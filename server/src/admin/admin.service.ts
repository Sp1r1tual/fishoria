import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { marked as MarkedType } from 'marked';

import { MailService } from '../mail/mail.service';
import { RedisService } from '../common/redis/redis.service';

import { AdminEntity } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminEntity: AdminEntity,
    private readonly redis: RedisService,
    private readonly mailService: MailService,
  ) {}

  async banUser(
    userId: string,
    reason: string,
    bannedById: string,
    expiresAt?: Date,
  ) {
    if (userId === bannedById) {
      throw new BadRequestException('auth.errors.cannotBanSelf');
    }

    const existingBan = await this.adminEntity.findActiveBan(userId);

    if (existingBan) {
      throw new BadRequestException('User is already banned');
    }

    const ban = await this.adminEntity.createBan({
      user: { connect: { id: userId } },
      reason,
      bannedBy: { connect: { id: bannedById } },
      expiresAt,
    });

    const redisTTL = expiresAt
      ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      : 3600 * 24 * 7;

    if (redisTTL > 0) {
      await this.redis.set(`ban:${userId}`, reason, { ex: redisTTL });
    }

    await this.adminEntity.deleteRefreshTokensByUser(userId);

    const user = await this.adminEntity.findUserById(userId);
    if (user) {
      this.mailService
        .sendBanMail(user.email, reason, user.language)
        .catch((e) => console.error(e));
    }

    return ban;
  }

  async unbanUser(userId: string) {
    const result = await this.adminEntity.deleteBansByUser(userId);
    if (result.count === 0) {
      throw new BadRequestException('User is not currently banned');
    }
    await this.redis.del(`ban:${userId}`);

    const user = await this.adminEntity.findUserById(userId);
    if (user) {
      this.mailService
        .sendUnbanMail(user.email, user.language)
        .catch((e) => console.error(e));
    }
  }

  async isUserBanned(userId: string) {
    const ban = await this.adminEntity.findActiveBan(userId);
    return !!ban;
  }

  async getStats() {
    const [playersCount] = await Promise.all([this.adminEntity.countPlayers()]);

    return {
      playersCount,
      version: '0.4.2',
    };
  }

  getDocFiles(): { filename: string; title: string }[] {
    const localDocsPath = path.join(process.cwd(), 'docs');
    const docsPath = fs.existsSync(localDocsPath)
      ? localDocsPath
      : path.join(__dirname, '..', '..', 'docs');

    if (fs.existsSync(docsPath)) {
      return fs
        .readdirSync(docsPath)
        .filter((f) => f.endsWith('.md'))
        .map((filename) => ({
          filename,
          title: filename.replace('.md', '').replace(/[-_]/g, ' '),
        }));
    }
    return [];
  }

  async getRenderedDoc(filename: string) {
    const localDocsPath = path.join(process.cwd(), 'docs');
    const docsPath = fs.existsSync(localDocsPath)
      ? localDocsPath
      : path.join(__dirname, '..', '..', 'docs');
    const filePath = path.join(docsPath, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Documentation file not found');
    }

    const { marked } = await (import('marked') as Promise<{
      marked: typeof MarkedType;
    }>);
    const content = fs.readFileSync(filePath, 'utf-8');

    return {
      html: await marked.parse(content),
      filename,
    };
  }
}
