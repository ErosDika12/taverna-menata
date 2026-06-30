const db = require('./db');

const SECTION_ITEM_LABELS = {
  menu: 'Menu item',
  gallery: 'Gallery item',
  text: 'Text content',
  contact: 'Contact content',
  settings: 'Settings'
};

const SECTION_LABELS = {
  menu: 'Menu',
  gallery: 'Gallery',
  text: 'Text / Content',
  contact: 'Contact',
  settings: 'Settings'
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function notificationVerb(action) {
  const lower = String(action).toLowerCase();
  if (lower.includes('delete')) return 'deleted';
  if (lower.includes('create') || lower.includes('upload') || lower.includes('add')) return 'added';
  return 'changed';
}

function buildNotificationMessage(admin, section, action, details, now) {
  const who = admin.email || admin.name || 'Website Editor';
  const itemLabel = SECTION_ITEM_LABELS[section] || SECTION_LABELS[section] || section;
  const verb = notificationVerb(action);
  const time = formatTime(now);

  if (details) {
    const item = String(details).replace(/^'|'$/g, '');
    return `${who} ${verb} ${itemLabel} '${item}' at ${time}.`;
  }

  const sectionLabel = SECTION_LABELS[section] || section;
  return `${who} ${verb} ${sectionLabel} at ${time}.`;
}

function ensureAdminRecord(admin) {
  if (!admin?.id) return;
  const existing = db.prepare('SELECT id FROM admins WHERE id = ?').get(admin.id);
  if (existing) return;

  const now = Date.now();
  db.prepare(
    `INSERT INTO admins (id, email, name, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, ?, '', ?, ?, ?, ?)
     ON CONFLICT(id) DO NOTHING`
  ).run(
    admin.id,
    admin.email || `admin-${admin.id}@menata.local`,
    admin.name || admin.email || 'Website Editor',
    admin.role || 'website_editor',
    admin.status || 'active',
    now,
    now
  );
}

function exportNotificationsRegistry() {
  const rows = db
    .prepare(
      `SELECT id, message, section, actor_admin_id, actor_email, actor_name, action, details, read, created_at
       FROM admin_notifications ORDER BY created_at DESC LIMIT 200`
    )
    .all();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('admin_notifications_registry', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(rows));
}

function importNotificationsRegistry() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_notifications_registry'").get();
  if (!row?.value) return;

  let items;
  try {
    items = JSON.parse(row.value);
  } catch {
    return;
  }
  if (!Array.isArray(items)) return;

  const insert = db.prepare(
    `INSERT OR IGNORE INTO admin_notifications
     (id, message, section, actor_admin_id, actor_email, actor_name, action, details, read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (const n of items) {
      if (!n?.message && !n?.action) continue;
      insert.run(
        n.id,
        n.message || '',
        n.section || null,
        n.actor_admin_id || null,
        n.actor_email || null,
        n.actor_name || null,
        n.action || null,
        n.details || null,
        n.read ? 1 : 0,
        n.created_at || Date.now()
      );
    }
  })();
}

function formatNotificationRow(row) {
  if (row.message?.trim()) return row.message;

  const who = row.actor_email || row.actor_name || 'Website Editor';
  const section = row.section || 'content';
  const itemLabel = SECTION_ITEM_LABELS[section] || SECTION_LABELS[section] || section;
  const verb = notificationVerb(row.action || 'updated');
  const time = formatTime(row.created_at || Date.now());

  if (row.details) {
    const item = String(row.details).replace(/^'|'$/g, '');
    return `${who} ${verb} ${itemLabel} '${item}' at ${time}.`;
  }

  return `${who} ${verb} ${itemLabel} at ${time}.`;
}

function logAdminActivity(admin, section, action, details = '') {
  if (!admin?.id) return;

  const now = Date.now();
  ensureAdminRecord(admin);

  try {
    db.prepare(
      'INSERT INTO admin_activity (admin_id, section, action, details, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(admin.id, section, action, details || null, now);
  } catch {
    /* activity log is best-effort */
  }

  if (admin.role !== 'website_editor') return;

  const message = buildNotificationMessage(admin, section, action, details, now);

  try {
    db.prepare(
      `INSERT INTO admin_notifications
       (message, section, actor_admin_id, actor_email, actor_name, action, details, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
    ).run(
      message,
      section,
      admin.id,
      admin.email || null,
      admin.name || null,
      action,
      details || null,
      now
    );
    exportNotificationsRegistry();
  } catch {
    /* notification insert is best-effort */
  }
}

module.exports = {
  logAdminActivity,
  SECTION_ITEM_LABELS,
  formatNotificationRow,
  importNotificationsRegistry,
  exportNotificationsRegistry
};
