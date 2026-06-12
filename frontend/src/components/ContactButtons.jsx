import { Phone, MessageCircle, Instagram, Facebook, MapPin } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';

export default function ContactButtons({ actions = ['call', 'whatsapp', 'instagram', 'facebook', 'directions'] }) {
  const settings = useSettings();
  const { lang } = useLang();
  const b = ui[lang].buttons;

  const all = {
    call: { href: `tel:${settings.phone?.replace(/\s/g, '')}`, label: b.call, icon: Phone, className: 'btn-primary' },
    whatsapp: { href: `https://wa.me/${settings.whatsapp}`, label: b.whatsapp, icon: MessageCircle, className: 'btn-whatsapp' },
    instagram: { href: settings.instagram, label: b.instagram, icon: Instagram, className: 'btn-outline' },
    facebook: { href: settings.facebook, label: b.facebook, icon: Facebook, className: 'btn-outline' },
    directions: { href: settings.maps_url, label: b.directions, icon: MapPin, className: 'btn-outline' }
  };

  return (
    <div className="contact-buttons">
      {actions.map((key) => {
        const { href, label, icon: Icon, className } = all[key];
        const external = !href?.startsWith('tel:');
        return (
          <a
            key={key}
            className={`btn ${className}`}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </a>
        );
      })}
    </div>
  );
}
