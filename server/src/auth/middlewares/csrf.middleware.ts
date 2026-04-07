import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies['XSRF-TOKEN']) {
      const token = randomBytes(32).toString('hex');
      const isProd = this.configService.get('NODE_ENV') === 'production';
      const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');

      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Must be false so Axios can read it
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        ...(cookieDomain && { domain: cookieDomain }),
        path: '/',
      });
    }
    next();
  }
}
