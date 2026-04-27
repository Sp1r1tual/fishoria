import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    super({
      url: configService.get<string>('UPSTASH_REDIS_REST_URL'),
      token: configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  async onModuleInit() {
    await this.ping();
  }
}
