import type { GameUiEventMap } from '@/common/types';

export const GameEvents = {
  emit<K extends keyof GameUiEventMap>(event: K, data: GameUiEventMap[K]) {
    window.dispatchEvent(new CustomEvent(`game-ui-${event}`, { detail: data }));
  },
  on<K extends keyof GameUiEventMap>(
    event: K,
    cb: (data: GameUiEventMap[K]) => void,
  ) {
    const handler = (e: Event) => {
      if ('detail' in e) cb((e as CustomEvent).detail);
    };
    window.addEventListener(`game-ui-${event}`, handler);
    return () => window.removeEventListener(`game-ui-${event}`, handler);
  },
};
