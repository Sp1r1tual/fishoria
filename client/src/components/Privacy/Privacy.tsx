import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { Bubbles } from '../UI/Bubbles/Bubbles';

import styles from './Privacy.module.css';

export function Privacy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundGradients} />
      <Bubbles count={45} className={styles.bubbles} />

      <ScreenContainer
        title={t('privacy.title', 'Privacy Policy')}
        onBack={() =>
          window.history.length > 1 ? navigate(-1) : navigate('/')
        }
        className={styles.privacy}
        showBgImage={false}
        showBlur={false}
      >
        <section className={styles['privacy__content']}>
          <div className={`glass ${styles['privacy__text-block']}`}>
            <p className={styles['privacy__text']}>{t('privacy.text')}</p>
          </div>
        </section>
      </ScreenContainer>
    </div>
  );
}
