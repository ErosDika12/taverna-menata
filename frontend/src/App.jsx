import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLang } from './i18n';
import { SettingsContext } from './settings';
import { apiGet } from './api';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminApp from './admin/AdminApp';
import logo from './assets/logo.png';

function PublicApp() {
  const { lang } = useLang();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(null);
    apiGet('/api/settings', lang)
      .then(setSettings)
      .catch(() => setSettings({}));
  }, [lang]);

  if (!settings) {
    return (
      <div className="splash">
        <img src={logo} alt="Taverna Menata" width="96" />
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ ...settings, lang }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </SettingsContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route
          path="/*"
          element={
            <LanguageProvider>
              <PublicApp />
            </LanguageProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
