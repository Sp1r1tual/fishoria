import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { FULL_PROFILE_INCLUDE } from '../../player/constants/player.constants';
import { getXpNeededForLevel } from '../../player/utils/player-experience.util';

export interface IQuestCondition {
  id: string;
  type: string;
  value: string;
  target: number;
  label: string | { uk: string; en: string };
  lakeId?: string;
}

@Injectable()
export class QuestEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findUserLanguage(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
  }

  async findProfileWithQuests(userId: string, language: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
      include: {
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
      },
    });
  }

  async findProfile(userId: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
    });
  }

  async findPlayerQuestWithDef(playerQuestId: string) {
    return this.prisma.playerQuest.findUnique({
      where: { id: playerQuestId },
      include: { quest: true },
    });
  }

  async executeClaimRewardTx(playerQuestId: string, profileId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;

      const playerQuest = await tx.playerQuest.findUnique({
        where: { id: playerQuestId },
        include: { quest: true },
      });

      if (!playerQuest || playerQuest.profileId !== profileId) {
        throw new BadRequestException('Quest not found for this player');
      }

      if (!playerQuest.isCompleted) {
        throw new BadRequestException('Quest is not completed yet');
      }

      if (playerQuest.isClaimed) {
        throw new BadRequestException('Reward already claimed');
      }

      const currentProfile = await tx.playerProfile.findUnique({
        where: { id: profileId },
      });
      if (!currentProfile) {
        throw new BadRequestException('Profile not found');
      }

      let newXp = currentProfile.xp + playerQuest.quest.xpReward;
      let newLevel = currentProfile.level;
      let xpNeeded = getXpNeededForLevel(newLevel);
      while (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
        xpNeeded = getXpNeededForLevel(newLevel);
      }

      await tx.playerQuest.update({
        where: { id: playerQuestId },
        data: { isClaimed: true },
      });

      await tx.playerProfile.update({
        where: { id: profileId },
        data: {
          xp: newXp,
          level: newLevel,
          money: { increment: playerQuest.quest.moneyReward },
        },
      });
    });

    return await this.findProfileWithFullInclude(profileId);
  }

  async updateQuestProgress(
    tx: Prisma.TransactionClient,
    profileId: string,
    catchData: { method: string; speciesId: string; lakeId: string },
  ) {
    const activeQuests = await tx.playerQuest.findMany({
      where: { profileId, isCompleted: false },
      include: { quest: true },
    });

    for (const pq of activeQuests) {
      const questDef = pq.quest;
      const conditions =
        (questDef.conditions as unknown as IQuestCondition[]) || [];
      const currentProgress = (pq.progress as Record<string, number>) || {};

      let updated = false;

      for (const cond of conditions) {
        if (cond.type === 'CATCH_METHOD' && cond.value === catchData.method) {
          currentProgress[cond.id] = (currentProgress[cond.id] || 0) + 1;
          updated = true;
        }

        if (
          cond.type === 'CATCH_SPECIES' &&
          cond.value === catchData.speciesId
        ) {
          currentProgress[cond.id] = (currentProgress[cond.id] || 0) + 1;
          updated = true;
        }

        if (
          cond.type === 'CATCH_SPECIES_ON_LAKE' &&
          cond.value === catchData.speciesId &&
          cond.lakeId === catchData.lakeId
        ) {
          currentProgress[cond.id] = (currentProgress[cond.id] || 0) + 1;
          updated = true;
        }
      }

      if (updated) {
        const isCompleted = conditions.every(
          (c: IQuestCondition) => (currentProgress[c.id] || 0) >= c.target,
        );

        await tx.playerQuest.update({
          where: { id: pq.id },
          data: {
            progress: currentProgress,
            isCompleted,
          },
        });
      }
    }
  }

  private async findProfileWithFullInclude(profileId: string) {
    return await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
      include: FULL_PROFILE_INCLUDE,
    });
  }
}
