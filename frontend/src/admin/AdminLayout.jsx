import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Images, FileText, Phone, Languages, LogOut } from 'lucide-react';
import { adminFetch } from '../api';
import logo from '../assets/logo.png';

const links = [
  { to: '/admin/dashboard', label: 'Paneli', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menyja', icon: UtensilsCrossed },
  { to: '/admin/gallery', label: 'Galeria', icon: Images },
  { to: '/admin/content', label: 'Teksti', icon: FileText },
  { to: '/admin/contact', label: 'Kontakti', icon: Phone },
  { to: '/admin/language', label: 'Cilësimet', icon: Languages }
];

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await adminFetch('/logout', { method: 'POST' });
    } catch {
      /* session may already be gone */
    }
    localStorage.removeItem('menata-admin-token');
    onLogout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="" width="40" />
          <span>Menata Admin</span>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-logout" onClick={logout}>
          <LogOut size={18} />
          Dil
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
