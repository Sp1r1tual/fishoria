import { Module } from '@nestjs/common';

import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsEntity } from './entities/news.entity';

@Module({
  controllers: [NewsController],
  providers: [NewsService, NewsEntity],
})
export class NewsModule {}
