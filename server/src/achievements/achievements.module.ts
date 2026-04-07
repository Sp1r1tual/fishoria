import { Module } from '@nestjs/common';

import { PrismaModule } from '../common/prisma/prisma.module';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { AchievementEntity } from './entities/achievement.entity';

@Module({
  imports: [PrismaModule],
  providers: [AchievementsService, AchievementEntity],
  controllers: [AchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
