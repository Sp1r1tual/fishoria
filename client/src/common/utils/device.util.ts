export const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1));

export const isSafari =
  typeof navigator !== 'undefined' &&
  (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || isIOS);
