import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AchievementResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  imageUrl: z.string().nullable(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  createdAt: z.iso.datetime().or(z.any()).optional(),
  updatedAt: z.iso.datetime().or(z.any()).optional(),
});

export class AchievementResponseDto extends createZodDto(
  AchievementResponseSchema,
) {}
