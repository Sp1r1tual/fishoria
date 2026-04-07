import { Injectable, BadRequestException } from '@nestjs/common';

import { ShopEntity } from './entities/shop.entity';
import { getItemPrice } from '../common/configs/prices.config';
import type { BuyDto } from './dto/shop.dto';
import { PlayerService } from '../player/player.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly shopEntity: ShopEntity,
    private readonly playerService: PlayerService,
  ) {}

  async buy(userId: string, body: BuyDto) {
    const profile = await this.shopEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    if (body.itemId === 'echo_sounder' && profile.hasEchoSounder) {
      throw new BadRequestException('Echo sounder already owned');
    }

    const qty = body.quantity || 1;
    const unitPrice = getItemPrice(body.itemId);
    const price = unitPrice * qty;

    if (profile.money < price)
      throw new BadRequestException('Not enough money');

    if (body.itemType === 'bait' || body.itemType === 'groundbait') {
      await this.shopEntity.executeBuyConsumableTx(
        profile.id,
        price,
        body.itemId,
        body.itemType,
        qty,
      );
    } else {
      await this.shopEntity.executeBuyGearTx(
        profile.id,
        price,
        body.itemId,
        body.itemType,
        qty,
      );
    }

    return this.playerService.getProfile(userId);
  }

  async sellAllFish(userId: string) {
    const profile = await this.shopEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    await this.shopEntity.executeSellAllFishTx(profile.id);
    return this.playerService.getProfile(userId);
  }
}
