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

export const WOOD_PATTERN_URL =
  'https://www.transparenttextures.com/patterns/wood-pattern.png';

export function discoverAssets(): string[] {
  const imageGlob = import.meta.glob(
    '/src/assets/**/*.{png,jpg,jpeg,svg,webp,gif}',
    {
      eager: true,
      query: '?url',
      import: 'default',
    },
  );

  const imageAssets = Object.entries(imageGlob)
    .filter(([path]) => {
      const p = path.toLowerCase();
      return (
        !p.includes('assets/global') &&
        !p.includes('assets/landing') &&
        !p.includes('assets/fish')
      );
    })
    .map(([, url]) => url as string);

  const audioGlob = import.meta.glob('/src/assets/**/*.{mp3,wav,ogg}', {
    eager: true,
    query: '?url',
    import: 'default',
  });

  const audioAssets = Object.entries(audioGlob)
    .filter(([path]) => {
      const p = path.toLowerCase();
      return (
        !p.includes('assets/global') &&
        !p.includes('assets/landing') &&
        !p.includes('assets/fish')
      );
    })
    .map(([, url]) => url as string);

  const externalAssets = [WOOD_PATTERN_URL];

  const uniqueAssets = Array.from(
    new Set([...imageAssets, ...audioAssets, ...externalAssets]),
  );

  return uniqueAssets;
}
