const crypto = require('crypto');
const { Router } = require('express');
const db = require('../db');
const { hashPassword } = require('../db');
const { requireAdmin, MAX_AGE_MS } = require('../middleware/auth');
const { uploadImage, uploadThumb, uploadMenuImage, uploadVideo, uploadVideoThumb, toUrl } = require('../upload');

const router = Router();

function handleUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || 'Gabim në ngarkim.' });
      next();
    });
  };
}

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Shkruani fjalëkalimin.' });

  const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (!row || row.value !== hashPassword(password)) {
    return res.status(401).json({ error: 'Fjalëkalimi është i gabuar.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO admin_sessions (token, created_at) VALUES (?, ?)').run(token, Date.now());
  res.json({ token });
});

router.post('/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (_req, res) => res.json({ ok: true }));

// --- Settings / content / contact ---
router.get('/settings', requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key NOT LIKE 'admin_%'").all();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.put('/settings', requireAdmin, (req, res) => {
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  db.transaction(() => {
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith('admin_')) continue;
      upsert.run(key, String(value ?? ''));
    }
  })();
  res.json({ ok: true });
});

router.put('/password', requireAdmin, (req, res) => {
  const { current, next } = req.body;
  const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (!row || row.value !== hashPassword(current)) {
    return res.status(401).json({ error: 'Fjalëkalimi aktual është i gabuar.' });
  }
  if (!next || next.length < 6) {
    return res.status(400).json({ error: 'Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere.' });
  }
  db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(hashPassword(next));
  db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password_source', 'user') ON CONFLICT(key) DO UPDATE SET value = 'user'")
    .run('user');
  res.json({ ok: true });
});

// --- Menu categories ---
router.get('/categories', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort, id').all());
});

router.post('/categories', requireAdmin, (req, res) => {
  const { name, name_en, type, note, note_en } = req.body;
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM categories').get().m;
  const r = db.prepare(
    'INSERT INTO categories (name, name_en, type, note, note_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, name_en || null, type || 'food', note || null, note_en || null, max + 1);
  res.json({ id: r.lastInsertRowid });
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  const { name, name_en, type, note, note_en, sort } = req.body;
  db.prepare(
    'UPDATE categories SET name=?, name_en=?, type=?, note=?, note_en=?, sort=? WHERE id=?'
  ).run(name, name_en || null, type, note || null, note_en || null, sort ?? 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Menu items ---
router.get('/items', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM items ORDER BY category_id, sort, id').all());
});

function asAvailable(value) {
  return value === 1 || value === true || value === '1' ? 1 : 0;
}

router.post('/items', requireAdmin, (req, res) => {
  const { category_id, name, name_en, description, description_en, price, image, available } = req.body;
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM items WHERE category_id = ?').get(category_id).m;
  const r = db.prepare(
    `INSERT INTO items (category_id, name, name_en, description, description_en, price, image, available, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(category_id, name, name_en || null, description || null, description_en || null, price, image || null, asAvailable(available), max + 1);
  res.json({ id: r.lastInsertRowid });
});

router.put('/items/:id', requireAdmin, (req, res) => {
  const { category_id, name, name_en, description, description_en, price, image, available, sort } = req.body;
  db.prepare(
    `UPDATE items SET category_id=?, name=?, name_en=?, description=?, description_en=?,
     price=?, image=?, available=?, sort=? WHERE id=?`
  ).run(category_id, name, name_en || null, description || null, description_en || null, price, image || null, asAvailable(available), sort ?? 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/items/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.post('/items/:id/image', requireAdmin, handleUpload(uploadMenuImage.single('image')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const url = toUrl(req.file.filename, 'menu');
  db.prepare('UPDATE items SET image = ? WHERE id = ?').run(url, req.params.id);
  res.json({ image: url });
});

// --- Gallery photos ---
router.get('/gallery', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY sort, id').all());
});

router.post('/gallery', requireAdmin, handleUpload(uploadImage.single('image')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const { category, alt, alt_en } = req.body;
  const image = toUrl(req.file.filename, 'gallery');
  const thumb = image; // admin can upload separate thumb later
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM gallery').get().m;
  const r = db.prepare('INSERT INTO gallery (image, thumb, category, alt, alt_en, sort) VALUES (?, ?, ?, ?, ?, ?)')
    .run(image, thumb, category || 'food', alt || '', alt_en || null, max + 1);
  res.json({ id: r.lastInsertRowid, image, thumb });
});

router.put('/gallery/:id', requireAdmin, (req, res) => {
  const { category, alt, alt_en, sort } = req.body;
  db.prepare('UPDATE gallery SET category=?, alt=?, alt_en=?, sort=? WHERE id=?')
    .run(category, alt, alt_en || null, sort ?? 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/gallery/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Videos ---
router.get('/videos', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM videos ORDER BY sort, id').all());
});

router.post('/videos', requireAdmin, handleUpload(uploadVideo.single('video')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua video.' });
  const { category, title, title_en } = req.body;
  const src = toUrl(req.file.filename, 'videos');
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM videos').get().m;
  const r = db.prepare('INSERT INTO videos (src, thumb, category, title, title_en, sort) VALUES (?, ?, ?, ?, ?, ?)')
    .run(src, null, category || 'food', title || '', title_en || null, max + 1);
  res.json({ id: r.lastInsertRowid, src });
});

router.post('/videos/:id/thumb', requireAdmin, handleUpload(uploadVideoThumb.single('thumb')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const thumb = toUrl(req.file.filename, 'videos/thumbs');
  db.prepare('UPDATE videos SET thumb = ? WHERE id = ?').run(thumb, req.params.id);
  res.json({ thumb });
});

router.put('/videos/:id', requireAdmin, (req, res) => {
  const { category, title, title_en, sort } = req.body;
  db.prepare('UPDATE videos SET category=?, title=?, title_en=?, sort=? WHERE id=?')
    .run(category, title, title_en || null, sort ?? 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/videos/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
