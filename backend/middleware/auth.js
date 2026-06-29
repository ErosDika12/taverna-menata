const crypto = require('crypto');
const db = require('../db');
const { hashPassword } = require('../db');

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getAdminSecret() {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  const pwHash = row?.value || hashPassword(process.env.ADMIN_PASSWORD || 'menata2024');
  return crypto.createHmac('sha256', 'menata-admin-secret-v1').update(pwHash).digest('hex');
}

function getTokenVersion() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_token_version'").get();
  return row ? Number(row.value) : 1;
}

function bumpTokenVersion() {
  const next = getTokenVersion() + 1;
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('admin_token_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(String(next));
}

function signPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getAdminSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function createAdminToken(admin) {
  return signPayload({
    v: getTokenVersion(),
    adminId: admin.id,
    role: admin.role,
    iat: Date.now(),
    exp: Date.now() + MAX_AGE_MS
  });
}

function verifyAdminToken(token) {
  if (!token || !token.includes('.')) return false;

  const dot = token.indexOf('.');
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return false;

  const expected = crypto.createHmac('sha256', getAdminSecret()).update(body).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return false;
  }

  if (!payload.exp || payload.exp < Date.now()) return false;
  if (payload.v !== getTokenVersion()) return false;
  return true;
}

function cleanSessions() {
  const cutoff = Date.now() - MAX_AGE_MS;
  try {
    db.prepare('DELETE FROM admin_sessions WHERE created_at < ?').run(cutoff);
  } catch {
    /* table may be unused */
  }
}

function hasLegacySession(token) {
  cleanSessions();
  try {
    return !!db.prepare('SELECT token FROM admin_sessions WHERE token = ?').get(token);
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const { attachAdmin } = require('./adminRoles');
  return attachAdmin(req, res, next);
}

module.exports = {
  requireAdmin,
  createAdminToken,
  verifyAdminToken,
  bumpTokenVersion,
  MAX_AGE_MS
};
