import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store/store';
import { Modal } from '../Modal/Modal';
import { WoodyButton } from '../../buttons/WoodyButton/WoodyButton';
import { GlobalPreloader } from '../../GlobalPreloader/GlobalPreloader';

import { ErrorView } from '../../ErrorView/ErrorView';

import styles from './ConnectingModal.module.css';

interface ConnectingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onHide: () => void;
}

export function ConnectingModal({
  isOpen,
  onCancel,
  onHide,
}: ConnectingModalProps) {
  const { t } = useTranslation();
  const { chatConnectionStatus } = useSelector(
    (state: RootState) => state.online,
  );

  if (!isOpen) return null;

  const isError = chatConnectionStatus === 'error';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onHide}
      title={isError ? t('common.error') : t('online.waiting.title')}
      maxWidth="420px"
    >
      <div
        className={`${styles['connecting-modal__content']} ${
          isError ? styles['connecting-modal__content--error'] : ''
        }`}
      >
        {isError ? (
          <div className={styles['connecting-modal__error-wrapper']}>
            <ErrorView
              message={t('common.serverUnavailable')}
              className={styles['connecting-modal__error']}
              noPadding={true}
            />
          </div>
        ) : (
          <>
            <p className={styles['connecting-modal__message']}>
              {t('online.waiting.message')}
            </p>

            <div className={styles['connecting-modal__preloader-wrapper']}>
              <GlobalPreloader
                delay={0}
                isInline={true}
                className={styles['connecting-modal__preloader']}
              />
            </div>
          </>
        )}

        <div className={styles['connecting-modal__actions']}>
          <WoodyButton
            id="hide-wait"
            variant="green"
            label={t('online.waiting.hide')}
            onClick={onHide}
          />
          <WoodyButton
            id="cancel-wait"
            variant="brown"
            label={t('online.waiting.cancel')}
            onClick={onCancel}
          />
        </div>
      </div>
    </Modal>
  );
}
