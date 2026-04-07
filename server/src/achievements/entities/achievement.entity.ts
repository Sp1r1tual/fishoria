import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AchievementEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(language: string) {
    return this.prisma.achievement.findMany({
      include: {
        translations: {
          where: { language },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByCode(code: string, language: string) {
    return this.prisma.achievement.findUnique({
      where: { code },
      include: {
        translations: {
          where: { language },
        },
      },
    });
  }

  async create(data: Prisma.AchievementCreateInput) {
    return this.prisma.achievement.create({
      data,
      include: { translations: true },
    });
  }
}
