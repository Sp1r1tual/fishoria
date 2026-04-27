import { Socket } from 'socket.io';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const token =
      data?.token ||
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.split(' ')[1] ||
      this.extractTokenFromCookie(client);

    if (!token) {
      this.logger.debug(`No token provided for socket ${client.id}`);
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.authService.verifyToken(token);

      client.user = payload;

      return true;
    } catch (error) {
      this.logger.debug(
        `Auth failed for socket ${client.id}: ${error.message}`,
      );
      throw error;
    }
  }

  private extractTokenFromCookie(client: Socket): string | null {
    const cookieHeader = client.handshake?.headers?.cookie;
    if (!cookieHeader) return null;

    const match = cookieHeader.match(/(?:^|;\s*)Authentication=([^;]*)/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }
}
