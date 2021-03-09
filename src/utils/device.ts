const _msBrowserRegExp = /(MSIE|Trident\/|Edge\/|Edg\/)/i;
/**
 * Determines if the current browser is IE or Edge (standard/chromium).
 */
export const IS_MICROSOFT_BROWSER: boolean =
  typeof navigator !== 'undefined' && _msBrowserRegExp.test(navigator.userAgent);

/**
 * Determines if the current device is touch-enabled.
 */
export const IS_TOUCH_DEVICE: boolean =
  (typeof window !== 'undefined' && 'ontouchstart' in window) ||
  (typeof navigator !== 'undefined' && !!navigator.maxTouchPoints);