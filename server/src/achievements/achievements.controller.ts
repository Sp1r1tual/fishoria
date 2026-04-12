import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AchievementsService } from './achievements.service';
import { AchievementResponseDto } from './dto/achievement-response.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAchievements(
    @GetUser('language') language: string,
  ): Promise<AchievementResponseDto[]> {
    return this.achievementsService.getAllAchievements(language);
  }
}
