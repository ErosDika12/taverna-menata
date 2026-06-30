import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { adminFetch } from '../api';

const SECTION_LABELS = {
  menu: 'Menu',
  gallery: 'Gallery',
  text: 'Text / Content',
  contact: 'Contact',
  settings: 'Settings'
};

function formatNotification(n) {
  if (n.message?.trim()) return n.message;

  const who = n.actor_email || n.actor_name || 'Website Editor';
  const section = SECTION_LABELS[n.section] || n.section || 'Content';
  const what = n.details ? String(n.details).replace(/^'|'$/g, '') : n.action || 'updated';
  const when = n.created_at
    ? new Date(n.created_at).toLocaleString('sq-AL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return `${who} · ${section} · ${what}${when ? ` · ${when}` : ''}`;
}

export default function AdminNotifications({ variant = 'default' }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const data = await adminFetch('/notifications');
    setItems(data);
    setError('');
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
    const interval = setInterval(() => load().catch(() => {}), 60000);
    return () => clearInterval(interval);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function markAllRead() {
    await adminFetch('/notifications/read-all', { method: 'PUT' });
    await load();
  }

  return (
    <div className={`admin-notifications ${variant === 'sidebar' ? 'admin-notifications-sidebar' : ''}`}>
      <button
        type="button"
        className="admin-notif-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open && unread) markAllRead();
        }}
      >
        <Bell size={20} />
        {unread > 0 && <span className="admin-notif-badge">{unread}</span>}
        {variant === 'sidebar' && <span className="admin-notif-label">Notifications</span>}
      </button>

      {open && (
        <div className="admin-notif-panel">
          <div className="admin-notif-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {error && <p className="admin-notif-error">{error}</p>}
          <ul>
            {items.length === 0 ? (
              <li className="admin-notif-empty">No notifications yet.</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className={n.read ? '' : 'unread'}>
                  <span className="admin-notif-message">{formatNotification(n)}</span>
                  <small>{new Date(n.created_at).toLocaleString()}</small>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
