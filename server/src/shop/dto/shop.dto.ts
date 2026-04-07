import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const BuySchema = z.object({
  itemId: z.string(),
  itemType: z.enum([
    'rod',
    'reel',
    'line',
    'hook',
    'bait',
    'groundbait',
    'gadget',
    'repair_kit',
  ]),
  quantity: z.number().int().positive().optional(),
});

export class BuyDto extends createZodDto(BuySchema) {}
