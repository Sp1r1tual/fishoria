import { $mainApi } from '@/http/axios';

export interface INews {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaginatedNews {
  data: INews[];
  hasMore: boolean;
}

export class NewsService {
  static async getAll(lang?: string): Promise<INews[]>;
  static async getAll(
    lang: string,
    page: number,
    limit: number,
  ): Promise<IPaginatedNews>;
  static async getAll(
    lang: string = 'en',
    page?: number,
    limit?: number,
  ): Promise<INews[] | IPaginatedNews> {
    const { data } = await $mainApi.get<INews[] | IPaginatedNews>('/news', {
      params: { lang, page, limit },
    });
    return data;
  }

  static async getById(id: string, lang: string = 'en') {
    const { data } = await $mainApi.get<INews>(`/news/${id}`, {
      params: { lang },
    });
    return data;
  }
}
