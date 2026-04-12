import type {
  IPlayerProfile,
  ICatchFishPayload,
  IBreakGearPayload,
} from '@/common/types';

import { $mainApi } from '@/http/axios';

export class GameService {
  static async catchFish(payload: ICatchFishPayload): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/game/catch',
      payload,
    );
    return data;
  }

  static async breakGear(payload: IBreakGearPayload): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/game/break',
      payload,
    );
    return data;
  }
}
