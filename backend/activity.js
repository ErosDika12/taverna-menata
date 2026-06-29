const db = require('./db');

const SECTION_LABELS = {
  menu: 'Menu',
  gallery: 'Gallery',
  text: 'Text',
  contact: 'Contact',
  settings: 'Settings'
};

function logAdminActivity(admin, section, action, details = '') {
  if (!admin?.id) return;

  const now = Date.now();
  db.prepare(
    'INSERT INTO admin_activity (admin_id, section, action, details, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(admin.id, section, action, details || null, now);

  if (admin.role !== 'editor') return;

  const sectionLabel =
    section === 'contact' ? 'Contact page' : SECTION_LABELS[section] || section;
  const message = `Website Editor updated ${sectionLabel}.`;

  db.prepare(
    'INSERT INTO admin_notifications (message, section, actor_admin_id, read, created_at) VALUES (?, ?, ?, 0, ?)'
  ).run(message, section, admin.id, now);
}

module.exports = { logAdminActivity, SECTION_LABELS };
