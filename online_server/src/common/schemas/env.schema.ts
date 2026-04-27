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

  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),
  POOLER_DATABASE_URL: z.url('POOLER_DATABASE_URL must be a valid URL'),

  UPSTASH_REDIS_REST_URL: z.url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, {
    message: 'UPSTASH_REDIS_REST_TOKEN is required',
  }),
});
