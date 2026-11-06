const { Router } = require('express');
const db = require('../db');
const { hashPassword, verifyPassword } = require('../password');
const { requireAdmin, createAdminToken, revokeSession, revokeAllSessionsForAdmin } = require('../middleware/auth');
const { requireMainAdmin, COOKIE_NAME } = require('../middleware/adminRoles');
const { loginRateLimit, recordLoginFailure, recordLoginSuccess } = require('../middleware/rateLimit');
const { sameOriginGuard } = require('../middleware/csrf');
const { logAdminActivity, formatNotificationRow, importNotificationsRegistry } = require('../activity');
const {
  uploadImage,
  uploadThumb,
  uploadMenuImage,
  uploadVideo,
  uploadVideoThumb,
  verifyImageMagicBytes,
  verifyVideoMagicBytes,
  optimizeGalleryImage,
  optimizeMenuImage,
  optimizeVideoThumb,
  toUrl
} = require('../upload');

const router = Router();

// Every admin response carries current, possibly sensitive state — never
// let a CDN/browser cache it.
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// CSRF defense-in-depth for state-changing requests. Login/logout don't rely
// on an existing session yet, but still shouldn't be driven cross-site.
router.use(sameOriginGuard);

function isSecureRequest(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https' || db.isProduction;
}

function setSessionCookie(req, res, token, exp) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Expires=${new Date(exp).toUTCString()}`
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req, res) {
  const parts = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Expires=Thu, 01 Jan 1970 00:00:00 GMT'];
  if (isSecureRequest(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function handleUpload(...middlewares) {
  return (req, res, next) => {
    const run = (i) => {
      if (i === 0) {
        middlewares[0](req, res, (err) => {
          if (err) return res.status(400).json({ error: err.message || 'Gabim në ngarkim.' });
          run(1);
        });
        return;
      }
      if (i >= middlewares.length) return next();
      middlewares[i](req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message || 'Gabim në ngarkim.' });
        run(i + 1);
      });
    };
    run(0);
  };
}

// Generic, identical response for "no such email" and "wrong password" —
// never confirm which one it was.
const GENERIC_LOGIN_ERROR = 'Email ose fjalëkalimi është i gabuar.';

function findAdminByEmail(email) {
  return db.prepare('SELECT * FROM admins WHERE email = ? COLLATE NOCASE').get(email.trim());
}

router.post('/login', loginRateLimit, (req, res) => {
  const email = String(req.body?.email || '').trim().slice(0, 254);
  const password = String(req.body?.password || '').slice(0, 128);
  if (!email || !password) {
    return res.status(400).json({ error: 'Shkruani email-in dhe fjalëkalimin.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    recordLoginFailure(req);
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }

  const admin = findAdminByEmail(email);
  if (!admin) {
    recordLoginFailure(req);
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }

  const { valid, legacy } = verifyPassword(password, admin.password_hash);
  if (!valid) {
    recordLoginFailure(req);
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }

  // Suspended accounts get the same generic error as a wrong password —
  // this does not confirm to an anonymous caller that the email exists.
  if (admin.status !== 'active') {
    recordLoginFailure(req);
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }

  // A correct password just proved who this is — only now does it make
  // sense to clear any failure count that was building up for this
  // account/IP (e.g. the admin mistyping it a couple of times earlier).
  recordLoginSuccess(req);

  if (legacy) {
    // Transparent, one-time migration off the old unsalted SHA-256 format.
    const rehashed = hashPassword(password);
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?').run(rehashed, Date.now(), admin.id);
  }

  const { token, exp } = createAdminToken(admin.id);
  setSessionCookie(req, res, token, exp);
  res.json({
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, status: admin.status },
    expiresAt: exp
  });
});

router.post('/logout', requireAdmin, (req, res) => {
  revokeSession(req.sid);
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  const { id, email, name, role, status } = req.admin;
  res.json({ ok: true, admin: { id, email, name, role, status } });
});

// --- Notifications (main admin only) ---
router.get('/notifications', requireAdmin, requireMainAdmin, (_req, res) => {
  importNotificationsRegistry();
  const rows = db
    .prepare(
      `SELECT n.id, n.message, n.section, n.actor_admin_id, n.actor_email, n.actor_name,
              n.action, n.details, n.read, n.created_at, a.name AS actor_name_join, a.email AS actor_email_join
       FROM admin_notifications n
       LEFT JOIN admins a ON a.id = n.actor_admin_id
       ORDER BY n.created_at DESC
       LIMIT 100`
    )
    .all()
    .map((row) => ({
      id: row.id,
      section: row.section,
      action: row.action,
      details: row.details,
      read: row.read,
      created_at: row.created_at,
      actor_email: row.actor_email || row.actor_email_join,
      actor_name: row.actor_name || row.actor_name_join,
      message: formatNotificationRow({
        ...row,
        actor_email: row.actor_email || row.actor_email_join,
        actor_name: row.actor_name || row.actor_name_join
      })
    }));
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
    .prepare('SELECT id, email, name, role, status, created_at, updated_at FROM admins ORDER BY role DESC, created_at ASC')
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
  if (password.length < 12) {
    return res.status(400).json({ error: 'Fjalëkalimi duhet të ketë të paktën 12 karaktere.' });
  }

  const exists = db.prepare('SELECT id FROM admins WHERE email = ? COLLATE NOCASE').get(email.trim());
  if (exists) return res.status(400).json({ error: 'Ky email ekziston tashmë.' });

  const now = Date.now();
  const r = db
    .prepare(
      `INSERT INTO admins (email, name, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, 'website_editor', 'active', ?, ?)`
    )
    .run(email.trim(), name.trim(), hashPassword(password), now, now);

  logAdminActivity(req.admin, 'settings', 'created admin', name.trim());
  res.json({ id: r.lastInsertRowid });
});

router.put('/admins/:id/suspend', requireAdmin, requireMainAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admini nuk u gjet.' });
  if (target.role === 'main_admin') {
    return res.status(403).json({ error: 'Nuk mund të pezulloni administratorin kryesor.' });
  }

  const now = Date.now();
  db.prepare("UPDATE admins SET status = 'suspended', updated_at = ? WHERE id = ?").run(now, req.params.id);
  revokeAllSessionsForAdmin(target.id); // suspension must kill any session already in flight
  logAdminActivity(req.admin, 'settings', 'suspended admin', target.name);
  res.json({ ok: true });
});

router.put('/admins/:id/activate', requireAdmin, requireMainAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admini nuk u gjet.' });

  const now = Date.now();
  db.prepare("UPDATE admins SET status = 'active', updated_at = ? WHERE id = ?").run(now, req.params.id);
  logAdminActivity(req.admin, 'settings', 'activated admin', target.name);
  res.json({ ok: true });
});

router.delete('/admins/:id', requireAdmin, requireMainAdmin, (req, res) => {
  const target = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admini nuk u gjet.' });
  if (target.role === 'main_admin') {
    return res.status(403).json({ error: 'Nuk mund të fshini administratorin kryesor.' });
  }

  db.prepare('DELETE FROM admins WHERE id = ?').run(req.params.id); // ON DELETE CASCADE drops sessions too
  logAdminActivity(req.admin, 'settings', 'deleted admin', target.name);
  res.json({ ok: true });
});

// --- Settings / content / contact ---
router.get('/settings', requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key NOT LIKE 'admin_%'").all();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.put('/settings', requireAdmin, (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Të dhënat e pavlefshme.' });
  }
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
  const { valid } = verifyPassword(current, req.admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Fjalëkalimi aktual është i gabuar.' });
  }
  if (!next || next.length < 12 || next === 'menata2024') {
    return res.status(400).json({ error: 'Fjalëkalimi i ri duhet të ketë të paktën 12 karaktere dhe të mos jetë i parazgjedhur.' });
  }

  const hash = hashPassword(next);
  const now = Date.now();
  db.prepare('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, req.admin.id);
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('admin_password_source', 'user') ON CONFLICT(key) DO UPDATE SET value = 'user'"
  ).run();

  // Every existing session for this admin — including the one making this
  // request — is invalidated; the caller must log in again with the new
  // password. This is what actually makes a password change meaningful.
  revokeAllSessionsForAdmin(req.admin.id);
  clearSessionCookie(req, res);

  logAdminActivity(req.admin, 'settings', 'changed password');
  res.json({ ok: true, reauthRequired: true });
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

router.delete('/categories/:id', requireAdmin, (req, res) => {
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

router.post('/items/:id/image', requireAdmin, handleUpload(uploadMenuImage.single('image'), verifyImageMagicBytes, optimizeMenuImage), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const url = toUrl(req.file.filename, 'menu');
  const item = db.prepare('SELECT name FROM items WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE items SET image = ? WHERE id = ?').run(url, req.params.id);
  logAdminActivity(req.admin, 'menu', 'updated item image', item?.name ? `'${item.name}'` : '');
  res.json({ image: url });
});

// --- Gallery photos ---
router.get('/gallery', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY created_at, sort, id').all());
});

router.post('/gallery', requireAdmin, handleUpload(uploadImage.single('image'), verifyImageMagicBytes, optimizeGalleryImage), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua foto.' });
  const { category, alt, alt_en } = req.body;
  const image = toUrl(req.file.filename, 'gallery');
  // A genuinely smaller derivative — not a second reference to the full
  // image — so the grid doesn't download the full-size file per cell.
  const thumb = req.thumbFilename ? toUrl(req.thumbFilename, 'gallery/thumbs') : image;
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM gallery').get().m;
  const r = db
    .prepare(
      'INSERT INTO gallery (image, thumb, category, alt, alt_en, sort, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(image, thumb, category || 'food', alt || '', alt_en || null, max + 1, Date.now());
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
  res.json(db.prepare('SELECT * FROM videos ORDER BY created_at, sort, id').all());
});

router.post('/videos', requireAdmin, handleUpload(uploadVideo.single('video'), verifyVideoMagicBytes), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua video.' });
  const { category, title, title_en } = req.body;
  const src = toUrl(req.file.filename, 'videos');
  const max = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM videos').get().m;
  const r = db
    .prepare(
      'INSERT INTO videos (src, thumb, category, title, title_en, sort, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(src, null, category || 'food', title || '', title_en || null, max + 1, Date.now());
  logAdminActivity(req.admin, 'gallery', 'uploaded video', title || category);
  res.json({ id: r.lastInsertRowid, src });
});

router.post('/videos/:id/thumb', requireAdmin, handleUpload(uploadVideoThumb.single('thumb'), verifyImageMagicBytes, optimizeVideoThumb), (req, res) => {
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
