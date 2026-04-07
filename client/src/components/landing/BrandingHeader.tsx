import { useTranslation } from 'react-i18next';

import styles from './BrandingHeader.module.css';

export const BrandingHeader = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.branding}>
      <h1 className={styles.title}>
        - Fishoria -
        <br /> A fishing simulator
      </h1>
      <p className={styles.subtitle}>{t('landing.hero.subtitle')}</p>
    </header>
  );
};
