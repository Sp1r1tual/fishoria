import { Module } from '@nestjs/common';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameEntity } from './entities/game.entity';

import { QuestModule } from '../quest/quest.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [QuestModule, AchievementsModule, PlayerModule],
  controllers: [GameController],
  providers: [GameService, GameEntity],
  exports: [GameService],
})
export class GameModule {}
