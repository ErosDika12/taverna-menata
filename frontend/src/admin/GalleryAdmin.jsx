import { useEffect, useState } from 'react';
import { adminFetch } from '../api';

const cats = [
  { value: 'food', label: 'Ushqimi' },
  { value: 'interior', label: 'Brenda' },
  { value: 'exterior', label: 'Oborri' },
  { value: 'atmosphere', label: 'Atmosfera' }
];

export default function GalleryAdmin() {
  const [tab, setTab] = useState('photos');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const [p, v] = await Promise.all([adminFetch('/gallery'), adminFetch('/videos')]);
    setPhotos(p);
    setVideos(v);
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message));
  }, []);

  async function uploadPhoto(e) {
    e.preventDefault();
    setMsg('');
    const fd = new FormData(e.target);
    try {
      const token = localStorage.getItem('menata-admin-token');
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      e.target.reset();
      await load();
      setMsg('Foto u ngarkua.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function uploadVideo(e) {
    e.preventDefault();
    setMsg('');
    const fd = new FormData(e.target);
    try {
      const token = localStorage.getItem('menata-admin-token');
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      e.target.reset();
      await load();
      setMsg('Video u ngarkua.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function deletePhoto(id) {
    if (!confirm('Fshini këtë foto?')) return;
    await adminFetch(`/gallery/${id}`, { method: 'DELETE' });
    await load();
    setMsg('Foto u fshi.');
  }

  async function deleteVideo(id) {
    if (!confirm('Fshini këtë video?')) return;
    await adminFetch(`/videos/${id}`, { method: 'DELETE' });
    await load();
    setMsg('Video u fshi.');
  }

  return (
    <div className="admin-page">
      <h1>Galeria</h1>
      {msg && <p className="admin-msg">{msg}</p>}

      <div className="admin-tabs">
        <button type="button" className={tab === 'photos' ? 'active' : ''} onClick={() => setTab('photos')}>
          Foto
        </button>
        <button type="button" className={tab === 'videos' ? 'active' : ''} onClick={() => setTab('videos')}>
          Video
        </button>
      </div>

      {tab === 'photos' && (
        <>
          <form className="admin-form admin-upload" onSubmit={uploadPhoto}>
            <h2>Ngarko foto</h2>
            <label>
              Foto
              <input type="file" name="image" accept="image/*" required />
            </label>
            <label>
              Kategoria
              <select name="category" defaultValue="food">
                {cats.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Përshkrimi (AL)
              <input name="alt" />
            </label>
            <label>
              Përshkrimi (EN)
              <input name="alt_en" />
            </label>
            <button type="submit" className="btn btn-primary">
              Ngarko
            </button>
          </form>

          <div className="admin-thumb-grid">
            {photos.map((p) => (
              <div key={p.id} className="admin-thumb">
                <img src={p.thumb} alt={p.alt} />
                <button type="button" className="danger" onClick={() => deletePhoto(p.id)}>
                  Fshi
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'videos' && (
        <>
          <form className="admin-form admin-upload" onSubmit={uploadVideo}>
            <h2>Ngarko video</h2>
            <label>
              Video (MP4, WebM, MOV)
              <input type="file" name="video" accept="video/*" required />
            </label>
            <label>
              Kategoria
              <select name="category" defaultValue="food">
                {cats.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titulli (AL)
              <input name="title" />
            </label>
            <label>
              Titulli (EN)
              <input name="title_en" />
            </label>
            <button type="submit" className="btn btn-primary">
              Ngarko
            </button>
          </form>

          <div className="admin-list">
            {videos.length === 0 && <p>Nuk ka video ende. Ngarkoni video reale të restorantit.</p>}
            {videos.map((v) => (
              <div key={v.id} className="admin-list-row">
                <div>
                  <strong>{v.title || 'Video'}</strong>
                  <span>{v.category}</span>
                </div>
                <button type="button" className="danger" onClick={() => deleteVideo(v.id)}>
                  Fshi
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
