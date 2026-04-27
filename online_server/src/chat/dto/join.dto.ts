import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const JoinSchema = z.object({
  userId: z.uuid(),
  lakeId: z.string().min(1),
  token: z.string(),
});

export class JoinDto extends createZodDto(JoinSchema) {}
