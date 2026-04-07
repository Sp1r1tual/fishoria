import type { UniversalModalType } from '@/common/types';

import { UniversalModal } from '../modals/UniversalModal/UniversalModal';
import { WoodyButton } from '../buttons/WoodyButton/WoodyButton';

import styles from './InfoPopup.module.css';

interface InfoPopupProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  icon?: string | React.ReactNode;
  type?: UniversalModalType;
  confirmLabel?: string;
  onConfirm: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  closeOnOverlayClick?: boolean;
}

export const InfoPopup = ({
  isOpen,
  title,
  message,
  icon,
  type = 'default',
  confirmLabel = 'OK',
  onConfirm,
  secondaryLabel,
  onSecondary,
  closeOnOverlayClick = true,
}: InfoPopupProps) => {
  return (
    <UniversalModal
      isOpen={isOpen}
      type={type}
      title={title}
      onClose={closeOnOverlayClick ? onConfirm : undefined}
      header={
        icon && (
          <div className={styles.iconWrapper}>
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )
      }
      actions={
        <>
          {secondaryLabel && onSecondary && (
            <WoodyButton variant="brown" onClick={onSecondary}>
              {secondaryLabel}
            </WoodyButton>
          )}
          <WoodyButton
            variant={type === 'danger' ? 'red' : 'green'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </WoodyButton>
        </>
      }
    >
      <div className={styles.message}>{message}</div>
    </UniversalModal>
  );
};
