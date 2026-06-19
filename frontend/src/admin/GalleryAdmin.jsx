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
  const [editPhoto, setEditPhoto] = useState(null);
  const [editVideo, setEditVideo] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, v] = await Promise.all([adminFetch('/gallery'), adminFetch('/videos')]);
    setPhotos(p);
    setVideos(v);
  }

  async function run(action) {
    setMsg('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message));
  }, []);

  async function uploadPhoto(e) {
    e.preventDefault();
    await run(async () => {
      const fd = new FormData(e.target);
      const token = localStorage.getItem('menata-admin-token');
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gabim.');
      e.target.reset();
      await load();
      setMsg('Foto u ngarkua.');
    });
  }

  async function uploadVideo(e) {
    e.preventDefault();
    await run(async () => {
      const fd = new FormData(e.target);
      const token = localStorage.getItem('menata-admin-token');
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gabim.');
      e.target.reset();
      await load();
      setMsg('Video u ngarkua.');
    });
  }

  async function savePhoto(e) {
    e.preventDefault();
    if (!editPhoto) return;
    await run(async () => {
      await adminFetch(`/gallery/${editPhoto.id}`, { method: 'PUT', body: editPhoto });
      setEditPhoto(null);
      await load();
      setMsg('Foto u përditësua.');
    });
  }

  async function saveVideo(e) {
    e.preventDefault();
    if (!editVideo) return;
    await run(async () => {
      await adminFetch(`/videos/${editVideo.id}`, { method: 'PUT', body: editVideo });
      setEditVideo(null);
      await load();
      setMsg('Video u përditësua.');
    });
  }

  async function deletePhoto(id) {
    if (!confirm('Fshini këtë foto?')) return;
    await run(async () => {
      await adminFetch(`/gallery/${id}`, { method: 'DELETE' });
      if (editPhoto?.id === id) setEditPhoto(null);
      await load();
      setMsg('Foto u fshi.');
    });
  }

  async function deleteVideo(id) {
    if (!confirm('Fshini këtë video?')) return;
    await run(async () => {
      await adminFetch(`/videos/${id}`, { method: 'DELETE' });
      if (editVideo?.id === id) setEditVideo(null);
      await load();
      setMsg('Video u fshi.');
    });
  }

  return (
    <div className="admin-page">
      <h1>Galeria</h1>
      {msg && <p className={msg.includes('Gabim') || msg.includes('error') ? 'admin-error' : 'admin-msg'}>{msg}</p>}

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
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Duke u ngarkuar…' : 'Ngarko'}
            </button>
          </form>

          <div className="admin-thumb-grid">
            {photos.map((p) => (
              <div key={p.id} className="admin-thumb">
                <img src={p.thumb} alt={p.alt} />
                <div className="admin-thumb-actions">
                  <button type="button" onClick={() => setEditPhoto({ ...p })}>
                    Ndrysho
                  </button>
                  <button type="button" className="danger" disabled={busy} onClick={() => deletePhoto(p.id)}>
                    Fshi
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editPhoto && (
            <form className="admin-form" onSubmit={savePhoto}>
              <h2>Ndrysho foton</h2>
              <label>
                Kategoria
                <select value={editPhoto.category} onChange={(e) => setEditPhoto({ ...editPhoto, category: e.target.value })}>
                  {cats.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Përshkrimi (AL)
                <input value={editPhoto.alt || ''} onChange={(e) => setEditPhoto({ ...editPhoto, alt: e.target.value })} />
              </label>
              <label>
                Përshkrimi (EN)
                <input value={editPhoto.alt_en || ''} onChange={(e) => setEditPhoto({ ...editPhoto, alt_en: e.target.value })} />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Duke u ruajtur…' : 'Ruaj'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditPhoto(null)}>
                  Anulo
                </button>
              </div>
            </form>
          )}
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
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Duke u ngarkuar…' : 'Ngarko'}
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
                <div className="admin-list-actions">
                  <button type="button" onClick={() => setEditVideo({ ...v })}>
                    Ndrysho
                  </button>
                  <button type="button" className="danger" disabled={busy} onClick={() => deleteVideo(v.id)}>
                    Fshi
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editVideo && (
            <form className="admin-form" onSubmit={saveVideo}>
              <h2>Ndrysho videon</h2>
              <label>
                Kategoria
                <select value={editVideo.category} onChange={(e) => setEditVideo({ ...editVideo, category: e.target.value })}>
                  {cats.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Titulli (AL)
                <input value={editVideo.title || ''} onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })} />
              </label>
              <label>
                Titulli (EN)
                <input value={editVideo.title_en || ''} onChange={(e) => setEditVideo({ ...editVideo, title_en: e.target.value })} />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Duke u ruajtur…' : 'Ruaj'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditVideo(null)}>
                  Anulo
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
