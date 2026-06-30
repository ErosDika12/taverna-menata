const db = require('./db');

const SECTION_ITEM_LABELS = {
  menu: 'Menu item',
  gallery: 'Gallery item',
  text: 'Text content',
  contact: 'Contact content'
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
  const itemLabel = SECTION_ITEM_LABELS[section] || section;
  const verb = notificationVerb(action);
  const time = formatTime(now);

  if (details) {
    const item = String(details).replace(/^'|'$/g, '');
    return `${who} ${verb} ${itemLabel} '${item}' at ${time}.`;
  }

  return `${who} ${verb} ${itemLabel} at ${time}.`;
}

function logAdminActivity(admin, section, action, details = '') {
  if (!admin?.id) return;

  const now = Date.now();
  try {
    db.prepare(
      'INSERT INTO admin_activity (admin_id, section, action, details, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(admin.id, section, action, details || null, now);

    if (admin.role !== 'website_editor') return;

    const message = buildNotificationMessage(admin, section, action, details, now);

    db.prepare(
      'INSERT INTO admin_notifications (message, section, actor_admin_id, read, created_at) VALUES (?, ?, ?, 0, ?)'
    ).run(message, section, admin.id, now);
  } catch {
    /* activity log is best-effort on serverless */
  }
}

module.exports = { logAdminActivity, SECTION_ITEM_LABELS };
