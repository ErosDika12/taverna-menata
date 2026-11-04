import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n';
import { apiGet } from '../api';
import { ui } from '../translations';
import MediaViewer from '../components/MediaViewer';
import { mediaUrl } from '../media';
import { GALLERY_VIDEOS } from '../galleryVideos';

export default function Gallery() {
  const { lang } = useLang();
  const t = ui[lang].gallery;
  const modes = [
    { key: 'all', label: t.all },
    { key: 'photos', label: t.photos },
    { key: 'videos', label: t.videos }
  ];

  const [mode, setMode] = useState('all');
  const [photos, setPhotos] = useState(null);
  const [openPhoto, setOpenPhoto] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPhotos(null);

    apiGet('/api/gallery', lang)
      .then((p) => {
        if (!cancelled) setPhotos(p);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const photoList = photos ?? [];
  const videoList = GALLERY_VIDEOS;

  const previewItems = useMemo(
    () =>
      photoList.map((p) => ({
        id: p.id,
        name: p.alt || t.title,
        caption: p.alt && p.alt !== 'Taverna Menata' ? p.alt : '',
        image: p.image
      })),
    [photoList, t.title]
  );

  const videoPreviewItems = useMemo(
    () =>
      videoList.map((v) => ({
        id: v.id,
        name: v.title || t.videos,
        caption: v.title || '',
        src: v.src,
        poster: v.poster
      })),
    [videoList, t.videos]
  );

  const showPhotos = mode === 'all' || mode === 'photos';
  const showVideos = mode === 'all' || mode === 'videos';
  const emptyPhotosOnly = mode === 'photos' && photoList.length === 0;
  const emptyVideosOnly = mode === 'videos' && videoList.length === 0;
  const emptyAll = mode === 'all' && photoList.length === 0 && videoList.length === 0;

  if (photos === null) {
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
                setOpenPhoto(null);
                setOpenVideo(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {emptyVideosOnly ? (
        <p className="gallery-empty">{t.noVideos}</p>
      ) : emptyPhotosOnly || emptyAll ? (
        <p className="gallery-empty">{t.loading}</p>
      ) : (
        <div className="gallery-grid">
          {showPhotos &&
            photoList.map((p, i) => (
              <button key={`photo-${p.id}`} className="gallery-cell" onClick={() => setOpenPhoto(i)}>
                <img src={mediaUrl(p.thumb)} alt={p.alt} loading="lazy" decoding="async" />
              </button>
            ))}

          {showVideos &&
            videoList.map((v, i) => (
              <button
                key={`video-${v.id}`}
                className="gallery-cell"
                onClick={() => setOpenVideo(i)}
                aria-label={v.title || t.videos}
              >
                <img src={mediaUrl(v.poster)} alt={v.title || t.videos} loading="lazy" decoding="async" />
              </button>
            ))}
        </div>
      )}

      {openPhoto !== null && previewItems.length > 0 && (
        <MediaViewer
          variant="gallery"
          items={previewItems}
          index={openPhoto}
          onClose={() => setOpenPhoto(null)}
          onChange={setOpenPhoto}
        />
      )}

      {openVideo !== null && videoPreviewItems.length > 0 && (
        <MediaViewer
          variant="gallery"
          items={videoPreviewItems}
          index={openVideo}
          onClose={() => setOpenVideo(null)}
          onChange={setOpenVideo}
        />
      )}
    </div>
  );
}
