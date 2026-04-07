import { Module } from '@nestjs/common';

import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PlayerEntity } from './entities/player.entity';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, PlayerEntity],
  exports: [PlayerService],
})
export class PlayerModule {}
