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
    const dtSec = deltaTime / 60;

    if (isMoving) {
      this.timeSinceLastMovement = 0;
      this.continuousReelTime += dtSec;

      if (this.continuousReelTime > 1.4) {
        this.interest -= 0.85 * dtSec;
      } else {
        this.interest += 0.32 * dtSec;
      }
    } else {
      this.continuousReelTime = 0;
      this.timeSinceLastMovement += dtSec;

      if (this.timeSinceLastMovement < 0.8) {
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
