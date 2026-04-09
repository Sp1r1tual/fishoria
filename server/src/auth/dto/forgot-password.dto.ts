import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ForgotPasswordSchema = z.object({
  email: z.email(),
  language: z.enum(['en', 'uk']).optional(),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
