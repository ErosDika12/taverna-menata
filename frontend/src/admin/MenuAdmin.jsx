import { useEffect, useState } from 'react';
import { adminFetch } from '../api';

export default function MenuAdmin() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [catId, setCatId] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(null);

  async function load() {
    const [cats, its] = await Promise.all([adminFetch('/categories'), adminFetch('/items')]);
    setCategories(cats);
    setItems(its);
    if (!catId && cats[0]) setCatId(cats[0].id);
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
      </div>

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
          <button type="submit" className="btn btn-outline">
            Ruaj kategorinë
          </button>
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
