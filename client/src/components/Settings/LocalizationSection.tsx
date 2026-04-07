import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { loadTranslations, markLanguageInitialized } from '@/i18n';

import { useUpdateLanguageMutation } from '@/queries/player.queries';

import styles from './Settings.module.css';

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
        <select
          id="language-select"
          name="language"
          className={styles['settings__select']}
          value={i18n.language ?? 'en'}
          onChange={(e) => {
            handleLanguageChange(e.target.value as 'en' | 'uk');
            (e.target as HTMLSelectElement).blur();
          }}
        >
          <option value="en">{t('settings.langEn')}</option>
          <option value="uk">{t('settings.langUk')}</option>
        </select>
      </div>
    </section>
  );
}
