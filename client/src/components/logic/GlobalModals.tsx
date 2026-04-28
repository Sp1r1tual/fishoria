import { ProfileModal } from '../UI/modals/ProfileModal/ProfileModal';
import { WeatherForecastModal } from '../UI/modals/WeatherForecastModal/WeatherForecastModal';
import { IntroSequenceManager } from './IntroSequenceManager';
import { LossSync } from '../GameCanvas/LossSync';
import { ConfirmChoiceModal } from '../UI/modals/ConfirmChoiceModal/ConfirmChoiceModal';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  closeProfileModal,
  closeWeatherModal,
  closeConfirmModal,
} from '@/store/slices/uiSlice';

export function GlobalModals() {
  const dispatch = useAppDispatch();

  const { profileModal, isWeatherModalOpen, confirmModal } = useAppSelector(
    (s) => s.ui,
  );

  return (
    <>
      <ProfileModal
        isOpen={profileModal.isOpen}
        player={profileModal.player}
        isError={profileModal.isError}
        onClose={() => dispatch(closeProfileModal())}
      />

      <WeatherForecastModal
        isOpen={isWeatherModalOpen}
        onClose={() => dispatch(closeWeatherModal())}
      />

      {confirmModal && (
        <ConfirmChoiceModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          cancelLabel={confirmModal.cancelLabel}
          onConfirm={() => {
            confirmModal.onConfirm();
            dispatch(closeConfirmModal());
          }}
          onCancel={() => {
            confirmModal.onCancel?.();
            dispatch(closeConfirmModal());
          }}
          icon={confirmModal.icon}
          price={confirmModal.price}
          coinIcon={confirmModal.coinIcon}
          isLoading={confirmModal.isLoading}
          closeButtonVariant={confirmModal.closeButtonVariant}
          confirmButtonVariant={confirmModal.confirmButtonVariant}
        />
      )}

      <IntroSequenceManager />
      <LossSync />
    </>
  );
}
