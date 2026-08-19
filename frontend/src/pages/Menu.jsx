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

/** Match backend/ensure-menu-structure.js FOOD_ORDER */
const FOOD_ORDER = [
  'Oferte Ditore',
  'Meny Ditore',
  'Sallata',
  'Pjata Kryesore',
  'Pjata Shtesë'
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

/** Oferta Ditore / Daily Offers only — not Meny Ditore */
function isDailyOffersCategory(name = '') {
  return /ofert/i.test(name) || /daily\s*(specials?|offers?)/i.test(name);
}

function isDailyMenuCategory(name = '') {
  return /meny\s*ditore/i.test(name) || /menuja\s*ditore/i.test(name) || /daily\s*menu/i.test(name);
}

function isServedUntil17Category(name = '') {
  return isDailyOffersCategory(name) || isDailyMenuCategory(name);
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
  const [preview, setPreview] = useState({ items: [], index: 0, categoryName: '' });

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [lang]);

  const foodCategories = useMemo(() => {
    if (!categories) return [];
    return sortFoodCategories(categories.filter((c) => c.type === 'food'));
  }, [categories]);

  const drinkCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories.filter((c) => c.type === 'drinks')].sort(
      (a, b) => (a.sort ?? 0) - (b.sort ?? 0)
    );
  }, [categories]);

  const visible = useMemo(() => {
    const list = type === 'food' ? foodCategories : drinkCategories;
    return list.filter((c) => (c.items?.length ?? 0) > 0);
  }, [type, foodCategories, drinkCategories]);

  function categoryLabel(c) {
    if (isDailyOffersCategory(c.name)) return t.dailyOffers;
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
        <div className="menu-type" role="tablist">
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
        </div>
      </div>

      {type === 'drinks' && settings.drinks_note && <p className="menu-note">{settings.drinks_note}</p>}

      {visible.map((c) => (
        <section key={c.id} id={`menu-cat-${c.id}`} className="menu-section">
          <h2 className="menu-category-title">{categoryLabel(c)}</h2>
          {isServedUntil17Category(c.name) && <p className="menu-note">{t.servedUntil}</p>}
          {c.note && !isServedUntil17Category(c.name) && <p className="menu-note">{c.note}</p>}
          <ul className="menu-list">
            {c.items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onOpen={() => openPreview(item, c.items, categoryLabel(c))}
              />
            ))}
          </ul>
        </section>
      ))}

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
