import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards, UsePipes } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ZodValidationPipe } from 'nestjs-zod';

import { GameService } from './game.service';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { RequireRoles, WsRolesGuard } from '../auth/guards/ws-roles.guard';

import { SetTimeDto } from './dto/set-time.dto';
import { SetWeatherDto } from './dto/set-weather.dto';

@WebSocketGateway({
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, true);
    },
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  namespace: '/game',
})
@UsePipes(new ZodValidationPipe())
export class GameGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  afterInit() {
    this.logger.log('Game gateway initialized on /game namespace');

    setInterval(() => {
      const changed = this.gameService.updateStateIfNecessary();
      if (changed) {
        this.broadcastGameState();
      }
    }, 3000);
  }

  handleConnection(client: Socket) {
    client.emit('game:sync', this.gameService.getGameState());
  }

  private broadcastGameState() {
    this.server.emit('game:sync', this.gameService.getGameState());
  }

  @UseGuards(WsAuthGuard, WsRolesGuard)
  @RequireRoles('MODERATOR')
  @SubscribeMessage('game:admin:set_time')
  handleSetTime(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SetTimeDto,
  ) {
    this.gameService.setGameTime(data.hour);
    this.broadcastGameState();
    this.logger.log(`Admin/Moderator set game time to ${data.hour}:00`);
  }

  @UseGuards(WsAuthGuard, WsRolesGuard)
  @RequireRoles('MODERATOR')
  @SubscribeMessage('game:admin:set_weather')
  handleSetWeather(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SetWeatherDto,
  ) {
    this.gameService.setWeather(data.weather);
    this.broadcastGameState();
    this.logger.log(`Admin/Moderator set weather to ${data.weather}`);
  }
}
