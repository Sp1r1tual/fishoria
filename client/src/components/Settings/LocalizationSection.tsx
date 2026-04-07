import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { loadTranslations, markLanguageInitialized } from '@/i18n';

import { useUpdateLanguageMutation } from '@/queries/player.queries';

import styles from './Settings.module.css';
import { WoodySelect } from '../UI/WoodySelect/WoodySelect';

export function LocalizationSection() {
  const { mutate: updateLangOnServer } = useUpdateLanguageMutation();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = useCallback(
    async (lang: 'en' | 'uk') => {
      await loadTranslations(lang);
      localStorage.setItem('i18nextLng', lang);
      markLanguageInitialized();
      updateLangOnServer(lang);
    },
    [updateLangOnServer],
  );

  return (
    <section className={styles['settings__section']}>
      <h3 className={styles['settings__section-title']}>
        {t('settings.localization')}
      </h3>
      <div className={styles['settings__field']}>
        <label className={styles['settings__label']}>
          {t('settings.selectLanguage')}
        </label>
        <WoodySelect
          value={i18n.language ?? 'en'}
          onChange={(val) => handleLanguageChange(val as 'en' | 'uk')}
          options={[
            { value: 'en', label: t('settings.langEn') },
            { value: 'uk', label: t('settings.langUk') },
          ]}
        />
      </div>
    </section>
  );
}
