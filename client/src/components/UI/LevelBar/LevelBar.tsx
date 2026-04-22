import { useEffect, useRef, useState } from 'react';

import { useDingSound } from '@/hooks/audio/useSoundEffect';

import { usePlayerQuery } from '@/queries/player.queries';

import { getXpNeededForLevel } from '@/common/utils/experience.util';

import styles from './LevelBar.module.css';

export function LevelBar() {
  const { data: player } = usePlayerQuery();
  const playDing = useDingSound();

  const level = player?.level ?? 1;
  const xp = player?.xp ?? 0;

  const prevLevelRef = useRef(level);
  const prevXpRef = useRef(xp);
  const [xpDiff, setXpDiff] = useState<number | null>(null);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      playDing();
    }
    prevLevelRef.current = level;
  }, [level, playDing]);

  useEffect(() => {
    if (xp > prevXpRef.current) {
      const diff = xp - prevXpRef.current;
      setXpDiff(diff);

      const timer = setTimeout(() => setXpDiff(null), 2000);
      prevXpRef.current = xp;

      return () => clearTimeout(timer);
    } else if (xp < prevXpRef.current && level > prevLevelRef.current) {
      const oldXpNeeded = getXpNeededForLevel(prevLevelRef.current);

      const diff = oldXpNeeded - prevXpRef.current + xp;
      setXpDiff(diff);

      const timer = setTimeout(() => setXpDiff(null), 2000);
      prevXpRef.current = xp;
      return () => clearTimeout(timer);
    }
    prevXpRef.current = xp;
  }, [xp, level]);

  const xpNeeded = getXpNeededForLevel(level);
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.levelNumber}>{level}</div>
      <div
        className={styles.barWrapper}
        style={{ '--xp-pct': `${xpPct}%` } as React.CSSProperties}
      >
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${xpPct}%` }}>
            <div className={styles.glow} />
          </div>
          <div
            className={`${styles.xpText} ${xpDiff !== null ? styles.hidden : ''}`}
          >
            {Math.floor(xp)} / {xpNeeded}
          </div>
        </div>
        {xpDiff !== null && (
          <div key={xp} className={styles.xpFloater}>
            +{Math.floor(xpDiff)}
          </div>
        )}
      </div>
    </div>
  );
}
