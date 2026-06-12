const db = require('../db');

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cleanSessions() {
  const cutoff = Date.now() - MAX_AGE_MS;
  db.prepare('DELETE FROM admin_sessions WHERE created_at < ?').run(cutoff);
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Nuk jeni të kyçur.' });

  cleanSessions();
  const session = db.prepare('SELECT token FROM admin_sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ error: 'Sesioni ka skaduar.' });

  next();
}

module.exports = { requireAdmin, MAX_AGE_MS };
