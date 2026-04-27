import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { EServerStatus } from '../enums/status.enum';

export const ServerStatusEnum = z.nativeEnum(EServerStatus);

export const ServerStatusResponseSchema = z.object({
  status: ServerStatusEnum,
  message: z.string(),
  uptime: z.number(),
  timestamp: z.iso.datetime().or(z.any()).optional(),
});

export class ServerStatusResponseDto extends createZodDto(
  ServerStatusResponseSchema,
) {}
