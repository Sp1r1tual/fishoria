import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const RepairSchema = z.object({
  kitUid: z.string(),
  targetUid: z.string(),
  targetType: z.enum(['rod', 'reel']),
});

export class RepairDto extends createZodDto(RepairSchema) {}
