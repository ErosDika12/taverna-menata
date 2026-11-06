const crypto = require('crypto');
const db = require('../db');

// Access tokens are short-lived; there is no refresh mechanism yet, so an
// admin simply logs in again once this elapses.
const TOKEN_TTL_MS = 45 * 60 * 1000; // 45 minutes

let cachedSecret = null;

/**
 * The signing key comes ONLY from ADMIN_SECRET. There is no fallback that
 * derives it from a password, a password hash, or any other application
 * data — that was the root cause of the previous token-forgery finding.
 *
 * In production this throws if ADMIN_SECRET is missing or too short, so the
 * process fails closed instead of silently signing tokens with a guessable
 * or derivable key. In local dev, a random per-process secret is generated
 * (and a warning printed) so `npm start` still works without extra setup —
 * every existing session is invalidated on each restart, which is fine for
 * a dev box.
 */
function getAdminSecret() {
  if (cachedSecret) return cachedSecret;

  const envSecret = process.env.ADMIN_SECRET;
  if (envSecret && envSecret.length >= 32) {
    cachedSecret = envSecret;
    return cachedSecret;
  }

  if (db.isProduction) {
    throw new Error(
      'FATAL: ADMIN_SECRET is missing or too short in production. Set a random secret of at ' +
      'least 32 characters (recommended: 64+ hex chars from crypto.randomBytes(48)) in the ' +
      'platform environment variables. Refusing to sign or verify admin tokens without it.'
    );
  }

  console.warn('[security] ADMIN_SECRET not set — generating an ephemeral per-process secret for local dev. All sessions will be invalidated on restart.');
  cachedSecret = crypto.randomBytes(48).toString('hex');
  return cachedSecret;
}

function sign(body) {
  return crypto.createHmac('sha256', getAdminSecret()).update(body).digest('base64url');
}

/**
 * Tokens carry only a random session id, issued-at and expiry — no role,
 * status, email or name. Authorization is always re-derived server-side
 * from the CURRENT admins row and the CURRENT admin_sessions row for `sid`.
 */
function createAdminToken(adminId) {
  const sid = crypto.randomBytes(24).toString('base64url');
  const now = Date.now();
  const exp = now + TOKEN_TTL_MS;

  db.prepare('INSERT INTO admin_sessions (sid, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    sid,
    adminId,
    now,
    exp
  );

  const payload = { sid, iat: now, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(body);
  return { token: `${body}.${sig}`, sid, exp };
}

function verifyAdminToken(token) {
  if (!token || !token.includes('.')) return null;

  const dot = token.indexOf('.');
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;

  let expected;
  try {
    expected = sign(body);
  } catch {
    return null; // misconfigured secret in production — fail closed
  }

  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload.sid || !payload.exp || payload.exp < Date.now()) return null;

  // The session row is the actual source of truth: logout, password change,
  // suspension and deletion all work by deleting rows here, which makes the
  // still-correctly-signed token worthless immediately.
  const session = db.prepare('SELECT * FROM admin_sessions WHERE sid = ?').get(payload.sid);
  if (!session || session.expires_at < Date.now()) return null;

  return { sid: payload.sid, adminId: session.admin_id };
}

function revokeSession(sid) {
  db.prepare('DELETE FROM admin_sessions WHERE sid = ?').run(sid);
}

function revokeAllSessionsForAdmin(adminId) {
  db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(adminId);
}

function cleanExpiredSessions() {
  db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(Date.now());
}

function requireAdmin(req, res, next) {
  const { attachAdmin } = require('./adminRoles');
  return attachAdmin(req, res, next);
}

module.exports = {
  requireAdmin,
  createAdminToken,
  verifyAdminToken,
  revokeSession,
  revokeAllSessionsForAdmin,
  cleanExpiredSessions,
  TOKEN_TTL_MS
};
