import { useEffect, useState } from 'react';
import { adminFetch } from '../api';

export default function ContactAdmin() {
  const [data, setData] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminFetch('/settings').then(setData).catch((e) => setMsg(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    try {
      await adminFetch('/settings', { method: 'PUT', body: data });
      setMsg('U ruajt.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  function set(key, value) {
    setData((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="admin-page">
      <h1>Kontakti</h1>
      {msg && <p className="admin-msg">{msg}</p>}

      <form className="admin-form" onSubmit={save}>
        <label>
          Telefoni
          <input value={data.phone || ''} onChange={(e) => set('phone', e.target.value)} />
        </label>
        <label>
          WhatsApp (pa +)
          <input value={data.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} />
        </label>
        <label>
          Instagram (linku)
          <input value={data.instagram || ''} onChange={(e) => set('instagram', e.target.value)} />
        </label>
        <label>
          Facebook (linku)
          <input value={data.facebook || ''} onChange={(e) => set('facebook', e.target.value)} />
        </label>
        <label>
          Adresa
          <input value={data.address || ''} onChange={(e) => set('address', e.target.value)} />
        </label>
        <label>
          Orari (AL)
          <input value={data.hours_sq || ''} onChange={(e) => set('hours_sq', e.target.value)} />
        </label>
        <label>
          Orari (EN)
          <input value={data.hours_en || ''} onChange={(e) => set('hours_en', e.target.value)} />
        </label>
        <label>
          Google Maps (linku)
          <input value={data.maps_url || ''} onChange={(e) => set('maps_url', e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary admin-btn-full">
          Ruaj
        </button>
      </form>
    </div>
  );
}
