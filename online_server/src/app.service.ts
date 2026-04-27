import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return { status: 'online', timestamp: new Date().toISOString() };
  }
}
