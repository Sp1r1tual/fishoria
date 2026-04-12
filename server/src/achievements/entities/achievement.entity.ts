import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AchievementEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(language: string) {
    return this.prisma.achievement.findMany({
      include: {
        translations: {
          where: { language },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByCode(code: string, language: string) {
    return this.prisma.achievement.findUnique({
      where: { code },
      include: {
        translations: {
          where: { language },
        },
      },
    });
  }

  async create(data: Prisma.AchievementCreateInput) {
    return this.prisma.achievement.create({
      data,
      include: { translations: true },
    });
  }

  async checkAndAssignCatchAchievements(
    tx: Prisma.TransactionClient,
    profileId: string,
    isTrophy: boolean,
  ) {
    if (isTrophy) {
      const ach = await tx.achievement.findUnique({
        where: { code: 'sportsman_fisher' },
      });

      if (ach) {
        const hasAch = await tx.playerAchievement.findUnique({
          where: {
            profileId_achievementId: {
              profileId,
              achievementId: ach.id,
            },
          },
        });

        if (!hasAch) {
          await tx.playerAchievement.create({
            data: { profileId, achievementId: ach.id },
          });
        }
      }
    }
  }

  async checkAndAssignRecklessAchievement(
    tx: Prisma.TransactionClient,
    profileId: string,
  ) {
    const achCode = 'reckless';
    const ach = await tx.achievement.findUnique({
      where: { code: achCode },
    });

    if (ach) {
      const hasAch = await tx.playerAchievement.findUnique({
        where: {
          profileId_achievementId: {
            profileId,
            achievementId: ach.id,
          },
        },
      });

      if (!hasAch) {
        await tx.playerAchievement.create({
          data: { profileId, achievementId: ach.id },
        });
      }
    }
  }
}
