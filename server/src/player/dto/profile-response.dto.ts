import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { PlayerQuestSchema } from '../../quest/dto/quest-response.dto';

/**
 * Standardized Prisma `include` for PlayerProfile responses.
 * Every endpoint that returns a profile MUST use this to ensure
 * a consistent response shape for the client cache.
 */
export const FULL_PROFILE_INCLUDE = {
  gearItems: true,
  consumables: true,
  fishCatches: true,
  lakeStats: true,
  playerQuests: {
    include: {
      quest: true,
    },
  },
  playerAchievements: {
    include: {
      achievement: {
        include: {
          translations: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      role: true,
      isActivated: true,
      language: true,
    },
  },
} as const;

const GearItemSchema = z.object({
  uid: z.string(),
  profileId: z.string(),
  itemType: z.string(),
  itemId: z.string(),
  condition: z.number().nullable(),
  meters: z.number().nullable(),
  isBroken: z.boolean(),
  createdAt: z.iso.datetime().or(z.any()).optional(),
});

const ConsumableItemSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  itemType: z.string(),
  itemId: z.string(),
  quantity: z.number(),
});

const FishCatchSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  speciesId: z.string(),
  speciesName: z.string(),
  weight: z.number(),
  length: z.number(),
  lakeId: z.string(),
  lakeName: z.string(),
  baitUsed: z.string(),
  method: z.string(),
  isReleased: z.boolean(),
  caughtAt: z.iso.datetime().or(z.any()).optional(),
});

const LakeStatisticSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  lakeId: z.string(),
  totalCaught: z.number(),
  totalWeight: z.number(),
  records: z.any(),
  minWeights: z.any(),
  speciesCounts: z.any(),
  speciesWeights: z.any(),
});

const PlayerAchievementSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  achievementId: z.string(),
  createdAt: z.iso.datetime().or(z.any()).optional(),
  achievement: z.object({
    id: z.string(),
    code: z.string(),
    imageUrl: z.string().nullable(),
    title: z.string(),
    description: z.string(),
  }),
});

const PlayerProfileResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  level: z.number(),
  xp: z.number(),
  money: z.number(),
  equippedRodUid: z.string().nullable(),
  equippedReelUid: z.string().nullable(),
  equippedLineUid: z.string().nullable(),
  equippedHookUid: z.string().nullable(),
  hasEchoSounder: z.boolean(),
  activeBait: z.string(),
  activeGroundbait: z.string(),
  gearItems: z.array(GearItemSchema),
  consumables: z.array(ConsumableItemSchema),
  fishCatches: z.array(FishCatchSchema),
  lakeStats: z.array(LakeStatisticSchema),
  playerQuests: z.array(PlayerQuestSchema),
  playerAchievements: z.array(PlayerAchievementSchema),
  createdAt: z.iso.datetime().or(z.any()).optional(),
  updatedAt: z.iso.datetime().or(z.any()).optional(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    username: z.string().nullable(),
    avatar: z.string().nullable(),
    role: z.enum(['PLAYER', 'MODERATOR', 'ADMIN']),
    isActivated: z.boolean(),
    language: z.string(),
  }),
});

export class PlayerProfileResponseDto extends createZodDto(
  PlayerProfileResponseSchema,
) {}
