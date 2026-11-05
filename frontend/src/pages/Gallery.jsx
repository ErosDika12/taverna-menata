import { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { useLang } from '../i18n';
import { apiGet } from '../api';
import { ui } from '../translations';
import MediaViewer from '../components/MediaViewer';
import { mediaUrl } from '../media';

/** Turn one /api/media row into the shape the grid and MediaViewer share.
 *  Ids are namespaced because photos and videos come from separate tables. */
function normalize(m, t) {
  if (m.type === 'video') {
    const title = m.title || '';
    return {
      id: `video-${m.id}`,
      type: 'video',
      src: m.src,
      poster: m.poster || m.thumb,
      name: title || t.videos,
      caption: title,
      created_at: m.created_at
    };
  }
  const alt = m.alt && m.alt !== 'Taverna Menata' ? m.alt : '';
  return {
    id: `photo-${m.id}`,
    type: 'photo',
    image: m.image,
    thumb: m.thumb,
    name: m.alt || t.title,
    caption: alt,
    created_at: m.created_at
  };
}

export default function Gallery() {
  const { lang } = useLang();
  const t = ui[lang].gallery;
  const modes = [
    { key: 'all', label: t.all },
    { key: 'photos', label: t.photos },
    { key: 'videos', label: t.videos }
  ];

  const [mode, setMode] = useState('all');
  const [media, setMedia] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setMedia(null);
    apiGet('/api/media', lang)
      .then((rows) => {
        if (!cancelled) setMedia(rows);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // One chronological array (already newest first from the API). The filters
  // only drop items; they never re-sort, so every mode keeps the same order.
  const feed = useMemo(() => (media ?? []).map((m) => normalize(m, t)), [media, t]);
  const visible = useMemo(() => {
    if (mode === 'photos') return feed.filter((m) => m.type === 'photo');
    if (mode === 'videos') return feed.filter((m) => m.type === 'video');
    return feed;
  }, [feed, mode]);

  if (media === null) {
    return <div className="page-loading">{t.loading}</div>;
  }

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
                setOpenIndex(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="gallery-empty">{mode === 'videos' ? t.noVideos : t.loading}</p>
      ) : (
        <div className="gallery-grid">
          {visible.map((m, i) => (
            <button
              key={m.id}
              className="gallery-cell"
              onClick={() => setOpenIndex(i)}
              aria-label={m.type === 'video' ? m.name : undefined}
            >
              <img
                src={mediaUrl(m.type === 'video' ? m.poster : m.thumb)}
                alt={m.name}
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

      {openIndex !== null && visible.length > 0 && (
        <MediaViewer
          variant="gallery"
          items={visible}
          index={Math.min(openIndex, visible.length - 1)}
          onClose={() => setOpenIndex(null)}
          onChange={setOpenIndex}
        />
      )}
    </div>
  );
}
