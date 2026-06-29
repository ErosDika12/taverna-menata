import { useEffect, useMemo, useState } from 'react';
import { Phone } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { apiGet } from '../api';
import { ui } from '../translations';
import ItemPreviewModal from '../components/ItemPreviewModal';
import { mediaUrl } from '../media';

function formatPrice(price) {
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

function MenuItemRow({ item, onOpen }) {
  return (
    <li className="menu-item">
      <button type="button" className="menu-item-thumb" onClick={() => onOpen(item)} aria-label={item.name}>
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
  );
}

export default function Menu() {
  const { lang } = useLang();
  const settings = useSettings();
  const t = ui[lang].menu;
  const [categories, setCategories] = useState(null);
  const [type, setType] = useState('food');
  const [activeId, setActiveId] = useState(null);
  const [preview, setPreview] = useState({ items: [], index: 0, categoryName: '' });

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then((data) => {
        setCategories(data);
        setActiveId(data.find((c) => c.type === 'food')?.id ?? null);
      })
      .catch(() => setCategories([]));
  }, [lang]);

  const foodCategories = useMemo(() => categories?.filter((c) => c.type === 'food') ?? [], [categories]);
  const drinkCategories = useMemo(() => categories?.filter((c) => c.type === 'drinks') ?? [], [categories]);
  const visible = type === 'food' ? foodCategories : drinkCategories;
  const active = visible.find((c) => c.id === activeId) ?? visible[0];

  function switchType(next) {
    setType(next);
    if (next === 'food') {
      setActiveId(foodCategories[0]?.id ?? null);
    } else {
      setActiveId(drinkCategories[0]?.id ?? null);
    }
  }

  function openPreview(item) {
    const index = active.items.findIndex((i) => i.id === item.id);
    setPreview({
      items: active.items,
      index: index >= 0 ? index : 0,
      categoryName: active.name
    });
  }

  if (!categories) {
    return <div className="page-loading">{t.loading}</div>;
  }

  const phone = settings.phone?.replace(/\s/g, '');

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p className="menu-subtitle-desktop">{t.subtitle}</p>
      </header>

      <div className="menu-sticky">
        <div className="menu-type" role="tablist">
          <button
            role="tab"
            aria-selected={type === 'food'}
            className={type === 'food' ? 'active' : ''}
            onClick={() => switchType('food')}
          >
            {t.food}
          </button>
          <button
            role="tab"
            aria-selected={type === 'drinks'}
            className={type === 'drinks' ? 'active' : ''}
            onClick={() => switchType('drinks')}
          >
            {t.drinks}
          </button>
        </div>

        <div className="chips" role="tablist">
          {visible.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === active?.id}
              className={c.id === active?.id ? 'active' : ''}
              onClick={() => setActiveId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {type === 'drinks' && settings.drinks_note && <p className="menu-note">{settings.drinks_note}</p>}
      {active?.note && <p className="menu-note">{active.note}</p>}

      <ul className="menu-list">
        {active?.items.map((item) => (
          <MenuItemRow key={item.id} item={item} onOpen={openPreview} />
        ))}
      </ul>

      <section className="reserve-strip">
        <h2>{t.foundTitle}</h2>
        <p>{t.foundText}</p>
        <a className="btn btn-primary reserve-phone-btn" href={`tel:${phone}`}>
          <Phone size={20} aria-hidden="true" />
          {t.reserveNow}
        </a>
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
