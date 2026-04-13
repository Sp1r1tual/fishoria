import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { RedisService } from '../common/redis/redis.service';
import { QuestEntity, IQuestCondition } from './entities/quest.entity';
import { PlayerQuestResponseDto } from './dto/quest-response.dto';
import { PlayerProfileResponseDto } from '../player/dto/profile-response.dto';
import { mapPlayerProfile } from '../player/mappers/player.mapper';

const QUEST_DEFS_CACHE_TTL = 600;

@Injectable()
export class QuestService {
  constructor(
    private readonly questEntity: QuestEntity,
    private readonly redis: RedisService,
  ) {}

  private async getQuestDefinitions(language: string) {
    const cacheKey = `cache:quest_defs:${language}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as Record<string, unknown>[];
      } catch {
        console.error('Corrupted cache for quest definitions');
      }
    }

    const quests =
      await this.questEntity.findAllQuestsWithTranslations(language);

    await this.redis
      .set(cacheKey, JSON.stringify(quests), { ex: QUEST_DEFS_CACHE_TTL })
      .catch(() => null);

    return quests;
  }

  async getPlayerQuests(
    userId: string,
    language: string = 'en',
  ): Promise<PlayerQuestResponseDto[]> {
    const [questDefs, profileData] = await Promise.all([
      this.getQuestDefinitions(language),
      this.questEntity.findPlayerQuestsOnly(userId),
    ]);

    if (!profileData) throw new NotFoundException('Profile not found');

    const questMap = new Map<string, Record<string, unknown>>(
      questDefs.map(
        (q: Record<string, unknown>) =>
          [q.id as string, q] as [string, Record<string, unknown>],
      ),
    );

    return profileData.playerQuests.map((pq) => {
      const q = questMap.get(pq.questId);
      const translations =
        (q?.translations as { title: string; description: string }[]) || [];
      const translation = translations[0];

      const title = translation?.title || '';
      const description = translation?.description || '';

      const rawConditions =
        (q?.conditions as unknown as IQuestCondition[]) || [];
      const conditions = rawConditions
        .map((c) => {
          if (!c) return null;
          const labelObj =
            c.label && typeof c.label === 'object'
              ? (c.label as Record<string, string>)
              : null;

          const label = labelObj
            ? labelObj[language] || labelObj['en'] || ''
            : (c.label as string) || '';

          return {
            id: c.id,
            type: c.type,
            value: c.value,
            target: c.target,
            label,
            lakeId: c.lakeId,
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      return {
        ...pq,
        quest: {
          ...(q || {}),
          title,
          description,
          conditions,
        },
      } as unknown as PlayerQuestResponseDto;
    });
  }

  async claimReward(
    userId: string,
    playerQuestId: string,
  ): Promise<PlayerProfileResponseDto> {
    const profile = await this.questEntity.findProfile(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const playerQuest =
      await this.questEntity.findPlayerQuestWithDef(playerQuestId);

    if (!playerQuest || playerQuest.profileId !== profile.id) {
      throw new BadRequestException('Quest not found for this player');
    }

    if (!playerQuest.isCompleted) {
      throw new BadRequestException('Quest is not completed yet');
    }

    if (playerQuest.isClaimed) {
      throw new BadRequestException('Reward already claimed');
    }

    const updatedProfile = await this.questEntity.executeClaimRewardTx(
      playerQuestId,
      profile.id,
    );

    return mapPlayerProfile(
      updatedProfile,
    ) as unknown as PlayerProfileResponseDto;
  }
}
