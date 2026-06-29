import { Phone } from 'lucide-react';
import { useLang } from '../i18n';
import { useSettings } from '../settings';
import { ui } from '../translations';

export default function MobileActionBar() {
  const settings = useSettings();
  const { lang } = useLang();
  const labels = ui[lang].mobileBar;
  const phone = settings.phone?.replace(/\s/g, '');

  return (
    <div className="mobile-action-bar mobile-action-bar-single" role="group" aria-label={labels.aria}>
      <a className="mobile-action-btn action-call" href={`tel:${phone}`}>
        <Phone size={22} aria-hidden="true" />
        <span>{labels.call}</span>
      </a>
    </div>
  );
}
