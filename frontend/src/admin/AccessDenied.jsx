import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="admin-page admin-access-denied">
      <ShieldAlert size={48} aria-hidden="true" />
      <h1>Access denied</h1>
      <p className="admin-lead">You do not have permission to view this section.</p>
      <Link to="/admin/dashboard" className="admin-primary-btn admin-access-back">
        Back to dashboard
      </Link>
    </div>
  );
}
