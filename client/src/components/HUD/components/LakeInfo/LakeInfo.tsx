import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';
import { GameClock } from '@/components/UI/GameClock/GameClock';

import { setGroundbaitExpiry } from '@/store/slices/gameSlice';
import { usePlayerQuery } from '@/queries/player.queries';
import { useConsumeMutation } from '@/queries/inventory.queries';
import { WeatherForecastModal } from '@/components/UI/modals/WeatherForecastModal/WeatherForecastModal';
import { WeatherStatus } from '@/components/UI/WeatherStatus/WeatherStatus';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import { GROUNDBAITS } from '@/common/configs/game';
import { TimeManager } from '@/game/managers/TimeManager';

import styles from './LakeInfo.module.css';

interface ILakeInfoProps {
  sceneRef: React.RefObject<LakeScene | null>;
  isDebugActive?: boolean;
}

export function LakeInfo({ sceneRef, isDebugActive }: ILakeInfoProps) {
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLakeInfoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 400);

    if (clickCountRef.current >= 3) {
      sceneRef.current?.toggleDebug();
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    }
  };

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);
  const groundbaitExpiresAt = useAppSelector((s) => s.game.groundbaitExpiresAt);

  const { data: player } = usePlayerQuery();
  const activeGroundbait = player?.activeGroundbait || 'none';
  const consumeMutation = useConsumeMutation();

  const groundbaitCounts =
    player?.consumables
      .filter(
        (c: { itemType: string; itemId: string; quantity: number }) =>
          c.itemType === 'groundbait',
      )
      .reduce(
        (
          acc: Record<string, number>,
          c: { itemType: string; itemId: string; quantity: number },
        ) => ({ ...acc, [c.itemId]: c.quantity }),
        {},
      ) || {};

  const handleActivateGroundbait = () => {
    if (activeGroundbait === 'none' || groundbaitExpiresAt !== null) return;
    const count = groundbaitCounts[activeGroundbait] ?? 0;
    if (count <= 0) return;

    const expiry = TimeManager.getGameTimeHours() + 4;

    consumeMutation.mutate({
      itemId: activeGroundbait,
      itemType: 'groundbait',
    });
    dispatch(setGroundbaitExpiry(expiry));
    sceneRef.current?.setActiveGroundbait(activeGroundbait, expiry);
  };

  const renderGroundbaitStatus = () => {
    const count = groundbaitCounts[activeGroundbait] ?? 0;
    const isActive = groundbaitExpiresAt !== null;
    const hasBaitSelected = activeGroundbait !== 'none';

    if (!hasBaitSelected) return null;
    if (!isActive && count <= 0) return null;

    return (
      <div className={styles['lake-info__groundbait-status']}>
        {!isActive ? (
          <div
            className={styles['lake-info__activate-gb']}
            onClick={handleActivateGroundbait}
            title={t('hud.throwMix')}
          >
            {GROUNDBAITS[activeGroundbait]?.icon?.includes('/') ? (
              <img src={GROUNDBAITS[activeGroundbait]?.icon} alt="groundbait" />
            ) : (
              <span style={{ fontSize: '1.2rem', margin: '0 4px' }}>
                {GROUNDBAITS[activeGroundbait]?.icon}
              </span>
            )}
            <span>
              {t('hud.throwMix')} ({count})
            </span>
          </div>
        ) : (
          <div className={styles['lake-info__groundbait-timer-wrap']}>
            <div className={styles['lake-info__groundbait-timer']}>
              🍱 {t('hud.groundbait')}:{' '}
              {TimeManager.formatTimeRemaining(groundbaitExpiresAt)}
            </div>
            <WoodyButton
              variant="red"
              size="sm"
              className={styles['lake-info__cancel-gb']}
              onClick={() => dispatch(setGroundbaitExpiry(null))}
            >
              ×
            </WoodyButton>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={[
        styles['lake-info'],
        isDebugActive ? styles['lake-info--debug'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleLakeInfoClick}
    >
      <div className={styles['lake-info__name']}>
        {currentLakeId ? t(`lakes.${currentLakeId}.name`) : '—'}
      </div>

      <div className={styles['lake-info__time-row']}>
        <GameClock
          mode="game"
          iconClassName={styles['lake-info__clock-icon']}
        />
        <WeatherStatus
          className={styles['lake-info__weather']}
          onClick={() => setIsWeatherModalOpen(true)}
          title={t('weather.viewForecast', 'View Forecast')}
        />
      </div>

      {renderGroundbaitStatus()}

      <WeatherForecastModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
      />
    </div>
  );
}
