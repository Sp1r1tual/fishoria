import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { setupSwagger } from './common/configs/swagger.config';
import { getCorsConfig } from './common/configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);

  const configService = app.get(ConfigService);
  app.enableCors(getCorsConfig(configService));

  app.use(cookieParser());

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
