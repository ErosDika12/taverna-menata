import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronsDown } from 'lucide-react';
import { useLang } from '../i18n';
import { ui } from '../translations';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { mediaUrl } from '../media';

function formatPrice(price) {
  if (price == null) return null;
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

function isDailyCategoryName(name = '') {
  return /ditore|daily/i.test(name);
}

export default function ItemPreviewModal({ items, index, onClose, onChange, categoryName }) {
  const { lang } = useLang();
  const t = ui[lang].preview;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const item = items[index];
  const touchStart = useRef({ x: 0, y: 0, t: 0, scrollTop: 0 });
  const contentRef = useRef(null);
  const gestureRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const goPrev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

  const goNext = useCallback(() => {
    if (index < items.length - 1) onChange(index + 1);
  }, [index, items.length, onChange]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setImageLoaded(false);
  }, [item?.id, item?.image]);

  useEffect(() => {
    if (item == null) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [item, onClose, goPrev, goNext]);

  function handleClose() {
    setVisible(false);
    window.setTimeout(onClose, 220);
  }

  function onTouchStart(e) {
    if (e.target.closest('.preview-modal-body-scroll')) {
      gestureRef.current = null;
      return;
    }
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      t: Date.now(),
      scrollTop: contentRef.current?.scrollTop ?? 0
    };
    gestureRef.current = 'pending';
    setDragging(true);
  }

  function onTouchMove(e) {
    if (!gestureRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

    if (gestureRef.current === 'pending') {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      gestureRef.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }

    if (gestureRef.current === 'vertical' && dy > 0) {
      setDragY(dy);
      setDragX(0);
      if (e.cancelable) e.preventDefault();
      return;
    }

    if (gestureRef.current === 'horizontal' && items.length > 1) {
      setDragX(dx);
      setDragY(0);
      if (e.cancelable) e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!gestureRef.current) {
      setDragging(false);
      return;
    }

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    const velocityY = dy / Math.max(dt, 1);
    const velocityX = dx / Math.max(dt, 1);

    const gesture = gestureRef.current;

    setDragging(false);
    setDragY(0);
    setDragX(0);
    gestureRef.current = null;

    if (gesture === 'vertical' && (dy > 70 || (dy > 40 && velocityY > 0.45)) && dy > Math.abs(dx)) {
      handleClose();
      return;
    }

    if (
      gesture === 'horizontal' &&
      items.length > 1 &&
      (Math.abs(dx) > 56 || Math.abs(velocityX) > 0.35) &&
      Math.abs(dx) > Math.abs(dy)
    ) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  if (!item) return null;

  const price = formatPrice(item.price);
  const showCategory = categoryName && !(isMobile && isDailyCategoryName(categoryName));
  const backdropOpacity = Math.max(0.35, 1 - dragY / 280);
  const modalTransform = `translateY(calc(${visible ? '0px' : '100%'} + ${dragY}px)) translateX(${dragX}px)`;

  return (
    <div
      className={`preview-modal-backdrop${visible ? ' is-open' : ''}${dragging ? ' is-dragging' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={handleClose}
      style={{ '--backdrop-opacity': backdropOpacity }}
    >
      <div
        className="preview-modal"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: modalTransform }}
      >
        <div className="preview-modal-handle" aria-hidden="true">
          <span />
        </div>

        <button type="button" className="preview-modal-close" aria-label={t.close} onClick={handleClose}>
          <X size={24} strokeWidth={2.5} />
        </button>

        {index > 0 && (
          <button type="button" className="preview-modal-nav prev" aria-label={t.prev} onClick={goPrev}>
            <ChevronLeft size={28} />
          </button>
        )}
        {index < items.length - 1 && (
          <button type="button" className="preview-modal-nav next" aria-label={t.next} onClick={goNext}>
            <ChevronRight size={28} />
          </button>
        )}

        <div className="preview-modal-content" ref={contentRef}>
          <div className="preview-modal-image-wrap">
            {item.image ? (
              <img
                className={imageLoaded ? 'is-loaded' : ''}
                src={mediaUrl(item.image)}
                alt={item.name}
                decoding="async"
                draggable={false}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="preview-modal-placeholder" />
            )}
          </div>

          {isMobile && items.length > 1 && (
            <div className="preview-modal-swipe-hints" aria-hidden="true">
              <ChevronLeft size={18} />
              <span>{t.swipeHorizontal}</span>
              <ChevronRight size={18} />
            </div>
          )}

          {isMobile && (
            <div className="preview-modal-dismiss-hint" aria-hidden="true">
              <ChevronsDown size={16} />
              <span>{t.swipeClose}</span>
            </div>
          )}

          <div className="preview-modal-body preview-modal-body-scroll">
            {showCategory && <span className="preview-modal-category">{categoryName}</span>}
            <h2>{item.name}</h2>
            {item.description && <p>{item.description}</p>}
            {price && <span className="preview-modal-price">{price}</span>}
            {items.length > 1 && (
              <span className="preview-modal-counter">
                {index + 1} / {items.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
