import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ChefHat, Leaf, Users, Phone } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { apiGet } from '../api';
import { ui } from '../translations';
import HomeSectionNav from '../components/HomeSectionNav';
import ItemPreviewModal from '../components/ItemPreviewModal';
import { mediaUrl } from '../media';

const highlightIcons = [ChefHat, Leaf, Users, Phone];

function formatPrice(price) {
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

function isDailyCategoryName(name = '') {
  return /ditore|daily/i.test(name);
}

const PREVIEW_MENU_ITEMS = 6;
const PREVIEW_GALLERY_PHOTOS = 8;

export default function Home() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].home;
  const tg = ui[lang].gallery;
  const tm = ui[lang].menu;
  const b = ui[lang].buttons;

  const [menuCategories, setMenuCategories] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [preview, setPreview] = useState({ items: [], index: 0, categoryName: '' });

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then(setMenuCategories)
      .catch(() => setMenuCategories([]));
    apiGet('/api/gallery', lang)
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, [lang]);

  const dailyCategory = useMemo(
    () => menuCategories?.find((c) => c.type === 'food' && isDailyCategoryName(c.name)),
    [menuCategories]
  );

  const regularMenuPreview = useMemo(() => {
    if (!menuCategories?.length) return [];
    const food = menuCategories.filter((c) => c.type === 'food' && !isDailyCategoryName(c.name));
    const pool = food.flatMap((c) => c.items.map((item) => ({ ...item, categoryName: c.name })));
    return pool.slice(0, PREVIEW_MENU_ITEMS);
  }, [menuCategories]);

  const dailyPreview = useMemo(() => (dailyCategory?.items || []).slice(0, PREVIEW_MENU_ITEMS), [dailyCategory]);
  const galleryPreview = useMemo(() => (photos || []).slice(0, PREVIEW_GALLERY_PHOTOS), [photos]);

  function openMenuPreview(item, list, categoryName) {
    const index = list.findIndex((i) => i.id === item.id);
    setPreview({ items: list, index: index >= 0 ? index : 0, categoryName });
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
    setPreview({ items, index: index >= 0 ? index : 0, categoryName: tg.title });
  }

  return (
    <div className="home-scroll">
      <HomeSectionNav hasDailyMenu={!!dailyCategory?.items?.length} />

      <section id="ballina" className="home-section hero">
        <img className="hero-bg" src={mediaUrl(settings.hero_image)} alt="" fetchPriority="high" decoding="async" />
        <div className="hero-content">
          <h1>{settings.site_name}</h1>
          <p className="hero-tagline">{settings.tagline}</p>
          <p className="hero-text">{settings.home_intro}</p>
        </div>
      </section>

      <section id="rreth-nesh" className="home-section section home-about">
        <h2>{t.aboutTitle}</h2>
        <div className="home-about-grid">
          <div className="home-about-text">
            {settings.about_text?.split('\n\n').slice(0, 2).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            <blockquote className="about-quote">{settings.tagline}</blockquote>
            <Link to="/about" className="btn btn-outline">
              {b.ourStory}
            </Link>
          </div>
          <img src="/uploads/gallery/thumbs/dsc09465.jpg" alt="Taverna Menata" loading="lazy" decoding="async" />
        </div>
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
      </section>

      {dailyCategory && (
        <section id="menu-ditore" className="home-section section home-menu menu-section-daily">
          <div className="home-section-head">
            <h2>{tm.dailyTitle}</h2>
            <p className="menu-section-sub menu-subtitle-desktop">{tm.dailySubtitle}</p>
          </div>
          {dailyCategory.note && <p className="menu-note">{dailyCategory.note}</p>}
          {dailyPreview.length > 0 ? (
            <ul className="menu-list home-menu-list">
              {dailyPreview.map((item) => (
                <li key={item.id} className="menu-item">
                  <button
                    type="button"
                    className="menu-item-thumb"
                    onClick={() => openMenuPreview(item, dailyCategory.items, dailyCategory.name)}
                    aria-label={item.name}
                  >
                    {item.image ? (
                      <img src={mediaUrl(item.image)} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <span className="menu-item-no-img" />
                    )}
                  </button>
                  <div className="menu-item-body">
                    <div className="menu-item-row">
                      <h3>{item.name}</h3>
                      <span className="menu-item-price">{formatPrice(item.price)}</span>
                    </div>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-loading">{tm.loading}</p>
          )}
        </section>
      )}

      <section id="menu" className="home-section section home-menu">
        <div className="home-section-head">
          <h2>{tm.regularTitle}</h2>
          <p className="menu-subtitle-desktop">{tm.subtitle}</p>
          <p className="menu-subtitle-desktop menu-price-euro-note">{tm.priceEuroNote}</p>
        </div>
        {menuCategories === null ? (
          <p className="home-loading">{tm.loading}</p>
        ) : regularMenuPreview.length === 0 ? (
          <p className="home-loading">{tm.loading}</p>
        ) : (
          <ul className="menu-list home-menu-list">
            {regularMenuPreview.map((item) => (
              <li key={item.id} className="menu-item">
                <button
                  type="button"
                  className="menu-item-thumb"
                  onClick={() => openMenuPreview(item, regularMenuPreview, item.categoryName)}
                  aria-label={item.name}
                >
                  {item.image ? (
                    <img src={mediaUrl(item.image)} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="menu-item-no-img" />
                  )}
                </button>
                <div className="menu-item-body">
                  <div className="menu-item-row">
                    <h3>{item.name}</h3>
                    <span className="menu-item-price">{formatPrice(item.price)}</span>
                  </div>
                  {item.description && <p>{item.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link to="/menu" className="btn btn-primary home-section-link">
          {b.menu}
        </Link>
      </section>

      <section id="galeria" className="home-section section home-gallery">
        <div className="home-section-head">
          <h2>{tg.title}</h2>
          <p>{tg.subtitle}</p>
        </div>
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
        <Link to="/gallery" className="btn btn-outline home-section-link">
          {tg.title}
        </Link>
      </section>

      {preview.items.length > 0 && (
        <ItemPreviewModal
          items={preview.items}
          index={preview.index}
          categoryName={preview.categoryName}
          onClose={() => setPreview({ items: [], index: 0, categoryName: '' })}
          onChange={(index) => setPreview((p) => ({ ...p, index }))}
        />
      )}
    </div>
  );
}
