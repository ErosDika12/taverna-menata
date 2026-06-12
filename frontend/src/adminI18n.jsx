import { createContext, useContext, useEffect, useState } from 'react';
import { adminUi } from './adminTranslations';

const STORAGE_KEY = 'menata-admin-lang';

const AdminLanguageContext = createContext(null);

export function AdminLanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => (localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'sq'));

  function setLang(next) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'sq';
  }, [lang]);

  const t = adminUi[lang];
  return <AdminLanguageContext.Provider value={{ lang, setLang, t }}>{children}</AdminLanguageContext.Provider>;
}

export function useAdminLang() {
  return useContext(AdminLanguageContext);
}
