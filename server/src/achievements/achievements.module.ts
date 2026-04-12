import { Module } from '@nestjs/common';

import { PrismaModule } from '../common/prisma/prisma.module';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementEntity } from './entities/achievement.entity';

@Module({
  imports: [PrismaModule],
  providers: [AchievementsService, AchievementEntity],
  controllers: [AchievementsController],
  exports: [AchievementsService, AchievementEntity],
})
export class AchievementsModule {}
