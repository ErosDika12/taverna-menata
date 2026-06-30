import { useState } from 'react';
import { adminFetch } from '../api';

export default function LanguageAdmin({ admin }) {
  const isMain = admin?.role === 'main_admin';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    if (!isMain) return;
    setMsg('');
    setSaving(true);
    try {
      await adminFetch('/password', { method: 'PUT', body: { current, next } });
      setCurrent('');
      setNext('');
      setMsg('Password updated successfully.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Settings</h1>
        <p className="admin-lead">Security and language information for the public website.</p>
      </div>

      <div className="admin-info-box">
        <h2>Website languages</h2>
        <p>
          The public site supports <strong>Albanian (default)</strong> and <strong>English</strong>.
          Visitors switch language with the AL / EN button in the header.
        </p>
        <p>
          Menu, homepage, about and contact text are edited separately for each language in
          <strong> Menu</strong>, <strong>Text</strong> and <strong>Contact</strong>.
        </p>
      </div>

      <form className="admin-form" onSubmit={changePassword}>
        <h2>Change admin password</h2>
        {!isMain ? (
          <p className="admin-hint">Only the Main Admin can change the admin password.</p>
        ) : (
          <>
            <p className="admin-hint">Use at least 6 characters. Default password is documented in README for first login.</p>
            <label>
              Current password
              <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </label>
            <label>
              New password
              <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} />
            </label>
            {msg && <p className={msg.includes('success') ? 'admin-msg' : 'admin-error'}>{msg}</p>}
            <button type="submit" className="admin-primary-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save new password'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
