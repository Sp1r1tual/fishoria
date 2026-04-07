import { z } from 'zod';

const QuestSchema = z.object({
  id: z.string(),
  title: z.any(),
  description: z.any(),
  imageUrl: z.string().nullable(),
  conditions: z.any(),
  xpReward: z.number(),
  moneyReward: z.number(),
  order: z.number(),
});

export const PlayerQuestSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  questId: z.string(),
  quest: QuestSchema,
  progress: z.any(),
  isCompleted: z.boolean(),
  isClaimed: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});
