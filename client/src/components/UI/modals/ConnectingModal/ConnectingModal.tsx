import { useTranslation } from 'react-i18next';

import { Modal } from '../Modal/Modal';
import { WoodyButton } from '../../buttons/WoodyButton/WoodyButton';
import { NetworkSection } from '../../../Settings/NetworkSection';

import styles from './ConnectingModal.module.css';

interface ConnectingModalProps {
  isOpen: boolean;
  onCancel: () => void;
}

export function ConnectingModal({ isOpen, onCancel }: ConnectingModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('online.waiting.title')}
      maxWidth="420px"
    >
      <div className={styles['connecting-modal__content']}>
        <p className={styles['connecting-modal__message']}>
          {t('online.waiting.message')}
        </p>
        <div className={styles['loading-spinner']}></div>

        <div className={styles['connecting-modal__network-section']}>
          <NetworkSection />
        </div>

        <div className={styles['connecting-modal__actions']}>
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
