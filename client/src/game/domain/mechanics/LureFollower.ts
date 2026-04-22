export class LureFollower {
  public speciesId: string;
  public interest: number = 0;
  public state: 'following' | 'attacking' | 'lost' = 'following';
  private timeSinceLastMovement: number = 0;

  constructor(speciesId: string, initialInterest: number = 0.1) {
    this.speciesId = speciesId;
    this.interest = initialInterest;
  }

  public update(
    deltaTime: number,
    isMoving: boolean,
    isCorrectTechnique: boolean,
  ) {
    const dtSec = deltaTime / 60;

    if (isMoving) {
      this.timeSinceLastMovement = 0;
      if (isCorrectTechnique) {
        this.interest += 0.55 * dtSec;
      } else {
        this.interest += 0.15 * dtSec;
      }
    } else {
      this.timeSinceLastMovement += dtSec;
      if (this.timeSinceLastMovement > 1.5) {
        this.interest -= 0.3 * dtSec;
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
