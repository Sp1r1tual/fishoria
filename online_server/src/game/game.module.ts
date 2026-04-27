import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../common/redis/redis.module';

import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [AuthModule, RedisModule],
  providers: [GameGateway, GameService],
})
export class GameModule {}
