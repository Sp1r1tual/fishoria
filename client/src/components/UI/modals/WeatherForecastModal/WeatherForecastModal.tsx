import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/hooks/core/useAppStore';

import { Modal } from '../Modal/Modal';

import { TimeManager } from '@/game/managers/TimeManager';

import styles from './WeatherForecastModal.module.css';

interface IWeatherForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeatherForecastModal({
  isOpen,
  onClose,
}: IWeatherForecastModalProps) {
  const { t } = useTranslation();
  const weatherForecast = useAppSelector((s) => s.game.weatherForecast);
  const lastWeatherUpdateHour = useAppSelector(
    (s) => s.game.lastWeatherUpdateHour,
  );
  const day = weatherForecast.slice(0, 24);

  const startHour =
    lastWeatherUpdateHour !== null
      ? new Date(lastWeatherUpdateHour * 3600000).getUTCHours()
      : new Date(TimeManager.getTime('game')).getUTCHours();
  const middleHour = (startHour + 12) % 24;
  const endHour = (startHour + 23) % 24;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather.forecastModalTitle', 'Weather Forecast')}
      showCloseButton
      closeButtonVariant="wooden"
    >
      <div className={styles.container}>
        <div className={styles.dayRow}>
          <div className={styles.dayLabel}>
            {t('weather.next24Hours', 'Next 24 Hours')}
          </div>
          <div className={styles.hoursGrid}>
            {day.map((weatherType, hourIndex) => {
              const cellHour = (startHour + hourIndex) % 24;
              const isNight = cellHour >= 21 || cellHour < 5;
              const weather = weatherType || 'clear';
              let label = t(`weather.${weather}`);

              if (weather === 'clear' && isNight) {
                label = label.replace('☀️', '🌙');
              }

              return (
                <div
                  key={hourIndex}
                  className={`${styles.hourCell} ${styles[weather] || styles.clear} ${
                    hourIndex === 0 ? styles.currentHour : ''
                  }`}
                  title={
                    hourIndex === 0
                      ? `${t('weather.now', 'Now')} - ${label}`
                      : `+${hourIndex}h - ${label}`
                  }
                />
              );
            })}
          </div>
          <div className={styles.timelineLabels}>
            <span>{String(startHour).padStart(2, '0')}:00</span>
            <span>{String(middleHour).padStart(2, '0')}:00</span>
            <span>{String(endHour).padStart(2, '0')}:00</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
