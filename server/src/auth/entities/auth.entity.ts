import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByGoogleOrEmail(googleId: string, email: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });
  }

  async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findActiveBan(userId: string) {
    return this.prisma.userBan.findFirst({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserByActivationLink(activationLink: string) {
    return this.prisma.user.findUnique({ where: { activationLink } });
  }

  async createRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    return this.prisma.refreshToken.create({ data });
  }

  async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.delete({ where: { token } });
  }

  async deleteRefreshTokenById(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async createBan(data: Prisma.UserBanCreateInput) {
    return this.prisma.userBan.create({ data });
  }

  async deleteRefreshTokensByUser(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async deleteBansByUser(userId: string) {
    return this.prisma.userBan.deleteMany({ where: { userId } });
  }

  async deletePasswordResetTokensByUser(userId: string) {
    return this.prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  async createPasswordResetToken(data: Prisma.PasswordResetTokenCreateInput) {
    return this.prisma.passwordResetToken.create({ data });
  }

  async findPasswordResetToken(token: string) {
    return this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async executePasswordResetTx(userId: string, hashPassword: string) {
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashPassword },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: { userId },
      }),
    ]);
  }
}
