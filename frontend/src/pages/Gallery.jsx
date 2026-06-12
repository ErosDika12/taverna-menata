import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useLang } from '../i18n';
import { apiGet } from '../api';
import { ui } from '../translations';
import { mediaUrl } from '../media';

export default function Gallery() {
  const { lang } = useLang();
  const t = ui[lang].gallery;
  const sections = [
    { key: 'all', label: t.sections.all },
    { key: 'food', label: t.sections.food },
    { key: 'interior', label: t.sections.interior },
    { key: 'exterior', label: t.sections.exterior },
    { key: 'atmosphere', label: t.sections.atmosphere }
  ];

  const [mode, setMode] = useState('photos');
  const [photos, setPhotos] = useState(null);
  const [videos, setVideos] = useState(null);
  const [section, setSection] = useState('all');
  const [openPhoto, setOpenPhoto] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPhotos(null);
    setVideos(null);

    apiGet('/api/gallery', lang)
      .then((p) => { if (!cancelled) setPhotos(p); })
      .catch(() => { if (!cancelled) setPhotos([]); });

    apiGet('/api/videos', lang)
      .then((v) => { if (!cancelled) setVideos(v); })
      .catch(() => { if (!cancelled) setVideos([]); });

    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    if (openPhoto === null) return;
    function onKey(e) {
      if (e.key === 'Escape') setOpenPhoto(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPhoto]);

  if (photos === null) {
    return <div className="page-loading">{t.loading}</div>;
  }

  const videoList = videos ?? [];

  const visiblePhotos = section === 'all' ? photos : photos.filter((p) => p.category === section);
  const visibleVideos = section === 'all' ? videoList : videoList.filter((v) => v.category === section);
  const photo = openPhoto !== null ? visiblePhotos[openPhoto] : null;

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <div className="gallery-sticky">
        <div className="menu-type gallery-mode" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'photos'}
            className={mode === 'photos' ? 'active' : ''}
            onClick={() => {
              setMode('photos');
              setOpenPhoto(null);
              setOpenVideo(null);
            }}
          >
            {t.photos}
          </button>
          <button
            role="tab"
            aria-selected={mode === 'videos'}
            className={mode === 'videos' ? 'active' : ''}
            onClick={() => {
              setMode('videos');
              setOpenPhoto(null);
              setOpenVideo(null);
            }}
          >
            {t.videos}
          </button>
        </div>

        <div className="chips" role="tablist">
          {sections.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={section === key}
              className={section === key ? 'active' : ''}
              onClick={() => {
                setSection(key);
                setOpenPhoto(null);
                setOpenVideo(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'photos' && (
        <div className="gallery-grid">
          {visiblePhotos.map((p, i) => (
            <button key={p.id} className="gallery-cell" onClick={() => setOpenPhoto(i)}>
              <img src={mediaUrl(p.thumb)} alt={p.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {mode === 'videos' && (
        <>
          {visibleVideos.length === 0 ? (
            <p className="gallery-empty">{t.noVideos}</p>
          ) : (
            <div className="video-grid">
              {visibleVideos.map((v) => (
                <button key={v.id} className="video-card" onClick={() => setOpenVideo(v)}>
                  {v.thumb ? (
                    <img src={mediaUrl(v.thumb)} alt={v.title} loading="lazy" decoding="async" />
                  ) : (
                    <div className="video-placeholder" />
                  )}
                  <span className="video-play">
                    <Play size={28} fill="currentColor" />
                  </span>
                  {v.title && <span className="video-title">{v.title}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {photo && (
        <div className="lightbox" role="dialog" onClick={() => setOpenPhoto(null)}>
          <img src={mediaUrl(photo.image)} alt={photo.alt} decoding="async" onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-close" aria-label={t.close} onClick={() => setOpenPhoto(null)}>
            <X size={28} />
          </button>
          {openPhoto > 0 && (
            <button
              className="lightbox-nav prev"
              aria-label={t.prevPhoto}
              onClick={(e) => {
                e.stopPropagation();
                setOpenPhoto(openPhoto - 1);
              }}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {openPhoto < visiblePhotos.length - 1 && (
            <button
              className="lightbox-nav next"
              aria-label={t.nextPhoto}
              onClick={(e) => {
                e.stopPropagation();
                setOpenPhoto(openPhoto + 1);
              }}
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}

      {openVideo && (
        <div className="lightbox video-lightbox" role="dialog" onClick={() => setOpenVideo(null)}>
          <video
            src={mediaUrl(openVideo.src)}
            controls
            playsInline
            preload="metadata"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-close" aria-label={t.close} onClick={() => setOpenVideo(null)}>
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
