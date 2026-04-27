import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsConfig(configService: ConfigService): CorsOptions {
  const clientUrl =
    configService.get<string>('CLIENT_URL') ?? 'http://localhost:5173';
  const apiUrl =
    configService.get<string>('API_URL') ?? 'http://localhost:5001';

  const allowedOrigins = [clientUrl, apiUrl].filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
