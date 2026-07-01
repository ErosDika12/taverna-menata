import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n';
import { ui } from '../translations';

const SECTION_CONFIG = [
  { id: 'ballina', labelKey: 'ballina' },
  { id: 'rreth-nesh', labelKey: 'about' },
  { id: 'menu-ditore', labelKey: 'menuDitore', requiresDaily: true },
  { id: 'menu', labelKey: 'menu' },
  { id: 'galeria', labelKey: 'gallery' }
];

export default function HomeSectionNav({ hasDailyMenu = false }) {
  const { lang } = useLang();
  const labels = ui[lang].homeSections;
  const [active, setActive] = useState('ballina');

  const sections = useMemo(
    () => SECTION_CONFIG.filter((s) => !s.requiresDaily || hasDailyMenu),
    [hasDailyMenu]
  );

  useEffect(() => {
    const elements = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
    }
  }

  return (
    <nav className="home-section-nav" aria-label={labels.aria}>
      <div className="home-section-nav-inner">
        {sections.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={active === id ? 'active' : ''}
            onClick={() => scrollTo(id)}
          >
            {labels[labelKey]}
          </button>
        ))}
      </div>
    </nav>
  );
}
