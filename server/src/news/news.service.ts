import { Injectable } from '@nestjs/common';
import { News, NewsTranslation, Prisma } from '@prisma/client';

import { RedisService } from '../common/redis/redis.service';
import { NewsEntity } from './entities/news.entity';

export interface ILocalizedNews {
  id: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
}

const NEWS_CACHE_TTL = 600;

@Injectable()
export class NewsService {
  constructor(
    private readonly newsEntity: NewsEntity,
    private readonly redis: RedisService,
  ) {}

  async getAllNews(language: string = 'en', page?: number, limit?: number) {
    const cacheKey = `cache:news:${language}`;

    let result: ILocalizedNews[] | null = null;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      if (typeof cached !== 'string') {
        result = cached as unknown as ILocalizedNews[];
      } else {
        try {
          result = JSON.parse(cached);
        } catch {
          console.error(`Corrupted cache for news at ${cacheKey}. Clearing...`);
          await this.redis.del(cacheKey).catch(() => null);
        }
      }
    }

    if (!result) {
      const news = await this.newsEntity.findPublished(language);
      result = news.map((item) => this.mapLocalized(item));

      await this.redis
        .set(cacheKey, JSON.stringify(result), { ex: NEWS_CACHE_TTL })
        .catch(() => null);
    }

    if (page !== undefined && limit !== undefined) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = result.slice(startIndex, endIndex);
      return {
        data: paginatedData,
        hasMore: endIndex < result.length,
      };
    }

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

    const created = await this.newsEntity.create(createInput);

    // Invalidate caches
    for (const lang of languages) {
      await this.redis.del(`cache:news:${lang}`).catch(() => null);
    }

    return created;
  }
}
