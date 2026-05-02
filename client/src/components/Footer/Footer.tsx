import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__content}>
        <div className={styles.footer__info}>
          <span className={styles.footer__version}>v0.5.1-beta</span>
          <span className={styles.footer__divider}>|</span>
          <span className={styles.footer__copyright}>
            © {currentYear} Atmosphoria Software
          </span>
        </div>

        <div className={styles.footer__line} />

        <div className={styles.footer__links}>
          <Link to="/privacy" className={styles.footer__link}>
            {t('footer.privacy')}
          </Link>
          <Link to="/terms" className={styles.footer__link}>
            {t('footer.terms')}
          </Link>
          <a
            href="mailto:support@fishoria.game"
            className={styles.footer__link}
          >
            {t('footer.support')}
          </a>
          <a
            href="https://github.com/Sp1r1tual/fishoria"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footer__link}
          >
            {t('footer.github')}
          </a>
        </div>
      </div>
    </footer>
  );
}
