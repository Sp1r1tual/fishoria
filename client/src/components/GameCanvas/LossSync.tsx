import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { InfoPopup } from '../UI/InfoPopup/InfoPopup';

import { clearLossEvent } from '@/store/slices/gameSlice';

import tensionIcon from '@/assets/ui/tension_event.webp';
import biteIcon from '@/assets/ui/bite_event.webp';
import escapeIcon from '@/assets/ui/escape_event.webp';
import snagIcon from '@/assets/ui/snag_event.webp';

import styles from './LossSync.module.css';

const LOSS_ICON_MAP: Record<string, React.ReactNode> = {
  tension: <img src={tensionIcon} alt="tension" width={56} />,
  bite: <img src={biteIcon} alt="bite" width={56} />,
  escape: <img src={escapeIcon} alt="escape" width={56} />,
  snag: <img src={snagIcon} alt="snag" width={56} />,
};

export function LossSync() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const lossEvent = useAppSelector((s) => s.game.lossEvent);

  if (!lossEvent) return null;

  const { reason, itemNames, lostMeters } = lossEvent;
  const icon = LOSS_ICON_MAP[reason] ?? '💥';
  const itemsFormatted = itemNames.map((n) => `«${n}»`).join(t('nav.and'));

  return (
    <InfoPopup
      isOpen
      type="danger"
      title={t(`loss.${reason}.title`)}
      confirmLabel={t('nav.ok')}
      icon={icon}
      message={
        <div>
          <p>{t(`loss.${reason}.msg`)}</p>
          <p className={styles.lostItems}>
            {t('loss.lost', { items: itemsFormatted })}
          </p>
          {lostMeters ? (
            <p className={styles.lostLineDetails}>
              {t('loss.lostLine', { meters: lostMeters })}
            </p>
          ) : null}
        </div>
      }
      onConfirm={() => dispatch(clearLossEvent())}
    />
  );
}
