import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

import { EServerStatus } from '../../status/enums/status.enum';

import { StatusService } from '../../status/status.service';

@Injectable()
export class RedisService extends Redis implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly statusService: StatusService,
  ) {
    super({
      url: configService.get<string>('UPSTASH_REDIS_REST_URL'),
      token: configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  async onModuleInit() {
    this.statusService.setStatus(
      EServerStatus.CONNECTING_REDIS,
      'Connecting to Redis...',
    );

    await this.ping();
    this.logger.log('Redis connected successfully');
  }
}
