import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'menata-lang';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'sq';
  });

  function setLang(next) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'en' ? 'en' : 'sq';
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'sq';
  }, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
