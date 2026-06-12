import { Phone, MessageCircle, Instagram, Facebook, MapPin, Clock, Navigation } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';

export default function Contact() {
  const settings = useSettings();
  const { lang } = useLang();
  const t = ui[lang].contact;
  const b = ui[lang].buttons;

  const channels = [
    { icon: Phone, label: b.call, value: settings.phone, href: `tel:${settings.phone?.replace(/\s/g, '')}` },
    { icon: MessageCircle, label: b.whatsapp, value: settings.phone, href: `https://wa.me/${settings.whatsapp}` },
    { icon: Navigation, label: b.directions, value: settings.address, href: settings.maps_url },
    { icon: Instagram, label: b.instagram, value: '@tavernamenata', href: settings.instagram },
    { icon: Facebook, label: b.facebook, value: 'Taverna Menata', href: settings.facebook }
  ];

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <div className="contact-channels">
        {channels.map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            className="contact-channel"
            href={href}
            {...(href?.startsWith('tel:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            <span className="contact-channel-icon">
              <Icon size={24} aria-hidden="true" />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{value}</small>
            </span>
          </a>
        ))}
      </div>

      <div className="contact-info">
        <div className="contact-info-row">
          <MapPin size={22} aria-hidden="true" />
          <div>
            <strong>{t.address}</strong>
            <p>{settings.address}</p>
            <a className="btn btn-outline" href={settings.maps_url} target="_blank" rel="noopener noreferrer">
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
    </div>
  );
}
