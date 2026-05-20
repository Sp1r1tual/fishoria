import { useState } from 'react';
import { useGear } from '@/hooks/game/useGear';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { ConfirmChoiceModal } from '../UI/modals/ConfirmChoiceModal/ConfirmChoiceModal';
import { Modal } from '../UI/modals/Modal/Modal';
import { ScreenHeader } from '../UI/ScreenHeader/ScreenHeader';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { GlassPanel } from '../UI/GlassPanel/GlassPanel';
import { GearCategory } from './GearCategory';
import { RepairModal } from './RepairModal';

import equipmentIcon from '@/assets/ui/equipment.webp';
import coinIcon from '@/assets/ui/coin.webp';

import styles from './Gear.module.css';

const GEAR_TABS = [
  'all',
  'rods',
  'reels',
  'lines',
  'hooks',
  'gadgets',
  'bait',
  'groundbait',
] as const;
type GearTabType = (typeof GEAR_TABS)[number];

export function Gear({ onClose }: { onClose?: () => void }) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GearTabType>('all');
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
    setIsInfoOpen(true);
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

      <div className={styles['gear__tabs_wrapper']}>
        <GlassPanel>
          <div className={styles['gear__tabs']}>
            {GEAR_TABS.map((tab) => (
              <WoodyButton
                key={tab}
                variant={activeTab === tab ? 'green' : 'brown'}
                size="sm"
                className={styles['gear__tab']}
                onClick={() => setActiveTab(tab)}
                label={t(`shop.tabs.${tab}`)}
              />
            ))}
          </div>
        </GlassPanel>
      </div>

      <div
        className={`${styles['gear__container']} ${
          onClose ? styles.with_fade : ''
        }`}
      >
        {(activeTab === 'all' || activeTab === 'rods') && (
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
        )}
        {(activeTab === 'all' || activeTab === 'reels') && (
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
        )}
        {(activeTab === 'all' || activeTab === 'lines') && (
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
        )}
        {(activeTab === 'all' || activeTab === 'hooks') && (
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
            isSpinningActive={isSpinningRod}
          />
        )}
        {(activeTab === 'all' || activeTab === 'gadgets') && (
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
        )}
        {(activeTab === 'all' || activeTab === 'bait') && (
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
        )}
        {(activeTab === 'all' || activeTab === 'groundbait') && (
          <GearCategory
            title={t('hud.groundbait')}
            items={getOwnedGroundbaits()}
            currentId={activeGroundbait}
            onEquip={(item) => handleEquip('groundbait', item)}
            styles={styles}
            t={t}
          />
        )}
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

      <Modal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={t('gear.title')}
        showCloseButton
        closeButtonVariant="wooden"
        maxWidth="500px"
      >
        <p className={styles['gear__info-text']}>{guideText}</p>
      </Modal>
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
