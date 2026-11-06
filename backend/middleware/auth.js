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
 * Tokens carry: adminId, the admin's token_version AT ISSUE TIME, issued-at
 * and expiry. No role/status/email/name — those are always re-read fresh
 * from the admins row on every request (see adminRoles.getAdminFromToken).
 *
 * IMPORTANT ARCHITECTURE NOTE — why there's no separate sessions table:
 * an earlier version of this stored each login in an `admin_sessions` table
 * and required that exact row to exist on every request. On Vercel, each
 * serverless instance has its OWN separate copy of the SQLite file with no
 * shared storage between them — a session created by the instance that
 * handled /login simply doesn't exist on a different instance that handles
 * the very next request, which 401'd a perfectly legitimate, still-active
 * admin at random. That bug is why this now uses token_version on the
 * admins row instead: logout/password-change/suspend/delete all bump or
 * are reflected by that one row, which (like every other admin-panel
 * value) is read fresh per request regardless of which instance answers —
 * no per-session row needs to "exist" anywhere for the token to work.
 *
 * The real tradeoff this accepts: logout and password-change now invalidate
 * ALL of that admin's sessions (every device/tab), not just the one acting.
 * That's a deliberate, documented choice — coarser revocation that actually
 * works reliably beats precise revocation that randomly breaks legitimate
 * use on this hosting architecture. True per-session revocation needs a
 * shared store (Redis/Vercel KV/Postgres), not per-instance SQLite.
 */
function createAdminToken(adminId, tokenVersion) {
  const now = Date.now();
  const exp = now + TOKEN_TTL_MS;
  const payload = { adminId, v: tokenVersion, iat: now, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(body);
  return { token: `${body}.${sig}`, exp };
}

/**
 * Verifies signature + expiry and returns the raw claims. It does NOT touch
 * the database — see adminRoles.getAdminFromToken for the token_version
 * comparison against the current admins row, which is what actually
 * decides whether the token is still honored.
 */
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

  if (!payload.adminId || typeof payload.v !== 'number' || !payload.exp || payload.exp < Date.now()) return null;

  return { adminId: payload.adminId, v: payload.v };
}

/** Bumping this invalidates every existing token for the admin at once. */
function bumpTokenVersion(adminId) {
  db.prepare('UPDATE admins SET token_version = token_version + 1 WHERE id = ?').run(adminId);
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
  TOKEN_TTL_MS
};
