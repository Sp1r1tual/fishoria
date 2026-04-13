import { useGameScene } from '@/hooks/game/useGameScene';
import { useAppSelector } from '@/hooks/core/useAppStore';

import { HUD } from '@/components/HUD/HUD';
import { GlobalPreloader } from '@/components/UI/GlobalPreloader/GlobalPreloader';
import { SnagMinigame } from '@/components/UI/SnagMinigame/SnagMinigame';
import { SceneSync } from './SceneSync';
import { CatchSync } from './CatchSync';
import { LossSync } from './LossSync';

import styles from './GameCanvas.module.css';

export function GameCanvas() {
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);

  const { containerRef, sceneRef, isLoading, debugActive, isSnagActive } =
    useGameScene({ currentLakeId });

  return (
    <div className={styles['game-canvas__wrapper']}>
      <div className={styles['game-canvas__viewport']}>
        {isLoading && <GlobalPreloader delay={700} />}

        <SceneSync sceneRef={sceneRef} />
        <CatchSync sceneRef={sceneRef} />
        <LossSync />

        <div
          className={styles['game-canvas__pixi-container']}
          ref={containerRef}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
        />

        <HUD sceneRef={sceneRef} topOnly debugActive={debugActive} />
      </div>

      <div className={styles['game-canvas__hud-tray']}>
        <HUD sceneRef={sceneRef} bottomOnly debugActive={debugActive} />
      </div>

      {isSnagActive && (
        <SnagMinigame
          onComplete={(success: boolean) =>
            sceneRef.current?.completeSnag(success)
          }
        />
      )}
    </div>
  );
}
