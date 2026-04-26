import { useGear } from '@/hooks/game/useGear';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { ConfirmChoiceModal } from '../UI/modals/ConfirmChoiceModal/ConfirmChoiceModal';
import { ScreenHeader } from '../UI/ScreenHeader/ScreenHeader';
import { GearCategory } from './GearCategory';
import { RepairModal } from './RepairModal';

import equipmentIcon from '@/assets/ui/equipment.webp';
import coinIcon from '@/assets/ui/coin.webp';

import styles from './Gear.module.css';

export function Gear({ onClose }: { onClose?: () => void }) {
  const {
    t,
    isLoading,
    player,
    activeBait,
    activeGroundbait,
    deleteModal,
    setDeleteModal,
    repairModal,
    setRepairModal,
    handleEquip,
    handleDelete,
    confirmDelete,
    handleRepair,
    handleBack,
    getRodInstances,
    getReelInstances,
    getLineInstances,
    getHookInstances,
    getGadgetInstances,
    getOwnedBaits,
    getOwnedGroundbaits,
    getRepairableItems,
    isSpinningRod,
  } = useGear();

  const repairableItems = getRepairableItems();

  const guideText = t('gear.equipment_guide');

  const handleShowInfo = () => {
    alert(guideText);
  };

  if (isLoading || !player) {
    return (
      <div className={styles.gear}>
        <div className={styles.gear__inner}>
          <div className={styles.gear__loading}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  const content = (
    <div className={`${styles['gear__inner']} ${!onClose ? 'fade-in' : ''}`}>
      {onClose && (
        <>
          <ScreenHeader
            title={t('gear.title')}
            titleIcon={equipmentIcon}
            onBack={() => handleBack(onClose)}
            onInfo={handleShowInfo}
            infoText={guideText}
            sticky
          />
        </>
      )}

      <div
        className={`${styles['gear__container']} ${
          onClose ? styles.with_fade : ''
        }`}
      >
        <GearCategory
          title={t('shop.tabs.rods')}
          items={getRodInstances()}
          currentUid={player.equippedRodUid}
          onEquip={(item) => handleEquip('rod', item, item.uid ?? null)}
          onDelete={(item) =>
            handleDelete(
              'rod',
              item.uid as string,
              t(`gear_items.${item.id}.name`),
            )
          }
          styles={styles}
          t={t}
        />
        <GearCategory
          title={t('shop.tabs.reels')}
          items={getReelInstances()}
          currentUid={player.equippedReelUid}
          onEquip={(item) => handleEquip('reel', item, item.uid ?? null)}
          onDelete={(item) =>
            handleDelete(
              'reel',
              item.uid as string,
              t(`gear_items.${item.id}.name`),
            )
          }
          styles={styles}
          t={t}
        />
        <GearCategory
          title={t('shop.tabs.lines')}
          items={getLineInstances()}
          currentUid={player.equippedLineUid}
          onEquip={(item) => handleEquip('line', item, item.uid ?? null)}
          onDelete={(item) =>
            handleDelete(
              'line',
              item.uid as string,
              t(`gear_items.${item.id}.name`),
            )
          }
          styles={styles}
          t={t}
        />
        <GearCategory
          title={t('shop.tabs.hooks')}
          items={getHookInstances()}
          currentUid={player.equippedHookUid}
          onEquip={(item) => handleEquip('hook', item, item.uid ?? null)}
          onDelete={(item) =>
            handleDelete(
              'hook',
              item.uid as string,
              t(`gear_items.${item.id}.name`),
            )
          }
          styles={styles}
          t={t}
        />
        <GearCategory
          title={t('shop.tabs.gadgets')}
          items={getGadgetInstances()}
          onEquip={(item) => {
            if (item.id === 'repair_kit' && item.uid) {
              setRepairModal({ isOpen: true, kitUid: item.uid });
            }
          }}
          styles={styles}
          t={t}
        />
        <GearCategory
          title={t('hud.bait')}
          items={getOwnedBaits()}
          currentId={activeBait}
          onEquip={(item) => handleEquip('bait', item)}
          styles={styles}
          t={t}
          isUnavailable={isSpinningRod}
          unavailableMessage={t('gear.notAvailableForSpinning')}
        />
        <GearCategory
          title={t('hud.groundbait')}
          items={getOwnedGroundbaits()}
          currentId={activeGroundbait}
          onEquip={(item) => handleEquip('groundbait', item)}
          styles={styles}
          t={t}
        />
      </div>
    </div>
  );

  const modals = (
    <>
      <ConfirmChoiceModal
        isOpen={deleteModal.isOpen}
        title={t('inventory.deleteConfirmTitle')}
        message={t('inventory.deleteConfirmMessage', {
          name: deleteModal.name,
        })}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal((p) => ({ ...p, isOpen: false }))}
        confirmLabel={t('inventory.deleteConfirmBtn')}
        coinIcon={coinIcon}
        confirmButtonVariant="red"
      />

      {repairModal.isOpen && (
        <RepairModal
          repairableItems={repairableItems}
          kitUid={repairModal.kitUid}
          onRepair={handleRepair}
          onClose={() => setRepairModal({ isOpen: false, kitUid: null })}
          styles={styles}
          t={t}
        />
      )}
    </>
  );

  if (onClose) {
    return (
      <div className={`${styles.gear} ${styles['gear--modal']}`}>
        {content}
        {modals}
      </div>
    );
  }

  return (
    <ScreenContainer
      title={t('gear.title')}
      titleIcon={equipmentIcon}
      onBack={() => handleBack(onClose)}
      onInfo={handleShowInfo}
      infoText={guideText}
      className={styles.gear}
      width="lg"
    >
      {content}
      {modals}
    </ScreenContainer>
  );
}
