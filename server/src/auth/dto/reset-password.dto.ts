import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'New password must be at least 8 characters'),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
