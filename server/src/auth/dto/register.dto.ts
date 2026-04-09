import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  username: z.string().min(3),
  language: z.enum(['en', 'uk']).optional().default('en'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
