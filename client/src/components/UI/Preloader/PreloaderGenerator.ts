import type { PreloadStep, AssetContext } from '@/common/types';

import {
  discoverAssets,
  ProgressTracker,
} from '@/common/preloader/preloader.utils';
import { loadAsset } from '@/common/preloader/preloader.handler';

export async function preloadGameAssets(
  onProgress: (step: PreloadStep) => void,
  signal?: AbortSignal,
): Promise<void> {
  const allUrls = discoverAssets();
  const total = allUrls.length;
  const tracker = new ProgressTracker();

  const context: AssetContext = {
    currentAssetName: '',
    currentAssetIsAudio: false,
    currentItemLoadedBytes: 0,
    currentItemTotalBytes: 0,
    currentIsFromCache: false,
  };

  onProgress({ messageKey: 'preloader.initializing', progress: 0 });

  if (total === 0) {
    onProgress({ messageKey: 'preloader.done', progress: 100 });
    return;
  }

  await new Promise((r) => setTimeout(r, 400));
  if (signal?.aborted) return;

  const emitProgress = () => {
    if (signal?.aborted) return;
    const progress = Math.floor((tracker.loadedCount / total) * 100);
    onProgress({
      messageKey: context.currentAssetIsAudio
        ? 'preloader.cachingAudio'
        : 'preloader.loadingTextures',
      progress,
      loaded: tracker.loadedCount,
      total,
      loadedBytes: tracker.loadedBytes,
      totalBytes: tracker.totalBytesEstimate,
      speedMbps: tracker.speedMbps,
      currentItemLoadedBytes: context.currentItemLoadedBytes,
      currentItemTotalBytes: context.currentItemTotalBytes,
      isFromCache: context.currentIsFromCache,
      currentAssetName: context.currentAssetName,
    });
  };

  const CONCURRENCY = 6;
  const queue = [...allUrls];

  const worker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) break;
      const url = queue.shift();
      if (!url) break;
      await loadAsset(url, tracker, emitProgress, context, signal);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, total) }, worker),
  );

  onProgress({ messageKey: 'preloader.done', progress: 100 });
}
