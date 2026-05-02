import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Subscription } from 'rxjs';

import { StatusService } from './status.service';

@WebSocketGateway({
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = process.env['CLIENT_URL'] ?? 'http://localhost:5173';
      if (!origin || origin === allowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  namespace: '/status',
})
export class StatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(StatusGateway.name);
  private statusSub: Subscription;

  @WebSocketServer()
  server: Server;

  constructor(private readonly statusService: StatusService) {}

  afterInit() {
    this.logger.log('Status gateway initialized on /status namespace');

    this.statusSub = this.statusService.statusChange$.subscribe((payload) => {
      this.server.emit('server:status', payload);
    });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);

    client.emit('server:status', this.statusService.getPayload());
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  onModuleDestroy() {
    this.statusSub?.unsubscribe();
  }
}
