import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RedisService } from '../common/redis/redis.service';

export interface IJwtPayload {
  sub: string;
  email: string;
  role: string;
  language: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async verifyToken(token: string): Promise<IJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<IJwtPayload>(token);

      const banReason = await this.redis.get(`ban:${payload.sub}`);
      if (banReason) {
        throw new ForbiddenException(`ACCOUNT_BANNED:::${banReason}`);
      }

      return payload;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
