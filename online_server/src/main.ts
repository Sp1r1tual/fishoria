import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { join } from 'path';

import { AppModule } from './app.module';
import { StatusService } from './status/status.service';
import { setupSwagger } from './common/configs/swagger.config';
import { getCorsConfig } from './common/configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);
  const staticPath = fs.existsSync(join(process.cwd(), 'public'))
    ? join(process.cwd(), 'public')
    : join(__dirname, '..', 'public');

  app.useStaticAssets(staticPath);

  const configService = app.get(ConfigService);
  app.enableCors(getCorsConfig(configService));

  app.use(cookieParser());

  setupSwagger(app);

  const port = process.env.PORT ?? 5001;
  await app.listen(port);

  const statusService = app.get(StatusService);
  statusService.setStatus(
    'online',
    `Server is online and listening on port ${port}`,
  );
}
bootstrap();
