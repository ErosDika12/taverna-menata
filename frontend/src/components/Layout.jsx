import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Images, Landmark, Phone } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';
import LanguageSwitcher from './LanguageSwitcher';
import MobileActionBar from './MobileActionBar';
import SeoHead from './SeoHead';
import logo from '../assets/logo.png';

const navIcons = [
  { to: '/', key: 'home', icon: Home },
  { to: '/menu', key: 'menu', icon: UtensilsCrossed },
  { to: '/gallery', key: 'gallery', icon: Images },
  { to: '/about', key: 'about', icon: Landmark },
  { to: '/contact', key: 'contact', icon: Phone }
];

export default function Layout() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang];
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.toggle('no-action-bar', pathname === '/contact');
    return () => document.body.classList.remove('no-action-bar');
  }, [pathname]);

  return (
    <>
      <header className="topbar">
        <NavLink to="/" className="topbar-brand">
          <img src={logo} alt="" />
          <span>{settings.site_name}</span>
        </NavLink>
        <nav className="topbar-nav">
          {navIcons.map(({ to, key }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {t.nav[key]}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <LanguageSwitcher />
          <a className="btn btn-primary topbar-call" href={`tel:${settings.phone?.replace(/\s/g, '')}`}>
            <Phone size={18} />
            {t.buttons.call}
          </a>
        </div>
      </header>

      <main>
        <Outlet key={lang} />
      </main>

      <footer className="footer">
        <img src={logo} alt="" width="54" />
        <p className="footer-tagline">{settings.tagline}</p>
        <p>
          {settings.address} · {settings.phone}
        </p>
        <p className="footer-hours">{settings.hours}</p>
      </footer>

      {pathname !== '/contact' && <MobileActionBar />}

      <nav className="bottomnav" aria-label={t.a11y.mainNav}>
        {navIcons.map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="bottomnav-item">
            <span className="bottomnav-icon">
              <Icon size={24} aria-hidden="true" />
            </span>
            <span className="bottomnav-label">{t.nav[key]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
