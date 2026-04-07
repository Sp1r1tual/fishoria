import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AchievementsService } from './achievements.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('achievements')
@ApiCookieAuth('Authentication')
@Controller('achievements')
export class AchievementsController {
  private readonly logger = new Logger(AchievementsController.name);

  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all achievements' })
  @ApiResponse({ status: 200, description: 'Return list of achievements.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAchievements(@GetUser('language') language: string) {
    this.logger.log('Fetching achievements list');
    return this.achievementsService.getAllAchievements(language);
  }
}
