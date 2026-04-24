import type { AssetContext } from '@/common/types';

import { ProgressTracker } from './preloader.utils';

async function fallbackToNative(url: string, isAudio: boolean): Promise<void> {
  if (!isAudio) {
    await new Promise<void>((resolve) => {
      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      const img = new Image();
      img.onload = safeResolve;
      img.onerror = safeResolve;
      img.src = url;

      if (img.complete) safeResolve();
      setTimeout(safeResolve, 10000);

      const win = window as unknown as { _assetCache?: Set<unknown> };
      if (!win._assetCache) win._assetCache = new Set();

      win._assetCache.add(img);
    });
  } else {
    const audio = new Audio();

    audio.preload = 'auto';
    audio.src = url;

    const win = window as unknown as { _assetCache?: Set<unknown> };

    if (!win._assetCache) win._assetCache = new Set();
    win._assetCache.add(audio);

    await new Promise((r) => setTimeout(r, 100));
  }
}

export async function loadAsset(
  url: string,
  tracker: ProgressTracker,
  onProgressEmit: () => void,
  context: AssetContext,
  signal?: AbortSignal,
) {
  if (signal?.aborted) return;

  const isAudio = !!url.match(/\.(mp3|wav|ogg)(?:\?.*)?$/i);
  const isSafari =
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const assetStartTime = Date.now();
  const assetName = url.split('/').pop() || url;

  context.currentAssetName = assetName;
  context.currentAssetIsAudio = isAudio;
  context.currentItemLoadedBytes = 0;
  context.currentItemTotalBytes = 0;
  context.currentIsFromCache = false;

  onProgressEmit();

  try {
    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 10000);

    let response: Response;
    try {
      let combinedSignal: AbortSignal = fetchController.signal;
      const abortSignalStatic = AbortSignal as unknown as {
        any?: (signals: AbortSignal[]) => AbortSignal;
      };

      if (signal && typeof abortSignalStatic.any === 'function') {
        combinedSignal = abortSignalStatic.any([
          fetchController.signal,
          signal,
        ]);
      }

      response = await fetch(url, {
        mode: url.includes('transparenttextures') ? 'no-cors' : 'cors',
        signal: combinedSignal,
      });

      clearTimeout(fetchTimeout);

      const fetchMs = Date.now() - assetStartTime;

      context.currentIsFromCache =
        response.status === 304 || response.type === 'opaque' || fetchMs < 50;
    } catch (error) {
      clearTimeout(fetchTimeout);

      if (signal?.aborted) {
        return;
      }

      console.warn(
        `Preloader: Fetch failed for ${assetName}, falling back to native.`,
        error,
      );
      await fallbackToNative(url, isAudio);
      return;
    }

    if (signal?.aborted) return;

    if (!response.ok && response.type !== 'opaque') {
      await fallbackToNative(url, isAudio);
      return;
    }

    if (response.type === 'opaque') return;

    const contentLength = parseInt(
      response.headers.get('content-length') || '0',
      10,
    );

    if (contentLength > 0) {
      tracker.totalBytesEstimate += contentLength;
      context.currentItemTotalBytes = contentLength;
    }

    const reader =
      !isSafari || isAudio ? response.body?.getReader() : undefined;

    if (reader) {
      let currentLoaded = 0;
      try {
        while (true) {
          if (signal?.aborted) {
            reader.cancel();
            return;
          }

          const readResult = await Promise.race([
            reader.read(),
            new Promise<{ done: true; value: undefined }>((_, reject) =>
              setTimeout(() => reject(new Error('read timeout')), 15000),
            ),
          ]);

          if (readResult.done) break;

          if (readResult.value) {
            tracker.addLoadedBytes(readResult.value.length);
            currentLoaded += readResult.value.length;
            if (context.currentAssetName === assetName) {
              context.currentItemLoadedBytes = currentLoaded;
              onProgressEmit();
            }
          }
        }
      } catch (error) {
        if (signal?.aborted) return;

        console.warn(
          `Preloader: Stream reading failed for ${assetName}:`,
          error,
        );

        try {
          reader.cancel();
        } catch (cancelError) {
          console.debug('Preloader: Error during reader cancel:', cancelError);
        }

        if (contentLength > currentLoaded) {
          tracker.addLoadedBytes(contentLength - currentLoaded);
          if (context.currentAssetName === assetName)
            context.currentItemLoadedBytes = contentLength;
        }
      }

      if (context.currentAssetName === assetName)
        context.currentItemLoadedBytes = Math.max(currentLoaded, contentLength);

      if (contentLength === 0) context.currentItemTotalBytes = currentLoaded;
    } else {
      try {
        const blob = await Promise.race([
          response.blob(),

          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('blob timeout')), 15000),
          ),
        ]);
        tracker.addLoadedBytes(blob.size);

        if (context.currentAssetName === assetName) {
          context.currentItemLoadedBytes = blob.size;
          if (contentLength === 0) context.currentItemTotalBytes = blob.size;
          onProgressEmit();
        }
      } catch (error) {
        if (signal?.aborted) return;
        console.warn(
          `Preloader: Blob/Fallback failed for ${assetName}:`,
          error,
        );

        if (contentLength > 0) {
          tracker.addLoadedBytes(contentLength);
          if (context.currentAssetName === assetName)
            context.currentItemLoadedBytes = contentLength;
        }

        await fallbackToNative(url, isAudio);
        return;
      }
    }

    if (!isAudio) {
      const img = new Image();
      img.src = url;

      const win = window as unknown as { _assetCache?: Set<unknown> };
      if (!win._assetCache) win._assetCache = new Set();

      win._assetCache.add(img);
    }
  } catch (error) {
    if (signal?.aborted) return;

    console.error(`Preloader: Critical error loading ${url}:`, error);

    await fallbackToNative(url, isAudio);
  } finally {
    tracker.incrementLoadedCount();
    onProgressEmit();
  }
}
