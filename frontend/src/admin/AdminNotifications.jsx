import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { adminFetch } from '../api';

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    const data = await adminFetch('/notifications');
    setItems(data);
  }

  useEffect(() => {
    load().catch(() => {});
    const interval = setInterval(() => load().catch(() => {}), 60000);
    return () => clearInterval(interval);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function markAllRead() {
    await adminFetch('/notifications/read-all', { method: 'PUT' });
    await load();
  }

  return (
    <div className="admin-notifications">
      <button
        type="button"
        className="admin-notif-btn"
        aria-label="Notifications"
        onClick={() => {
          setOpen(!open);
          if (!open && unread) markAllRead();
        }}
      >
        <Bell size={20} />
        {unread > 0 && <span className="admin-notif-badge">{unread}</span>}
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
          <ul>
            {items.length === 0 ? (
              <li className="admin-notif-empty">No notifications yet.</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className={n.read ? '' : 'unread'}>
                  {n.message}
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
