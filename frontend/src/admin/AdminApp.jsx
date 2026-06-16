import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { adminFetch } from '../api';
import AdminLayout from './AdminLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import MenuAdmin from './MenuAdmin';
import GalleryAdmin from './GalleryAdmin';
import ContentAdmin from './ContentAdmin';
import ContactAdmin from './ContactAdmin';
import LanguageAdmin from './LanguageAdmin';
import '../admin.css';

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('menata-admin-token');
    if (!token) {
      setReady(true);
      return;
    }
    adminFetch('/me')
      .then(() => setAuthed(true))
      .catch(() => localStorage.removeItem('menata-admin-token'))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="admin-loading">Loading admin panel…</div>;
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="login" element={<Login onLogin={() => setAuthed(true)} />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={() => setAuthed(false)} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<MenuAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="contact" element={<ContactAdmin />} />
        <Route path="settings" element={<LanguageAdmin />} />
        <Route path="language" element={<Navigate to="/admin/settings" replace />} />
      </Route>
      <Route path="login" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
