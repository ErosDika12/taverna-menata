import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';
import logo from '../assets/logo.png';

export default function About() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].about;

  return (
    <div className="page page-about">
      <div className="about">
        <h1 className="about-title">{t.title}</h1>

        <img className="about-logo" src={logo} alt="Taverna Menata" />

        <div className="about-text">
          {settings.about_text?.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <blockquote className="about-quote">{settings.tagline}</blockquote>

        <div className="about-cta">
          <p>{t.cta}</p>
        </div>
      </div>
    </div>
  );
}
