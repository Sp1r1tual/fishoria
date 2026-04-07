import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { InventoryModule } from './inventory/inventory.module';
import { GameModule } from './game/game.module';
import { NewsModule } from './news/news.module';
import { QuestModule } from './quest/quest.module';
import { validateEnv } from './common/configs/env.validation';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { MailModule } from './mail/mail.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CsrfMiddleware } from './auth/middlewares/csrf.middleware';
import { CsrfGuard } from './auth/guards/csrf.guard';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    RedisModule,
    MailModule,
    ShopModule,
    AuthModule,
    PlayerModule,
    InventoryModule,
    GameModule,
    NewsModule,
    QuestModule,
    AchievementsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
