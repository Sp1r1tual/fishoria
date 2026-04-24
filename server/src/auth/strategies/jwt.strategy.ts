import { Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    language: string;
  }) {
    const banReason = await this.redis.get(`ban:${payload.sub}`);

    if (banReason) {
      throw new ForbiddenException(`ACCOUNT_BANNED:::${banReason}`);
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      language: payload.language,
    };
  }
}
