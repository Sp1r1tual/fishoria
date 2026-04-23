import { useState, useRef, useEffect, useCallback } from 'react';

import styles from './DebugLegend.module.css';

interface IDebugLegendProps {
  minDepth: number;
  maxDepth: number;
}

export function DebugLegend({ minDepth, maxDepth }: IDebugLegendProps) {
  const position = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const legendRef = useRef<HTMLDivElement>(null);

  const step = 0.5;
  const items: { label: string; color: string }[] = [];

  let totalSteps = Math.floor((maxDepth - minDepth) / step) + 1;
  const lastStepVal = minDepth + (totalSteps - 1) * step;
  if (lastStepVal < maxDepth - 0.01) {
    totalSteps++;
  }

  for (let i = 0; i < totalSteps; i++) {
    const isLast = i === totalSteps - 1;
    const d = isLast ? maxDepth : minDepth + i * step;
    if (!isLast && d >= maxDepth - 0.1) continue;
    const depthNorm = (d - minDepth) / Math.max(0.1, maxDepth - minDepth);
    const hue = 60 + depthNorm * 180;
    const color = `hsl(${hue}, 90%, 45%)`;
    const label = `${d.toFixed(1)}m`;
    items.push({ label, color });
  }

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = {
      x: clientX - position.current.x,
      y: clientY - position.current.y,
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let pendingX = position.current.x;
    let pendingY = position.current.y;

    const updateDOM = () => {
      if (!isDragging || !legendRef.current) return;
      position.current.x = pendingX;
      position.current.y = pendingY;
      legendRef.current.style.transform = `translate(${pendingX}px, ${pendingY}px) scale(0.88) rotate(1deg)`;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      pendingX = clientX - dragStartPos.current.x;
      pendingY = clientY - dragStartPos.current.y;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateDOM);
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      if (legendRef.current) {
        legendRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;

        const rect = legendRef.current.getBoundingClientRect();

        let newLeft = rect.left;
        let newTop = rect.top;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + rect.width > window.innerWidth)
          newLeft = window.innerWidth - rect.width;
        if (newTop + rect.height > window.innerHeight)
          newTop = window.innerHeight - rect.height;

        position.current.x = 0;
        position.current.y = 0;
        legendRef.current.style.transform = `translate(0px, 0px) scale(0.85)`;

        legendRef.current.style.position = 'fixed';
        legendRef.current.style.left = `${newLeft}px`;
        legendRef.current.style.top = `${newTop}px`;
        legendRef.current.style.right = 'auto';
        legendRef.current.style.bottom = 'auto';
        legendRef.current.style.margin = '0';
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging]);

  useEffect(() => {
    if (legendRef.current) {
      legendRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px) scale(0.85)`;
    }
  }, []);

  return (
    <div
      ref={legendRef}
      className={`${styles.legend} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div className={styles.dragHandle}>
        <div className={styles.dragDots}>:::</div>
      </div>
      <div className={styles.itemsWrapper}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <div
              className={styles.dot}
              style={{ backgroundColor: item.color }}
            />
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
