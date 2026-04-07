import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { FULL_PROFILE_INCLUDE } from '../../player/dto/profile-response.dto';
import { getFishSellPrice } from '../../common/configs/prices.config';

@Injectable()
export class ShopEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(userId: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
    });
  }

  async findProfileWithCatches(userId: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
      include: { fishCatches: true },
    });
  }

  async executeBuyConsumableTx(
    profileId: string,
    price: number,
    itemId: string,
    itemType: string,
    qty: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;

      const profile = await tx.playerProfile.findUnique({
        where: { id: profileId },
      });
      if (!profile || profile.money < price) {
        throw new BadRequestException('Not enough money');
      }

      await tx.playerProfile.update({
        where: { id: profileId },
        data: { money: { decrement: price } },
      });

      const existing = await tx.consumableItem.findFirst({
        where: { profileId, itemId, itemType },
      });

      if (existing) {
        await tx.consumableItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: qty } },
        });
      } else {
        await tx.consumableItem.create({
          data: {
            profileId,
            itemId,
            itemType,
            quantity: qty,
          },
        });
      }
    });

    return await this.findProfileWithFullInclude(profileId);
  }

  private async findProfileWithFullInclude(profileId: string) {
    return await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
      include: FULL_PROFILE_INCLUDE,
    });
  }

  async executeBuyGearTx(
    profileId: string,
    price: number,
    itemId: string,
    itemType: string,
    qty: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;

      const profile = await tx.playerProfile.findUnique({
        where: { id: profileId },
      });
      if (!profile || profile.money < price) {
        throw new BadRequestException('Not enough money');
      }

      const updateData: Prisma.PlayerProfileUpdateInput = {
        money: { decrement: price },
      };

      if (itemId === 'echo_sounder') {
        updateData.hasEchoSounder = true;
      }

      await tx.playerProfile.update({
        where: { id: profileId },
        data: updateData,
      });

      if (itemId !== 'echo_sounder') {
        for (let i = 0; i < qty; i++) {
          await tx.gearItem.create({
            data: {
              profileId,
              itemType: itemId === 'repair_kit' ? 'repair_kit' : itemType,
              itemId,
              condition:
                itemType === 'rod' ||
                itemType === 'reel' ||
                itemId === 'repair_kit'
                  ? 100
                  : null,
              meters: itemType === 'line' ? 300 : null,
            },
          });
        }
      }
    });

    return await this.findProfileWithFullInclude(profileId);
  }

  async executeSellAllFishTx(profileId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;

      const catches = await tx.fishCatch.findMany({
        where: { profileId, isReleased: false },
      });

      const total = catches.reduce(
        (sum, f) => sum + getFishSellPrice(f.speciesId, f.weight),
        0,
      );

      await tx.fishCatch.deleteMany({
        where: { profileId, isReleased: false },
      });

      await tx.playerProfile.update({
        where: { id: profileId },
        data: { money: { increment: total } },
      });
    });

    return await this.findProfileWithFullInclude(profileId);
  }
}
