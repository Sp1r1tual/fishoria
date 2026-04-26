import { Module } from '@nestjs/common';

import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryEntity } from './entities/inventory.entity';

import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PlayerModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryEntity],
  exports: [InventoryService],
})
export class InventoryModule {}
