import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const AddMoneySchema = z.object({
  targetUserId: z.uuid().optional(),
  amount: z.number().int().min(1).max(1000000, {
    message: 'Amount must not exceed 1,000,000',
  }),
});

export class AddMoneyDto extends createZodDto(AddMoneySchema) {}
