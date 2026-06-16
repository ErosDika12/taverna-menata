import { Link } from 'react-router-dom';
import { UtensilsCrossed, Images, FileText, Phone, Settings } from 'lucide-react';

const cards = [
  { to: '/admin/menu', label: 'Edit Menu', text: 'Categories, dishes, prices and photos', icon: UtensilsCrossed },
  { to: '/admin/gallery', label: 'Edit Gallery', text: 'Photos, videos and categories', icon: Images },
  { to: '/admin/content', label: 'Edit Website Text', text: 'Hero, homepage and about text', icon: FileText },
  { to: '/admin/contact', label: 'Edit Contact Info', text: 'Phone, address and opening hours', icon: Phone },
  { to: '/admin/settings', label: 'Settings', text: 'Password and language info', icon: Settings }
];

export default function Dashboard() {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Dashboard</h1>
        <p className="admin-lead">Choose what you want to update on the website.</p>
      </div>
      <div className="admin-cards">
        {cards.map(({ to, label, text, icon: Icon }) => (
          <Link key={to} to={to} className="admin-card">
            <span className="admin-card-icon">
              <Icon size={28} aria-hidden="true" />
            </span>
            <strong>{label}</strong>
            <span>{text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
