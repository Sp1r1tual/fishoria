import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { AudioSlider } from './AudioSlider';

import { updateSettings } from '@/store/slices/settingsSlice';

import styles from './Settings.module.css';

export function AudioSection() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const musicEnabled = useAppSelector((s) => s.settings.musicEnabled);
  const sfxEnabled = useAppSelector((s) => s.settings.sfxEnabled);
  const ambientEnabled = useAppSelector((s) => s.settings.ambientEnabled);
  const musicVolume = useAppSelector((s) => s.settings.musicVolume);
  const sfxVolume = useAppSelector((s) => s.settings.sfxVolume);
  const ambientVolume = useAppSelector((s) => s.settings.ambientVolume);

  const handleMusicVolume = useCallback(
    (volume: number) => dispatch(updateSettings({ musicVolume: volume })),
    [dispatch],
  );

  const handleSfxVolume = useCallback(
    (volume: number) => dispatch(updateSettings({ sfxVolume: volume })),
    [dispatch],
  );

  const handleAmbientVolume = useCallback(
    (volume: number) => dispatch(updateSettings({ ambientVolume: volume })),
    [dispatch],
  );

  return (
    <section className={styles['settings__section']}>
      <h3 className={styles['settings__section-title']}>
        {t('settings.audio')}
      </h3>

      <div className={styles['settings__field']}>
        <div className={styles['settings__toggle-row']}>
          <label className={styles['settings__label']}>
            {t('settings.music')}
          </label>
          <input
            id="music-enabled"
            name="music-enabled"
            type="checkbox"
            checked={musicEnabled}
            onChange={(e) =>
              dispatch(updateSettings({ musicEnabled: e.target.checked }))
            }
            className={styles['settings__toggle']}
          />
        </div>
        <AudioSlider
          id="music-volume"
          name="music-volume"
          value={musicVolume}
          enabled={musicEnabled}
          onVolumeChange={handleMusicVolume}
        />
      </div>

      <div className={styles['settings__field']}>
        <div className={styles['settings__toggle-row']}>
          <label className={styles['settings__label']}>
            {t('settings.soundEffects')}
          </label>
          <input
            id="sfx-enabled"
            name="sfx-enabled"
            type="checkbox"
            checked={sfxEnabled}
            onChange={(e) =>
              dispatch(updateSettings({ sfxEnabled: e.target.checked }))
            }
            className={styles['settings__toggle']}
          />
        </div>
        <AudioSlider
          id="sfx-volume"
          name="sfx-volume"
          value={sfxVolume}
          enabled={sfxEnabled}
          onVolumeChange={handleSfxVolume}
        />
      </div>

      <div className={styles['settings__field']}>
        <div className={styles['settings__toggle-row']}>
          <label className={styles['settings__label']}>
            {t('settings.ambientSounds')}
          </label>
          <input
            id="ambient-enabled"
            name="ambient-enabled"
            type="checkbox"
            checked={ambientEnabled !== false}
            onChange={(e) =>
              dispatch(updateSettings({ ambientEnabled: e.target.checked }))
            }
            className={styles['settings__toggle']}
          />
        </div>
        <AudioSlider
          id="ambient-volume"
          name="ambient-volume"
          value={ambientVolume ?? 60}
          enabled={ambientEnabled !== false}
          onVolumeChange={handleAmbientVolume}
        />
      </div>
    </section>
  );
}
