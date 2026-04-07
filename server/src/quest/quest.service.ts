import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { QuestEntity } from './entities/quest.entity';

interface LocalizedQuestField {
  [lang: string]: string | undefined;
}

interface QuestCondition {
  id: string;
  type: string;
  value: string;
  target: number;
  label: LocalizedQuestField | string;
}

@Injectable()
export class QuestService {
  constructor(private readonly questEntity: QuestEntity) {}

  async getPlayerQuests(userId: string, language: string = 'en') {
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
        (q?.conditions as unknown as QuestCondition[]) || [];
      const conditions = rawConditions
        .map((c) => {
          if (!c) return null;
          const labelObj =
            c.label && typeof c.label === 'object'
              ? (c.label as LocalizedQuestField)
              : null;

          const label = labelObj
            ? labelObj[language] || labelObj['en'] || ''
            : (c.label as string) || '';

          return {
            ...c,
            label,
          };
        })
        .filter(Boolean);

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

  async claimReward(userId: string, playerQuestId: string) {
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

    return this.questEntity.executeClaimRewardTx(playerQuestId, profile.id);
  }
}
