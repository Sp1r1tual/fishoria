import { Injectable } from '@nestjs/common';

import { RedisService } from '../common/redis/redis.service';
import { AchievementEntity } from './entities/achievement.entity';
import { AchievementResponseDto } from './dto/achievement-response.dto';

interface IRawAchievementItem {
  id: string;
  order: number;
  code: string;
  imageUrl: string | null;
  translations: { title: string; description: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const ACHIEVEMENTS_CACHE_TTL = 600;

@Injectable()
export class AchievementsService {
  constructor(
    private readonly achievementEntity: AchievementEntity,
    private readonly redis: RedisService,
  ) {}

  async getAllAchievements(
    language: string = 'en',
  ): Promise<AchievementResponseDto[]> {
    const cacheKey = `cache:achievements:${language}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as AchievementResponseDto[];
      } catch {
        console.error('Corrupted cache for achievements');
      }
    }

    const achievements = (await this.achievementEntity.findAll(
      language,
    )) as IRawAchievementItem[];

    const result = achievements.map((item) => this.mapLocalized(item));

    await this.redis
      .set(cacheKey, JSON.stringify(result), {
        ex: ACHIEVEMENTS_CACHE_TTL,
      })
      .catch(() => null);

    return result;
  }

  private mapLocalized(item: IRawAchievementItem): AchievementResponseDto {
    const translation = item.translations?.[0];

    return {
      id: item.id,
      code: item.code,
      imageUrl: item.imageUrl,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      title: translation?.title || '',
      description: translation?.description || '',
    };
  }
}
