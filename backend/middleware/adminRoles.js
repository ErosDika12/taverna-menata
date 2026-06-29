const db = require('../db');
const { verifyAdminToken } = require('./auth');

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
  if (!admin || admin.status !== 'active') return null;
  if (admin.role !== payload.role) return null;
  return admin;
}

function attachAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Nuk jeni t� ky�ur.' });

  const admin = getAdminFromToken(token);
  if (!admin) return res.status(401).json({ error: 'Nuk jeni t� ky�ur.' });

  req.admin = admin;
  next();
}

function requireMainAdmin(req, res, next) {
  if (!req.admin) return res.status(401).json({ error: 'Nuk jeni t� ky�ur.' });
  if (req.admin.role !== 'main') {
    return res.status(403).json({ error: 'Vet�m administratori kryesor ka qasje n� k�t� seksion.' });
  }
  next();
}

module.exports = { attachAdmin, requireMainAdmin, getAdminFromToken };
