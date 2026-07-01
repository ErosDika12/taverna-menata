import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../i18n';
import { ui } from '../translations';
import { mediaUrl } from '../media';

function formatPrice(price) {
  if (price == null) return null;
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

export default function ItemPreviewModal({ items, index, onClose, onChange, categoryName }) {
  const { lang } = useLang();
  const t = ui[lang].preview;
  const item = items[index];
  const touchStart = useRef({ x: 0, y: 0, t: 0 });
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const goPrev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

  const goNext = useCallback(() => {
    if (index < items.length - 1) onChange(index + 1);
  }, [index, items.length, onChange]);

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

  if (!item) return null;

  function onTouchStart(e) {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    setDragging(true);
  }

  function onTouchMove(e) {
    if (!dragging) return;
    const touch = e.touches[0];
    const dy = touch.clientY - touchStart.current.y;
    if (dy > 0) setDragY(dy);
  }

  function onTouchEnd(e) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;

    setDragging(false);
    setDragY(0);

    if (Math.abs(dy) > 80 && dy > 0 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 500) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  const price = formatPrice(item.price);

  return (
    <div
      className="preview-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={onClose}
      style={{ '--drag-y': `${dragY}px` }}
    >
      <div
        className={`preview-modal${dragging ? ' dragging' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button type="button" className="preview-modal-close" aria-label={t.close} onClick={onClose}>
          <X size={28} />
        </button>

        {index > 0 && (
          <button type="button" className="preview-modal-nav prev" aria-label={t.prev} onClick={goPrev}>
            <ChevronLeft size={32} />
          </button>
        )}
        {index < items.length - 1 && (
          <button type="button" className="preview-modal-nav next" aria-label={t.next} onClick={goNext}>
            <ChevronRight size={32} />
          </button>
        )}

        <div className="preview-modal-image-wrap">
          {item.image ? (
            <img src={mediaUrl(item.image)} alt={item.name} decoding="async" draggable={false} />
          ) : (
            <div className="preview-modal-placeholder" />
          )}
        </div>

        <div className="preview-modal-body">
          {categoryName && <span className="preview-modal-category">{categoryName}</span>}
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
  );
}
