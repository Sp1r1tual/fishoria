import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { AddMoneyDto } from './dto/player.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('player')
@ApiCookieAuth('Authentication')
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current player profile' })
  @ApiResponse({ status: 200, description: 'Return player profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@GetUserId() userId: string) {
    return this.playerService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @Post('add-money')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Add money to player (Moderator only)' })
  @ApiResponse({ status: 201, description: 'Money added successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  addMoney(
    @GetUserId() modId: string,
    @Body(new ZodValidationPipe(AddMoneyDto)) body: AddMoneyDto,
  ) {
    return this.playerService.addMoney(body.targetUserId || modId, body.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Reset player profile' })
  @ApiResponse({ status: 201, description: 'Profile reset successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  resetProfile(@GetUserId() userId: string) {
    return this.playerService.resetProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('language')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Update player language' })
  @ApiBody({
    schema: { type: 'object', properties: { language: { type: 'string' } } },
  })
  @ApiResponse({ status: 201, description: 'Language updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateLanguage(
    @GetUserId() userId: string,
    @Body('language') language: string,
  ) {
    return this.playerService.updateLanguage(userId, language);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Update player profile' })
  @ApiResponse({ status: 201, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateProfile(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(UpdateProfileDto)) body: UpdateProfileDto,
  ) {
    return this.playerService.updateProfile(userId, body);
  }
}
