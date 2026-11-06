const db = require('../db');
const { verifyAdminToken } = require('./auth');

const COOKIE_NAME = 'menata_admin_session';

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      out[key] = part.slice(eq + 1).trim();
    }
  }
  return out;
}

function readToken(req) {
  const cookies = parseCookies(req);
  if (cookies[COOKIE_NAME]) return cookies[COOKIE_NAME];
  // Legacy bearer-header support is intentionally NOT provided — the token
  // now lives only in an HttpOnly cookie the browser controls, never in JS.
  return null;
}

/**
 * Authorization is derived ONLY from the current admins row, read fresh on
 * every request. A valid, unexpired token proves which admin is making the
 * request and at what token_version it was issued; it is never trusted for
 * role, status, email or name, and it can NEVER create or recreate an admin
 * record. If the admin row is missing, suspended, or its token_version has
 * since been bumped (logout/password-change/suspend all bump it), this is
 * a 401 — full stop, no fallback reconstruction from token claims.
 */
function getAdminFromToken(token) {
  const verified = verifyAdminToken(token);
  if (!verified) return null;

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(verified.adminId);
  if (!admin || admin.status !== 'active') return null;
  if ((admin.token_version ?? 1) !== verified.v) return null;
  return admin;
}

function attachAdmin(req, res, next) {
  const token = readToken(req);
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

module.exports = { attachAdmin, requireMainAdmin, getAdminFromToken, COOKIE_NAME, parseCookies };
