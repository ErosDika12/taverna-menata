import { useEffect, useState } from 'react';
import { useLang } from '../i18n';
import { ui } from '../translations';

const SECTION_IDS = ['ballina', 'rreth-nesh', 'menu-ditore', 'menu', 'galeria', 'directions', 'review', 'kontakt'];

export default function HomeSectionNav() {
  const { lang } = useLang();
  const labels = ui[lang].homeSections;
  const [active, setActive] = useState('ballina');

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
    }
  }

  const keys = ['ballina', 'about', 'menuDitore', 'menu', 'gallery', 'directions', 'review', 'contact'];

  return (
    <nav className="home-section-nav" aria-label={labels.aria}>
      <div className="home-section-nav-inner">
        {SECTION_IDS.map((id, i) => (
          <button
            key={id}
            type="button"
            className={active === id ? 'active' : ''}
            onClick={() => scrollTo(id)}
          >
            {labels[keys[i]]}
          </button>
        ))}
      </div>
    </nav>
  );
}
