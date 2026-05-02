import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UsePipes, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ZodValidationPipe } from 'nestjs-zod';

import type { IChatUser } from './types/chat.types';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';

import { ChatService } from './chat.service';
import type { IJwtPayload } from '../auth/auth.service';

import { JoinDto } from './dto/join.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { CatchEventDto } from './dto/catch-event.dto';
import { MarkReadDto } from './dto/mark-read.dto';

interface ISocketMeta {
  user: IChatUser;
  lakeId: string;
}

interface IAuthenticatedSocket extends Socket {
  user: IJwtPayload;
}

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
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  private readonly socketMeta = new Map<string, ISocketMeta>();

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    this.logger.log('Chat gateway initialized on /chat namespace');
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`Client connected to chat: ${client.id}`);
    await this.broadcastAllLakesStats();
  }

  async handleDisconnect(client: Socket) {
    const meta = this.socketMeta.get(client.id);
    if (!meta) return;

    const { user, lakeId } = meta;
    this.socketMeta.delete(client.id);

    await this.chatService.removeOnlineUser(lakeId, user.id);

    const roomState = await this.chatService.getLakeRoomState(lakeId);
    this.server.to(lakeId).emit('chat:room_state', roomState);

    await this.broadcastAllLakesStats();

    this.logger.debug(
      `User ${user.username} left lake ${lakeId} (${client.id})`,
    );
  }

  private async broadcastAllLakesStats() {
    const stats = await this.chatService.getAllLakesOnlineCount();
    this.server.emit('chat:all_lakes_stats', stats);
  }

  @UseGuards(WsAuthGuard)
  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() payload: JoinDto,
  ) {
    const { lakeId } = payload;
    const userId = client.user.sub;

    const chatUser = await this.chatService.getUser(userId);
    if (!chatUser) {
      client.emit('chat:error', { message: 'User not found' });
      return;
    }

    const existing = this.socketMeta.get(client.id);
    if (existing) {
      await this.chatService.removeOnlineUser(existing.lakeId, chatUser.id);
      client.leave(existing.lakeId);

      const oldRoomState = await this.chatService.getLakeRoomState(
        existing.lakeId,
      );
      this.server.to(existing.lakeId).emit('chat:room_state', oldRoomState);
    }

    client.join(lakeId);
    this.socketMeta.set(client.id, { user: chatUser, lakeId });

    await this.chatService.addOnlineUser(lakeId, chatUser);

    const [history, roomState, readPointers] = await Promise.all([
      this.chatService.getHistory(lakeId),
      this.chatService.getLakeRoomState(lakeId),
      this.chatService.getLastReadPointers(lakeId, userId),
    ]);

    client.emit('chat:history', {
      ...history,
      readPointers,
    });
    this.server.to(lakeId).emit('chat:room_state', roomState);
    await this.broadcastAllLakesStats();

    this.server.to(lakeId).emit('chat:user_joined', {
      user: chatUser.username,
      lakeId,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(
      `User ${chatUser.username} joined lake ${lakeId} (${client.id})`,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:leave')
  async handleLeave(@ConnectedSocket() client: IAuthenticatedSocket) {
    const meta = this.socketMeta.get(client.id);
    if (!meta) return;

    const { user, lakeId } = meta;
    this.socketMeta.delete(client.id);
    client.leave(lakeId);

    await this.chatService.removeOnlineUser(lakeId, user.id);

    const roomState = await this.chatService.getLakeRoomState(lakeId);
    this.server.to(lakeId).emit('chat:room_state', roomState);

    await this.broadcastAllLakesStats();

    this.logger.debug(
      `User ${user.username} explicitly left lake ${lakeId} (${client.id})`,
    );
  }

  @UseGuards(WsAuthGuard)
  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage('chat:send_message')
  async handleMessage(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      client.emit('chat:error', { message: 'Not authenticated in chat' });
      return;
    }

    const { user, lakeId } = meta;
    const message = await this.chatService.createChatMessage(
      user,
      lakeId,
      payload,
    );
    if (!message) return;

    this.server.to(lakeId).emit('chat:message', message);
  }

  @UseGuards(WsAuthGuard)
  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage('chat:delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() payload: DeleteMessageDto,
  ) {
    const meta = this.socketMeta.get(client.id);
    if (!meta) return;

    const { user, lakeId } = meta;
    const deleted = await this.chatService.deleteMessage(
      lakeId,
      payload.messageId,
      user.id,
    );

    if (deleted) {
      this.server.to(lakeId).emit('chat:message_deleted', {
        messageId: payload.messageId,
      });
    }
  }

  @UseGuards(WsAuthGuard)
  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage('chat:catch_event')
  async handleCatchEvent(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() payload: CatchEventDto,
  ) {
    const meta = this.socketMeta.get(client.id);
    if (!meta) {
      client.emit('chat:error', { message: 'Not authenticated in chat' });
      return;
    }

    const catchMessage = this.chatService.createCatchEvent(meta.user, payload);
    this.server.to(payload.lakeId).emit('chat:event', catchMessage);
  }

  @UseGuards(WsAuthGuard)
  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage('chat:mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() payload: MarkReadDto,
  ) {
    const userId = client.user.sub;
    await this.chatService.markAsRead(
      payload.lakeId,
      userId,
      payload.messageId,
      payload.type,
    );
  }
}
