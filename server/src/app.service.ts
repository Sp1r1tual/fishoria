import { Injectable } from '@nestjs/common';

import { PrismaService } from './common/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [playersCount] = await Promise.all([this.prisma.user.count()]);

    return {
      playersCount,
      version: '0.3.0',
    };
  }
}
