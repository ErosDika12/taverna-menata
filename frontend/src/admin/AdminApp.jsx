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
import AdminsAdmin from './AdminsAdmin';
import '../admin.css';

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('menata-admin-token');
    if (!token) {
      setReady(true);
      return;
    }
    adminFetch('/me')
      .then((data) => {
        setAuthed(true);
        setAdmin(data.admin);
        if (data.admin) localStorage.setItem('menata-admin-user', JSON.stringify(data.admin));
      })
      .catch(() => {
        localStorage.removeItem('menata-admin-token');
        localStorage.removeItem('menata-admin-user');
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="admin-loading">Loading admin panel…</div>;
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="login" element={<Login onLogin={(a) => { setAuthed(true); setAdmin(a); }} />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout admin={admin} onLogout={() => { setAuthed(false); setAdmin(null); }} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard admin={admin} />} />
        <Route path="menu" element={<MenuAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="contact" element={<ContactAdmin />} />
        <Route
          path="settings"
          element={admin?.role === 'main_admin' ? <LanguageAdmin admin={admin} /> : <Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="admins"
          element={admin?.role === 'main_admin' ? <AdminsAdmin /> : <Navigate to="/admin/dashboard" replace />}
        />
        <Route path="language" element={<Navigate to="/admin/settings" replace />} />
      </Route>
      <Route path="login" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
