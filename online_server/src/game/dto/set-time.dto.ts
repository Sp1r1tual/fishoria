import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SetTimeSchema = z.object({
  hour: z.number().int().min(0).max(23),
});

export class SetTimeDto extends createZodDto(SetTimeSchema) {}
