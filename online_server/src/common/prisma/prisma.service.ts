import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { EServerStatus } from '../../status/enums/status.enum';

import { StatusService } from '../../status/status.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor(
    configService: ConfigService,
    private readonly statusService: StatusService,
  ) {
    const connectionString = configService.get<string>('POOLER_DATABASE_URL');
    const pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    this.statusService.setStatus(
      EServerStatus.CONNECTING_DB,
      'Connecting to database...',
    );

    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
