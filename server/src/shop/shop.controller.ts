import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { BuyDto } from './dto/shop.dto';

@ApiTags('shop')
@ApiCookieAuth('Authentication')
@ApiSecurity('XSRF')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post('buy')
  @ApiOperation({ summary: 'Buy item from shop' })
  @ApiResponse({ status: 201, description: 'Item purchased successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  buyItem(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(BuyDto))
    body: BuyDto,
  ) {
    return this.shopService.buy(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sell')
  @ApiOperation({ summary: 'Sell all caught fish' })
  @ApiResponse({ status: 201, description: 'Fish sold successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  sellItem(@GetUserId() userId: string) {
    return this.shopService.sellAllFish(userId);
  }
}
