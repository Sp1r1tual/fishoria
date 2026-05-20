import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useClickSound } from '@/hooks/audio/useSoundEffect';

import { UniversalModal } from '../UniversalModal/UniversalModal';
import { WoodyButton } from '../../buttons/WoodyButton/WoodyButton';

import { usePlayerQuery, useClaimDailyReward } from '@/queries/player.queries';

import { BAITS } from '@/common/configs/game/bait.config';
import { GROUNDBAITS } from '@/common/configs/game/groundbait.config';
import { SHOP_HOOKS } from '@/common/configs/game/gear.config';
import { DAILY_REWARDS } from '@/common/configs/game/daily-rewards.config';

import coinIcon from '@/assets/ui/coin.webp';

import styles from './DailyRewardModal.module.css';

export function DailyRewardModal() {
  const { t } = useTranslation();
  const { data: player } = usePlayerQuery();
  const claimDailyReward = useClaimDailyReward();

  const playClick = useClickSound();

  const gridRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown.current = true;
    startX.current = e.pageX - (gridRef.current?.offsetLeft || 0);
    scrollLeft.current = gridRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown.current || !gridRef.current) return;
    e.preventDefault();
    const x = e.pageX - gridRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    gridRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const reward = player?.dailyReward;

  const handleClaim = () => {
    playClick();
    claimDailyReward();
  };

  if (!reward) return null;

  const getConsumableIcon = (itemType: string, itemId: string) => {
    if (itemType === 'groundbait') {
      return GROUNDBAITS[itemId]?.icon;
    }
    return BAITS[itemId]?.icon;
  };

  const getGearIcon = (itemId: string) => {
    return SHOP_HOOKS.find((h) => h.id === itemId)?.icon;
  };

  const getDayPreview = (dayConfig: (typeof DAILY_REWARDS)[0]) => {
    if (dayConfig.money) {
      return {
        icons: [coinIcon],
        text: `+${dayConfig.money}`,
      };
    }
    if (dayConfig.consumables && dayConfig.consumables.length > 0) {
      const icons = dayConfig.consumables
        .slice(0, 3)
        .map((c) => getConsumableIcon(c.itemType, c.itemId))
        .filter((icon): icon is string => !!icon);
      const totalQty = dayConfig.consumables.reduce(
        (acc, c) => acc + c.quantity,
        0,
      );
      return {
        icons: icons.length > 0 ? icons : [coinIcon],
        text: `x${totalQty}`,
      };
    }
    if (dayConfig.gearItems && dayConfig.gearItems.length > 0) {
      const icons = dayConfig.gearItems
        .slice(0, 3)
        .map((g) => getGearIcon(g.itemId))
        .filter((icon): icon is string => !!icon);
      const totalQty = dayConfig.gearItems.length;
      return {
        icons: icons.length > 0 ? icons : [coinIcon],
        text: `x${totalQty}`,
      };
    }
    return { icons: [coinIcon], text: '' };
  };

  return (
    <UniversalModal
      isOpen={true}
      title={t('dailyReward.title', 'Daily Bonus')}
      type="success"
      description={
        <div className={styles.rewardContainer}>
          <div
            ref={gridRef}
            className={styles.calendarGrid}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {DAILY_REWARDS.map((dayConfig) => {
              const d = dayConfig.day;
              const isClaimed = d < reward.day;
              const isActive = d === reward.day;
              const isLocked = d > reward.day;
              const preview = getDayPreview(dayConfig);

              return (
                <div
                  key={`day-${d}`}
                  className={`${styles.calendarCell} ${
                    isClaimed ? styles.claimedCell : ''
                  } ${isActive ? styles.activeCell : ''} ${
                    isLocked ? styles.lockedCell : ''
                  }`}
                >
                  <span className={styles.calendarCellTitle}>
                    {t('dailyReward.dayShort', {
                      day: d,
                      defaultValue: `${d} д.`,
                    })}
                  </span>
                  {preview.icons.length > 1 ? (
                    <div className={styles.iconStack}>
                      {preview.icons.map((icon, idx) => (
                        <img
                          key={idx}
                          src={icon}
                          alt={`reward-icon-${idx}`}
                          className={styles.stackedIcon}
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={preview.icons[0]}
                      alt={`day-${d}`}
                      className={styles.calendarCellIcon}
                    />
                  )}
                  <span className={styles.calendarCellQty}>{preview.text}</span>
                  {isClaimed && <span className={styles.claimedBadge}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      }
      actions={
        <WoodyButton
          id="claim-daily"
          variant="green"
          onClick={handleClaim}
          label={t('dailyReward.claim', 'Claim')}
        />
      }
    />
  );
}
