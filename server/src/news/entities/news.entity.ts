import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NewsEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(language: string) {
    return this.prisma.news.findMany({
      where: { isPublished: true },
      include: {
        translations: {
          where: { language },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, language: string) {
    return this.prisma.news.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
      },
    });
  }

  async create(data: Prisma.NewsCreateInput) {
    return this.prisma.news.create({
      data,
      include: { translations: true },
    });
  }
}
