import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChefHat, Leaf, Users, Phone, MapPin, Clock, Navigation, Volume2, VolumeX } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { apiGet } from '../api';
import { ui } from '../translations';
import ItemPreviewModal from '../components/ItemPreviewModal';
import GalleryReelsViewer from '../components/GalleryReelsViewer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { mediaUrl } from '../media';

const highlightIcons = [ChefHat, Leaf, Users, Phone];

function formatPrice(price) {
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

const PREVIEW_MENU_ITEMS = 6;
const PREVIEW_GALLERY_PHOTOS = 9;
const HERO_VIDEO_SRC = '/videos/Video-61801.mp4';

export default function Home() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].home;
  const tg = ui[lang].gallery;
  const tm = ui[lang].menu;
  const tc = ui[lang].contact;
  const b = ui[lang].buttons;
  const isMobile = useMediaQuery('(max-width: 799px)');

  const [menuCategories, setMenuCategories] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [preview, setPreview] = useState({ items: [], index: 0, categoryName: '', type: 'menu' });
  const [heroMuted, setHeroMuted] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const heroVideoRef = useRef(null);
  const heroPoster = mediaUrl(settings.hero_image);

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then(setMenuCategories)
      .catch(() => setMenuCategories([]));
    apiGet('/api/gallery', lang)
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, [lang]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    let cancelled = false;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.defaultMuted = false;
    video.volume = 1;

    async function tryAutoplay() {
      if (cancelled) return;
      video.muted = false;
      try {
        await video.play();
        if (!cancelled) setHeroMuted(false);
      } catch {
        video.muted = true;
        try {
          await video.play();
          if (!cancelled) setHeroMuted(true);
        } catch {
          /* Poster stays visible if autoplay is fully blocked. */
        }
      }
    }

    if (video.readyState >= 2) {
      tryAutoplay();
    } else {
      video.addEventListener('loadeddata', tryAutoplay);
    }

    return () => {
      cancelled = true;
      video.removeEventListener('loadeddata', tryAutoplay);
    };
  }, []);

  const regularMenuPreview = useMemo(() => {
    if (!menuCategories?.length) return [];
    const food = menuCategories.filter((c) => c.type === 'food');
    const pool = food.flatMap((c) => c.items.map((item) => ({ ...item, categoryName: c.name })));
    return pool.slice(0, PREVIEW_MENU_ITEMS);
  }, [menuCategories]);

  const galleryPreview = useMemo(() => (photos || []).slice(0, PREVIEW_GALLERY_PHOTOS), [photos]);
  const phone = settings.phone?.replace(/\s/g, '');
  const galleryCta = lang === 'en' ? 'See Gallery' : 'Shiko Galerinë';

  function closePreview() {
    setPreview({ items: [], index: 0, categoryName: '', type: 'menu' });
  }

  function toggleHeroMute() {
    const video = heroVideoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    video.volume = 1;
    setHeroMuted(nextMuted);
    if (video.paused) {
      const play = video.play();
      if (play && typeof play.catch === 'function') play.catch(() => {});
    }
  }

  function openMenuPreview(item, list, categoryName) {
    const index = list.findIndex((i) => i.id === item.id);
    setPreview({ items: list, index: index >= 0 ? index : 0, categoryName, type: 'menu' });
  }

  function openGalleryPreview(photo, list) {
    const items = list.map((p) => ({
      id: p.id,
      name: p.alt || tg.title,
      description: null,
      price: null,
      image: p.image
    }));
    const index = list.findIndex((p) => p.id === photo.id);
    setPreview({ items, index: index >= 0 ? index : 0, categoryName: tg.title, type: 'gallery' });
  }

  const galleryViewerOpen = preview.items.length > 0 && preview.type === 'gallery';
  const menuViewerOpen = preview.items.length > 0 && preview.type === 'menu';

  return (
    <div className="home-scroll">
      {/* 1. Ballina — matches bottom nav */}
      <section id="ballina" className="home-section hero">
        {heroPoster ? (
          <img className="hero-bg hero-bg-photo" src={heroPoster} alt="" fetchPriority="high" decoding="async" />
        ) : null}
        <div className="hero-video-frame">
          <div className="hero-video-landscape">
            <video
              ref={heroVideoRef}
              className={`hero-video${heroVideoReady ? ' is-visible' : ''}`}
              src={HERO_VIDEO_SRC}
              poster={heroPoster || undefined}
              muted={heroMuted}
              autoPlay
              playsInline
              loop
              preload="auto"
              onLoadedData={() => setHeroVideoReady(true)}
              onPlaying={() => setHeroVideoReady(true)}
            />
          </div>
        </div>
        <button
          type="button"
          className="hero-mute-btn"
          onClick={toggleHeroMute}
          aria-label={heroMuted ? (lang === 'en' ? 'Unmute video' : 'Ndiz zërin') : lang === 'en' ? 'Mute video' : 'Fik zërin'}
          aria-pressed={heroMuted}
        >
          {heroMuted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
        </button>
        <div className="hero-content">
          <h1>{settings.site_name}</h1>
          <p className="hero-tagline">{settings.tagline}</p>
          <p className="hero-text">{settings.home_intro}</p>
        </div>
      </section>

      {/* 2. Menyja — matches nav order */}
      <section id="menu" className="home-section section home-menu">
        <Link to="/menu" className="btn btn-primary home-section-link">
          {b.menu}
        </Link>
        <p className="home-section-desc">{t.menuIntro}</p>
        {menuCategories === null ? (
          <p className="home-loading">{tm.loading}</p>
        ) : regularMenuPreview.length === 0 ? (
          <p className="home-loading">{tm.loading}</p>
        ) : (
          <ul className="menu-list home-menu-list">
            {regularMenuPreview.map((item) => (
              <li key={item.id} className="menu-item">
                <span className="menu-item-thumb">
                  {item.image ? (
                    <img src={mediaUrl(item.image)} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="menu-item-no-img" />
                  )}
                </span>
                <div className="menu-item-body">
                  <div className="menu-item-row">
                    <h3>{item.name}</h3>
                    <span className="menu-item-price">{formatPrice(item.price)}</span>
                  </div>
                  {item.description && <p>{item.description}</p>}
                </div>
                <button
                  type="button"
                  className="home-menu-item-hit"
                  aria-label={item.name}
                  onClick={() => openMenuPreview(item, regularMenuPreview, item.categoryName)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Galeria — button → text → photos (3-col) */}
      <section id="galeria" className="home-section section home-gallery">
        <Link to="/gallery" className="btn btn-primary home-section-link">
          {galleryCta}
        </Link>
        <p className="home-section-desc">{tg.subtitle}</p>
        {photos === null ? (
          <p className="home-loading">{tg.loading}</p>
        ) : (
          <div className="home-gallery-grid">
            {galleryPreview.map((p) => (
              <button
                key={p.id}
                type="button"
                className="gallery-cell"
                onClick={() => openGalleryPreview(p, galleryPreview)}
              >
                <img src={mediaUrl(p.thumb)} alt={p.alt} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 4. Historia — button → text → photo */}
      <section id="historia" className="home-section section home-about">
        <div className="home-about-intro">
          <Link to="/about" className="btn btn-primary home-section-link">
            {b.ourStory}
          </Link>
          <p className="home-section-desc">{t.visitText}</p>
        </div>
        <div className="home-about-grid">
          <div className="home-about-text">
            <div className="highlights">
              {t.highlights.map(({ title, text }, i) => {
                const Icon = highlightIcons[i];
                return (
                  <div key={title} className="highlight-card">
                    <span className="highlight-icon">
                      <Icon size={26} aria-hidden="true" />
                    </span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <img
            src="/uploads/gallery/thumbs/dsc09465.jpg"
            alt="Taverna Menata"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* 5. Kontakti — button → text → content */}
      <section id="kontakt" className="home-section section home-contact">
        <Link to="/contact" className="btn btn-primary home-section-link">
          {b.contactUs}
        </Link>
        <p className="home-section-desc">{tc.subtitle}</p>

        <div className="contact-block home-contact-block">
          <p>{tc.callText}</p>
          <a className="btn btn-outline" href={`tel:${phone}`}>
            <Phone size={18} aria-hidden="true" />
            {tc.callTitle}
          </a>
        </div>

        <div className="contact-block home-contact-block">
          <div className="contact-info-row">
            <MapPin size={22} aria-hidden="true" />
            <div>
              <strong>{tc.address}</strong>
              <p>{settings.address}</p>
            </div>
          </div>
          <div className="contact-info-row">
            <Clock size={22} aria-hidden="true" />
            <div>
              <strong>{tc.hours}</strong>
              <p>{settings.hours}</p>
            </div>
          </div>
          <a className="btn btn-outline" href={settings.maps_url} target="_blank" rel="noopener noreferrer">
            <Navigation size={18} aria-hidden="true" />
            {b.directions}
          </a>
        </div>
      </section>

      {galleryViewerOpen &&
        createPortal(
          isMobile ? (
            <GalleryReelsViewer
              items={preview.items}
              index={preview.index}
              onClose={closePreview}
              onChange={(index) => setPreview((p) => ({ ...p, index }))}
            />
          ) : (
            <ItemPreviewModal
              items={preview.items}
              index={preview.index}
              categoryName={preview.categoryName}
              onClose={closePreview}
              onChange={(index) => setPreview((p) => ({ ...p, index }))}
            />
          ),
          document.body
        )}

      {menuViewerOpen && (
        <ItemPreviewModal
          items={preview.items}
          index={preview.index}
          categoryName={preview.categoryName}
          onClose={closePreview}
          onChange={(index) => setPreview((p) => ({ ...p, index }))}
        />
      )}
    </div>
  );
}
