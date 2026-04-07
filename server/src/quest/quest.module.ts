import { Module } from '@nestjs/common';

import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { QuestEntity } from './entities/quest.entity';

@Module({
  controllers: [QuestController],
  providers: [QuestService, PrismaService, QuestEntity],
  exports: [QuestService],
})
export class QuestModule {}
