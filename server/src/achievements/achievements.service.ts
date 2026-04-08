import { Injectable } from '@nestjs/common';

import { AchievementEntity } from './entities/achievement.entity';
import { AchievementResponseDto } from './dto/achievement-response.dto';

interface RawAchievementItem {
  id: string;
  code: string;
  imageUrl: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  translations: { title: string; description: string }[];
}

@Injectable()
export class AchievementsService {
  constructor(private readonly achievementEntity: AchievementEntity) {}

  async getAllAchievements(
    language: string = 'en',
  ): Promise<AchievementResponseDto[]> {
    const achievements = (await this.achievementEntity.findAll(
      language,
    )) as RawAchievementItem[];
    return achievements.map((item) => this.mapLocalized(item));
  }

  private mapLocalized(item: RawAchievementItem): AchievementResponseDto {
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
