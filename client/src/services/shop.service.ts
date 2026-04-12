import type { IPlayerProfile, IBuyItemPayload } from '@/common/types';

import { $mainApi } from '@/http/axios';

export class ShopService {
  static async buy(payload: IBuyItemPayload): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>('/shop/buy', payload);
    return data;
  }

  static async sell(): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>('/shop/sell');
    return data;
  }
}
