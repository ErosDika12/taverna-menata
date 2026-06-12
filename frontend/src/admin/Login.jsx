import { useState } from 'react';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gabim.');
      localStorage.setItem('menata-admin-token', data.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <img src={logo} alt="Taverna Menata" width="72" />
        <h1>Paneli i Menatës</h1>
        <p>Shkruani fjalëkalimin për të hyrë.</p>
        <label>
          Fjalëkalimi
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="btn btn-primary admin-btn-full" disabled={loading}>
          {loading ? 'Duke u kyçur…' : 'Hyr'}
        </button>
      </form>
    </div>
  );
}
