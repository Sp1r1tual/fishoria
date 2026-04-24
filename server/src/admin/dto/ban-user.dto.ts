import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const BanUserSchema = z.object({
  userId: z.uuid(),
  reason: z.string().min(1, 'Reason is required'),
  expiresAt: z.string().optional(),
});

export class BanUserDto extends createZodDto(BanUserSchema) {}
