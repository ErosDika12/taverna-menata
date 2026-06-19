import { useEffect, useState } from 'react';
import { adminFetch } from '../api';

export default function ContentAdmin() {
  const [data, setData] = useState({});
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch('/settings').then(setData).catch((e) => setMsg(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      await adminFetch('/settings', { method: 'PUT', body: data });
      setMsg('U ruajt.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  function set(key, value) {
    setData((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="admin-page">
      <h1>Teksti i faqes</h1>
      <p className="admin-lead">Ndryshoni tekstet e ballinës, historisë dhe footer-it në të dy gjuhët.</p>
      {msg && <p className={msg === 'U ruajt.' ? 'admin-msg' : 'admin-error'}>{msg}</p>}

      <form className="admin-form" onSubmit={save}>
        <h2>Hero — titulli</h2>
        <label>
          Emri i faqes (AL)
          <input value={data.site_name_sq || ''} onChange={(e) => set('site_name_sq', e.target.value)} />
        </label>
        <label>
          Emri i faqes (EN)
          <input value={data.site_name_en || ''} onChange={(e) => set('site_name_en', e.target.value)} />
        </label>

        <h2>Hero — nëntitulli</h2>
        <label>
          Slogani (AL)
          <input value={data.tagline_sq || ''} onChange={(e) => set('tagline_sq', e.target.value)} />
        </label>
        <label>
          Slogani (EN)
          <input value={data.tagline_en || ''} onChange={(e) => set('tagline_en', e.target.value)} />
        </label>

        <h2>Hero — përshkrimi</h2>
        <label>
          Teksti i shkurtër (AL)
          <textarea value={data.home_intro_sq || ''} onChange={(e) => set('home_intro_sq', e.target.value)} rows={3} />
        </label>
        <label>
          Teksti i shkurtër (EN)
          <textarea value={data.home_intro_en || ''} onChange={(e) => set('home_intro_en', e.target.value)} rows={3} />
        </label>

        <h2>Ballina dhe footer</h2>
        <p className="admin-hint">Slogani shfaqet edhe në footer të faqes.</p>

        <h2>Historia</h2>
        <label>
          Teksti (AL)
          <textarea value={data.about_text_sq || ''} onChange={(e) => set('about_text_sq', e.target.value)} rows={8} />
        </label>
        <label>
          Teksti (EN)
          <textarea value={data.about_text_en || ''} onChange={(e) => set('about_text_en', e.target.value)} rows={8} />
        </label>

        <h2>Menyja — shënim për pijet</h2>
        <label>
          Shënim (AL)
          <input value={data.drinks_note_sq || ''} onChange={(e) => set('drinks_note_sq', e.target.value)} />
        </label>
        <label>
          Shënim (EN)
          <input value={data.drinks_note_en || ''} onChange={(e) => set('drinks_note_en', e.target.value)} />
        </label>

        <button type="submit" className="admin-primary-btn" disabled={saving}>
          {saving ? 'Duke u ruajtur…' : 'Ruaj ndryshimet'}
        </button>
      </form>
    </div>
  );
}
