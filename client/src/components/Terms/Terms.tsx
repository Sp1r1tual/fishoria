import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { Bubbles } from '../UI/Bubbles/Bubbles';

import styles from './Terms.module.css';

export function Terms() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundGradients} />
      <Bubbles count={45} className={styles.bubbles} />

      <ScreenContainer
        title={t('terms.title', 'Terms of Service')}
        onBack={() =>
          window.history.length > 1 ? navigate(-1) : navigate('/')
        }
        className={styles.terms}
        showBgImage={false}
        showBlur={false}
      >
        <section className={styles['terms__content']}>
          <div className={`glass ${styles['terms__text-block']}`}>
            <p className={styles['terms__text']}>{t('terms.text')}</p>
          </div>
        </section>
      </ScreenContainer>
    </div>
  );
}
