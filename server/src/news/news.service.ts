import { Injectable } from '@nestjs/common';
import { News, NewsTranslation, Prisma } from '@prisma/client';

import { RedisService } from '../common/redis/redis.service';
import { NewsEntity } from './entities/news.entity';

const NEWS_CACHE_TTL = 600;

@Injectable()
export class NewsService {
  constructor(
    private readonly newsEntity: NewsEntity,
    private readonly redis: RedisService,
  ) {}

  async getAllNews(language: string = 'en') {
    const cacheKey = `cache:news:${language}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string);
      } catch {
        console.error('Corrupted cache for news');
      }
    }

    const news = await this.newsEntity.findPublished(language);
    const result = news.map((item) => this.mapLocalized(item));

    await this.redis
      .set(cacheKey, JSON.stringify(result), { ex: NEWS_CACHE_TTL })
      .catch(() => null);

    return result;
  }

  async getNewsById(id: string, language: string = 'en') {
    const item = await this.newsEntity.findById(id, language);
    if (!item) return null;

    return this.mapLocalized(item);
  }

  private mapLocalized(item: News & { translations?: NewsTranslation[] }) {
    const translation = item.translations?.[0];

    return {
      id: item.id,
      imageUrl: item.imageUrl,
      isPublished: item.isPublished,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      title: translation?.title || '',
      content: translation?.content || '',
    };
  }

  async createNews(data: {
    title: { [key: string]: string };
    content: { [key: string]: string };
    imageUrl?: string;
    isPublished?: boolean;
  }) {
    const languages = Object.keys(data.title);
    const createInput: Prisma.NewsCreateInput = {
      imageUrl: data.imageUrl,
      isPublished: data.isPublished,
      translations: {
        create: languages.map((lang) => ({
          language: lang,
          title: data.title[lang],
          content: data.content[lang],
        })),
      },
    };

    return this.newsEntity.create(createInput);
  }
}
