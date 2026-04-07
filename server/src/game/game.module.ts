import { Module } from '@nestjs/common';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameEntity } from './entities/game.entity';

@Module({
  controllers: [GameController],
  providers: [GameService, GameEntity],
  exports: [GameService],
})
export class GameModule {}
