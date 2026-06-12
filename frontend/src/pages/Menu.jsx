import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { apiGet } from '../api';
import { ui } from '../translations';
import ContactButtons from '../components/ContactButtons';
import { mediaUrl } from '../media';

function formatPrice(price) {
  return `${price % 1 === 0 ? price : price.toFixed(2).replace(/0$/, '')} €`;
}

export default function Menu() {
  const { lang } = useLang();
  const settings = useSettings();
  const t = ui[lang].menu;
  const [categories, setCategories] = useState(null);
  const [type, setType] = useState('food');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    apiGet('/api/menu', lang)
      .then((data) => {
        setCategories(data);
        setActiveId(data.find((c) => c.type === 'food')?.id ?? null);
      })
      .catch(() => setCategories([]));
  }, [lang]);

  const visible = useMemo(() => categories?.filter((c) => c.type === type) ?? [], [categories, type]);
  const active = visible.find((c) => c.id === activeId) ?? visible[0];

  function switchType(next) {
    setType(next);
    setActiveId(categories?.find((c) => c.type === next)?.id ?? null);
  }

  if (!categories) {
    return <div className="page-loading">{t.loading}</div>;
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <div className="menu-sticky">
        <div className="menu-type" role="tablist">
          <button role="tab" aria-selected={type === 'food'} className={type === 'food' ? 'active' : ''} onClick={() => switchType('food')}>
            {t.food}
          </button>
          <button role="tab" aria-selected={type === 'drinks'} className={type === 'drinks' ? 'active' : ''} onClick={() => switchType('drinks')}>
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
          <li key={item.id} className="menu-item">
            {item.image && <img src={mediaUrl(item.image)} alt={item.name} loading="lazy" decoding="async" />}
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

      <section className="reserve-strip">
        <h2>{t.foundTitle}</h2>
        <p>{t.foundText}</p>
        <ContactButtons actions={['call', 'whatsapp']} />
      </section>
    </div>
  );
}
