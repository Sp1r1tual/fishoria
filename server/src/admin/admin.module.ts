import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';

import { AdminService } from './admin.service';
import { AdminEntity } from './entities/admin.entity';

import { PrismaModule } from '../common/prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, RedisModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService, AdminEntity],
  exports: [AdminService],
})
export class AdminModule {}
