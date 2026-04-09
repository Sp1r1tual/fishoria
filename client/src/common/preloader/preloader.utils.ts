export class ProgressTracker {
  private speedWindow: { time: number; bytes: number }[] = [];
  speedMbps = 0;
  loadedBytes = 0;
  totalBytesEstimate = 0;
  loadedCount = 0;

  updateSpeed(newBytes: number) {
    const now = Date.now();
    this.speedWindow.push({ time: now, bytes: newBytes });
    while (
      this.speedWindow.length > 0 &&
      this.speedWindow[0].time < now - 2000
    ) {
      this.speedWindow.shift();
    }
    if (this.speedWindow.length > 1) {
      const timeDiff = (now - this.speedWindow[0].time) / 1000;
      if (timeDiff > 0) {
        const bytesDiff = this.speedWindow.reduce(
          (acc, curr) => acc + curr.bytes,
          0,
        );
        this.speedMbps = bytesDiff / (timeDiff * 1024 * 1024);
      }
    } else {
      this.speedMbps = 0;
    }
  }

  addLoadedBytes(bytes: number) {
    this.loadedBytes += bytes;
    this.updateSpeed(bytes);
  }

  incrementLoadedCount() {
    this.loadedCount++;
  }
}

/**
 * Handles discovery of all assets in the project.
 */
export function discoverAssets(): string[] {
  const imageAssets = (
    Object.values(
      import.meta.glob('/src/assets/**/*.{png,jpg,jpeg,svg,webp,gif}', {
        eager: true,
        query: '?url',
        import: 'default',
      }),
    ) as string[]
  ).filter(
    (path) =>
      !path.includes('/assets/landing/') && !path.includes('/assets/global/'),
  );

  const audioAssets = (
    Object.values(
      import.meta.glob('/src/assets/**/*.{mp3,wav,ogg}', {
        eager: true,
        query: '?url',
        import: 'default',
      }),
    ) as string[]
  ).filter(
    (path) =>
      !path.includes('/assets/landing/') && !path.includes('/assets/global/'),
  );

  const externalAssets = [
    'https://www.transparenttextures.com/patterns/wood-pattern.png',
  ];

  return [...imageAssets, ...audioAssets, ...externalAssets];
}
