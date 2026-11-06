const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const seed = require('./seed-data');
const { hashPassword } = require('./password');

// Production = deployed on a real platform (Vercel/Railway) or NODE_ENV says so.
// Local `node server.js` / `npm run dev` is never production, regardless of what
// environment variables happen to be set on the developer's machine.
const isProduction = Boolean(
  process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production'
);

function resolveDbPath() {
  const bundled = path.join(__dirname, 'menata.db');
  // DATA_DIR points to a persistent disk (e.g. a Railway volume); on Vercel only /tmp is writable.
  const dataDir = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : null);
  if (!dataDir) return bundled;

  fs.mkdirSync(dataDir, { recursive: true });
  const target = path.join(dataDir, 'menata.db');
  if (!fs.existsSync(target) && fs.existsSync(bundled)) {
    fs.copyFileSync(bundled, target);
  }
  return target;
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
    sort     INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS videos (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    src      TEXT NOT NULL,
    thumb    TEXT,
    category TEXT NOT NULL DEFAULT 'food'
      CHECK (category IN ('food', 'interior', 'exterior', 'atmosphere')),
    title    TEXT,
    title_en TEXT,
    sort     INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- token_version is the single source of truth for whether a signed token
  -- is still valid — bumping it (logout/password-change/suspend) instantly
  -- invalidates every token issued before the bump, because this row is
  -- read fresh on every request regardless of which serverless instance
  -- answers. (An earlier design used a separate per-session table keyed by
  -- a random session id; on Vercel, each instance has its own isolated
  -- copy of this SQLite file, so a session created by the instance that
  -- handled /login simply didn't exist on a different instance handling
  -- the very next request — that 401'd legitimate, still-active admins at
  -- random. token_version lives on the SAME row every instance already
  -- reads per-request for status/role, so it doesn't have that gap.)
  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'website_editor' CHECK (role IN ('main_admin', 'website_editor')),
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    token_version INTEGER NOT NULL DEFAULT 1,
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
  'ALTER TABLE gallery ADD COLUMN created_at INTEGER',
  'ALTER TABLE videos ADD COLUMN created_at INTEGER',
  'ALTER TABLE admins ADD COLUMN updated_at INTEGER',
  'ALTER TABLE admins ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE admin_notifications ADD COLUMN actor_email TEXT',
  'ALTER TABLE admin_notifications ADD COLUMN actor_name TEXT',
  'ALTER TABLE admin_notifications ADD COLUMN action TEXT',
  'ALTER TABLE admin_notifications ADD COLUMN details TEXT'
];
for (const sql of migrations) {
  try { db.exec(sql); } catch { /* already applied */ }
}
db.prepare('UPDATE admins SET updated_at = created_at WHERE updated_at IS NULL').run();

// Drop any leftover session table from either prior design (the bearer
// token itself as PK, or the sid-keyed table that caused the cross-instance
// logout bug) — sessions are no longer tracked in a table at all.
try {
  db.exec('DROP TABLE IF EXISTS admin_sessions');
} catch { /* best effort */ }

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
  })();

  console.log('Database seeded with initial menu, gallery and settings (no admin credentials).');
}

// Local-dev-only convenience password. Never used when isProduction is true —
// ensureBootstrapAdmin() throws instead of falling back to it in production.
const LOCAL_DEV_PASSWORD = 'local-dev-admin-change-me';

/**
 * Create or fix up the main_admin account from ADMIN_PASSWORD.
 *
 * Production (Vercel/Railway/NODE_ENV=production) REQUIRES ADMIN_PASSWORD to
 * be set and non-trivial; if it's missing or weak, this throws and the
 * process must not come up serving traffic. There is no derived or
 * hardcoded production fallback.
 *
 * Once an operator has changed the password via the admin UI
 * (admin_password_source = 'user'), ADMIN_PASSWORD only matters for
 * bootstrapping a brand-new deployment — it never overwrites that password.
 */
function ensureBootstrapAdmin() {
  const get = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value;
  const upsertSetting = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );

  const envPassword = process.env.ADMIN_PASSWORD;
  const mainAdmin = db.prepare("SELECT * FROM admins WHERE role = 'main_admin' ORDER BY id ASC LIMIT 1").get();
  const source = get('admin_password_source');

  if (mainAdmin && source === 'user') return; // operator already rotated it — never touch it here.

  if (isProduction) {
    if (!envPassword || envPassword === 'menata2024' || envPassword.length < 12) {
      throw new Error(
        'FATAL: ADMIN_PASSWORD is missing or too weak in production. Set a strong, unique ' +
        'ADMIN_PASSWORD (12+ chars, not the old default) in the platform environment variables ' +
        'before starting the server. Refusing to boot with an insecure or absent admin credential.'
      );
    }
  }

  const password = envPassword || LOCAL_DEV_PASSWORD;
  if (!envPassword && !isProduction) {
    console.warn('[security] ADMIN_PASSWORD not set — using a local-dev-only placeholder password. Never do this in production.');
  }

  const hash = hashPassword(password);
  const now = Date.now();

  if (!mainAdmin) {
    db.prepare(
      `INSERT INTO admins (email, name, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, 'main_admin', 'active', ?, ?)`
    ).run('admin@menata.local', 'Main Admin', hash, now, now);
  } else {
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, mainAdmin.id);
  }
  upsertSetting.run('admin_password_source', 'env');
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
      token_version INTEGER NOT NULL DEFAULT 1,
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

  const rows = db.prepare('SELECT key, value FROM settings').all();
  for (const row of rows) {
    if (!row.value || !/05:00|05\.00/.test(row.value)) continue;
    upsert.run(
      row.key,
      row.value.replace(/05:00/g, '03:00').replace(/05\.00/g, '03.00')
    );
  }
}

function fixStaleClosingTime(text) {
  if (!text) return text;
  return text.replace(/05:00/g, '03:00').replace(/05\.00/g, '03.00');
}

function migrateCategoryNotes() {
  const rows = db.prepare('SELECT id, name, name_en, note, note_en FROM categories').all();
  const update = db.prepare('UPDATE categories SET note = ?, note_en = ? WHERE id = ?');
  for (const row of rows) {
    const isDaily = /ditore|daily/i.test(`${row.name || ''} ${row.name_en || ''}`);
    let note = fixStaleClosingTime(row.note);
    let noteEn = fixStaleClosingTime(row.note_en);
    if (isDaily) {
      note = null;
      noteEn = null;
    }
    if (note !== row.note || noteEn !== row.note_en) {
      update.run(note, noteEn, row.id);
    }
  }
}

// Remove any leftover SENSITIVE data from the pre-remediation design, which
// stored password hashes and raw session tokens inside `settings` and was
// then committed to the (public) repo via the seed database. That mechanism
// (admin_registry / MENATA_ADMIN_REGISTRY / token-based account recreation)
// is removed outright — see the final security report for the multi-admin-
// on-ephemeral-Vercel limitation this leaves. (admin_notifications_registry
// is NOT touched here: it only ever held non-sensitive notification text,
// never a credential or session token, so it's kept for serverless
// persistence of the notification feed.)
function purgeLegacySecretSettings() {
  db.prepare(
    "DELETE FROM settings WHERE key IN ('admin_registry', 'admin_password', 'admin_token_version')"
  ).run();
}

seedIfEmpty();

const { ensureI18n } = require('./ensure-i18n');
const { ensureMenuStructure } = require('./ensure-menu-structure');
const { ensureMenuImages } = require('./ensure-menu-images');
const { ensureGalleryMedia } = require('./ensure-gallery-media');
ensureI18n(db);
purgeLegacySecretSettings();
migrateAdminRolesSchema();
ensureBootstrapAdmin();
migrateOpeningHours();
migrateCategoryNotes();
ensureMenuStructure(db);
ensureMenuImages(db);
ensureGalleryMedia(db);

if (require.main === module) {
  reseed();
}

module.exports = db;
module.exports.isProduction = isProduction;
