import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ServerStatusResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  uptime: z.number(),
  timestamp: z.iso.datetime().or(z.any()).optional(),
});

export class ServerStatusResponseDto extends createZodDto(
  ServerStatusResponseSchema,
) {}
