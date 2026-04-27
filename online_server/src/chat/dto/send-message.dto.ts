import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SendMessageSchema = z.object({
  text: z.string().min(1).max(100),
});

export class SendMessageDto extends createZodDto(SendMessageSchema) {}
