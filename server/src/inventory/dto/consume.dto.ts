import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ConsumeSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['bait', 'groundbait']),
  quantity: z.number().int().positive().optional(),
});

export class ConsumeDto extends createZodDto(ConsumeSchema) {}
