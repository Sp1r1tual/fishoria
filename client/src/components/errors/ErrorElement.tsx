import { useRouteError, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

import styles from './errors.module.css';

export function ErrorElement() {
  const error = useRouteError() as { statusText?: string; message?: string };
  const navigate = useNavigate();
  const { t } = useTranslation();

  console.error('Router Error:', error);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorBox}>
        <img
          src="/assets/icons/error.webp"
          alt="Error"
          width={64}
          height={64}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <h1>{t('errorPage.title', 'Oops! Something went wrong.')}</h1>
        <p>
          {t(
            'errorPage.description',
            'We encountered an unexpected error while trying to load this page.',
          )}
        </p>

        {error && (
          <div className={styles.errorDetails}>
            {error.statusText ||
              error.message ||
              t('errorPage.unknown', 'Unknown Error')}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <WoodyButton variant="brown" onClick={() => navigate(-1)}>
            {t('errorPage.goBack', 'Go Back')}
          </WoodyButton>
          <WoodyButton
            variant="green"
            onClick={() => navigate('/', { replace: true })}
          >
            {t('errorPage.goHome', 'Home')}
          </WoodyButton>
        </div>
      </div>
    </div>
  );
}
