import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getAllNews(@Query('lang') lang?: string) {
    return this.newsService.getAllNews(lang);
  }

  @Get(':id')
  getNewsById(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.newsService.getNewsById(id, lang);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @Post()
  createNews(
    @Body()
    data: {
      title: { [key: string]: string };
      content: { [key: string]: string };
      imageUrl?: string;
    },
  ) {
    return this.newsService.createNews(data);
  }
}
