import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';

import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { CatchDto } from './dto/catch.dto';
import { BreakDto } from './dto/break-gear.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('catch')
  catchFish(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(CatchDto))
    body: CatchDto,
  ) {
    return this.gameService.catchFish(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('break')
  breakGear(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(BreakDto))
    body: BreakDto,
  ) {
    return this.gameService.breakGear(userId, body);
  }
}
