import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useLang } from '../i18n';
import { ui } from '../translations';
import { mediaUrl } from '../media';

export default function GalleryReelsViewer({ items, index, onClose, onChange }) {
  const { lang } = useLang();
  const t = ui[lang].preview;
  const tg = ui[lang].gallery;
  const rootRef = useRef(null);
  const dragYRef = useRef(0);
  const startYRef = useRef(0);
  const startTRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const goPrev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

  const goNext = useCallback(() => {
    if (index < items.length - 1) onChange(index + 1);
  }, [index, items.length, onChange]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') goPrev();
      if (e.key === 'ArrowDown') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    function onTouchStart(e) {
      if (e.target.closest('.gallery-reels-close')) return;
      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      startTRef.current = Date.now();
      dragYRef.current = 0;
      setDragging(true);
    }

    function onTouchMove(e) {
      if (!startTRef.current) return;
      const dy = e.touches[0].clientY - startYRef.current;
      const atStart = index === 0 && dy > 0;
      const atEnd = index === items.length - 1 && dy < 0;
      const next = atStart || atEnd ? dy * 0.28 : dy;
      dragYRef.current = next;
      setDragY(next);
      if (e.cancelable) e.preventDefault();
    }

    function onTouchEnd() {
      if (!startTRef.current) return;
      const dy = dragYRef.current;
      const dt = Date.now() - startTRef.current;
      const velocity = dy / Math.max(dt, 1);
      const threshold = Math.max(72, window.innerHeight * 0.14);

      startTRef.current = 0;
      dragYRef.current = 0;
      setDragging(false);
      setDragY(0);

      if ((dy < -threshold || velocity < -0.45) && dy < 0) {
        goNext();
        return;
      }
      if ((dy > threshold || velocity > 0.45) && dy > 0) {
        goPrev();
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [index, items.length, goPrev, goNext]);

  const translateY = `calc(${-index * 100}dvh + ${dragY}px)`;

  return (
    <div
      ref={rootRef}
      className={`gallery-reels${dragging ? ' is-dragging' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={tg.title}
    >
      <button type="button" className="gallery-reels-close" aria-label={t.close} onClick={onClose}>
        <X size={26} strokeWidth={2.5} />
      </button>

      <div className="gallery-reels-track" style={{ transform: `translate3d(0, ${translateY}, 0)` }}>
        {items.map((item, i) => (
          <div className="gallery-reels-slide" key={item.id}>
            {item.image ? (
              <img
                src={mediaUrl(item.image)}
                alt={item.name}
                draggable={false}
                loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
