import { useAppSelector } from '@/hooks/core/useAppStore';

import { CatchPopup } from '@/components/CatchPopup/CatchPopup';

import { LakeScene } from '@/game/engine/scenes/LakeScene';

interface ICatchSyncProps {
  sceneRef: React.RefObject<LakeScene | null>;
}

export function CatchSync({ sceneRef }: ICatchSyncProps) {
  const lastCatch = useAppSelector((s) => s.game.lastCatch);

  if (!lastCatch) return null;

  return <CatchPopup result={lastCatch} sceneRef={sceneRef} />;
}
