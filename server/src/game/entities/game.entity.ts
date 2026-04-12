import { Injectable } from '@nestjs/common';
import { PlayerProfile, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { QuestEntity } from '../../quest/entities/quest.entity';
import { AchievementEntity } from '../../achievements/entities/achievement.entity';
import { PlayerEntity } from '../../player/entities/player.entity';
import { FULL_PROFILE_INCLUDE } from '../../player/constants/player.constants';
import { CatchDto } from '../dto/catch.dto';
import { BreakDto } from '../dto/break-gear.dto';

@Injectable()
export class GameEntity {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questEntity: QuestEntity,
    private readonly achievementEntity: AchievementEntity,
    private readonly playerEntity: PlayerEntity,
  ) {}

  async findProfile(userId: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
    });
  }

  async findUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, language: true },
    });
  }

  async findFullProfile(profileId: string, language: string = 'en') {
    return this.prisma.playerProfile.findUnique({
      where: { id: profileId },
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
      },
    });
  }

  async findDuplicateCatch(profileId: string, body: CatchDto) {
    const fiveSecondsAgo = new Date(Date.now() - 5000);

    return this.prisma.fishCatch.findFirst({
      where: {
        profileId,
        speciesId: body.speciesId,
        weight: body.weight,
        length: body.length,
        lakeId: body.lakeId,
        caughtAt: { gte: fiveSecondsAgo },
      },
    });
  }

  async executeCatchFishTx(
    profile: PlayerProfile,
    body: CatchDto,
    xpGain: number,
    language: string = 'en',
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profile.id} FOR UPDATE`;

      await tx.fishCatch.create({
        data: {
          profileId: profile.id,
          speciesId: body.speciesId,
          speciesName: body.speciesName,
          weight: body.weight,
          length: body.length,
          lakeId: body.lakeId,
          lakeName: body.lakeName,
          baitUsed: body.baitUsed,
          method: body.method,
          isReleased: body.isReleased ?? false,
        },
      });

      await this.questEntity.updateQuestProgress(tx, profile.id, {
        method: body.method,
        speciesId: body.speciesId,
        lakeId: body.lakeId,
      });

      if (body.baitUsed && !body.baitUsed.startsWith('lure_')) {
        await tx.consumableItem.updateMany({
          where: {
            profileId: profile.id,
            itemId: body.baitUsed,
            itemType: 'bait',
            quantity: { gt: 0 },
          },
          data: { quantity: { decrement: 1 } },
        });
      }

      await this.playerEntity.addXp(tx, profile.id, xpGain);

      const rodDamage = body.rodDamage ?? 0;
      const reelDamage = body.reelDamage ?? 0;

      if (rodDamage > 0 && profile.equippedRodUid) {
        const rodItem = await tx.gearItem.findUnique({
          where: { uid: profile.equippedRodUid },
        });

        if (rodItem?.condition !== null && rodItem?.condition !== undefined) {
          const newCondition = Math.max(0, rodItem.condition - rodDamage);

          await tx.gearItem.update({
            where: { uid: profile.equippedRodUid },
            data: { condition: newCondition, isBroken: newCondition === 0 },
          });

          if (newCondition === 0) {
            await tx.playerProfile.update({
              where: { id: profile.id },
              data: { equippedRodUid: null },
            });
          }
        }
      }

      if (reelDamage > 0 && profile.equippedReelUid) {
        const reelItem = await tx.gearItem.findUnique({
          where: { uid: profile.equippedReelUid },
        });

        if (reelItem?.condition !== null && reelItem?.condition !== undefined) {
          const newCondition = Math.max(0, reelItem.condition - reelDamage);

          await tx.gearItem.update({
            where: { uid: profile.equippedReelUid },
            data: { condition: newCondition, isBroken: newCondition === 0 },
          });

          if (newCondition === 0) {
            await tx.playerProfile.update({
              where: { id: profile.id },
              data: { equippedReelUid: null },
            });
          }
        }
      }

      const existingStat = await tx.lakeStatistic.findUnique({
        where: {
          profileId_lakeId: { profileId: profile.id, lakeId: body.lakeId },
        },
      });

      if (existingStat) {
        const records = (existingStat.records as Record<string, number>) || {};
        const minWeights =
          (existingStat.minWeights as Record<string, number>) || {};
        const speciesCounts =
          (existingStat.speciesCounts as Record<string, number>) || {};
        const speciesWeights =
          (existingStat.speciesWeights as Record<string, number>) || {};

        records[body.speciesId] = Math.max(
          records[body.speciesId] || 0,
          body.weight,
        );
        minWeights[body.speciesId] =
          minWeights[body.speciesId] !== undefined
            ? Math.min(minWeights[body.speciesId], body.weight)
            : body.weight;
        speciesCounts[body.speciesId] =
          (speciesCounts[body.speciesId] || 0) + 1;
        speciesWeights[body.speciesId] =
          (speciesWeights[body.speciesId] || 0) + body.weight;

        await tx.lakeStatistic.update({
          where: { id: existingStat.id },
          data: {
            totalCaught: existingStat.totalCaught + 1,
            totalWeight: existingStat.totalWeight + body.weight,
            records,
            minWeights,
            speciesCounts,
            speciesWeights,
          },
        });
      } else {
        await tx.lakeStatistic.create({
          data: {
            profileId: profile.id,
            lakeId: body.lakeId,
            totalCaught: 1,
            totalWeight: body.weight,
            records: { [body.speciesId]: body.weight },
            minWeights: { [body.speciesId]: body.weight },
            speciesCounts: { [body.speciesId]: 1 },
            speciesWeights: { [body.speciesId]: body.weight },
          },
        });
      }

      const isTrophy =
        body.sizeRank === 'trophy' ||
        (body.maxWeight && body.weight >= body.maxWeight * 0.75) ||
        false;

      await this.achievementEntity.checkAndAssignCatchAchievements(
        tx,
        profile.id,
        isTrophy,
      );
    });

    return await this.findProfileWithFullInclude(profile.id, language);
  }

  async executeBreakGearTx(
    profile: PlayerProfile,
    body: BreakDto,
    language: string = 'en',
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profile.id} FOR UPDATE`;

      const currentProfile = await tx.playerProfile.findUnique({
        where: { id: profile.id },
      });
      if (!currentProfile) return;

      const rodDamage = body.rodDamage ?? 0;
      const reelDamage = body.reelDamage ?? 0;

      if (
        rodDamage > 0 &&
        currentProfile.equippedRodUid &&
        body.type !== 'rod'
      ) {
        const rodItem = await tx.gearItem.findUnique({
          where: { uid: currentProfile.equippedRodUid },
        });

        if (rodItem?.condition !== null && rodItem?.condition !== undefined) {
          const newCondition = Math.max(0, rodItem.condition - rodDamage);

          await tx.gearItem.update({
            where: { uid: currentProfile.equippedRodUid },
            data: { condition: newCondition, isBroken: newCondition === 0 },
          });

          if (newCondition === 0) {
            await tx.playerProfile.update({
              where: { id: profile.id },
              data: { equippedRodUid: null },
            });

            currentProfile.equippedRodUid = null;
          }
        }
      }

      if (
        reelDamage > 0 &&
        currentProfile.equippedReelUid &&
        body.type !== 'reel'
      ) {
        const reelItem = await tx.gearItem.findUnique({
          where: { uid: currentProfile.equippedReelUid },
        });

        if (reelItem?.condition !== null && reelItem?.condition !== undefined) {
          const newCondition = Math.max(0, reelItem.condition - reelDamage);

          await tx.gearItem.update({
            where: { uid: currentProfile.equippedReelUid },
            data: { condition: newCondition, isBroken: newCondition === 0 },
          });

          if (newCondition === 0) {
            await tx.playerProfile.update({
              where: { id: profile.id },
              data: { equippedReelUid: null },
            });

            currentProfile.equippedReelUid = null;
          }
        }
      }

      if (body.type === 'line' || body.type === 'hook') {
        if (currentProfile.equippedHookUid) {
          const brokenHook = await tx.gearItem.findUnique({
            where: { uid: currentProfile.equippedHookUid },
          });

          await tx.gearItem.delete({
            where: { uid: currentProfile.equippedHookUid },
          });

          let nextHookUid: string | null = null;
          if (brokenHook) {
            const nextItem = await tx.gearItem.findFirst({
              where: {
                profileId: profile.id,
                itemType: 'hook',
                itemId: brokenHook.itemId,
                uid: { not: currentProfile.equippedHookUid },
              },
            });
            if (nextItem) nextHookUid = nextItem.uid;
          }

          await tx.playerProfile.update({
            where: { id: profile.id },
            data: { equippedHookUid: nextHookUid },
          });
        }
      }

      if (
        body.type === 'line' ||
        body.type === 'hook' ||
        body.type === 'bait'
      ) {
        if (body.baitId) {
          await tx.consumableItem.updateMany({
            where: {
              profileId: profile.id,
              itemId: body.baitId,
              itemType: 'bait',
              quantity: { gt: 0 },
            },
            data: { quantity: { decrement: 1 } },
          });
        }
      }

      const lostMeters = body.lostMeters ?? 0;
      if (
        body.type === 'line' &&
        currentProfile.equippedLineUid &&
        lostMeters > 0
      ) {
        const line = await tx.gearItem.findFirst({
          where: { uid: currentProfile.equippedLineUid },
        });

        if (line && line.meters !== null) {
          const remaining = Math.max(0, line.meters - lostMeters);

          if (remaining < 10) {
            await tx.gearItem.delete({ where: { uid: line.uid } });
            await tx.playerProfile.update({
              where: { id: profile.id },
              data: { equippedLineUid: null },
            });
          } else {
            await tx.gearItem.update({
              where: { uid: line.uid },
              data: { meters: remaining },
            });
          }
        }
      }

      let gearBroken = false;
      if (body.type === 'rod' && currentProfile.equippedRodUid) {
        await tx.gearItem.update({
          where: { uid: currentProfile.equippedRodUid },
          data: { isBroken: true, condition: 0 },
        });

        await tx.playerProfile.update({
          where: { id: profile.id },
          data: { equippedRodUid: null },
        });

        gearBroken = true;
      }

      if (body.type === 'reel' && currentProfile.equippedReelUid) {
        await tx.gearItem.update({
          where: { uid: currentProfile.equippedReelUid },
          data: { isBroken: true, condition: 0 },
        });

        await tx.playerProfile.update({
          where: { id: profile.id },
          data: { equippedReelUid: null },
        });

        gearBroken = true;
      }

      if (body.type === 'line' || body.type === 'hook') {
        gearBroken = true;
      }

      if (gearBroken) {
        await this.achievementEntity.checkAndAssignRecklessAchievement(
          tx,
          profile.id,
        );
      }
    });

    return await this.findProfileWithFullInclude(profile.id, language);
  }

  private async findProfileWithFullInclude(
    profileId: string,
    language: string = 'en',
  ) {
    return await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
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
      },
    });
  }
}
