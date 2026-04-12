import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { QuestEntity, IQuestCondition } from './entities/quest.entity';
import { PlayerQuestResponseDto } from './dto/quest-response.dto';
import { PlayerProfileResponseDto } from '../player/dto/profile-response.dto';
import { mapPlayerProfile } from '../player/mappers/player.mapper';

@Injectable()
export class QuestService {
  constructor(private readonly questEntity: QuestEntity) {}

  async getPlayerQuests(
    userId: string,
    language: string = 'en',
  ): Promise<PlayerQuestResponseDto[]> {
    const profile = await this.questEntity.findProfileWithQuests(
      userId,
      language,
    );
    if (!profile) throw new NotFoundException('Profile not found');

    return profile.playerQuests.map((pq) => {
      const q = pq.quest;
      const translation = q?.translations?.[0];

      const title = translation?.title || '';
      const description = translation?.description || '';

      const rawConditions =
        (q?.conditions as unknown as IQuestCondition[]) || [];
      const conditions = rawConditions
        .map((c) => {
          if (!c) return null;
          const labelObj =
            c.label && typeof c.label === 'object'
              ? (c.label as Record<string, string>)
              : null;

          const label = labelObj
            ? labelObj[language] || labelObj['en'] || ''
            : (c.label as string) || '';

          return {
            id: c.id,
            type: c.type,
            value: c.value,
            target: c.target,
            label,
            lakeId: c.lakeId,
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      return {
        ...pq,
        quest: {
          ...q,
          title,
          description,
          conditions,
        },
      };
    });
  }

  async claimReward(
    userId: string,
    playerQuestId: string,
  ): Promise<PlayerProfileResponseDto> {
    const profile = await this.questEntity.findProfile(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const playerQuest =
      await this.questEntity.findPlayerQuestWithDef(playerQuestId);

    if (!playerQuest || playerQuest.profileId !== profile.id) {
      throw new BadRequestException('Quest not found for this player');
    }

    if (!playerQuest.isCompleted) {
      throw new BadRequestException('Quest is not completed yet');
    }

    if (playerQuest.isClaimed) {
      throw new BadRequestException('Reward already claimed');
    }

    const updatedProfile = await this.questEntity.executeClaimRewardTx(
      playerQuestId,
      profile.id,
    );

    return mapPlayerProfile(
      updatedProfile,
    ) as unknown as PlayerProfileResponseDto;
  }
}
