import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { QuestService } from './quest.service';

@ApiTags('quests')
@ApiCookieAuth('Authentication')
@Throttle({ default: { limit: 120, ttl: 60000 } })
@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active quests for player' })
  @ApiResponse({ status: 200, description: 'Return list of quests.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getQuests(
    @GetUserId() userId: string,
    @GetUser('language') language: string,
  ) {
    return this.questService.getPlayerQuests(userId, language);
  }

  @Post('claim')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Claim quest reward' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { playerQuestId: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Reward claimed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async claimReward(
    @GetUserId() userId: string,
    @Body('playerQuestId') playerQuestId: string,
  ) {
    return this.questService.claimReward(userId, playerQuestId);
  }
}
