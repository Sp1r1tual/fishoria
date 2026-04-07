import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  avatar: z.string().optional(),
});

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
