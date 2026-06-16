import { Link } from 'react-router-dom';
import { UtensilsCrossed, Images, FileText, Phone, Languages } from 'lucide-react';

const cards = [
  { to: '/admin/menu', label: 'Menyja', text: 'Kategoritë, pjatat dhe çmimet', icon: UtensilsCrossed },
  { to: '/admin/gallery', label: 'Galeria', text: 'Foto dhe video', icon: Images },
  { to: '/admin/content', label: 'Teksti i faqes', text: 'Ballina, hero dhe historia', icon: FileText },
  { to: '/admin/contact', label: 'Kontakti', text: 'Telefon, adresa, orari', icon: Phone },
  { to: '/admin/language', label: 'Cilësimet', text: 'Gjuha dhe fjalëkalimi', icon: Languages }
];

export default function Dashboard() {
  return (
    <div className="admin-page">
      <h1>Mirë se vini</h1>
      <p className="admin-lead">Zgjidhni çfarë dëshironi të ndryshoni.</p>
      <div className="admin-cards">
        {cards.map(({ to, label, text, icon: Icon }) => (
          <Link key={to} to={to} className="admin-card">
            <Icon size={32} />
            <strong>{label}</strong>
            <span>{text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
