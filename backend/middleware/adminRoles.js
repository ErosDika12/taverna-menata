const db = require('../db');
const { verifyAdminToken } = require('./auth');

function syncAdminFromToken(payload) {
  if (!payload?.adminId || !payload?.email || !payload?.role) return null;

  const now = Date.now();
  const existing = db.prepare('SELECT * FROM admins WHERE id = ?').get(payload.adminId);

  if (existing) {
    if (existing.status !== 'active') return null;
    if (existing.role !== payload.role) return null;
    return existing;
  }

  // Serverless fallback: restore admin from signed JWT when row is missing (ephemeral DB).
  if (payload.status && payload.status !== 'active') return null;

  db.prepare(
    `INSERT INTO admins (id, email, name, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, ?, '', ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       email = excluded.email,
       name = excluded.name,
       role = excluded.role,
       status = excluded.status,
       updated_at = excluded.updated_at`
  ).run(
    payload.adminId,
    payload.email,
    payload.name || payload.email,
    payload.role,
    payload.status || 'active',
    payload.iat || now,
    now
  );

  return db.prepare('SELECT * FROM admins WHERE id = ?').get(payload.adminId);
}

function getAdminFromToken(token) {
  if (!token || !token.includes('.')) return null;

  if (!verifyAdminToken(token)) return null;

  const dot = token.indexOf('.');
  const body = token.slice(0, dot);
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload.adminId) return null;

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(payload.adminId);
  if (admin) {
    if (admin.status !== 'active') return null;
    if (admin.role !== payload.role) return null;
    return admin;
  }

  return syncAdminFromToken(payload);
}

function attachAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Nuk jeni të kyçur.' });

  const admin = getAdminFromToken(token);
  if (!admin) return res.status(401).json({ error: 'Nuk jeni të kyçur.' });

  req.admin = admin;
  next();
}

function requireMainAdmin(req, res, next) {
  if (!req.admin) return res.status(401).json({ error: 'Nuk jeni të kyçur.' });
  if (req.admin.role !== 'main_admin') {
    return res.status(403).json({ error: 'Vetëm administratori kryesor ka qasje në këtë seksion.' });
  }
  next();
}

module.exports = { attachAdmin, requireMainAdmin, getAdminFromToken, syncAdminFromToken };
