import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';

export default function MobileActionBar() {
  const settings = useSettings();
  const { lang } = useLang();
  const labels = ui[lang].mobileBar;
  const phone = settings.phone?.replace(/\s/g, '');

  const actions = [
    { href: `tel:${phone}`, label: labels.call, icon: Phone, className: 'action-call' },
    { href: `https://wa.me/${settings.whatsapp}`, label: labels.whatsapp, icon: MessageCircle, className: 'action-wa' },
    { href: settings.maps_url, label: labels.directions, icon: MapPin, className: 'action-map' }
  ];

  return (
    <div className="mobile-action-bar" role="group" aria-label={labels.aria}>
      {actions.map(({ href, label, icon: Icon, className }) => (
        <a
          key={label}
          className={`mobile-action-btn ${className}`}
          href={href}
          target={href.startsWith('tel:') ? undefined : '_blank'}
          rel={href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
        >
          <Icon size={22} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}
