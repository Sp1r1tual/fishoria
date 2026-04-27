import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MarkReadSchema = z.object({
  lakeId: z.string().min(1),
  messageId: z.string().min(1),
  type: z.enum(['chat', 'system']),
});

export class MarkReadDto extends createZodDto(MarkReadSchema) {}
