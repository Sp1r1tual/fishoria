import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveBan(userId: string) {
    return this.prisma.userBan.findFirst({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  async createBan(data: Prisma.UserBanCreateInput) {
    return this.prisma.userBan.create({ data });
  }

  async deleteBansByUser(userId: string) {
    return this.prisma.userBan.deleteMany({ where: { userId } });
  }

  async deleteRefreshTokensByUser(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async countPlayers() {
    return this.prisma.user.count();
  }
}
