import type { TFunction } from 'i18next';

import type { IGearItemBase } from '@/common/types';

import { UniversalModal } from '@/components/UI/modals/UniversalModal/UniversalModal';
import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';

interface IRepairModalProps {
  repairableItems: IGearItemBase[];
  kitUid: string | null;
  onRepair: (
    kitUid: string,
    targetUid: string,
    targetType: 'rod' | 'reel',
  ) => void;
  onClose: () => void;
  styles: Record<string, string>;
  t: TFunction;
}

export function RepairModal({
  repairableItems,
  kitUid,
  onRepair,
  onClose,
  styles,
  t,
}: IRepairModalProps) {
  const conditionColor = (val: number) =>
    val < 20 ? '#ef4444' : val < 50 ? '#fbbf24' : '#4ade80';

  return (
    <UniversalModal
      isOpen={true}
      title={t('gear.repairModal.title')}
      onClose={onClose}
      actions={
        <WoodyButton onClick={onClose} variant="red" size="sm">
          {t('common.close')}
        </WoodyButton>
      }
    >
      <div className={styles['gear__repair-list']}>
        {repairableItems.length === 0 ? (
          <div
            style={{ padding: '20px', textAlign: 'center', color: '#fbbf24' }}
          >
            {t('gear.repairModal.empty')}
          </div>
        ) : (
          repairableItems.map((item) => {
            const condVal = Math.floor(item.condition ?? 0);
            const color = conditionColor(condVal);
            return (
              <div
                key={item.uid}
                className={styles['gear__repair-item']}
                onClick={() => {
                  if (
                    kitUid &&
                    item.uid &&
                    (item.itemType === 'rod' || item.itemType === 'reel')
                  ) {
                    onRepair(kitUid, item.uid, item.itemType);
                  }
                }}
              >
                <div className={styles['gear__repair-item-icon']}>
                  {item.icon && <img src={item.icon} alt="" />}
                </div>
                <div className={styles['gear__repair-item-info']}>
                  <div className={styles['gear__repair-item-name']}>
                    {t(`gear_items.${item.id}.name`)}
                  </div>
                  <div className={styles['gear__repair-item-cond']}>
                    {t('gear.repairModal.durability', { value: condVal })}
                    <div
                      className={styles['gear-item__condition-bar']}
                      style={{ marginTop: '5px' }}
                    >
                      <div
                        className={styles['gear-item__condition-fill']}
                        style={{
                          width: `${Math.max(0, condVal)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </UniversalModal>
  );
}
