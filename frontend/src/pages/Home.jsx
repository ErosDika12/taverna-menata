import { Link } from 'react-router-dom';
import { BookOpen, ChefHat, Leaf, Users, MessageCircle } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';
import ContactButtons from '../components/ContactButtons';
import { mediaUrl } from '../media';

const icons = [ChefHat, Leaf, Users, MessageCircle];

export default function Home() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].home;
  const b = ui[lang].buttons;

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src={mediaUrl(settings.hero_image)} alt="" fetchPriority="high" decoding="async" />
        <div className="hero-content">
          <h1>{settings.site_name}</h1>
          <p className="hero-tagline">{settings.tagline}</p>
          <p className="hero-text">{settings.home_intro}</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-light">
              <BookOpen size={20} aria-hidden="true" />
              {b.menu}
            </Link>
            <ContactButtons actions={['call', 'whatsapp', 'directions']} />
          </div>
        </div>
      </section>

      <section className="section">
        <h2>{t.whyTitle}</h2>
        <div className="highlights">
          {t.highlights.map(({ title, text }, i) => {
            const Icon = icons[i];
            return (
              <div key={title} className="highlight-card">
                <span className="highlight-icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section home-visit">
        <img src="/uploads/gallery/thumbs/dsc09465.jpg" alt="Taverna Menata" loading="lazy" decoding="async" />
        <div>
          <h2>{t.visitTitle}</h2>
          <p>{t.visitText}</p>
          <Link to="/about" className="btn btn-outline">
            {b.ourStory}
          </Link>
        </div>
      </section>

      <section className="section reserve-strip">
        <h2>{t.reserveTitle}</h2>
        <p>{t.reserveText}</p>
        <ContactButtons />
      </section>
    </>
  );
}
