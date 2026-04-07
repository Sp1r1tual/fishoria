import { useTranslation } from 'react-i18next';

import { useScrollReveal } from '@/hooks/ui/useScrollReveal';

import companyLogo from '@/assets/landing/company_logo.webp';

import styles from './CompanyBranding.module.css';

export const CompanyBranding = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.5 });

  return (
    <aside
      ref={elementRef}
      className={`${styles.companySection} ${isVisible ? styles.visible : ''}`}
      aria-label={t('landing.branding.ariaLabel', 'Developer information')}
    >
      <p className={styles.developedBy}>{t('landing.branding.developedBy')}</p>
      <img
        src={companyLogo}
        alt={t('landing.branding.logoAlt')}
        className={styles.companyLogo}
      />
    </aside>
  );
};
