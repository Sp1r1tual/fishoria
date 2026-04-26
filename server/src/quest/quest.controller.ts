import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

import { QuestService } from './quest.service';
import { PlayerQuestResponseDto } from './dto/quest-response.dto';
import { PlayerProfileResponseDto } from '../player/dto/profile-response.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  async getQuests(
    @GetUserId() userId: string,
    @GetUser('language') tokenLanguage: string,
    @Query('lang') queryLanguage?: string,
  ): Promise<PlayerQuestResponseDto[]> {
    return this.questService.getPlayerQuests(
      userId,
      queryLanguage || tokenLanguage,
    );
  }

  @Post('claim')
  async claimReward(
    @GetUserId() userId: string,
    @Body('playerQuestId') playerQuestId: string,
  ): Promise<PlayerProfileResponseDto> {
    return this.questService.claimReward(userId, playerQuestId);
  }
}
