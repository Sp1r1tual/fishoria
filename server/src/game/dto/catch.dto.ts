import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CatchSchema = z.object({
  speciesId: z.string(),
  speciesName: z.string(),
  weight: z.number(),
  length: z.number(),
  lakeId: z.string(),
  lakeName: z.string(),
  baitUsed: z.string(),
  method: z.enum(['FLOAT', 'SPINNING', 'FEEDER']),
  rodDamage: z.number().optional(),
  reelDamage: z.number().optional(),
  maxWeight: z.number().optional(),
  sizeRank: z.enum(['small', 'good', 'trophy']).optional(),
  isReleased: z.boolean().optional(),
});

export class CatchDto extends createZodDto(CatchSchema) {}
