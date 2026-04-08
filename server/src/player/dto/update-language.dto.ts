import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const UpdateLanguageSchema = z.object({
  language: z.enum(['en', 'uk']),
});

export class UpdateLanguageDto extends createZodDto(UpdateLanguageSchema) {}
