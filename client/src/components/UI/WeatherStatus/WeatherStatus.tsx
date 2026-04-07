import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/hooks/core/useAppStore';

import { TimeManager } from '@/game/managers/TimeManager';

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

  const time = TimeManager.getTime('game');
  const currentHour = time.getHours();
  const isNight = currentHour >= 21 || currentHour < 5;

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
