import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/hooks/core/useAppStore';

import { TimeManager } from '@/game/managers/TimeManager';
import { GameEvents } from '@/game/engine/GameEvents';
import { TIME_SYSTEM } from '@/common/configs/game/system.config';

interface IWeatherStatusProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function WeatherStatus({
  className = '',
  onClick,
  title,
}: IWeatherStatusProps) {
  const { t } = useTranslation();
  const weather = useAppSelector((s) => s.game.weather);

  const [currentHour, setCurrentHour] = useState(() =>
    TimeManager.getTime('game').getUTCHours(),
  );

  useEffect(() => {
    const unsubscribe = GameEvents.on('timeUpdate', (data) => {
      if (data.mode === 'game') {
        setCurrentHour(data.hour);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isNight =
    currentHour >= TIME_SYSTEM.nightStart ||
    currentHour < TIME_SYSTEM.morningStart;

  const weatherLabel = (() => {
    switch (weather) {
      case 'rain':
        return t('weather.rain');
      case 'cloudy':
        return t('weather.cloudy');
      default: {
        const clearLabel = t('weather.clear');
        if (isNight) {
          return clearLabel.replace('☀️', '🌙');
        }
        return clearLabel;
      }
    }
  })();

  return (
    <div className={className} onClick={onClick} title={title}>
      {weatherLabel}
    </div>
  );
}
