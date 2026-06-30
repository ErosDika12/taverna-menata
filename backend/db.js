const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const seed = require('./seed-data');

function resolveDbPath() {
  const bundled = path.join(__dirname, 'menata.db');
  if (!process.env.VERCEL) return bundled;

  const tmp = path.join('/tmp', 'menata.db');
  if (!fs.existsSync(tmp) && fs.existsSync(bundled)) {
    fs.copyFileSync(bundled, tmp);
  }
  return tmp;
}

const db = new Database(resolveDbPath());
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    name_en TEXT,
    type    TEXT NOT NULL DEFAULT 'food' CHECK (type IN ('food', 'drinks')),
    note    TEXT,
    note_en TEXT,
    sort    INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS items (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id    INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    name_en        TEXT,
    description    TEXT,
    description_en TEXT,
    price          REAL NOT NULL,
    image          TEXT,
    available      INTEGER NOT NULL DEFAULT 1,
    sort           INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    image    TEXT NOT NULL,
    thumb    TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'food'
      CHECK (category IN ('food', 'interior', 'exterior', 'atmosphere')),
    alt      TEXT,
    alt_en   TEXT,
    sort     INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS videos (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    src      TEXT NOT NULL,
    thumb    TEXT,
    category TEXT NOT NULL DEFAULT 'food'
      CHECK (category IN ('food', 'interior', 'exterior', 'atmosphere')),
    title    TEXT,
    title_en TEXT,
    sort     INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token      TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'website_editor' CHECK (role IN ('main_admin', 'website_editor')),
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_activity (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    section    TEXT NOT NULL,
    action     TEXT NOT NULL,
    details    TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_notifications (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    message        TEXT NOT NULL,
    section        TEXT,
    actor_admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    read           INTEGER NOT NULL DEFAULT 0,
    created_at     INTEGER NOT NULL
  );
`);

// Add columns on existing databases without wiping data.
const migrations = [
  'ALTER TABLE categories ADD COLUMN name_en TEXT',
  'ALTER TABLE categories ADD COLUMN note_en TEXT',
  'ALTER TABLE items ADD COLUMN name_en TEXT',
  'ALTER TABLE items ADD COLUMN description_en TEXT',
  'ALTER TABLE items ADD COLUMN available INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE gallery ADD COLUMN alt_en TEXT',
  'ALTER TABLE admins ADD COLUMN updated_at INTEGER'
];
for (const sql of migrations) {
  try { db.exec(sql); } catch { /* already applied */ }
}
db.prepare('UPDATE admins SET updated_at = created_at WHERE updated_at IS NULL').run();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function seedIfEmpty() {
  if (db.prepare('SELECT COUNT(*) AS n FROM categories').get().n > 0) return;
  reseed();
}

function reseed() {
  db.exec('DELETE FROM items; DELETE FROM categories; DELETE FROM gallery; DELETE FROM videos; DELETE FROM settings;');

  const insertCategory = db.prepare(
    'INSERT INTO categories (name, name_en, type, note, note_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    `INSERT INTO items (category_id, name, name_en, description, description_en, price, image, available, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertPhoto = db.prepare(
    'INSERT INTO gallery (image, thumb, category, alt, alt_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertVideo = db.prepare(
    'INSERT INTO videos (src, thumb, category, title, title_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

  db.transaction(() => {
    seed.categories.forEach((category, ci) => {
      const tr = seed.categoryTranslations[category.name] || {};
      const { lastInsertRowid } = insertCategory.run(
        category.name,
        tr.name_en || null,
        category.type,
        category.note || null,
        tr.note_en || null,
        ci
      );
      category.items.forEach((item, ii) => {
        insertItem.run(
          lastInsertRowid,
          item.name,
          item.name_en || null,
          item.description || null,
          item.description_en || null,
          item.price,
          item.image || null,
          item.available !== undefined ? item.available : 1,
          ii
        );
      });
    });

    seed.gallery.forEach((photo, i) => {
      insertPhoto.run(
        `/uploads/gallery/${photo.file}`,
        `/uploads/gallery/thumbs/${photo.file}`,
        photo.category,
        photo.alt,
        photo.alt_en || null,
        i
      );
    });

    (seed.videos || []).forEach((video, i) => {
      insertVideo.run(
        `/uploads/videos/${video.file}`,
        video.thumb ? `/uploads/videos/thumbs/${video.thumb}` : null,
        video.category,
        video.title,
        video.title_en || null,
        i
      );
    });

    for (const [key, value] of Object.entries(seed.settings)) {
      insertSetting.run(key, value);
    }
    for (const [key, value] of Object.entries(seed.settingsEn || {})) {
      insertSetting.run(key, value);
    }

    insertSetting.run('admin_password', hashPassword(process.env.ADMIN_PASSWORD || 'menata2024'));
    insertSetting.run('admin_password_source', process.env.ADMIN_PASSWORD ? 'env' : 'default');
  })();

  console.log('Database seeded with initial menu, gallery and settings.');
}

function ensureAdminPassword(db) {
  const get = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value;
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const defaultPw = process.env.ADMIN_PASSWORD || 'menata2024';
  const defaultHash = hashPassword(defaultPw);

  if (process.env.ADMIN_PASSWORD) {
    upsert.run('admin_password', defaultHash);
    upsert.run('admin_password_source', 'env');
    return;
  }

  if (!get('admin_password')) {
    upsert.run('admin_password', defaultHash);
    upsert.run('admin_password_source', 'default');
    return;
  }

  // Keep default password until changed explicitly in admin Settings.
  if (get('admin_password_source') !== 'user') {
    upsert.run('admin_password', defaultHash);
    upsert.run('admin_password_source', get('admin_password_source') || 'default');
  }
}

function ensureAdminsTable() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM admins').get().n;
  if (count > 0) return;

  const pwRow = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  const defaultHash = pwRow?.value || hashPassword(process.env.ADMIN_PASSWORD || 'menata2024');
  const now = Date.now();

  db.prepare(
    `INSERT INTO admins (email, name, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, ?, 'main_admin', 'active', ?, ?)`
  ).run('admin@menata.local', 'Main Admin', defaultHash, now, now);
}

function ensureMainAdminAccount() {
  const defaultHash = hashPassword(process.env.ADMIN_PASSWORD || 'menata2024');
  const now = Date.now();
  let main = db.prepare("SELECT * FROM admins WHERE role = 'main_admin' ORDER BY id ASC LIMIT 1").get();

  if (!main) {
    ensureAdminsTable();
    main = db.prepare("SELECT * FROM admins WHERE role = 'main_admin' ORDER BY id ASC LIMIT 1").get();
    if (!main) return;
  }

  const source = db.prepare("SELECT value FROM settings WHERE key = 'admin_password_source'").get()?.value;
  const passwordHash = source === 'user' ? main.password_hash : defaultHash;

  if (main.email !== 'admin@menata.local' || main.password_hash !== passwordHash) {
    db.prepare(
      "UPDATE admins SET email = 'admin@menata.local', password_hash = ?, updated_at = ? WHERE id = ?"
    ).run(passwordHash, now, main.id);
  }
}

function migrateAdminRolesSchema() {
  const row = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'admins'")
    .get();
  if (!row?.sql) return;
  const hasOldRoles = row.sql.includes("('main', 'editor')");
  if (!hasOldRoles) {
    db.prepare("UPDATE admins SET role = 'main_admin' WHERE role = 'main'").run();
    db.prepare("UPDATE admins SET role = 'website_editor' WHERE role = 'editor'").run();
    return;
  }

  db.exec(`
    BEGIN;
    CREATE TABLE admins_new (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'website_editor' CHECK (role IN ('main_admin', 'website_editor')),
      status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
    INSERT INTO admins_new (id, email, name, password_hash, role, status, created_at, updated_at)
    SELECT
      id,
      email,
      name,
      password_hash,
      CASE
        WHEN role = 'main' THEN 'main_admin'
        ELSE 'website_editor'
      END,
      status,
      created_at,
      COALESCE(updated_at, created_at)
    FROM admins;
    DROP TABLE admins;
    ALTER TABLE admins_new RENAME TO admins;
    COMMIT;
  `);
}

function migrateOpeningHours() {
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  for (const key of ['hours_sq', 'hours_en', 'hours']) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    if (!row?.value) continue;
    const updated = row.value.replace(/05:00/g, '03:00').replace(/05\.00/g, '03.00');
    if (updated !== row.value) upsert.run(key, updated);
  }
}

function exportAdminsRegistry() {
  const admins = db
    .prepare('SELECT id, email, name, password_hash, role, status, created_at, updated_at FROM admins')
    .all();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('admin_registry', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(admins));
}

function importAdminsRegistry() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_registry'").get();
  if (!row?.value) return;

  let admins;
  try {
    admins = JSON.parse(row.value);
  } catch {
    return;
  }
  if (!Array.isArray(admins)) return;

  const upsert = db.prepare(
    `INSERT INTO admins (id, email, name, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       email = excluded.email,
       name = excluded.name,
       password_hash = CASE WHEN excluded.password_hash != '' THEN excluded.password_hash ELSE admins.password_hash END,
       role = excluded.role,
       status = excluded.status,
       updated_at = excluded.updated_at`
  );

  db.transaction(() => {
    for (const admin of admins) {
      if (!admin?.email || !admin?.role) continue;
      upsert.run(
        admin.id,
        admin.email,
        admin.name || admin.email,
        admin.password_hash || '',
        admin.role,
        admin.status || 'active',
        admin.created_at || Date.now(),
        admin.updated_at || admin.created_at || Date.now()
      );
    }
  })();
}

function importAdminsFromEnv() {
  const raw = process.env.MENATA_ADMIN_REGISTRY;
  if (!raw) return;
  try {
    db.prepare(
      "INSERT INTO settings (key, value) VALUES ('admin_registry', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(raw);
    importAdminsRegistry();
  } catch {
    /* ignore malformed env */
  }
}

seedIfEmpty();

const { ensureI18n } = require('./ensure-i18n');
ensureI18n(db);
ensureAdminPassword(db);
migrateAdminRolesSchema();
ensureAdminsTable();
ensureMainAdminAccount();
importAdminsFromEnv();
importAdminsRegistry();
exportAdminsRegistry();
migrateOpeningHours();

if (require.main === module) {
  reseed();
}

module.exports = db;
module.exports.hashPassword = hashPassword;
module.exports.exportAdminsRegistry = exportAdminsRegistry;
module.exports.importAdminsRegistry = importAdminsRegistry;
