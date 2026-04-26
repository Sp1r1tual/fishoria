import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { RedisService } from '../common/redis/redis.service';
import { PlayerEntity } from './entities/player.entity';
import { PlayerProfileResponseDto } from './dto/profile-response.dto';

import {
  STARTER_MONEY,
  STARTER_LEVEL,
  STARTER_XP,
  STARTER_GEAR_ITEMS,
  STARTER_CONSUMABLES,
} from '../common/configs/starter-kit';

import { mapPlayerProfile } from './mappers/player.mapper';
import { UpdateProfileDto } from './dto/update-profile.dto';

const QUEST_COUNT_CACHE_KEY = 'cache:quest_count';
const QUEST_COUNT_TTL = 300;

@Injectable()
export class PlayerService {
  constructor(
    private readonly playerEntity: PlayerEntity,
    private readonly redis: RedisService,
  ) {}

  async getProfile(
    userId: string,
    language?: string,
    isMe = true,
  ): Promise<PlayerProfileResponseDto> {
    const user = await this.playerEntity.findUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lang = language || user.language;

    const rawProfile = await this.playerEntity.findProfile(userId, lang);

    let profile = mapPlayerProfile(
      rawProfile,
      lang,
    ) as unknown as PlayerProfileResponseDto | null;

    if (!profile) {
      if (!isMe) {
        throw new NotFoundException('Player profile not found');
      }

      try {
        const createdProfile = (await this.playerEntity.createProfile(
          {
            user: { connect: { id: userId } },
            money: STARTER_MONEY,
            level: STARTER_LEVEL,
            xp: STARTER_XP,
            gearItems: {
              create: STARTER_GEAR_ITEMS.map((item) => ({ ...item })),
            },
            consumables: {
              create: STARTER_CONSUMABLES.map((item) => ({ ...item })),
            },
          },
          lang,
        )) as unknown as PlayerProfileResponseDto;

        const rod = createdProfile.gearItems.find((g) => g.itemType === 'rod');
        const reel = createdProfile.gearItems.find(
          (g) => g.itemType === 'reel',
        );
        const line = createdProfile.gearItems.find(
          (g) => g.itemType === 'line',
        );
        const hook = createdProfile.gearItems.find(
          (g) => g.itemType === 'hook',
        );

        profile = (await this.playerEntity.updateProfile(
          createdProfile.id,
          {
            equippedRodUid: rod?.uid,
            equippedReelUid: reel?.uid,
            equippedLineUid: line?.uid,
            equippedHookUid: hook?.uid,
          },
          lang,
        )) as unknown as PlayerProfileResponseDto;
      } catch (e: unknown) {
        if ((e as { code?: string })?.code === 'P2002') {
          profile = (await this.playerEntity.findProfile(
            userId,
            lang,
          )) as unknown as PlayerProfileResponseDto;
        } else {
          throw e;
        }
      }
    }

    if (isMe && profile) {
      await this.syncQuests(profile.id, profile.playerQuests?.length ?? 0);
    }

    if (!profile) {
      throw new NotFoundException('Player profile not found');
    }

    return profile;
  }

  private async syncQuests(profileId: string, currentCount: number) {
    let total: number;

    const cached = await this.redis.get(QUEST_COUNT_CACHE_KEY);
    if (cached !== null && cached !== undefined) {
      total = Number(cached);
    } else {
      total = await this.playerEntity.countQuests();
      await this.redis.set(QUEST_COUNT_CACHE_KEY, total.toString(), {
        ex: QUEST_COUNT_TTL,
      });
    }

    if (currentCount >= total) return;

    const allQuests = await this.playerEntity.findQuests();
    const playerQuests = await this.playerEntity.findPlayerQuests(profileId);

    const existingQuestIds = new Set(playerQuests.map((pq) => pq.questId));

    const newQuestsToAssign = allQuests.filter(
      (q) => !existingQuestIds.has(q.id),
    );

    if (newQuestsToAssign.length > 0) {
      await this.playerEntity.createPlayerQuests(
        newQuestsToAssign.map((q) => ({
          profileId,
          questId: q.id,
        })),
      );
    }
  }

  async addMoney(userId: string, amount: number) {
    await this.playerEntity.incrementMoney(userId, amount);
    return this.getProfile(userId);
  }

  async updateLanguage(userId: string, language: string) {
    await this.playerEntity.updateLanguage(userId, language);
    return { success: true, language };
  }

  async resetProfile(userId: string) {
    await this.playerEntity.deleteProfile(userId).catch(() => null);

    return this.getProfile(userId);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PlayerProfileResponseDto> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.username) data.username = dto.username;
    if (dto.avatar) data.avatar = dto.avatar;

    await this.playerEntity.updateUser(userId, data);

    return this.getProfile(userId);
  }
}
