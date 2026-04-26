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

        const stopThreshold = 2;
        if (dist > stopThreshold) {
          const decelerationRadius = isSmall ? 70 : 120;
          const targetSpeed =
            speedLimit * Math.min(1, dist / decelerationRadius);

          const ux = dx / dist;
          const uy = dy / dist;

          const waveFreq = isSmall ? 3 : 2.5;
          const waveAmp = isSmall ? 0.4 : 0.6;
          const lateralWobble =
            Math.sin(fish.t * waveFreq) * waveAmp * Math.min(1, dist / 80);

          const desiredVx = ux * targetSpeed - uy * lateralWobble;
          const desiredVy = uy * targetSpeed + ux * lateralWobble;

          const steerFactor = isSmall ? 0.07 : 0.1;
          fish.vx += (desiredVx - fish.vx) * steerFactor * timeScale;
          fish.vy += (desiredVy - fish.vy) * steerFactor * timeScale;

          const damping = Math.pow(0.98, timeScale);
          fish.vx *= damping;
          fish.vy *= damping;
        } else {
          const friction = Math.pow(0.75, timeScale);
          fish.vx *= friction;
          fish.vy *= friction;
        }
      } else {
        fish.opacity = Math.max(0, fish.opacity - 0.02 * timeScale);

        const friction = Math.pow(0.96, timeScale);
        fish.vx *= friction;
        fish.vy *= friction;
      }

      fish.x += fish.vx * timeScale;
      fish.y += fish.vy * timeScale;

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

      if (Math.abs(fish.vx) > 0.15 || Math.abs(fish.vy) > 0.15) {
        const targetAngle = Math.atan2(fish.vy, fish.vx);
        const diff =
          ((targetAngle - fish.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

        const turnSpeed = isSmall ? 0.14 : 0.2;
        fish.angle += diff * turnSpeed * timeScale;

        fish.angle = ((fish.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
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
