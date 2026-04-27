import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useLakeCardAnimations } from '@/hooks/ui/useLakeCardAnimations';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { ConnectingModal } from '../UI/modals/ConnectingModal/ConnectingModal';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { usePlayerQuery } from '@/queries/player.queries';
import { navigateTo } from '@/store/slices/uiSlice';
import { setCurrentLake } from '@/store/slices/gameSlice';
import { updateSettings } from '@/store/slices/settingsSlice';

import { LAKES } from '@/common/configs/game';

import boatIcon from '@/assets/ui/boat.webp';

import styles from './LakeSelect.module.css';

export function LakeSelect() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { data: player } = usePlayerQuery();
  const { descRefs, previewRefs, cardRefs, handleDescClick } =
    useLakeCardAnimations();

  const [pendingLakeId, setPendingLakeId] = useState<string | null>(null);
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);
  const connectionStatus = useAppSelector((s) => s.online.connectionStatus);

  useEffect(() => {
    if (pendingLakeId && (connectionStatus === 'online' || !onlineMode)) {
      dispatch(setCurrentLake(pendingLakeId));
      dispatch(navigateTo('game'));

      setTimeout(() => {
        setPendingLakeId(null);
      }, 0);
    }
  }, [pendingLakeId, connectionStatus, onlineMode, dispatch]);

  const handleSelect = (lakeId: string) => {
    if (onlineMode && connectionStatus !== 'online') {
      setPendingLakeId(lakeId);
    } else {
      dispatch(setCurrentLake(lakeId));
      dispatch(navigateTo('game'));
    }
  };

  const handleCancelWait = () => {
    if (pendingLakeId) {
      dispatch(updateSettings({ onlineMode: false }));
      dispatch(setCurrentLake(pendingLakeId));
      dispatch(navigateTo('game'));
      setPendingLakeId(null);
    }
  };

  return (
    <ScreenContainer
      title={t('lakeSelect.title')}
      titleIcon={boatIcon}
      onBack={() => dispatch(navigateTo('mainMenu'))}
      className={styles['lake-select']}
    >
      <div className={`${styles['lake-select__grid']} fade-in`}>
        {LAKES.map((lake) => (
          <div
            key={lake.id}
            id={`lake-card-${lake.id}`}
            ref={(el) => {
              cardRefs.current[lake.id] = el;
            }}
            className={styles['lake-card']}
          >
            <div
              ref={(el) => {
                previewRefs.current[lake.id] = el;
              }}
              className={styles['lake-card__preview']}
              style={{
                backgroundImage: `url(${lake.timeOfDayConfig.day.bgImageUrl})`,
              }}
            >
              <div className={styles['lake-card__overlay']} />
            </div>
            <div className={styles['lake-card__badge']}>
              Lv.{lake.unlockLevel}
            </div>

            <div className={styles['lake-card__body']}>
              <div className={styles['lake-card__content']}>
                <div className={styles['lake-card__name']}>
                  {t(`lakes.${lake.id}.name`)}
                </div>
                <p
                  ref={(el) => {
                    descRefs.current[lake.id] = el;
                  }}
                  className={styles['lake-card__desc']}
                  onClick={() => handleDescClick(lake.id)}
                >
                  {t(`lakes.${lake.id}.description`)}
                </p>
              </div>
              <div className={styles['lake-card__stats']}>
                <div className={styles['lake-card__stat']}>
                  {t('hud.depth')}:{' '}
                  <span>
                    {lake.depthMap.minDepth}–{lake.depthMap.maxDepth}m
                  </span>
                </div>
              </div>
            </div>

            {player && player.level < lake.unlockLevel ? (
              <WoodyButton
                variant="red"
                size="sm"
                className={styles['lake-card__action']}
                label={t('lakeSelect.locked')}
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            ) : (
              <WoodyButton
                variant="green"
                size="sm"
                className={styles['lake-card__action']}
                label={t('lakeSelect.go')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lake.id);
                }}
              />
            )}
          </div>
        ))}
      </div>

      <ConnectingModal isOpen={!!pendingLakeId} onCancel={handleCancelWait} />
    </ScreenContainer>
  );
}
