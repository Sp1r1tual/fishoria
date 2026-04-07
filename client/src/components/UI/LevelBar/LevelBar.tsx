import { useEffect, useRef } from 'react';

import { useDingSound } from '@/hooks/audio/useDingSound';

import { usePlayerQuery } from '@/queries/player.queries';

import { getXpNeededForLevel } from '@/common/utils/experience.util';

import styles from './LevelBar.module.css';

export function LevelBar() {
  const { data: player } = usePlayerQuery();
  const playDing = useDingSound();

  const level = player?.level ?? 1;
  const xp = player?.xp ?? 0;
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      playDing();
    }
    prevLevelRef.current = level;
  }, [level, playDing]);

  const xpNeeded = getXpNeededForLevel(level);
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.levelNumber}>{level}</div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${xpPct}%` }}>
          <div className={styles.glow} />
        </div>
      </div>
    </div>
  );
}
