import { useAppSelector } from '@/hooks/core/useAppStore';

import { GameChatContent } from './GameChatContent';

interface IGameChatProps {
  isNight?: boolean;
}

export function GameChat({ isNight = false }: IGameChatProps) {
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);
  const readPointers = useAppSelector((s) => s.online.readPointers);

  return (
    <GameChatContent
      key={currentLakeId}
      isNight={isNight}
      initialReadPointers={readPointers}
    />
  );
}
