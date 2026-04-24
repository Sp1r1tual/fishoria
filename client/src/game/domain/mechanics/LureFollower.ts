export class LureFollower {
  public speciesId: string;
  public interest: number = 0;
  public state: 'following' | 'attacking' | 'lost' = 'following';
  private timeSinceLastMovement: number = 0;

  constructor(speciesId: string, initialInterest: number = 0.1) {
    this.speciesId = speciesId;
    this.interest = initialInterest;
  }

  private continuousReelTime: number = 0;

  public update(deltaTime: number, isMoving: boolean) {
    const dtSec = deltaTime;

    if (isMoving) {
      this.timeSinceLastMovement = 0;
      this.continuousReelTime += dtSec;

      if (this.continuousReelTime < 0.25) {
        // Penalty for very short "stutter" movements
        this.interest -= 0.15 * dtSec;
      } else if (this.continuousReelTime > 1.4) {
        this.interest -= 0.85 * dtSec;
      } else {
        this.interest += 0.32 * dtSec;
      }
    } else {
      // Decay continuous time instead of instant reset to prevent spam
      this.continuousReelTime = Math.max(
        0,
        this.continuousReelTime - dtSec * 4,
      );
      this.timeSinceLastMovement += dtSec;

      if (this.timeSinceLastMovement < 0.8) {
        // Small bonus for a proper "stop-and-go" pause
        this.interest += 0.05 * dtSec;
      } else if (this.timeSinceLastMovement > 1.6) {
        this.interest -= 1.2 * dtSec;
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
