import { $mainApi } from '@/http/axios';

export const ShopService = {
  buy: async (payload: {
    itemId: string;
    itemType: string;
    quantity?: number;
  }) => {
    const { data } = await $mainApi.post('/shop/buy', payload);
    return data;
  },
  sell: async () => {
    const { data } = await $mainApi.post('/shop/sell');
    return data;
  },
};
