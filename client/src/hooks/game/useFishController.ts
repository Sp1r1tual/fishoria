import { useRef, useState, useCallback } from 'react';

import type { IFishVisualState } from '@/common/types';

export function useFishController() {
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef({ x: 400, y: 150 });
  const fishRef = useRef<IFishVisualState>({
    x: 180,
    y: 120,
    vx: 0.5,
    vy: 0.2,
    angle: 0,
    t: 0,
    opacity: 0,
  });

  const onMouseMove = useCallback((x: number, y: number) => {
    mousePos.current = { x, y };
  }, []);

  const onMouseEnter = useCallback(
    (x: number, y: number, w: number, h: number) => {
      setIsHovered(true);
      const dL = x;
      const dR = w - x;
      const dT = y;
      const dB = h - y;
      const min = Math.min(dL, dR, dT, dB);

      const fish = fishRef.current;
      fish.opacity = 0;
      if (min === dL) {
        fish.x = -40;
        fish.y = y;
      } else if (min === dR) {
        fish.x = w + 40;
        fish.y = y;
      } else if (min === dT) {
        fish.x = x;
        fish.y = -40;
      } else {
        fish.x = x;
        fish.y = h + 40;
      }

      const initialBoost = w < 640 ? 0.02 : 0.02;
      fish.vx = (x - fish.x) * initialBoost;
      fish.vy = (y - fish.y) * initialBoost;
    },
    [],
  );

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const update = useCallback(
    (deltaTime: number, W: number, H: number) => {
      const fish = fishRef.current;
      const timeScale = deltaTime * 60;
      fish.t += deltaTime;

      const isSmall = W < 640;
      const speedLimit = isSmall ? 2.2 : 3.5;

      if (isHovered) {
        fish.opacity = Math.min(1, fish.opacity + 0.015 * timeScale);
        const dx = mousePos.current.x - fish.x;
        const dy = mousePos.current.y - fish.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          const targetSpeed = Math.min(speedLimit, dist * 0.1);
          const desiredVx = (dx / dist) * targetSpeed;
          const desiredVy = (dy / dist) * targetSpeed;

          // Steer towards desired velocity smoothly
          const steerFactor = isSmall ? 0.07 : 0.1;
          fish.vx += (desiredVx - fish.vx) * steerFactor * timeScale;
          fish.vy += (desiredVy - fish.vy) * steerFactor * timeScale;
        }
      } else {
        fish.opacity = Math.max(0, fish.opacity - 0.02 * timeScale);
        // Exponential decay for friction, adjusted for framerate
        const friction = Math.pow(0.96, timeScale);
        fish.vx *= friction;
        fish.vy *= friction;
      }

      fish.x += fish.vx * timeScale;
      fish.y += fish.vy * timeScale;

      // Soft bounding box bounce
      const r = isSmall ? 20 : 40;
      if (fish.x < r) {
        fish.x = r;
        fish.vx = Math.abs(fish.vx) * 0.8;
      }
      if (fish.x > W - r) {
        fish.x = W - r;
        fish.vx = -Math.abs(fish.vx) * 0.8;
      }
      if (fish.y < r) {
        fish.y = r;
        fish.vy = Math.abs(fish.vy) * 0.8;
      }
      if (fish.y > H - r) {
        fish.y = H - r;
        fish.vy = -Math.abs(fish.vy) * 0.8;
      }

      // Smoothly rotate body towards the actual movement vector
      if (Math.abs(fish.vx) > 0.05 || Math.abs(fish.vy) > 0.05) {
        const targetAngle = Math.atan2(fish.vy, fish.vx);
        let diff = targetAngle - fish.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const turnSpeed = isSmall ? 0.14 : 0.2;
        fish.angle += diff * turnSpeed * timeScale;

        // Keep angle in [-PI, PI] range to prevent "upside down" rendering bugs
        // that occur when cumulative angle exceeds standard bounds.
        while (fish.angle < -Math.PI) fish.angle += Math.PI * 2;
        while (fish.angle > Math.PI) fish.angle -= Math.PI * 2;
      }

      return fish;
    },
    [isHovered],
  );

  return {
    fishRef,
    isHovered,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    update,
  };
}
