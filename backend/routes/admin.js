const { Router } = require('express');
const db = require('../db');
const { hashPassword } = require('../db');
const { requireAdmin, createAdminToken, bumpTokenVersion } = require('../middleware/auth');
const { requireMainAdmin } = require('../middleware/adminRoles');
const { logAdminActivity } = require('../activity');
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

function findAdminByCredentials(email, password) {
  const admin = db.prepare('SELECT * FROM admins WHERE email = ? COLLATE NOCASE').get(email.trim());
  if (!admin) return null;
  if (admin.password_hash !== hashPassword(password)) return null;
  return admin;
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Shkruani email-in dhe fjalëkalimin.' });
  }

  const admin = findAdminByCredentials(email, password);
  if (!admin) {
    return res.status(401).json({ error: 'Email ose fjalëkalimi është i gabuar.' });
  }
  if (admin.status === 'suspended') {
    return res.status(403).json({ error: 'Llogaria juaj është pezulluar.' });
  }

  const token = createAdminToken(admin);
  try {
    db.prepare('INSERT INTO admin_sessions (token, created_at) VALUES (?, ?)').run(token, Date.now());
  } catch {
    /* optional legacy store */
  }
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, status: admin.status }
  });
});

router.post('/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  const { id, email, name, role, status } = req.admin;
  res.json({ ok: true, admin: { id, email, name, role, status } });
});

// --- Notifications (main admin only) ---
router.get('/notifications', requireAdmin, requireMainAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT n.*, a.name AS actor_name
       FROM admin_notifications n
       LEFT JOIN admins a ON a.id = n.actor_admin_id
       ORDER BY n.created_at DESC
       LIMIT 100`
    )
    .all();
  res.json(rows);
});

router.put('/notifications/read-all', requireAdmin, requireMainAdmin, (_req, res) => {
  db.prepare('UPDATE admin_notifications SET read = 1').run();
  res.json({ ok: true });
});

router.put('/notifications/:id/read', requireAdmin, requireMainAdmin, (req, res) => {
  db.prepare('UPDATE admin_notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Admin management (main admin only) ---
router.get('/admins', requireAdmin, requireMainAdmin, (_req, res) => {
  const admins = db
    .prepare('SELECT id, email, name, role, status, created_at FROM admins ORDER BY role DESC, created_at ASC')
    .all();
  res.json(admins);
});

router.get('/admins/:id/activity', requireAdmin, requireMainAdmin, (req, res) => {
  const rows = db
    .prepare(
      'SELECT * FROM admin_activity WHERE admin_id = ? ORDER BY created_at DESC LIMIT 50'
    )
    .all(req.params.id);
  res.json(rows);
});

router.get('/activity', requireAdmin, requireMainAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT act.*, a.name AS admin_name, a.email AS admin_email
       FROM admin_activity act
       JOIN admins a ON a.id = act.admin_id
       ORDER BY act.created_at DESC
       LIMIT 200`
    )
    .all();
  res.json(rows);
});

router.post('/admins', requireAdmin, requireMainAdmin, (req, res) => {
  const { email, name, password } = req.body;
  if (!email?.trim() || !name?.trim() || !password) {
    return res.status(400).json({ error: 'Plotësoni të gjitha fushat.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.' });
  }

  const exists = db.prepare('SELECT id FROM admins WHERE email = ? COLLATE NOCASE').get(email.trim());
  if (exists) return res.status(400).json({ error: 'Ky email ekziston tashmë.' });

  const r = db
    .prepare(
      `INSERT INTO admins (email, name, password_hash, role, status, created_at)
       VALUES (?, ?, ?, 'website_editor', 'active', ?)`
    )
    .run(email.trim(), name.trim(), hashPassword(password), Date.now());

  logAdminActivity(req.admin, 'settings', 'created admin', name.trim());
  res.json({ id: r.lastInsertRowid });
});

router.put('/admins/:id/suspend', requireAdmin, requireMainAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admini nuk u gjet.' });
  if (target.role === 'main_admin') {
    return res.status(403).json({ error: 'Nuk mund të pezulloni administratorin kryesor.' });
  }

  db.prepare("UPDATE admins SET status = 'suspended' WHERE id = ?").run(req.params.id);
  logAdminActivity(req.admin, 'settings', 'suspended admin', target.name);
  res.json({ ok: true });
});

router.put('/admins/:id/activate', requireAdmin, requireMainAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admini nuk u gjet.' });

  db.prepare("UPDATE admins SET status = 'active' WHERE id = ?").run(req.params.id);
  logAdminActivity(req.admin, 'settings', 'activated admin', target.name);
  res.json({ ok: true });
});

router.delete('/admins/:id', requireAdmin, requireMainAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admini nuk u gjet.' });
  if (target.role === 'main_admin') {
    return res.status(403).json({ error: 'Nuk mund të fshini administratorin kryesor.' });
  }

  db.prepare('DELETE FROM admins WHERE id = ?').run(req.params.id);
  logAdminActivity(req.admin, 'settings', 'deleted admin', target.name);
  res.json({ ok: true });
});

// --- Settings / content / contact ---
router.get('/settings', requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key NOT LIKE 'admin_%'").all();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.put('/settings', requireAdmin, (req, res) => {
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const changed = [];
  db.transaction(() => {
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith('admin_')) continue;
      upsert.run(key, String(value ?? ''));
      changed.push(key);
    }
  })();

  const section = changed.some((k) =>
    ['phone', 'whatsapp', 'instagram', 'facebook', 'address', 'hours_sq', 'hours_en', 'maps_url', 'review_url'].includes(k)
  )
    ? 'contact'
    : 'text';
  logAdminActivity(req.admin, section, 'updated settings', changed.join(', '));
  res.json({ ok: true });
});

router.put('/password', requireAdmin, requireMainAdmin, (req, res) => {
  const { current, next } = req.body;
  if (req.admin.password_hash !== hashPassword(current)) {
    return res.status(401).json({ error: 'Fjalëkalimi aktual është i gabuar.' });
  }
  if (!next || next.length < 6) {
    return res.status(400).json({ error: 'Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere.' });
  }

  const hash = hashPassword(next);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, req.admin.id);
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('admin_password', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(hash);
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('admin_password_source', 'user') ON CONFLICT(key) DO UPDATE SET value = 'user'"
  ).run('user');
  bumpTokenVersion();
  logAdminActivity(req.admin, 'settings', 'changed password');
  res.json({ ok: true });
});

// --- Menu categories ---
router.get('/categories', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort, id').all());
});

router.post('/categories', requireAdmin, (req, res) => {
  const { name, name_en, type, note, note_en } = req.body;
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM categories').get().m;
  const r = db
    .prepare(
      'INSERT INTO categories (name, name_en, type, note, note_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(name, name_en || null, type || 'food', note || null, note_en || null, max + 1);
  logAdminActivity(req.admin, 'menu', 'created category', name);
  res.json({ id: r.lastInsertRowid });
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  const { name, name_en, type, note, note_en, sort } = req.body;
  db.prepare(
    'UPDATE categories SET name=?, name_en=?, type=?, note=?, note_en=?, sort=? WHERE id=?'
  ).run(name, name_en || null, type, note || null, note_en || null, sort ?? 0, req.params.id);
  logAdminActivity(req.admin, 'menu', 'updated category', name);
  res.json({ ok: true });
});

router.delete('/categories/:id', requireAdmin, requireMainAdmin, (req, res) => {
  const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  logAdminActivity(req.admin, 'menu', 'deleted category', cat?.name || '');
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
  const r = db
    .prepare(
      `INSERT INTO items (category_id, name, name_en, description, description_en, price, image, available, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      category_id,
      name,
      name_en || null,
      description || null,
      description_en || null,
      price,
      image || null,
      asAvailable(available),
      max + 1
    );
  logAdminActivity(req.admin, 'menu', 'created item', `'${name}'`);
  res.json({ id: r.lastInsertRowid });
});

router.put('/items/:id', requireAdmin, (req, res) => {
  const { category_id, name, name_en, description, description_en, price, image, available, sort } = req.body;
  db.prepare(
    `UPDATE items SET category_id=?, name=?, name_en=?, description=?, description_en=?,
     price=?, image=?, available=?, sort=? WHERE id=?`
  ).run(
    category_id,
    name,
    name_en || null,
    description || null,
    description_en || null,
    price,
    image || null,
    asAvailable(available),
    sort ?? 0,
    req.params.id
  );
  logAdminActivity(req.admin, 'menu', 'updated item', `'${name}'`);
  res.json({ ok: true });
});

router.delete('/items/:id', requireAdmin, (req, res) => {
  const item = db.prepare('SELECT name FROM items WHERE id = ?').get(req.params.id);
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  logAdminActivity(req.admin, 'menu', 'deleted item', item?.name ? `'${item.name}'` : '');
  res.json({ ok: true });
});

router.post('/items/:id/image', requireAdmin, handleUpload(uploadMenuImage.single('image')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const url = toUrl(req.file.filename, 'menu');
  const item = db.prepare('SELECT name FROM items WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE items SET image = ? WHERE id = ?').run(url, req.params.id);
  logAdminActivity(req.admin, 'menu', 'updated item image', item?.name ? `'${item.name}'` : '');
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
  const thumb = image;
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM gallery').get().m;
  const r = db
    .prepare('INSERT INTO gallery (image, thumb, category, alt, alt_en, sort) VALUES (?, ?, ?, ?, ?, ?)')
    .run(image, thumb, category || 'food', alt || '', alt_en || null, max + 1);
  logAdminActivity(req.admin, 'gallery', 'uploaded photo', alt || category);
  res.json({ id: r.lastInsertRowid, image, thumb });
});

router.put('/gallery/:id', requireAdmin, (req, res) => {
  const { category, alt, alt_en, sort } = req.body;
  db.prepare('UPDATE gallery SET category=?, alt=?, alt_en=?, sort=? WHERE id=?').run(
    category,
    alt,
    alt_en || null,
    sort ?? 0,
    req.params.id
  );
  logAdminActivity(req.admin, 'gallery', 'updated photo', alt || category);
  res.json({ ok: true });
});

router.delete('/gallery/:id', requireAdmin, (req, res) => {
  const photo = db.prepare('SELECT alt FROM gallery WHERE id = ?').get(req.params.id);
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  logAdminActivity(req.admin, 'gallery', 'deleted photo', photo?.alt || '');
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
  const r = db
    .prepare('INSERT INTO videos (src, thumb, category, title, title_en, sort) VALUES (?, ?, ?, ?, ?, ?)')
    .run(src, null, category || 'food', title || '', title_en || null, max + 1);
  logAdminActivity(req.admin, 'gallery', 'uploaded video', title || category);
  res.json({ id: r.lastInsertRowid, src });
});

router.post('/videos/:id/thumb', requireAdmin, handleUpload(uploadVideoThumb.single('thumb')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const thumb = toUrl(req.file.filename, 'videos/thumbs');
  db.prepare('UPDATE videos SET thumb = ? WHERE id = ?').run(thumb, req.params.id);
  logAdminActivity(req.admin, 'gallery', 'updated video thumbnail');
  res.json({ thumb });
});

router.put('/videos/:id', requireAdmin, (req, res) => {
  const { category, title, title_en, sort } = req.body;
  db.prepare('UPDATE videos SET category=?, title=?, title_en=?, sort=? WHERE id=?').run(
    category,
    title,
    title_en || null,
    sort ?? 0,
    req.params.id
  );
  logAdminActivity(req.admin, 'gallery', 'updated video', title || category);
  res.json({ ok: true });
});

router.delete('/videos/:id', requireAdmin, (req, res) => {
  const video = db.prepare('SELECT title FROM videos WHERE id = ?').get(req.params.id);
  db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
  logAdminActivity(req.admin, 'gallery', 'deleted video', video?.title || '');
  res.json({ ok: true });
});

module.exports = router;
