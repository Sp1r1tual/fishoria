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
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('news')
@Throttle({ default: { limit: 120, ttl: 60000 } })
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all news' })
  @ApiResponse({ status: 200, description: 'Return list of news.' })
  getAllNews(@Query('lang') lang?: string) {
    return this.newsService.getAllNews(lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news by ID' })
  @ApiResponse({ status: 200, description: 'Return news item.' })
  @ApiResponse({ status: 404, description: 'News not found.' })
  getNewsById(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.newsService.getNewsById(id, lang);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @Post()
  @ApiCookieAuth('Authentication')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Create news item (Moderator only)' })
  @ApiResponse({ status: 201, description: 'News created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
