export const SCREEN_THRESHOLDS = {
  MOBILE: 1000,
  TABLET: 1080,
  SMALL_MOBILE: 768,
};

export const isMobile = (width: number): boolean =>
  width < SCREEN_THRESHOLDS.MOBILE;
export const isTablet = (width: number): boolean =>
  width < SCREEN_THRESHOLDS.TABLET;
export const isSmallMobile = (width: number): boolean =>
  width < SCREEN_THRESHOLDS.SMALL_MOBILE;

export const getRenderScale = (width: number): number =>
  isSmallMobile(width) ? 0.65 : isMobile(width) ? 0.75 : 1.0;

export const getBubbleScale = (width: number): number =>
  isMobile(width) ? 0.7 : 1.0;
