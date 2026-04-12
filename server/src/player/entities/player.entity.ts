import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { FULL_PROFILE_INCLUDE } from '../constants/player.constants';
import { getXpNeededForLevel } from '../utils/player-experience.util';

@Injectable()
export class PlayerEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(userId: string, language: string = 'en') {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
      include: {
        ...FULL_PROFILE_INCLUDE,
        playerQuests: {
          include: {
            quest: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
        playerAchievements: {
          include: {
            achievement: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
      },
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
    language: string = 'en',
  ) {
    return this.prisma.playerProfile.create({
      data,
      include: {
        ...FULL_PROFILE_INCLUDE,
        playerQuests: {
          include: {
            quest: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
        playerAchievements: {
          include: {
            achievement: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateProfile(
    profileId: string,
    data: Prisma.PlayerProfileUpdateInput,
    language: string = 'en',
  ) {
    return this.prisma.playerProfile.update({
      where: { id: profileId },
      data,
      include: {
        ...FULL_PROFILE_INCLUDE,
        playerQuests: {
          include: {
            quest: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
        playerAchievements: {
          include: {
            achievement: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
      },
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
