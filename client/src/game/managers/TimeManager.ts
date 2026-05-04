import { GameEvents } from '@/game/engine/GameEvents';

import { TIME_SYSTEM } from '@/common/configs/game';

let realStartTime = Date.now();
const date = new Date();
date.setUTCHours(TIME_SYSTEM.gameStartHour, 0, 0, 0);
let virtualStartTime = date.getTime();

const saved = localStorage.getItem('fishing_session_data');
if (saved) {
  try {
    const data = JSON.parse(saved);
    if (data.virtualTime && data.savedAt) {
      const elapsedRealMs = Date.now() - data.savedAt;
      const elapsedVirtualMs =
        elapsedRealMs * TIME_SYSTEM.gameTimeSpeedMultiplier;
      virtualStartTime = data.virtualTime + elapsedVirtualMs;
    }
  } catch (e) {
    console.error('Failed to parse saved session time', e);
  }
}

export const TimeManager = {
  getTime(mode: 'real' | 'game' = 'game'): Date {
    if (mode === 'real') {
      return new Date();
    }

    const now = Date.now();
    const elapsedReal = now - realStartTime;
    const elapsedVirtual = elapsedReal * TIME_SYSTEM.gameTimeSpeedMultiplier;

    return new Date(virtualStartTime + elapsedVirtual);
  },

  setGameTime(hour: number) {
    const date = this.getTime('game');
    date.setUTCHours(hour, 0, 0, 0);
    virtualStartTime = date.getTime();
    realStartTime = Date.now();

    GameEvents.emit('timeUpdate', { hour, mode: 'game' });
  },

  /**
   * Returns the absolute game time in years since the Unix era.
   * Used to compare timestamps (e.g., end of baiting).
   * For the hour of the day (0-23) use getTime('game').getUTCHours().
   */
  getGameTimeHours(): number {
    const d = this.getTime('game');
    return d.getTime() / (1000 * 60 * 60);
  },

  saveSessionData(
    weather: string,
    forecast: string[],
    lastUpdate: number | null,
  ) {
    const data = {
      virtualTime: this.getTime('game').getTime(),
      weather,
      weatherForecast: forecast,
      lastWeatherUpdateHour: lastUpdate,
      savedAt: Date.now(),
    };
    localStorage.setItem('fishing_session_data', JSON.stringify(data));
  },

  loadSessionData(): {
    virtualTime: number;
    weather: string;
    weatherForecast?: string[];
    lastWeatherUpdateHour?: number | null;
  } | null {
    const saved = localStorage.getItem('fishing_session_data');
    if (!saved) return null;
    try {
      const data = JSON.parse(saved);
      return data;
    } catch {
      return null;
    }
  },

  restoreSession(virtualTime: number) {
    realStartTime = Date.now();
    virtualStartTime = virtualTime;

    const h = new Date(virtualTime).getUTCHours();
    GameEvents.emit('timeUpdate', { hour: h, mode: 'game' });
  },

  formatTimeRemaining(
    targetHours: number,
    t?: (key: string) => string,
  ): string {
    const current = this.getGameTimeHours();
    const diffHours = targetHours - current;
    if (diffHours <= 0) return '0';

    const totalMinutes = Math.floor(diffHours * 60);

    if (diffHours >= 1) {
      const hrs = Math.ceil(diffHours);
      const hourLabel = t ? t('units.hour') : 'h';
      return `${hrs} ${hourLabel}`;
    }

    const mins = Math.max(1, totalMinutes);
    const minLabel = t ? t('units.min') : 'm';
    return `${mins} ${minLabel}`;
  },
};

let lastEmittedHour = -1;
setInterval(() => {
  const currentHour = TimeManager.getTime('game').getUTCHours();
  if (currentHour !== lastEmittedHour) {
    if (lastEmittedHour !== -1) {
      GameEvents.emit('timeUpdate', { hour: currentHour, mode: 'game' });
    }
    lastEmittedHour = currentHour;
  }
}, 1000);
