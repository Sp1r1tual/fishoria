import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { FULL_PROFILE_INCLUDE } from '../constants/player.constants';
import { getXpNeededForLevel } from '../utils/player-experience.util';
import { DailyReward } from '../../common/configs/daily-rewards.config';

@Injectable()
export class PlayerEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(userId: string, _language: string = 'en') {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
      include: FULL_PROFILE_INCLUDE,
    });
  }

  async findUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, language: true },
    });
  }

  async createProfile(
    data: Prisma.PlayerProfileCreateInput,
    _language: string = 'en',
  ) {
    return this.prisma.playerProfile.create({
      data,
      include: FULL_PROFILE_INCLUDE,
    });
  }

  async updateProfile(
    profileId: string,
    data: Prisma.PlayerProfileUpdateInput,
    _language: string = 'en',
  ) {
    return this.prisma.playerProfile.update({
      where: { id: profileId },
      data,
      include: FULL_PROFILE_INCLUDE,
    });
  }

  async applyDailyReward(
    profileId: string,
    consecutiveDays: number,
    reward: DailyReward,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.PlayerProfileUpdateInput = {
        lastLoginAt: new Date(),
        consecutiveDays,
      };

      if (reward.money) {
        updateData.money = { increment: reward.money };
      }

      await tx.playerProfile.update({
        where: { id: profileId },
        data: updateData,
      });

      if (reward.consumables) {
        for (const cons of reward.consumables) {
          const existing = await tx.consumableItem.findFirst({
            where: {
              profileId,
              itemId: cons.itemId,
              itemType: cons.itemType,
            },
          });
          if (existing) {
            await tx.consumableItem.update({
              where: { id: existing.id },
              data: { quantity: { increment: cons.quantity } },
            });
          } else {
            await tx.consumableItem.create({
              data: {
                profileId,
                itemType: cons.itemType,
                itemId: cons.itemId,
                quantity: cons.quantity,
              },
            });
          }
        }
      }

      if (reward.gearItems) {
        for (const gear of reward.gearItems) {
          const q = gear.quantity || 1;
          for (let i = 0; i < q; i++) {
            await tx.gearItem.create({
              data: {
                profileId,
                itemType: gear.itemType,
                itemId: gear.itemId,
                condition: 100,
              },
            });
          }
        }
      }

      return tx.playerProfile.findUnique({
        where: { id: profileId },
        include: FULL_PROFILE_INCLUDE,
      });
    });
  }

  async incrementMoney(userId: string, amount: number) {
    return this.prisma.playerProfile.update({
      where: { userId },
      data: { money: { increment: amount } },
      include: FULL_PROFILE_INCLUDE,
    });
  }

  async updateLanguage(userId: string, language: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { language },
    });
  }

  async deleteProfile(userId: string) {
    return this.prisma.playerProfile.delete({
      where: { userId },
    });
  }

  async findQuests() {
    return this.prisma.quest.findMany();
  }

  async findPlayerQuests(profileId: string) {
    return this.prisma.playerQuest.findMany({
      where: { profileId },
    });
  }

  async createPlayerQuests(data: Prisma.PlayerQuestCreateManyInput[]) {
    return this.prisma.playerQuest.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async countQuests() {
    return this.prisma.quest.count();
  }

  async addXp(tx: Prisma.TransactionClient, profileId: string, xpGain: number) {
    const currentProfile = await tx.playerProfile.findUnique({
      where: { id: profileId },
    });

    let newXp = (currentProfile?.xp || 0) + xpGain;
    let newLevel = currentProfile?.level || 1;
    let xpNeeded = getXpNeededForLevel(newLevel);

    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      xpNeeded = getXpNeededForLevel(newLevel);
    }

    await tx.playerProfile.update({
      where: { id: profileId },
      data: { xp: newXp, level: newLevel },
    });
  }
}
