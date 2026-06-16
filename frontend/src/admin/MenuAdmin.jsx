import { useEffect, useState } from 'react';
import { adminFetch } from '../api';

export default function MenuAdmin() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [catId, setCatId] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(null);
  const [newCat, setNewCat] = useState(null);

  async function load() {
    const [cats, its] = await Promise.all([adminFetch('/categories'), adminFetch('/items')]);
    setCategories(cats);
    setItems(its);
    if (!catId && cats[0]) setCatId(cats[0].id);
    else if (catId && !cats.find((c) => c.id === catId) && cats[0]) setCatId(cats[0].id);
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message));
  }, []);

  const catItems = items.filter((i) => i.category_id === catId);
  const activeCat = categories.find((c) => c.id === catId);

  async function saveCategory(e) {
    e.preventDefault();
    if (!activeCat) return;
    setMsg('');
    try {
      await adminFetch(`/categories/${activeCat.id}`, { method: 'PUT', body: activeCat });
      setMsg('Kategoria u ruajt.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function createCategory(e) {
    e.preventDefault();
    setMsg('');
    try {
      await adminFetch('/categories', { method: 'POST', body: newCat });
      setNewCat(null);
      await load();
      setMsg('Kategoria u shtua.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function removeCategory(id) {
    if (!confirm('Fshini këtë kategori? Artikujt brenda saj do të fshihen.')) return;
    setMsg('');
    try {
      await adminFetch(`/categories/${id}`, { method: 'DELETE' });
      await load();
      setMsg('Kategoria u fshi.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function saveItem(e) {
    e.preventDefault();
    setMsg('');
    try {
      if (form.id) {
        await adminFetch(`/items/${form.id}`, { method: 'PUT', body: form });
      } else {
        await adminFetch('/items', { method: 'POST', body: form });
      }
      setForm(null);
      await load();
      setMsg('U ruajt.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function uploadItemImage(itemId, file) {
    if (!file) return;
    setMsg('');
    const fd = new FormData();
    fd.append('image', file);
    const token = localStorage.getItem('menata-admin-token');
    const res = await fetch(`/api/admin/items/${itemId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gabim.');
    setForm((f) => (f && f.id === itemId ? { ...f, image: data.image } : f));
    await load();
    setMsg('Foto u ngarkua.');
  }

  async function removeItem(id) {
    if (!confirm('Fshini këtë artikull?')) return;
    await adminFetch(`/items/${id}`, { method: 'DELETE' });
    await load();
    setMsg('U fshi.');
  }

  function newItem() {
    setForm({
      category_id: catId,
      name: '',
      name_en: '',
      description: '',
      description_en: '',
      price: 0,
      image: '',
      available: 1,
      sort: 0
    });
  }

  return (
    <div className="admin-page">
      <h1>Menyja</h1>
      {msg && <p className="admin-msg">{msg}</p>}

      <div className="admin-row">
        <label>
          Kategoria
          <select value={catId || ''} onChange={(e) => setCatId(Number(e.target.value))}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={newItem}>
          + Artikull i ri
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setNewCat({ name: '', name_en: '', type: 'food', note: '', note_en: '' })}
        >
          + Kategori e re
        </button>
      </div>

      {newCat && (
        <form className="admin-form" onSubmit={createCategory}>
          <h2>Kategori e re</h2>
          <label>
            Emri (AL)
            <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} required />
          </label>
          <label>
            Emri (EN)
            <input value={newCat.name_en} onChange={(e) => setNewCat({ ...newCat, name_en: e.target.value })} />
          </label>
          <label>
            Lloji
            <select value={newCat.type} onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}>
              <option value="food">Ushqim</option>
              <option value="drinks">Pije</option>
            </select>
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              Shto
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setNewCat(null)}>
              Anulo
            </button>
          </div>
        </form>
      )}

      {activeCat && (
        <form className="admin-form" onSubmit={saveCategory}>
          <h2>Kategoria: {activeCat.name}</h2>
          <label>
            Emri (AL)
            <input
              value={activeCat.name}
              onChange={(e) => setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, name: e.target.value } : c)))}
              required
            />
          </label>
          <label>
            Emri (EN)
            <input
              value={activeCat.name_en || ''}
              onChange={(e) => setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, name_en: e.target.value } : c)))}
            />
          </label>
          <label>
            Shënim (AL)
            <input
              value={activeCat.note || ''}
              onChange={(e) => setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, note: e.target.value } : c)))}
            />
          </label>
          <label>
            Shënim (EN)
            <input
              value={activeCat.note_en || ''}
              onChange={(e) => setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, note_en: e.target.value } : c)))}
            />
          </label>
          <label>
            Renditja
            <input
              type="number"
              value={activeCat.sort ?? 0}
              onChange={(e) =>
                setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, sort: Number(e.target.value) } : c)))
              }
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-outline">
              Ruaj kategorinë
            </button>
            <button type="button" className="danger admin-inline-danger" onClick={() => removeCategory(activeCat.id)}>
              Fshi kategorinë
            </button>
          </div>
        </form>
      )}

      <div className="admin-list">
        {catItems.map((item) => (
          <div key={item.id} className="admin-list-row">
            <div>
              <strong>{item.name}</strong>
              <span>{item.price} €</span>
              {!item.available && <em> (jo në dispozicion)</em>}
            </div>
            <div className="admin-list-actions">
              <button type="button" onClick={() => setForm({ ...item, available: item.available ? 1 : 0 })}>
                Ndrysho
              </button>
              <button type="button" className="danger" onClick={() => removeItem(item.id)}>
                Fshi
              </button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <form className="admin-form" onSubmit={saveItem}>
          <h2>{form.id ? 'Ndrysho artikullin' : 'Artikull i ri'}</h2>
          <label>
            Emri (AL)
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Emri (EN)
            <input value={form.name_en || ''} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
          </label>
          <label>
            Përshkrimi (AL)
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </label>
          <label>
            Përshkrimi (EN)
            <textarea value={form.description_en || ''} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={2} />
          </label>
          <label>
            Çmimi (€)
            <input type="number" step="0.5" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </label>
          <label>
            Renditja
            <input type="number" value={form.sort ?? 0} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} />
          </label>
          {form.image && (
            <div className="admin-item-preview">
              <img src={form.image} alt="" />
            </div>
          )}
          {form.id && (
            <label>
              Foto e artikullit
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadItemImage(form.id, e.target.files?.[0]).catch((err) => setMsg(err.message))}
              />
            </label>
          )}
          <label className="admin-check">
            <input type="checkbox" checked={!!form.available} onChange={(e) => setForm({ ...form, available: e.target.checked ? 1 : 0 })} />
            Në dispozicion
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              Ruaj
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>
              Anulo
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
