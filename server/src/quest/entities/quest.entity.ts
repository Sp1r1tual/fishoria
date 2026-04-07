import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { FULL_PROFILE_INCLUDE } from '../../player/dto/profile-response.dto';

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
      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
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

  private async findProfileWithFullInclude(profileId: string) {
    return await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
      include: FULL_PROFILE_INCLUDE,
    });
  }
}
