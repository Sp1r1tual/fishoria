import { Module } from '@nestjs/common';

import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryEntity } from './entities/inventory.entity';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryEntity],
  exports: [InventoryService],
})
export class InventoryModule {}
