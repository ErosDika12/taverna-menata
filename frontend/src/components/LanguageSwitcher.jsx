import { useLang } from '../i18n';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLang();

  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Gjuha / Language">
      <button type="button" className={lang === 'sq' ? 'active' : ''} onClick={() => setLang('sq')}>
        AL
      </button>
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
        EN
      </button>
    </div>
  );
}
