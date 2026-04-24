import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UnbanUserSchema = z.object({
  userId: z.uuid(),
});

export class UnbanUserDto extends createZodDto(UnbanUserSchema) {}
