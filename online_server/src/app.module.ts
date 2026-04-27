import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { StatusModule } from './status/status.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

import { validateEnv } from './common/configs/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    StatusModule,
    PrismaModule,
    RedisModule,
    ChatModule,
    AuthModule,
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
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
