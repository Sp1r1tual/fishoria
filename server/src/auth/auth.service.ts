import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { add } from 'date-fns';
import ms from 'ms';
import * as bcrypt from 'bcrypt';

import { RedisService } from '../common/redis/redis.service';
import { MailService } from '../mail/mail.service';
import { GoogleAuthPayloadDto } from './dto/google-payload.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly mailService: MailService,
    private readonly authEntity: AuthEntity,
  ) {}

  async validateOAuthUser(user: GoogleAuthPayloadDto) {
    let internalUser = await this.authEntity.findUserByGoogleOrEmail(
      user.googleId,
      user.email,
    );

    if (internalUser) {
      internalUser = await this.authEntity.updateUser(internalUser.id, {
        googleId: user.googleId,
        username: internalUser.username || user.displayName,
        avatar: internalUser.avatar || user.picture,
        isActivated: true,
      });
    } else {
      internalUser = await this.authEntity.createUser({
        googleId: user.googleId,
        email: user.email,
        username: user.displayName,
        avatar: user.picture,
        isActivated: true,
      });
    }

    const ban = await this.authEntity.findActiveBan(internalUser.id);

    if (ban) {
      await this.redis.set(`ban:${internalUser.id}`, 'true', { ex: 3600 });
      throw new UnauthorizedException('landing.auth.errors.accountBanned');
    }

    return internalUser;
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Record<string, unknown> | null> {
    const user = await this.authEntity.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('landing.auth.errors.userNotFound');
    }

    if (!user.password) {
      throw new UnauthorizedException('landing.auth.errors.googleAccount');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('landing.auth.errors.incorrectPassword');
    }

    if (!user.isActivated) {
      throw new UnauthorizedException('landing.auth.errors.emailNotActivated');
    }

    const ban = await this.authEntity.findActiveBan(user.id);
    if (ban) {
      throw new UnauthorizedException('landing.auth.errors.accountBanned');
    }

    const { password: _password, ...result } = user;
    return result;
  }

  async register(dto: RegisterDto) {
    const candidate = await this.authEntity.findUserByEmail(dto.email);

    if (candidate) {
      throw new BadRequestException('landing.auth.errors.userAlreadyExists');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);
    const activationLink = randomBytes(32).toString('hex');

    const user = await this.authEntity.createUser({
      email: dto.email,
      password: hashPassword,
      username: dto.username,
      activationLink,
      language: dto.language,
    });

    await this.mailService.sendActivationMail(
      user.email,
      `${this.configService.get('API_URL')}/auth/activate/${activationLink}`,
      user.language,
    );

    return user;
  }

  async activate(activationLink: string) {
    const user = await this.authEntity.findUserByActivationLink(activationLink);

    if (!user) {
      throw new BadRequestException(
        'landing.auth.errors.invalidActivationLink',
      );
    }

    await this.authEntity.updateUser(user.id, {
      isActivated: true,
      activationLink: null,
    });
  }

  async login(
    user: {
      id: string;
      email: string;
      role: string;
      language: string;
      username?: string | null;
      avatar?: string | null;
    },
    userAgent?: string,
    ip?: string,
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      language: user.language,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      userAgent,
      ip,
    );

    const { id, email, role, language, username, avatar } = user;

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      role,
      user: { id, email, role, language, username, avatar },
    };
  }

  async generateRefreshToken(userId: string, userAgent?: string, ip?: string) {
    const token = randomBytes(40).toString('hex');
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION',
    )!;
    const expiresAt = add(new Date(), {
      seconds: ms(expiresIn as ms.StringValue) / 1000,
    });

    return await this.authEntity.createRefreshToken({
      token,
      user: { connect: { id: userId } },
      userAgent,
      ip,
      expiresAt,
    });
  }

  async logout(refreshToken: string) {
    await this.authEntity.deleteRefreshToken(refreshToken).catch(() => null);
  }

  async refreshTokens(refreshToken: string, userAgent?: string, ip?: string) {
    const savedToken = await this.authEntity.findRefreshToken(refreshToken);

    if (
      !savedToken ||
      savedToken.expiresAt < new Date() ||
      savedToken.revokedAt
    ) {
      if (savedToken) {
        await this.authEntity.deleteRefreshTokenById(savedToken.id);
      }
      return null;
    }

    const isBanned = await this.redis.get(`ban:${savedToken.userId}`);
    if (isBanned) {
      await this.authEntity.deleteRefreshTokenById(savedToken.id);
      throw new UnauthorizedException('User is banned');
    }

    await this.authEntity.deleteRefreshTokenById(savedToken.id);
    return await this.login(savedToken.user, userAgent, ip);
  }

  async banUser(
    userId: string,
    reason: string,
    bannedById: string,
    expiresAt?: Date,
  ) {
    const ban = await this.authEntity.createBan({
      user: { connect: { id: userId } },
      reason,
      bannedBy: { connect: { id: bannedById } },
      expiresAt,
    });

    const redisTTL = expiresAt
      ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      : 3600 * 24 * 7;

    if (redisTTL > 0) {
      await this.redis.set(`ban:${userId}`, 'true', { ex: redisTTL });
    }

    await this.authEntity.deleteRefreshTokensByUser(userId);
    return ban;
  }

  async unbanUser(userId: string) {
    await this.authEntity.deleteBansByUser(userId);
    await this.redis.del(`ban:${userId}`);
  }

  async requestPasswordReset(
    email: string,
    userAgent?: string,
    ip?: string,
    language?: string,
  ) {
    const user = await this.authEntity.findUserByEmail(email);
    if (!user) return;

    await this.authEntity.deletePasswordResetTokensByUser(user.id);

    const token = randomBytes(32).toString('hex');
    const expiresIn = this.configService.get<string>(
      'JWT_RESET_TOKEN_EXPIRATION',
    )!;
    const expiresAt = add(new Date(), {
      seconds: ms(expiresIn as ms.StringValue) / 1000,
    });

    await this.authEntity.createPasswordResetToken({
      token,
      user: { connect: { id: user.id } },
      expiresAt,
      userAgent,
      ip,
    });

    const resetLink = `${this.configService.get<string>('CLIENT_URL')}/reset-password?token=${token}`;
    await this.mailService.sendPasswordResetMail(
      user.email,
      resetLink,
      language || user.language,
    );
  }

  async verifyPasswordResetToken(token: string) {
    const resetToken = await this.authEntity.findPasswordResetToken(token);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('landing.auth.errors.invalidResetToken');
    }

    return { sub: resetToken.userId, email: resetToken.user.email };
  }

  async resetPassword(token: string, newPass: string) {
    const payload = await this.verifyPasswordResetToken(token);
    const hashPassword = await bcrypt.hash(newPass, 10);

    await this.authEntity.executePasswordResetTx(payload.sub, hashPassword);
  }
}
