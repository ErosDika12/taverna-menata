import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Beer,
  BookOpen,
  Coffee,
  CupSoda,
  GlassWater,
  Grape,
  Martini,
  Percent,
  Salad,
  Soup,
  UtensilsCrossed,
  Wine
} from 'lucide-react';
import { useLang } from '../i18n';
import { apiGet } from '../api';
import { ui } from '../translations';
import ItemPreviewModal from '../components/ItemPreviewModal';
import { mediaUrl } from '../media';

const FOOD_ORDER = [
  { keys: ['oferte ditore', 'ofertat ditore', 'daily offers', 'daily specials'], icon: Percent },
  { keys: ['meny ditore', 'daily menu'], icon: BookOpen },
  { keys: ['sallata', 'sallatat', 'salads'], icon: Salad },
  { keys: ['pjata kryesore', 'main dishes'], icon: Soup },
  { keys: ['pjata shtese', 'side dishes'], icon: Coffee }
];

const DRINK_ORDER = [
  { keys: ['birrat', 'beers'], icon: Beer },
  { keys: ['verera', 'wines'], icon: Wine },
  { keys: ['koktella', 'koktelet', 'cocktails'], icon: Martini },
  { keys: ['shots'], icon: GlassWater },
  { keys: ['raki'], icon: CupSoda },
  { keys: ['whiskey'], icon: GlassWater },
  { keys: ['vodka'], icon: GlassWater },
  { keys: ['gin'], icon: GlassWater },
  { keys: ['rum'], icon: GlassWater },
  { keys: ['tequila'], icon: GlassWater },
  { keys: ['likere', 'liker', 'liqueurs'], icon: Grape },
  { keys: ['cognac'], icon: Wine },
  { keys: ['shampanje', 'champagne'], icon: CupSoda }
];

function categoryKey(name = '') {
  return String(name)
    .normalize('NFC')
    .replace(/ë/g, 'e')
    .replace(/Ë/g, 'E')
    .toLowerCase()
    .trim();
}

function matchOrderEntry(name, orderList) {
  const key = categoryKey(name);
  return orderList.findIndex((entry) => entry.keys.some((k) => key === k || key.includes(k)));
}

function sortByOrder(list, orderList) {
  return [...list].sort((a, b) => {
    const ra = matchOrderEntry(a.name, orderList);
    const rb = matchOrderEntry(b.name, orderList);
    const ia = ra >= 0 ? ra : 999;
    const ib = rb >= 0 ? rb : 999;
    if (ia !== ib) return ia - ib;
    return (a.sort ?? 0) - (b.sort ?? 0);
  });
}

function iconForCategory(name, type) {
  const order = type === 'food' ? FOOD_ORDER : DRINK_ORDER;
  const idx = matchOrderEntry(name, order);
  if (idx >= 0) return order[idx].icon;
  return type === 'food' ? UtensilsCrossed : Wine;
}

function isDailyOffersCategory(name = '') {
  return /ofert/i.test(name) || /daily\s*(specials?|offers?)/i.test(name);
}

function CategoryCard({ label, Icon, onClick }) {
  return (
    <button type="button" className="menu-cat-card" onClick={onClick}>
      <span className="menu-cat-card-icon" aria-hidden="true">
        <Icon size={28} strokeWidth={1.75} />
      </span>
      <span className="menu-cat-card-label">{label}</span>
    </button>
  );
}

function ProductCard({ item, onOpen }) {
  return (
    <button type="button" className="menu-product-card" onClick={() => onOpen(item)} aria-label={item.name}>
      <span className="menu-product-media">
        {item.image ? (
          <img src={mediaUrl(item.image)} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="menu-product-placeholder" aria-hidden="true" />
        )}
      </span>
      <span className="menu-product-name">{item.name}</span>
    </button>
  );
}

export default function Menu() {
  const { lang } = useLang();
  const t = ui[lang].menu;
  const [categories, setCategories] = useState(null);
  const [view, setView] = useState('root'); // root | categories | items
  const [type, setType] = useState(null); // food | drinks
  const [activeId, setActiveId] = useState(null);
  const [preview, setPreview] = useState({ items: [], index: 0, categoryName: '' });

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [lang]);

  const foodCategories = useMemo(() => {
    if (!categories) return [];
    return sortByOrder(
      categories.filter((c) => c.type === 'food'),
      FOOD_ORDER
    );
  }, [categories]);

  const drinkCategories = useMemo(() => {
    if (!categories) return [];
    return sortByOrder(
      categories.filter((c) => c.type === 'drinks'),
      DRINK_ORDER
    );
  }, [categories]);

  const visibleCategories = type === 'food' ? foodCategories : type === 'drinks' ? drinkCategories : [];
  const active = visibleCategories.find((c) => c.id === activeId) ?? null;

  function categoryLabel(c) {
    if (!c) return '';
    if (isDailyOffersCategory(c.name)) return t.dailyOffers;
    return c.name;
  }

  function openType(next) {
    setType(next);
    setActiveId(null);
    setView('categories');
  }

  function openCategory(cat) {
    setActiveId(cat.id);
    setView('items');
  }

  function goBack() {
    if (view === 'items') {
      setActiveId(null);
      setView('categories');
      return;
    }
    if (view === 'categories') {
      setType(null);
      setView('root');
    }
  }

  function backLabel() {
    if (view === 'items') {
      return type === 'drinks' ? t.backToDrinks : t.backToFood;
    }
    return t.backToMenu;
  }

  function openPreview(item, list, categoryName) {
    const index = list.findIndex((i) => i.id === item.id);
    const cleaned = list.map((i) => ({
      ...i,
      price: null,
      description: null
    }));
    setPreview({
      items: cleaned,
      index: index >= 0 ? index : 0,
      categoryName
    });
  }

  if (!categories) {
    return <div className="page-loading">{t.loading}</div>;
  }

  return (
    <div className="page menu-browse">
      <header className="page-head">
        <h1>{t.title}</h1>
      </header>

      {view !== 'root' && (
        <button type="button" className="menu-back-btn" onClick={goBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          {backLabel()}
        </button>
      )}

      {view === 'root' && (
        <section className="menu-root" aria-label={t.title}>
          <button type="button" className="menu-root-card" onClick={() => openType('food')}>
            <span className="menu-root-icon" aria-hidden="true">
              <UtensilsCrossed size={40} strokeWidth={1.6} />
            </span>
            <span className="menu-root-label">{t.food}</span>
          </button>
          <button type="button" className="menu-root-card" onClick={() => openType('drinks')}>
            <span className="menu-root-icon" aria-hidden="true">
              <Wine size={40} strokeWidth={1.6} />
            </span>
            <span className="menu-root-label">{t.drinks}</span>
          </button>
        </section>
      )}

      {view === 'categories' && (
        <section className="menu-cat-grid" aria-label={type === 'food' ? t.food : t.drinks}>
          {visibleCategories.map((c) => {
            const Icon = iconForCategory(c.name, type);
            return (
              <CategoryCard
                key={c.id}
                label={categoryLabel(c)}
                Icon={Icon}
                onClick={() => openCategory(c)}
              />
            );
          })}
        </section>
      )}

      {view === 'items' && active && (
        <section id="menu" className="menu-products-section" aria-label={categoryLabel(active)}>
          <h2 className="menu-products-title">{categoryLabel(active)}</h2>
          {isDailyOffersCategory(active.name) && <p className="menu-note">{t.dailyNote}</p>}
          {active.note && !isDailyOffersCategory(active.name) && <p className="menu-note">{active.note}</p>}

          {active.items.length === 0 ? (
            <p className="menu-note">{t.loading}</p>
          ) : (
            <div className="menu-product-grid">
              {active.items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onOpen={() => openPreview(item, active.items, categoryLabel(active))}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {preview.items.length > 0 && (
        <ItemPreviewModal
          items={preview.items}
          index={preview.index}
          categoryName={preview.categoryName}
          hidePrice
          onClose={() => setPreview({ items: [], index: 0, categoryName: '' })}
          onChange={(index) => setPreview((p) => ({ ...p, index }))}
        />
      )}
    </div>
  );
}
