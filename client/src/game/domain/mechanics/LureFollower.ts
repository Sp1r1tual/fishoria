import { INTEREST_RATES } from '@/common/configs/game';

export class LureFollower {
  public speciesId: string;
  public interest: number = 0;
  public state: 'following' | 'attacking' | 'lost' = 'following';
  private timeSinceLastMovement: number = 0;

  constructor(speciesId: string, initialInterest: number = 0) {
    this.speciesId = speciesId;
    this.interest =
      initialInterest ||
      INTEREST_RATES.spinning.follower.initialInterestMin +
        Math.random() * INTEREST_RATES.spinning.follower.initialInterestRange;
  }

  private continuousReelTime: number = 0;

  public update(deltaTime: number, isMoving: boolean) {
    const dtSec = deltaTime;

    const config = INTEREST_RATES.spinning.follower;

    if (isMoving) {
      this.timeSinceLastMovement = 0;
      this.continuousReelTime += dtSec;

      if (this.continuousReelTime < config.shortMoveThreshold) {
        // Penalty for very short "stutter" movements
        this.interest -= config.shortMovePenalty * dtSec;
      } else if (this.continuousReelTime > config.longMoveThreshold) {
        this.interest -= config.longMovePenalty * dtSec;
      } else {
        this.interest += config.goodMoveBonus * dtSec;
      }
    } else {
      // Decay continuous time instead of instant reset to prevent spam
      this.continuousReelTime = Math.max(
        0,
        this.continuousReelTime - dtSec * config.stopDecayMultiplier,
      );
      this.timeSinceLastMovement += dtSec;

      if (this.timeSinceLastMovement < config.shortPauseThreshold) {
        // Small bonus for a proper "stop-and-go" pause
        this.interest += config.goodPauseBonus * dtSec;
      } else if (this.timeSinceLastMovement > config.longPauseThreshold) {
        this.interest -= config.longPausePenalty * dtSec;
      }
    }

    this.interest = Math.max(0, Math.min(1, this.interest));

    if (this.interest >= 1.0) {
      this.state = 'attacking';
    } else if (this.interest <= 0) {
      this.state = 'lost';
    }
  }
}
