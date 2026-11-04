import { useEffect, useRef, useState } from 'react';

const AXIS_LOCK_PX = 10;
const WHEEL_STEP = 40;
const WHEEL_COOLDOWN_MS = 550;

/**
 * Vertical-only next/previous navigation shared by every media viewer.
 *   next = swipe up / wheel down / ArrowDown / PageDown
 *   prev = swipe down / wheel up / ArrowUp / PageUp
 * Horizontal movement (touch or trackpad) is swallowed and never navigates.
 * Elements marked [data-no-swipe] (buttons) keep their own tap behaviour.
 * Returns { drag, dragging } for live drag feedback.
 */
export function useVerticalNav(ref, { index, count, onNext, onPrev, onTap, onKeyEscape }) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const latest = useRef({});
  latest.current = { index, count, onNext, onPrev, onTap, onKeyEscape };

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let g = null;
    let raf = 0;
    let swallowClickUntil = 0;
    let dragY = 0;

    const flush = () => {
      raf = 0;
      setDrag(dragY);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const reset = () => {
      dragY = 0;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setDrag(0);
      setDragging(false);
    };

    function onTouchStart(e) {
      if (e.touches.length !== 1 || e.target.closest?.('[data-no-swipe]')) {
        g = null;
        return;
      }
      const t = e.touches[0];
      g = { x: t.clientX, y: t.clientY, t: Date.now(), axis: null, target: e.target };
    }

    function onTouchMove(e) {
      if (e.cancelable) e.preventDefault(); // the page behind never scrolls
      if (!g) return;
      const t = e.touches[0];
      const dx = t.clientX - g.x;
      const dy = t.clientY - g.y;
      if (!g.axis) {
        if (Math.hypot(dx, dy) < AXIS_LOCK_PX) return;
        // Diagonals favour "horizontal" (ignored) so they never change item.
        g.axis = Math.abs(dy) > Math.abs(dx) * 1.2 ? 'y' : 'x';
        if (g.axis === 'y') setDragging(true);
      }
      if (g.axis !== 'y') return;
      const { index: i, count: n } = latest.current;
      const atEdge = (i === 0 && dy > 0) || (i === n - 1 && dy < 0);
      dragY = atEdge ? dy * 0.25 : dy;
      schedule();
    }

    function onTouchEnd(e) {
      if (!g) return;
      const gesture = g;
      g = null;
      const t = e.changedTouches?.[0];
      const dx = t ? t.clientX - gesture.x : 0;
      const dy = t ? t.clientY - gesture.y : 0;
      const dt = Date.now() - gesture.t;
      reset();
      // A drag must never be read as a tap (e.g. closing via the backdrop).
      if (gesture.axis) swallowClickUntil = Date.now() + 400;
      if (e.type === 'touchcancel') return;

      if (!gesture.axis) {
        if (dt < 500) latest.current.onTap?.(gesture.target);
        return;
      }
      if (gesture.axis !== 'y' || Math.abs(dy) <= Math.abs(dx)) return;

      const v = dy / Math.max(dt, 1);
      const threshold = Math.max(56, window.innerHeight * 0.12);
      if (dy < 0 && (dy < -threshold || (dy < -32 && v < -0.45))) latest.current.onNext?.();
      else if (dy > 0 && (dy > threshold || (dy > 32 && v > 0.45))) latest.current.onPrev?.();
    }

    let acc = 0;
    let lastWheel = 0;
    let lockedUntil = 0;
    function onWheel(e) {
      e.preventDefault(); // never scroll the page behind
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // horizontal: ignore
      const now = Date.now();
      if (now < lockedUntil) return;
      if (now - lastWheel > 200) acc = 0;
      lastWheel = now;
      acc += e.deltaY;
      if (Math.abs(acc) < WHEEL_STEP) return;
      if (acc > 0) latest.current.onNext?.();
      else latest.current.onPrev?.();
      acc = 0;
      lockedUntil = now + WHEEL_COOLDOWN_MS;
    }

    function onClickCapture(e) {
      if (Date.now() < swallowClickUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') latest.current.onKeyEscape?.();
      else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        latest.current.onNext?.();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        latest.current.onPrev?.();
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('click', onClickCapture, true);
    window.addEventListener('keydown', onKey);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [ref]);

  return { drag, dragging };
}
