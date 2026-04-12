import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ConditionSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string(),
  target: z.number(),
  label: z.string(),
  lakeId: z.string().optional(),
});

const QuestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  conditions: z.array(ConditionSchema),
  xpReward: z.number(),
  moneyReward: z.number(),
  order: z.number(),
  createdAt: z.iso.datetime().or(z.any()).optional(),
  updatedAt: z.iso.datetime().or(z.any()).optional(),
});

class QuestResponseDto extends createZodDto(QuestSchema) {}

export const PlayerQuestSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  questId: z.string(),
  quest: QuestSchema,
  progress: z.any(),
  isCompleted: z.boolean(),
  isClaimed: z.boolean(),
  createdAt: z.iso.datetime().or(z.any()).optional(),
  updatedAt: z.iso.datetime().or(z.any()).optional(),
});

export class PlayerQuestResponseDto extends createZodDto(PlayerQuestSchema) {}
