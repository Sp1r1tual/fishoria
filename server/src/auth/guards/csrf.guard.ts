import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-reset-token',
    '/auth/reset-password',
    '/auth/refresh',
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip CSRF for public auth routes that may be accessed before cookie is set
    if (this.publicPaths.some((path) => request.url?.includes(path))) {
      return true;
    }

    // Skip CSRF for Bearer tokens (mobile apps)
    if (request.headers.authorization?.startsWith('Bearer ')) {
      return true;
    }

    const csrfCookie = request.cookies['XSRF-TOKEN'];
    const csrfHeader = request.headers['x-xsrf-token'];

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      console.warn(
        `[CsrfGuard] Failed! Cookie: ${csrfCookie}, Header: ${csrfHeader}`,
      );
      throw new ForbiddenException('CSRF token validation failed');
    }

    return true;
  }
}
