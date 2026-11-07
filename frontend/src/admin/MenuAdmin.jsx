import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminFetch, adminUpload } from '../api';
import ImageCropper from './ImageCropper';

const blankCategory = () => ({ name: '', name_en: '', type: 'food', note: '', note_en: '' });

const blankItem = (categoryId) => ({
  category_id: categoryId,
  name: '',
  name_en: '',
  description: '',
  description_en: '',
  price: 0,
  image: '',
  available: 1,
  sort: 0
});

export default function MenuAdmin() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [catId, setCatId] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(null);
  const [newCat, setNewCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // "New item", "New category" and "Edit category" open as their own page (?view=...), so the browser Back button works.
  const view = searchParams.get('view');
  const fullPage = view === 'new-item' || view === 'new-category' || view === 'edit-category';

  useEffect(() => {
    if (view === 'new-item') {
      setNewCat(null);
      setForm((f) => (f && !f.id ? { ...f, category_id: f.category_id ?? catId } : blankItem(catId)));
    } else if (view === 'new-category') {
      setForm(null);
      setNewCat((c) => c || blankCategory());
    } else if (view === 'edit-category') {
      setForm(null);
      setNewCat(null);
    } else {
      setNewCat(null);
      setForm((f) => (f && !f.id ? null : f));
    }
  }, [view, catId]);

  useEffect(() => {
    if (fullPage) window.scrollTo({ top: 0 });
  }, [view]);

  // Only one form is open at a time; this key changes whenever a different form opens.
  const openFormKey = form ? `item-${form.id ?? 'new'}` : newCat ? 'new-cat' : null;

  useEffect(() => {
    if (openFormKey && !fullPage) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [openFormKey]);

  function showError(err) {
    if (err.message === 'LOGIN_REQUIRED') return;
    setMsg(err.message);
  }

  async function load() {
    const [cats, its] = await Promise.all([adminFetch('/categories'), adminFetch('/items')]);
    setCategories(cats);
    setItems(its);
    if (!catId && cats[0]) setCatId(cats[0].id);
    else if (catId && !cats.find((c) => c.id === catId) && cats[0]) setCatId(cats[0].id);
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch(showError)
      .finally(() => setLoading(false));
  }, []);

  const catItems = items.filter((i) => i.category_id === catId);
  const activeCat = categories.find((c) => c.id === catId);
  const foodCategories = categories.filter((c) => c.type === 'food');
  const drinkCategories = categories.filter((c) => c.type === 'drinks');

  async function saveCategory(e) {
    e.preventDefault();
    if (!activeCat) return;
    setMsg('');
    setSaving(true);
    try {
      await adminFetch(`/categories/${activeCat.id}`, { method: 'PUT', body: activeCat });
      setSearchParams({});
      setMsg('Kategoria u ruajt.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createCategory(e) {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      await adminFetch('/categories', { method: 'POST', body: newCat });
      setNewCat(null);
      setSearchParams({});
      await load();
      setMsg('Kategoria u shtua.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id) {
    if (!confirm('Fshini këtë kategori? Artikujt brenda saj do të fshihen.')) return;
    setMsg('');
    setSaving(true);
    try {
      await adminFetch(`/categories/${id}`, { method: 'DELETE' });
      setSearchParams({});
      await load();
      setMsg('Kategoria u fshi.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(e) {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      const payload = { ...form, category_id: Number(form.category_id), available: form.available ? 1 : 0 };
      if (form.id) {
        await adminFetch(`/items/${form.id}`, { method: 'PUT', body: payload });
      } else {
        await adminFetch('/items', { method: 'POST', body: payload });
        setCatId(payload.category_id);
        setSearchParams({});
      }
      setForm(null);
      await load();
      setMsg('Saved. Visible on the public menu after refresh.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadItemImage(itemId, file) {
    if (!file) return;
    setMsg('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const data = await adminUpload(`/items/${itemId}/image`, fd);
      setForm((f) => (f && f.id === itemId ? { ...f, image: data.image } : f));
      await load();
      setMsg('Foto u ngarkua.');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id) {
    if (!confirm('Fshini këtë artikull?')) return;
    setMsg('');
    setSaving(true);
    try {
      await adminFetch(`/items/${id}`, { method: 'DELETE' });
      if (form?.id === id) setForm(null);
      await load();
      setMsg('U fshi.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  function closeForms() {
    setForm(null);
    setNewCat(null);
  }

  function editItem(item) {
    closeForms();
    setForm({ ...item, available: item.available ? 1 : 0 });
  }

  function openNewCategory() {
    closeForms();
    setMsg('');
    setSearchParams({ view: 'new-category' });
  }

  function openEditCategory() {
    closeForms();
    setMsg('');
    setSearchParams({ view: 'edit-category' });
  }

  function newItem() {
    closeForms();
    setMsg('');
    setSearchParams({ view: 'new-item' });
  }

  function backToMenu() {
    setSearchParams({});
  }

  const categoryOptions = (
    <>
      <optgroup label="USHQIM">
        {foodCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="PIJE">
        {drinkCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </optgroup>
    </>
  );

  return (
    <div className="admin-page">
      <h1>Menyja</h1>
      {msg && !msg.includes('LOGIN') && (
        <p className={msg.includes('Gabim') || msg.includes('error') ? 'admin-error' : 'admin-msg'}>{msg}</p>
      )}

      {loading ? (
        <p className="admin-lead">Duke u ngarkuar menyja…</p>
      ) : (
        <>
      {fullPage && (
        <button type="button" className="btn btn-outline" onClick={backToMenu}>
          ← Kthehu te menyja
        </button>
      )}

      {!fullPage && (
      <div className="admin-row">
        <label>
          Kategoria
          <select value={catId || ''} onChange={(e) => setCatId(Number(e.target.value))}>
            {categoryOptions}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={newItem}>
          + Artikull i ri
        </button>
        <button type="button" className="btn btn-outline" onClick={openNewCategory}>
          + Kategori e re
        </button>
        {activeCat && (
          <button type="button" className="btn btn-outline" onClick={openEditCategory}>
            Ndrysho kategorinë
          </button>
        )}
      </div>
      )}

      {view === 'new-category' && newCat && (
        <form ref={formRef} className="admin-form" onSubmit={createCategory}>
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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Shto
            </button>
            <button type="button" className="btn btn-outline" onClick={backToMenu}>
              Anulo
            </button>
          </div>
        </form>
      )}

      {view === 'edit-category' && activeCat && (
        <form ref={formRef} className="admin-form" onSubmit={saveCategory}>
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
            <button type="submit" className="btn btn-outline" disabled={saving}>
              Ruaj kategorinë
            </button>
            <button type="button" className="btn btn-outline" onClick={backToMenu}>
              Anulo
            </button>
            <button type="button" className="danger admin-inline-danger" disabled={saving} onClick={() => removeCategory(activeCat.id)}>
              Fshi kategorinë
            </button>
          </div>
        </form>
      )}

      {!fullPage && (
      <div className="admin-list">
        {catItems.map((item) => (
          <div key={item.id} className="admin-list-row">
            <div>
              <strong>{item.name}</strong>
              <span>{item.price} €</span>
              {!item.available && <em> (jo në dispozicion)</em>}
            </div>
            <div className="admin-list-actions">
              <button type="button" onClick={() => editItem(item)}>
                Ndrysho
              </button>
              <button type="button" className="danger" disabled={saving} onClick={() => removeItem(item.id)}>
                Fshi
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {form && (form.id ? !fullPage : view === 'new-item') && (
        <form ref={formRef} className="admin-form" onSubmit={saveItem}>
          <h2>{form.id ? 'Ndrysho artikullin' : 'Artikull i ri'}</h2>
          <label>
            Kategoria
            <select
              value={form.category_id || ''}
              onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
              required
            >
              {categoryOptions}
            </select>
          </label>
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) setRawImage({ itemId: form.id, file });
                }}
              />
            </label>
          )}
          <label className="admin-check">
            <input type="checkbox" checked={!!form.available} onChange={(e) => setForm({ ...form, available: e.target.checked ? 1 : 0 })} />
            Në dispozicion
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Duke u ruajtur…' : 'Ruaj'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => (form.id ? setForm(null) : backToMenu())}>
              Anulo
            </button>
          </div>
        </form>
      )}
        </>
      )}

      {rawImage && (
        <ImageCropper
          file={rawImage.file}
          onCancel={() => setRawImage(null)}
          onDone={(file) => {
            setRawImage(null);
            uploadItemImage(rawImage.itemId, file);
          }}
        />
      )}
    </div>
  );
}
