import { useEffect } from 'react';

// Reference-counted so overlapping viewers never unlock each other early.
let locks = 0;
let saved = null;

/**
 * Freezes the page behind an overlay. position:fixed + negative top is the only
 * approach that stops iOS Safari rubber-banding the page underneath; the scroll
 * position is restored exactly (and instantly) on unlock.
 */
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
    if (locks === 0) {
      const b = document.body.style;
      saved = {
        y: window.scrollY,
        position: b.position,
        top: b.top,
        left: b.left,
        right: b.right,
        width: b.width,
        overflow: b.overflow
      };
      b.position = 'fixed';
      b.top = `-${saved.y}px`;
      b.left = '0';
      b.right = '0';
      b.width = '100%';
      b.overflow = 'hidden';
      document.documentElement.classList.add('viewer-open');
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0 && saved) {
        const b = document.body.style;
        const s = saved;
        saved = null;
        b.position = s.position;
        b.top = s.top;
        b.left = s.left;
        b.right = s.right;
        b.width = s.width;
        b.overflow = s.overflow;
        document.documentElement.classList.remove('viewer-open');
        window.scrollTo({ top: s.y, left: 0, behavior: 'instant' });
      }
    };
  }, [active]);
}
