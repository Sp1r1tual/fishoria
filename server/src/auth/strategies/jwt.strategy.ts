import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        (request) => {
          return request?.cookies?.Authentication;
        },
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
    const isBanned = await this.redis.get(`ban:${payload.sub}`);

    if (isBanned) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      language: payload.language,
    };
  }
}
