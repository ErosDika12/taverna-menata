import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Images,
  FileText,
  Phone,
  Settings,
  LogOut,
  Users
} from 'lucide-react';
import { adminFetch } from '../api';
import AdminNotifications from './AdminNotifications';
import logo from '../assets/logo.png';

const baseLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/content', label: 'Text', icon: FileText },
  { to: '/admin/contact', label: 'Contact', icon: Phone },
  { to: '/admin/settings', label: 'Settings', icon: Settings, mainOnly: true }
];

const adminLink = { to: '/admin/admins', label: 'Admins', icon: Users, mainOnly: true };

export default function AdminLayout({ admin, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMain = admin?.role === 'main';

  const links = isMain
    ? [...baseLinks.slice(0, 5), adminLink, baseLinks[5]]
    : baseLinks.filter((l) => !l.mainOnly);

  async function logout() {
    try {
      await adminFetch('/logout', { method: 'POST' });
    } catch {
      /* session may already be gone */
    }
    localStorage.removeItem('menata-admin-token');
    localStorage.removeItem('menata-admin-user');
    onLogout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar admin-sidebar-desktop">
        <div className="admin-brand">
          <img src={logo} alt="" width="42" />
          <div>
            <span>Menata Admin</span>
            <small>{isMain ? 'Main Admin' : 'Website Editor'}</small>
          </div>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-logout" onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
          Logout
        </button>
      </aside>

      <div className="admin-body">
        <header className="admin-topbar">
          <div className="admin-brand admin-brand-mobile">
            <img src={logo} alt="" width="36" />
            <span>Menata Admin</span>
          </div>
          <div className="admin-topbar-actions">
            {isMain && <AdminNotifications />}
            <button type="button" className="admin-logout admin-logout-mobile" onClick={logout}>
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>

        <nav className="admin-mobile-nav" aria-label="Admin navigation">
          {links.map(({ to, label, icon: Icon, end }) => {
            const active = end ? pathname === to : pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} end={end} className={active ? 'active' : undefined}>
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
