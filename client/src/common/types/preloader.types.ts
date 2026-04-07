export interface PreloadStep {
  messageKey: string;
  progress: number;
  loaded?: number;
  total?: number;
  totalBytes?: number;
  loadedBytes?: number;
  speedMbps?: number;
  currentItemLoadedBytes?: number;
  currentItemTotalBytes?: number;
  currentAssetName?: string;
  isFromCache?: boolean;
}

export interface AssetContext {
  currentAssetName: string;
  currentAssetIsAudio: boolean;
  currentItemLoadedBytes: number;
  currentItemTotalBytes: number;
  currentIsFromCache: boolean;
}
