import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const EquipItemSchema = z.object({
  targetType: z.enum(['rod', 'reel', 'line', 'hook', 'bait', 'groundbait']),
  uid: z.string().nullable().optional(),
  targetId: z.string().nullable().optional(),
});

const EquipSchema = z.object({
  targetType: z
    .enum(['rod', 'reel', 'line', 'hook', 'bait', 'groundbait'])
    .optional(),
  uid: z.string().nullable().optional(),
  targetId: z.string().nullable().optional(),

  equips: z.array(EquipItemSchema).optional(),
});

export class EquipDto extends createZodDto(EquipSchema) {}
type EquipItemDto = z.infer<typeof EquipItemSchema>;
