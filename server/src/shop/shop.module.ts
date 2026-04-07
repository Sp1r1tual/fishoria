import { Module } from '@nestjs/common';

import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopEntity } from './entities/shop.entity';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PlayerModule],
  controllers: [ShopController],
  providers: [ShopService, ShopEntity],
})
export class ShopModule {}
