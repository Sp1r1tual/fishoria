import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
