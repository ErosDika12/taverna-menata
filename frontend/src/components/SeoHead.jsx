import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { pageSeo, SITE_URL } from '../seo';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SeoHead() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const settings = useSettings();
  const seo = pageSeo(lang, pathname);
  const siteName = settings.site_name || (lang === 'en' ? 'Taverna Menata' : 'Taverna Menata');
  const ogImage = settings.hero_image
    ? `${SITE_URL}${settings.hero_image.startsWith('/') ? '' : '/'}${settings.hero_image}`
    : `${SITE_URL}/uploads/gallery/dsc09455.jpg`;

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'sq';
    document.title = seo.title;

    setMeta('description', seo.description);
    setMeta('og:title', seo.title, 'property');
    setMeta('og:description', seo.description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', siteName, 'property');
    setMeta('og:url', `${SITE_URL}${pathname === '/' ? '' : pathname}`, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:locale', lang === 'en' ? 'en_US' : 'sq_AL', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    setMeta('twitter:image', ogImage);
  }, [lang, pathname, seo.title, seo.description, siteName, ogImage]);

  return null;
}
