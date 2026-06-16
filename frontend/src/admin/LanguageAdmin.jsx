import { useState } from 'react';
import { adminFetch } from '../api';

export default function LanguageAdmin() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState('');

  async function changePassword(e) {
    e.preventDefault();
    setMsg('');
    try {
      await adminFetch('/password', { method: 'PUT', body: { current, next } });
      setCurrent('');
      setNext('');
      setMsg('Fjalëkalimi u ndryshua.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="admin-page">
      <h1>Cilësimet</h1>

      <div className="admin-info-box">
        <h2>Gjuhët e faqes</h2>
        <p>
          Faqja ka dy gjuhë: <strong>Shqip</strong> (parazgjedhur) dhe <strong>Anglisht</strong>.
          Vizitorët ndërrojnë gjuhën me butonin AL / EN.
        </p>
        <p>
          Tekstet e menysë, ballinës dhe historisë redaktohen veç e veç për çdo gjuhë te{' '}
          <strong>Menyja</strong> dhe <strong>Përmbajtja</strong>.
        </p>
      </div>

      <form className="admin-form" onSubmit={changePassword}>
        <h2>Ndrysho fjalëkalimin</h2>
        <label>
          Fjalëkalimi aktual
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label>
          Fjalëkalimi i ri
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} />
        </label>
        {msg && <p className="admin-msg">{msg}</p>}
        <button type="submit" className="btn btn-primary">
          Ruaj fjalëkalimin
        </button>
      </form>
    </div>
  );
}
