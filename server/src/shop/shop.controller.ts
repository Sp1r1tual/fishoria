import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';

import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { BuyDto } from './dto/shop.dto';

import { PlayerProfileResponseDto } from '../player/dto/profile-response.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post('buy')
  buyItem(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(BuyDto))
    body: BuyDto,
  ): Promise<PlayerProfileResponseDto> {
    return this.shopService.buy(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sell')
  sellItem(@GetUserId() userId: string): Promise<PlayerProfileResponseDto> {
    return this.shopService.sellAllFish(userId);
  }
}
