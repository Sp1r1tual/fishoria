import { Injectable } from '@nestjs/common';

import { AchievementEntity } from './entities/achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(private readonly achievementEntity: AchievementEntity) {}

  async getAllAchievements(language: string = 'en') {
    const achievements = await this.achievementEntity.findAll(language);
    return achievements.map((item) => this.mapLocalized(item));
  }

  private mapLocalized(item: {
    id: string;
    code: string;
    imageUrl: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    translations: { title: string; description: string }[];
  }) {
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
