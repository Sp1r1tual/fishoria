import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { preloadGameAssets } from './PreloaderGenerator';
import type { PreloadStep } from '@/common/types';

import { unlockAudio } from '@/hooks/audio/useGameAudio';

import { store } from '@/store';
import { addToast } from '@/store/slices/uiSlice';

import { WoodyButton } from '../buttons/WoodyButton/WoodyButton';

import styles from './PreloaderScreen.module.css';

export function PreloaderScreen({
  onComplete,
  error,
  onRetry,
}: {
  onComplete: () => void;
  error?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  const [complete, setComplete] = useState(false);

  const progressFillRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLSpanElement>(null);
  const assetNameRef = useRef<HTMLDivElement>(null);
  const byteStatsRef = useRef<HTMLSpanElement>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  useEffect(() => {
    if (error) return;

    const controller = new AbortController();

    const updateUI = (step: PreloadStep) => {
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${Math.max(2, step.progress)}%`;
      }
      if (percentageRef.current) {
        percentageRef.current.textContent = `${step.progress}%`;
      }
      if (messageRef.current) {
        let text = t(step.messageKey);
        if (step.total && step.total > 0) {
          text += ` (${step.loaded}/${step.total})`;
        }
        messageRef.current.textContent = text;
      }
      if (assetNameRef.current) {
        assetNameRef.current.textContent =
          step.currentAssetName ||
          (step.loaded === 0 && step.progress < 100
            ? t('preloader.initializing')
            : '');
      }
      if (byteStatsRef.current) {
        if (
          step.currentItemLoadedBytes !== undefined &&
          step.currentItemLoadedBytes > 0
        ) {
          let text = formatSize(step.currentItemLoadedBytes);
          if (step.currentItemTotalBytes) {
            text += ` / ${formatSize(step.currentItemTotalBytes)}`;
          }
          byteStatsRef.current.textContent = text;
        } else {
          byteStatsRef.current.textContent = '';
        }
      }

      if (step.progress >= 100) {
        setComplete(true);
      }
    };

    preloadGameAssets((currentStep) => {
      if (!controller.signal.aborted) {
        updateUI(currentStep);
      }
    }, controller.signal).catch((err) => {
      if (!controller.signal.aborted) {
        console.error('Помилка під час завантаження ассетів', err);
        const message = err instanceof Error ? err.message : String(err);
        store.dispatch(
          addToast({
            message: `Asset loading error: ${message}`,
            type: 'error',
            duration: 0,
          }),
        );
      }
    });

    return () => {
      controller.abort();
    };
  }, [t, error]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Fishoria</h1>
          <p className={styles.tagline}>a fishing simulator</p>
          <p className={styles.subtitle}>by Atmosphoria Software</p>
        </div>

        <div className={styles.loaderContainer}>
          {error ? (
            <div className={`${styles.errorState} fade-in`}>
              <p className={styles.errorMessage}>
                {t(
                  'common.serverUnavailable',
                  'Server is temporarily unavailable',
                )}
              </p>
              <WoodyButton
                variant="brown"
                size="md"
                onClick={onRetry}
                label={t('common.retry', 'Retry')}
              />
            </div>
          ) : (
            <>
              <div className={styles.progressBar}>
                <div
                  ref={progressFillRef}
                  className={styles.progressFill}
                  style={{ width: '2%' }}
                />
              </div>

              <div className={styles.statsRow}>
                <div className={styles.mainProgress}>
                  <span ref={messageRef} className={styles.messageText}>
                    {t('preloader.preparing')}
                  </span>
                  <span ref={percentageRef} className={styles.percentage}>
                    0%
                  </span>
                </div>

                <div className={styles.assetProgressBar}>
                  <div ref={assetNameRef} className={styles.assetName}>
                    {t('preloader.initializing')}
                  </div>
                  <div className={styles.assetStatus}>
                    <span ref={byteStatsRef} className={styles.byteValue} />
                  </div>
                </div>
              </div>

              <div className={styles.buttonSlot}>
                {complete && (
                  <WoodyButton
                    variant="green"
                    size="lg"
                    className={styles.startButton}
                    onClick={() => {
                      unlockAudio();
                      setTimeout(() => {
                        onCompleteRef.current();
                      }, 200);
                    }}
                    label={t('preloader.clickToStart', 'Start The Game')}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
