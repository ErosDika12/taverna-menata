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

function isDailyCategoryName(name = '') {
  return /ditore|daily/i.test(name);
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
        const regularFood = data.filter((c) => c.type === 'food' && !isDailyCategoryName(c.name));
        setActiveId(regularFood[0]?.id ?? data.find((c) => c.type === 'food')?.id ?? null);
      })
      .catch(() => setCategories([]));
  }, [lang]);

  const dailyCategory = useMemo(
    () => categories?.find((c) => c.type === 'food' && isDailyCategoryName(c.name)),
    [categories]
  );
  const foodCategories = useMemo(
    () => categories?.filter((c) => c.type === 'food' && !isDailyCategoryName(c.name)) ?? [],
    [categories]
  );
  const drinkCategories = useMemo(() => categories?.filter((c) => c.type === 'drinks') ?? [], [categories]);
  const visible = type === 'food' ? foodCategories : drinkCategories;
  const active = visible.find((c) => c.id === activeId) ?? visible[0];

  function switchType(next) {
    setType(next);
    setActiveId((next === 'food' ? foodCategories : drinkCategories)[0]?.id ?? null);
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

      {dailyCategory && (
        <section id="menu-ditore" className="menu-section menu-section-daily">
          <header className="menu-section-head">
            <h2>{t.dailyTitle}</h2>
          </header>
          <ul className="menu-list">
            {dailyCategory.items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onOpen={() => openPreview(item, dailyCategory.items, dailyCategory.name)}
              />
            ))}
          </ul>
        </section>
      )}

      <section id="menu" className="menu-section">
        <header className="menu-section-head">
          <h2>{t.regularTitle}</h2>
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
            <MenuItemRow key={item.id} item={item} onOpen={() => openPreview(item, active.items, active.name)} />
          ))}
        </ul>
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
