import { $onlineApi } from '@/http/axios';

export class OnlineService {
  static async pingStatus() {
    try {
      await $onlineApi.get('/status');
    } catch {
      // Ignore errors for background ping
    }
  }
}
