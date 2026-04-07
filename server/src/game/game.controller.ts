import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { CatchDto } from './dto/catch.dto';
import { BreakDto } from './dto/break-gear.dto';

@ApiTags('game')
@ApiCookieAuth('Authentication')
@ApiSecurity('XSRF')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('catch')
  @ApiOperation({ summary: 'Register a fish catch' })
  @ApiResponse({ status: 201, description: 'Fish caught successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  catchFish(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(CatchDto))
    body: CatchDto,
  ) {
    return this.gameService.catchFish(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('break')
  @ApiOperation({ summary: 'Register gear break' })
  @ApiResponse({ status: 201, description: 'Gear broken recorded.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  breakGear(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(BreakDto))
    body: BreakDto,
  ) {
    return this.gameService.breakGear(userId, body);
  }
}
