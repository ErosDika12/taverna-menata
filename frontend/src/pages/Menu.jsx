import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { apiGet } from '../api';
import { ui } from '../translations';
import ItemPreviewModal from '../components/ItemPreviewModal';
import { mediaUrl } from '../media';

function formatPrice(price) {
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

/** Match backend/ensure-menu-structure.js FOOD_ORDER (offers are a main tab, not listed here). */
const FOOD_ORDER = ['Meny Ditore', 'Sallata', 'Pjata Kryesore', 'Pjata Shtesë'];

const WEEKDAY_OFFERS = [
  { id: 'offer-mon', day_sq: 'E HËNË', day_en: 'Monday', name: 'Pasul në Tavë', price: 4.9 },
  { id: 'offer-tue', day_sq: 'E MARTË', day_en: 'Tuesday', name: 'Tavë me Patate', price: 4.9 },
  { id: 'offer-wed', day_sq: 'E MËRKURË', day_en: 'Wednesday', name: 'Dollma', price: 4.9 },
  { id: 'offer-thu', day_sq: 'E ENJTE', day_en: 'Thursday', name: 'Tavë me Perime', price: 4.9 },
  { id: 'offer-fri', day_sq: 'E PREMTE', day_en: 'Friday', name: 'Sarma me fleta rrushi', price: 4.9 },
  { id: 'offer-sat', day_sq: 'E SHTUNË', day_en: 'Saturday', name: 'Tavë me oriz', price: 4.9 }
];

function categoryKey(name = '') {
  return String(name)
    .normalize('NFC')
    .replace(/ë/g, 'e')
    .replace(/Ë/g, 'E')
    .toLowerCase()
    .trim();
}

const FOOD_RANK = new Map(FOOD_ORDER.map((n, i) => [categoryKey(n), i]));

function sortFoodCategories(food) {
  return [...food].sort((a, b) => {
    const ra = FOOD_RANK.has(categoryKey(a.name)) ? FOOD_RANK.get(categoryKey(a.name)) : 999;
    const rb = FOOD_RANK.has(categoryKey(b.name)) ? FOOD_RANK.get(categoryKey(b.name)) : 999;
    if (ra !== rb) return ra - rb;
    return (a.sort ?? 0) - (b.sort ?? 0);
  });
}

function isDailyOffersCategory(name = '') {
  return /ofert/i.test(name) || /daily\s*(specials?|offers?)/i.test(name);
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

function CategorySections({ categories, categoryLabel, onOpen }) {
  return categories.map((c) => (
    <section key={c.id} id={`menu-cat-${c.id}`} className="menu-section">
      <h2 className="menu-category-title">{categoryLabel(c)}</h2>
      {c.note && <p className="menu-note">{c.note}</p>}
      <ul className="menu-list">
        {c.items.map((item) => (
          <MenuItemRow
            key={item.id}
            item={item}
            onOpen={() => onOpen(item, c.items, categoryLabel(c))}
          />
        ))}
      </ul>
    </section>
  ));
}

export default function Menu() {
  const { lang } = useLang();
  const settings = useSettings();
  const t = ui[lang].menu;
  const [categories, setCategories] = useState(null);
  const [type, setType] = useState('food');
  const [preview, setPreview] = useState({ items: [], index: 0, categoryName: '' });

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [lang]);

  const foodCategories = useMemo(() => {
    if (!categories) return [];
    return sortFoodCategories(
      categories.filter((c) => c.type === 'food' && !isDailyOffersCategory(c.name))
    );
  }, [categories]);

  const drinkCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories.filter((c) => c.type === 'drinks')].sort(
      (a, b) => (a.sort ?? 0) - (b.sort ?? 0)
    );
  }, [categories]);

  const visible = useMemo(() => {
    const list = type === 'food' ? foodCategories : type === 'drinks' ? drinkCategories : [];
    return list.filter((c) => (c.items?.length ?? 0) > 0);
  }, [type, foodCategories, drinkCategories]);

  const offerItems = useMemo(
    () =>
      WEEKDAY_OFFERS.map((o) => ({
        id: o.id,
        name: o.name,
        price: o.price,
        image: null,
        description: null
      })),
    []
  );

  function categoryLabel(c) {
    return c.name;
  }

  function openPreview(item, list, categoryName) {
    const index = list.findIndex((i) => i.id === item.id);
    setPreview({
      items: list,
      index: index >= 0 ? index : 0,
      categoryName
    });
  }

  if (!categories) {
    return <div className="page-loading">{t.loading}</div>;
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
      </header>

      <div className="menu-sticky">
        <div className="menu-type menu-three" role="tablist">
          <button
            role="tab"
            aria-selected={type === 'food'}
            className={type === 'food' ? 'active' : ''}
            onClick={() => setType('food')}
          >
            {t.food}
          </button>
          <button
            role="tab"
            aria-selected={type === 'drinks'}
            className={type === 'drinks' ? 'active' : ''}
            onClick={() => setType('drinks')}
          >
            {t.drinks}
          </button>
          <button
            role="tab"
            aria-selected={type === 'offers'}
            className={type === 'offers' ? 'active' : ''}
            onClick={() => setType('offers')}
          >
            {t.offers}
          </button>
        </div>
      </div>

      {type === 'drinks' && settings.drinks_note && <p className="menu-note">{settings.drinks_note}</p>}

      {type === 'offers' && <p className="menu-note">{t.offersServedUntil}</p>}

      {type === 'offers'
        ? WEEKDAY_OFFERS.map((offer) => {
            const day = lang === 'en' ? offer.day_en : offer.day_sq;
            const item = offerItems.find((i) => i.id === offer.id);
            return (
              <section key={offer.id} className="menu-section">
                <h2 className="menu-category-title">{day}</h2>
                <ul className="menu-list">
                  <MenuItemRow
                    item={item}
                    onOpen={() => openPreview(item, offerItems, day)}
                  />
                </ul>
              </section>
            );
          })
        : (
            <CategorySections
              categories={visible}
              categoryLabel={categoryLabel}
              onOpen={openPreview}
            />
          )}

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
