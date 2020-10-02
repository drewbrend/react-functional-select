const OVERFLOW_REGEXP = /(auto|scroll)/;

function getScrollTop(el: HTMLElement): number {
  return isDocumentElement(el) ? window.pageYOffset : el.scrollTop;
}

function scrollTo(el: HTMLElement, top: number): void {
  isDocumentElement(el) ? window.scrollTo(0, top) : (el.scrollTop = top);
}

function isDocumentElement(el: HTMLElement | Window): boolean {
  return (
    el === document.documentElement || el === document.body || el === window
  );
}

function getScrollParent(el: HTMLElement): HTMLElement {
  let style = getComputedStyle(el);
  const excludeStaticParent = (style.position === 'absolute');

  if (style.position === 'fixed') {
    return document.documentElement;
  }

  for (let parent = el as HTMLElement | null; (parent = parent ? parent.parentElement : null);) {
    style = getComputedStyle(parent);
    if (
      !(excludeStaticParent && style.position === 'static') &&
      OVERFLOW_REGEXP.test(`${style.overflow}${style.overflowY}${style.overflowX}`)
    ) {
      return parent;
    }
  }

  return document.documentElement;
}

function smoothScrollTo(
  element: HTMLElement,
  to: number,
  duration: number = 300,
  callback?: (...args: any[]) => any
): void {
  let currentTime = 0;
  const start = getScrollTop(element);
  const change = (to - start);
  const easeOutCubic = (t: number): number => change * ((t = t / duration - 1) * t * t + 1) + start;

  function smoothScroller(): void {
    currentTime += 5;
    scrollTo(element, easeOutCubic(currentTime));
    if (currentTime < duration) {
      window.requestAnimationFrame(smoothScroller);
    } else {
      callback && callback();
    }
  }

  window.requestAnimationFrame(smoothScroller);
}

/**
 * Calculates the top property value for the MenuWrapper <div />.
 * This property is only generated when the position of the menu is above the control.
 */
export const calculateMenuTop = (
  menuHeight: number,
  menuEl: HTMLElement | null,
  controlEl: HTMLElement | null
): string => {
  const menuHeightOrDefault = (menuHeight > 0 || !menuEl) ? menuHeight : menuEl.getBoundingClientRect().height;
  const controlHeight = controlEl ? controlEl.getBoundingClientRect().height : 0;

  const menuElStyle = menuEl && getComputedStyle(menuEl);
  const marginBottom = menuElStyle ? parseInt(menuElStyle.marginBottom || '0', 10) : 0;
  const marginTop = menuElStyle ? parseInt(menuElStyle.marginTop || '0', 10) : 0;

  return `calc(${-Math.abs(menuHeightOrDefault + controlHeight)}px + ${marginBottom + marginTop}px)`;
};

export function menuFitsBelowControl(menuEl: HTMLElement | null): boolean {
  if (!menuEl) return true;

  const menuRect = menuEl.getBoundingClientRect();
  const scrollParent = getScrollParent(menuEl);
  const scrollTop = getScrollTop(scrollParent);
  const scrollSpaceBelow = (scrollParent.getBoundingClientRect().height - scrollTop - menuRect.top);

  return (scrollSpaceBelow >= menuRect.height);
}

/**
 * Calculate space around the control and menu to determine if an animated
 * scroll can performed to show the menu in full view. Also, execute a callback if defined.
 */
export function scrollMenuIntoViewOnOpen(
  menuEl: HTMLElement | null,
  menuScrollDuration: number | undefined,
  scrollMenuIntoView: boolean | undefined,
  handleOnMenuOpen: (availableSpace?: number) => void
): void {
  if (!menuEl) {
    handleOnMenuOpen();
    return;
  }

  const viewInner = window.innerHeight;
  const menuRect = menuEl.getBoundingClientRect();
  const viewSpaceBelow = viewInner - menuRect.top;

  // Menu will fit in available space - no need to do scroll
  if (viewSpaceBelow >= menuRect.height) {
    handleOnMenuOpen();
    return;
  }

  const scrollParent = getScrollParent(menuEl);
  const scrollTop = getScrollTop(scrollParent);
  const scrollSpaceBelow = (scrollParent.getBoundingClientRect().height - scrollTop - menuRect.top);
  const notEnoughSpaceBelow = scrollSpaceBelow < menuRect.height;

  // Sufficient space does not exist to scroll menu fully into view
  // ...Calculate available space and use that as the the new menuHeight (use scrollSpaceBelow for now).
  // OR scrollMenuIntoView = false
  if (notEnoughSpaceBelow || !scrollMenuIntoView) {
    const condensedMenuHeight = notEnoughSpaceBelow ? scrollSpaceBelow : undefined;
    handleOnMenuOpen(condensedMenuHeight);
    return;
  }

  // Do scroll and upon scroll animation completion, execute the callback if defined
  const marginBottom = parseInt(getComputedStyle(menuEl).marginBottom || '0', 10);
  const scrollDown = (menuRect.bottom - viewInner + scrollTop + marginBottom);
  smoothScrollTo(scrollParent, scrollDown, menuScrollDuration, handleOnMenuOpen);
}
