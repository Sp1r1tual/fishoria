export const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1));

export const isAndroid =
  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

export const isMac =
  typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) && !isIOS;

export const isWindows =
  typeof navigator !== 'undefined' && /Win/.test(navigator.userAgent);

export const isMobile = isIOS || isAndroid;

export const isLandscape = () =>
  typeof window !== 'undefined' && window.innerWidth > window.innerHeight;

export const isSafari =
  typeof navigator !== 'undefined' &&
  (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || isIOS);
