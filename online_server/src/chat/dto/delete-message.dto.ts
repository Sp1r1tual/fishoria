import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DeleteMessageSchema = z.object({
  messageId: z.string().min(1),
});

export class DeleteMessageDto extends createZodDto(DeleteMessageSchema) {}
