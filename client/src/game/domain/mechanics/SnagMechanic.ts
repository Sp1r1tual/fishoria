import { SNAG } from '@/common/configs/game';

interface ISnagParams {
  rigType?: string;
  isOnBottom?: boolean;
  isMoving?: boolean;
  deltaTime: number;
}

export class SnagMechanic {
  private snagChanceCounter = 0;

  public updateSpinningSnag(params: ISnagParams): boolean {
    if (params.rigType !== 'spinning') return false;

    if (params.isOnBottom && params.isMoving) {
      this.snagChanceCounter +=
        (params.deltaTime / 60) * SNAG.spinningAccumulationRate;

      // Starting from grace period of bottom dragging, start rolling for snag
      if (this.snagChanceCounter > SNAG.spinningSnagGracePeriod) {
        const snagProb =
          (this.snagChanceCounter - SNAG.spinningSnagGracePeriod) *
          SNAG.spinningSnagProbMultiplier *
          params.deltaTime;
        if (Math.random() < snagProb) {
          this.snagChanceCounter = 0;
          return true;
        }
      }
    } else {
      // Slow decay if not dragging
      this.snagChanceCounter = Math.max(
        0,
        this.snagChanceCounter -
          (params.deltaTime / 60) * SNAG.spinningDecayRate,
      );
    }

    return false;
  }

  public checkStaticSnag(
    rigType: string | undefined,
    isOnBottom: boolean,
  ): boolean {
    if (!isOnBottom) return false;

    if (rigType === 'float') {
      return Math.random() < SNAG.floatOnBottomSnagChance;
    }

    if (rigType === 'feeder') {
      return Math.random() < SNAG.feederOnBottomSnagChance;
    }

    return false;
  }

  public reset(): void {
    this.snagChanceCounter = 0;
  }

  public getSnagProgress(): number {
    return this.snagChanceCounter;
  }
}
