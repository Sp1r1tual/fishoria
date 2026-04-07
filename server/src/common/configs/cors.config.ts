import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsConfig(configService: ConfigService): CorsOptions {
  return {
    origin: configService.get<string>('CLIENT_URL') ?? 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
  };
}
