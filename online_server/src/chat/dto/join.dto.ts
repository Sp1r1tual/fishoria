import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const JoinSchema = z.object({
  lakeId: z.string().min(1),
});

export class JoinDto extends createZodDto(JoinSchema) {}
