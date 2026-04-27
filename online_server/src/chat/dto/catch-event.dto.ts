import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CatchEventSchema = z.object({
  speciesName: z.string(),
  weight: z.number().positive(),
  lakeId: z.string(),
  lakeName: z.string(),
  method: z.enum(['float', 'spinning', 'feeder']),
});

export class CatchEventDto extends createZodDto(CatchEventSchema) {}
