import { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { useLang } from '../i18n';
import { apiGet } from '../api';
import { ui } from '../translations';
import ItemPreviewModal from '../components/ItemPreviewModal';
import GalleryReelsViewer from '../components/GalleryReelsViewer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { mediaUrl } from '../media';

export default function Gallery() {
  const { lang } = useLang();
  const t = ui[lang].gallery;
  const isMobile = useMediaQuery('(max-width: 799px)');
  const isTouchPhone = useMediaQuery('(hover: none) and (pointer: coarse)');
  const useReels = isMobile || isTouchPhone;
  const modes = [
    { key: 'all', label: t.all },
    { key: 'photos', label: t.photos },
    { key: 'videos', label: t.videos }
  ];

  const [mode, setMode] = useState('all');
  // One collection for both media types, already ordered by the backend on the
  // persistent `created_at` field, so photos and videos stay interleaved.
  const [media, setMedia] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setMedia(null);

    apiGet('/api/media', lang)
      .then((m) => {
        if (!cancelled) setMedia(m);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const mediaList = media ?? [];

  const visible = useMemo(() => {
    if (mode === 'photos') return mediaList.filter((m) => m.type === 'photo');
    if (mode === 'videos') return mediaList.filter((m) => m.type === 'video');
    return mediaList;
  }, [mediaList, mode]);

  // The viewer walks exactly the sequence shown in the grid, so opening an
  // item from "Të gjitha" keeps photos and videos in one continuous run.
  const viewerItems = useMemo(
    () =>
      visible.map((m) =>
        m.type === 'video'
          ? { id: `video-${m.id}`, name: m.title || t.videos, src: m.src, poster: m.thumb }
          : {
              id: `photo-${m.id}`,
              name: m.alt || t.title,
              description: null,
              price: null,
              image: m.image
            }
      ),
    [visible, t.title, t.videos]
  );

  if (media === null) {
    return <div className="page-loading">{t.loading}</div>;
  }

  const emptyLabel = mode === 'videos' ? t.noVideos : t.loading;

  return (
    <div className="page" id="galeria">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <div className="gallery-sticky">
        <div className="menu-type gallery-mode" role="tablist">
          {modes.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={mode === key}
              className={mode === key ? 'active' : ''}
              onClick={() => {
                setMode(key);
                setOpen(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="gallery-empty">{emptyLabel}</p>
      ) : (
        <div className="gallery-grid">
          {visible.map((m, i) => (
            <button
              key={`${m.type}-${m.id}`}
              type="button"
              className={`gallery-cell${m.type === 'video' ? ' gallery-cell-video' : ''}`}
              onClick={() => setOpen(i)}
              aria-label={m.type === 'video' ? m.title || t.videos : m.alt}
            >
              <img
                src={mediaUrl(m.type === 'video' ? m.thumb : m.thumb || m.image)}
                alt={m.type === 'video' ? '' : m.alt}
                loading="lazy"
                decoding="async"
              />
              {m.type === 'video' && (
                <span className="gallery-cell-play" aria-hidden="true">
                  <Play size={16} fill="currentColor" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open !== null &&
        viewerItems.length > 0 &&
        (useReels ? (
          <GalleryReelsViewer
            items={viewerItems}
            index={open}
            onClose={() => setOpen(null)}
            onChange={setOpen}
          />
        ) : (
          <ItemPreviewModal
            items={viewerItems}
            index={open}
            categoryName={t.title}
            onClose={() => setOpen(null)}
            onChange={setOpen}
          />
        ))}
    </div>
  );
}
