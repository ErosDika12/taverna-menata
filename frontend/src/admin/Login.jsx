import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Fjalëkalimi është i gabuar.');
      }
      if (!data.token) {
        throw new Error('Nuk u mor tokeni i hyrjes. Provoni përsëri.');
      }
      localStorage.setItem('menata-admin-token', data.token);
      onLogin();
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Nuk u lidh me serverin. Kontrolloni që backend është aktiv në portin 4000.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <img src={logo} alt="Taverna Menata" width="80" />
        <h1>Menata Admin</h1>
        <p className="admin-login-sub">Hyni për të ndryshuar menynë, galerinë dhe tekstet e faqes.</p>
        <label>
          Fjalëkalimi
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Shkruani fjalëkalimin"
            required
          />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" className="admin-login-btn" disabled={loading}>
          <Lock size={18} aria-hidden="true" />
          {loading ? 'Duke u kyçur…' : 'Hyr në panel'}
        </button>
      </form>
    </div>
  );
}
