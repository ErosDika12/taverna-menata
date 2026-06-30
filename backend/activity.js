const db = require('./db');

const SECTION_LABELS = {
  menu: 'Menu',
  gallery: 'Gallery',
  text: 'Text',
  contact: 'Contact',
  settings: 'Settings'
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function logAdminActivity(admin, section, action, details = '') {
  if (!admin?.id) return;

  const now = Date.now();
  db.prepare(
    'INSERT INTO admin_activity (admin_id, section, action, details, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(admin.id, section, action, details || null, now);

  if (admin.role !== 'editor') return;

  const sectionLabel = section === 'contact' ? 'Contact page' : SECTION_LABELS[section] || section;
  const who = admin.name || admin.email || 'Website Editor';
  const what = details ? `${action} ${details}` : action;
  const message = `${who} updated ${sectionLabel} (${what}) at ${formatTime(now)}.`;

  db.prepare(
    'INSERT INTO admin_notifications (message, section, actor_admin_id, read, created_at) VALUES (?, ?, ?, 0, ?)'
  ).run(message, section, admin.id, now);
}

module.exports = { logAdminActivity, SECTION_LABELS };
