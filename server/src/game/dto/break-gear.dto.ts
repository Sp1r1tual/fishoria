import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const BreakSchema = z.object({
  type: z.enum(['rod', 'reel', 'line', 'hook', 'bait']),
  baitId: z.string().optional(),
  lostMeters: z.number().optional(),
  rodDamage: z.number().optional(),
  reelDamage: z.number().optional(),
});

export class BreakDto extends createZodDto(BreakSchema) {}
