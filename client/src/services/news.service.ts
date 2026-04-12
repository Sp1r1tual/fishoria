import { $mainApi } from '@/http/axios';

export interface INews {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export class NewsService {
  static async getAll(lang: string = 'en') {
    const { data } = await $mainApi.get<INews[]>('/news', {
      params: { lang },
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
