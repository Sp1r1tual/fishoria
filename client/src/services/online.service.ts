import { $onlineApi } from '@/http/axios';

let lastPingTime = 0;
const PING_THRESHOLD = 30000;

export class OnlineService {
  static async pingStatus(force = false) {
    const now = Date.now();
    if (!force && now - lastPingTime < PING_THRESHOLD) {
      return true;
    }

    try {
      lastPingTime = now;
      await $onlineApi.get('/status');
      return true;
    } catch {
      return false;
    }
  }
}
