import { Injectable, BadRequestException } from '@nestjs/common';

import { GameEntity } from './entities/game.entity';
import { CatchDto } from './dto/catch.dto';
import { BreakDto } from './dto/break-gear.dto';
import { FISH_SPECIES_MULTIPLIERS } from '../common/configs/prices.config';
import { EXPERIENCE } from '../common/configs/game.config';
import { mapPlayerProfile } from '../player/mappers/player.mapper';

@Injectable()
export class GameService {
  constructor(private readonly gameEntity: GameEntity) {}

  async catchFish(userId: string, body: CatchDto) {
    const user = await this.gameEntity.findUser(userId);
    if (!user) throw new BadRequestException('User not found');

    const lang = user.language;

    const profile = await this.gameEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const duplicate = await this.gameEntity.findDuplicateCatch(
      profile.id,
      body,
    );
    if (duplicate) {
      const fullProfile = await this.gameEntity.findFullProfile(
        profile.id,
        lang,
      );
      return mapPlayerProfile(fullProfile);
    }

    const multiplier = FISH_SPECIES_MULTIPLIERS[body.speciesId] || 1.0;
    const xpGain = Math.ceil(
      (body.weight || 0) * EXPERIENCE.baseXpPerKg * multiplier,
    );
    const updatedProfile = await this.gameEntity.executeCatchFishTx(
      profile,
      body,
      xpGain,
      lang,
    );
    return mapPlayerProfile(updatedProfile);
  }

  async breakGear(userId: string, body: BreakDto) {
    const user = await this.gameEntity.findUser(userId);
    if (!user) throw new BadRequestException('User not found');

    const lang = user.language;

    const profile = await this.gameEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const updatedProfile = await this.gameEntity.executeBreakGearTx(
      profile,
      body,
      lang,
    );
    return mapPlayerProfile(updatedProfile);
  }
}
