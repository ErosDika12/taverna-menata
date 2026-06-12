import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';
import logo from '../assets/logo.png';

export default function About() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].about;
  const b = ui[lang].buttons;

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
      </header>

      <div className="about">
        <img className="about-logo" src={logo} alt="Taverna Menata" />

        {settings.about_text?.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}

        <blockquote className="about-quote">{settings.tagline}</blockquote>

        <div className="about-photos">
          <img src="/uploads/gallery/thumbs/dsc09459.jpg" alt="Taverna Menata" loading="lazy" />
          <img src="/uploads/gallery/thumbs/dsc09411.jpg" alt="Taverna Menata" loading="lazy" />
        </div>

        <div className="about-cta">
          <p>{t.cta}</p>
          <Link to="/contact" className="btn btn-primary">
            {b.contactUs}
          </Link>
        </div>
      </div>
    </div>
  );
}
