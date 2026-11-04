import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useLang } from '../i18n';
import { ui } from '../translations';
import { mediaUrl } from '../media';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useVerticalNav } from '../hooks/useVerticalNav';

// Wheel/keyboard listeners need the viewer root; tapping a video toggles it.
const toggleHandlers = new WeakMap();

function Caption({ text, t }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  if (!text) return null;
  return (
    <div className={`mv-caption${expanded ? ' is-expanded' : ''}`}>
      <p ref={ref} className="mv-caption-text">
        {text}
      </p>
      {(overflowing || expanded) && (
        <button type="button" data-no-swipe className="mv-caption-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? t.seeLess : t.seeMore}
        </button>
      )}
    </div>
  );
}

function Slide({ item, offset, active, variant, muted, onMutedChange, categoryName, total, position, onBackdrop, t }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Only the active slide plays. The viewer is opened by a deliberate tap, so
  // try with sound first and fall back to muted if the browser refuses.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    if (!active) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* metadata not loaded yet */
      }
      return undefined;
    }
    let cancelled = false;
    video.muted = muted;
    setPaused(false);
    const p = video.play();
    if (p && p.catch) {
      p.catch(() => {
        if (cancelled || video.muted) return;
        video.muted = true;
        onMutedChange(true);
        video.play()?.catch?.(() => {});
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, item.id]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    toggleHandlers.set(video, () => {
      if (video.paused) {
        video.play()?.catch?.(() => {});
        setPaused(false);
      } else {
        video.pause();
        setPaused(true);
      }
    });
    return () => toggleHandlers.delete(video);
  }, []);

  const media = item.src ? (
    <video
      ref={videoRef}
      className="mv-media"
      src={mediaUrl(item.src)}
      poster={item.poster ? mediaUrl(item.poster) : undefined}
      playsInline
      loop
      muted={muted}
      preload={active ? 'auto' : 'metadata'}
      disablePictureInPicture
      aria-label={item.name}
    />
  ) : item.image ? (
    <img
      className="mv-media"
      src={mediaUrl(item.image)}
      alt={item.name}
      draggable={false}
      decoding="async"
      loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
    />
  ) : (
    <div className="mv-media mv-placeholder" />
  );

  const style = { transform: `translate3d(0, calc(${offset * 100}% + var(--mv-drag, 0px)), 0)` };

  if (variant === 'menu') {
    return (
      <div className="mv-slide mv-slide-menu" style={style} onClick={(e) => e.target === e.currentTarget && onBackdrop()}>
        <article className="mv-card">
          <div className="mv-card-media">{media}</div>
          <div className="mv-card-body">
            {categoryName && <span className="mv-card-category">{categoryName}</span>}
            <h2>{item.name}</h2>
            {item.description && <p>{item.description}</p>}
            {total > 1 && (
              <span className="mv-card-counter">
                {position} / {total}
              </span>
            )}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="mv-slide mv-slide-gallery" style={style}>
      {media}
      {item.src && paused && active && <span className="mv-paused" aria-hidden="true" />}
      <div className="mv-gallery-shade">
        <Caption key={item.id} text={item.caption} t={t} />
      </div>
    </div>
  );
}

/**
 * One viewer shell for Menu and Gallery (phone, tablet and desktop alike).
 * variant="menu"    -> white product card, text below the image.
 * variant="gallery" -> immersive media with the caption overlaid, Instagram style.
 * Navigation is vertical only (see useVerticalNav).
 */
export default function MediaViewer({ items, index, variant = 'gallery', categoryName, onClose, onChange }) {
  const { lang } = useLang();
  const t = { ...ui[lang].preview, seeMore: ui[lang].gallery.seeMore, seeLess: ui[lang].gallery.seeLess };
  const rootRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const count = items.length;
  const current = items[index];
  const hasVideo = Boolean(current?.src);

  useBodyScrollLock(true);

  const goNext = useCallback(() => {
    if (index < count - 1) onChange(index + 1);
  }, [index, count, onChange]);
  const goPrev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

  const onTap = useCallback((target) => {
    const video = target?.closest?.('video');
    if (video) toggleHandlers.get(video)?.();
  }, []);

  const { drag, dragging } = useVerticalNav(rootRef, {
    index,
    count,
    onNext: goNext,
    onPrev: goPrev,
    onTap,
    onKeyEscape: onClose
  });

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  if (!current) return null;

  const visible = [];
  for (let i = Math.max(0, index - 1); i <= Math.min(count - 1, index + 1); i += 1) visible.push(i);

  const node = (
    <div
      ref={rootRef}
      className={`mv mv-${variant}${dragging ? ' is-dragging' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={current.name}
      tabIndex={-1}
      style={{ '--mv-drag': `${drag}px` }}
    >
      <div className="mv-track">
        {visible.map((i) => (
          <Slide
            key={items[i].id}
            item={items[i]}
            offset={i - index}
            active={i === index}
            variant={variant}
            muted={muted}
            onMutedChange={setMuted}
            categoryName={categoryName}
            total={count}
            position={i + 1}
            onBackdrop={onClose}
            t={t}
          />
        ))}
      </div>

      <button type="button" data-no-swipe className="mv-btn mv-close" aria-label={t.close} onClick={onClose}>
        <X size={24} strokeWidth={2.5} />
      </button>

      {hasVideo && (
        <button
          type="button"
          data-no-swipe
          className="mv-btn mv-sound"
          aria-label={muted ? t.unmute : t.mute}
          aria-pressed={!muted}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? <VolumeX size={22} aria-hidden="true" /> : <Volume2 size={22} aria-hidden="true" />}
        </button>
      )}

      {count > 1 && (
        <div className="mv-arrows" data-no-swipe>
          <button type="button" className="mv-btn" aria-label={t.prev} disabled={index === 0} onClick={goPrev}>
            <ChevronUp size={26} />
          </button>
          <button type="button" className="mv-btn" aria-label={t.next} disabled={index === count - 1} onClick={goNext}>
            <ChevronDown size={26} />
          </button>
        </div>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
