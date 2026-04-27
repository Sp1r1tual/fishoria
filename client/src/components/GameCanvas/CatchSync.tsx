import { useEffect, useRef } from 'react';

import type { IFishCatch, ICatchEventPayload } from '@/common/types';

import { useAppSelector } from '@/hooks/core/useAppStore';
import { getChatSocket } from '@/services/socket.service';

import { CatchPopup } from '@/components/CatchPopup/CatchPopup';

import { LakeScene } from '@/game/engine/scenes/LakeScene';

interface ICatchSyncProps {
  sceneRef: React.RefObject<LakeScene | null>;
}

export function CatchSync({ sceneRef }: ICatchSyncProps) {
  const lastCatch = useAppSelector((s) => s.game.lastCatch);
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const emittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastCatch || lastCatch.type !== 'fish' || !onlineMode) return;

    const fish = lastCatch as IFishCatch;
    const catchId = `${fish.species.id}_${fish.weight}_${fish.lakeId}`;

    if (emittedRef.current === catchId) return;
    emittedRef.current = catchId;

    const socket = getChatSocket();
    if (!socket.connected) return;

    const payload: ICatchEventPayload = {
      fishId: fish.species.id,
      speciesName: fish.species.name,
      weight: fish.weight,
      lakeId: fish.lakeId,
      lakeName: fish.lakeName,
      method: fish.method,
    };

    socket.emit('chat:catch_event', payload);
  }, [lastCatch, onlineMode]);

  if (!lastCatch) return null;

  return <CatchPopup result={lastCatch} sceneRef={sceneRef} />;
}
