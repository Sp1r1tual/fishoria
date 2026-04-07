import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      message: 'NODE_ENV must be development, production, or test',
    })
    .default('development'),

  PORT: z.string().min(1, 'PORT is required'),
  CLIENT_URL: z.url('CLIENT_URL must be a valid URL'),
  API_URL: z.url('API_URL must be a valid URL'),
  MAIL_API_URL: z.url('MAIL_API_URL must be a valid URL'),

  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),
  POOLER_DATABASE_URL: z.url('POOLER_DATABASE_URL must be a valid URL'),

  UPSTASH_REDIS_REST_URL: z.url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, {
    message: 'UPSTASH_REDIS_REST_TOKEN is required',
  }),

  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_SECRET: z.string().min(1, 'GOOGLE_SECRET is required'),
  GOOGLE_CALLBACK_URL: z.url('GOOGLE_CALLBACK_URL must be a valid URL'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRATION: z
    .string()
    .min(1, 'JWT_ACCESS_TOKEN_EXPIRATION is required'),
  JWT_REFRESH_TOKEN_EXPIRATION: z
    .string()
    .min(1, 'JWT_REFRESH_TOKEN_EXPIRATION is required'),

  JWT_RESET_SECRET: z
    .string()
    .min(32, 'JWT_RESET_SECRET must be at least 32 characters'),
  JWT_RESET_TOKEN_EXPIRATION: z
    .string()
    .min(1, 'JWT_RESET_TOKEN_EXPIRATION is required'),

  SMTP_USER: z.email('SMTP_USER must be a valid email'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
});
