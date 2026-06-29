import { Phone, Instagram, Facebook, MapPin, Clock, Star, Navigation } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';

export default function Contact() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].contact;
  const b = ui[lang].buttons;
  const phone = settings.phone?.replace(/\s/g, '');
  const reviewUrl = settings.review_url || settings.maps_url;

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section id="contact" className="contact-block">
        <h2>{t.callTitle}</h2>
        <p>{t.callText}</p>
        <a className="btn btn-primary contact-call-btn" href={`tel:${phone}`}>
          <Phone size={20} aria-hidden="true" />
          {b.call}
        </a>
        <div className="contact-social">
          <a className="btn btn-outline" href={settings.instagram} target="_blank" rel="noopener noreferrer">
            <Instagram size={20} aria-hidden="true" />
            {b.instagram}
          </a>
          <a className="btn btn-outline" href={settings.facebook} target="_blank" rel="noopener noreferrer">
            <Facebook size={20} aria-hidden="true" />
            {b.facebook}
          </a>
        </div>
      </section>

      <section id="directions" className="contact-block">
        <h2>{t.directionsTitle}</h2>
        <div className="contact-info-row">
          <MapPin size={22} aria-hidden="true" />
          <div>
            <strong>{t.address}</strong>
            <p>{settings.address}</p>
            <a className="btn btn-outline" href={settings.maps_url} target="_blank" rel="noopener noreferrer">
              <Navigation size={18} aria-hidden="true" />
              {b.directions}
            </a>
          </div>
        </div>
        <div className="contact-info-row">
          <Clock size={22} aria-hidden="true" />
          <div>
            <strong>{t.hours}</strong>
            <p>{settings.hours}</p>
          </div>
        </div>
        <div className="contact-map">
          <iframe
            title={t.mapTitle}
            src="https://maps.google.com/maps?q=Taverna+Menata+Prishtina&z=16&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <section id="review" className="contact-block">
        <h2>{t.reviewTitle}</h2>
        <p>{t.reviewText}</p>
        <a className="btn btn-outline" href={reviewUrl} target="_blank" rel="noopener noreferrer">
          <Star size={20} aria-hidden="true" />
          {t.reviewButton}
        </a>
      </section>
    </div>
  );
}
