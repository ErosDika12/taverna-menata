const fs = require('fs');
const path = require('path');
const express = require('express');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { uploadsRoot } = require('./upload');

const app = express();

const { importNotificationsRegistry } = require('./activity');
importNotificationsRegistry();

// Inline style attributes are used throughout the frontend for per-slide
// transforms/offsets computed at runtime (MediaViewer drag/position math);
// rewriting that to class toggles is out of scope for this remediation, so
// style-src keeps 'unsafe-inline' as a narrow, documented exception. No
// other directive allows inline or eval'd script.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // The Contact page embeds a Google Maps iframe (maps.google.com); nothing
  // else on the site uses frames, and the site itself refuses to be framed
  // via frame-ancestors below.
  "frame-src https://maps.google.com https://www.google.com",
  "frame-ancestors 'none'"
].join('; ');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', CSP);
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// Sensitive-looking paths must 404, not fall through to the SPA's
// index.html. This is a signal/hygiene fix — Vercel's static layer never
// actually served these files — but it also protects the local/Railway
// server, which does read straight off this filesystem.
const SENSITIVE_PATH_RE = /(^\/\.|\/\.env|\/\.git|\.db(-wal|-shm)?$|\/backend\/|^\/package(-lock)?\.json$|^\/vercel\.json$|^\/railway\.json$|\.(sql|log|bak|yml|yaml)$)/i;
app.use((req, res, next) => {
  if (SENSITIVE_PATH_RE.test(req.path)) return res.status(404).type('text/plain').send('Not found');
  next();
});

app.use(express.json({ limit: '2mb' }));

function staticUploads(root) {
  return express.static(root, { maxAge: '7d', fallthrough: true });
}

app.use('/uploads', (req, res, next) => {
  staticUploads(uploadsRoot())(req, res, () => {
    staticUploads(path.join(__dirname, 'uploads'))(req, res, next);
  });
});
app.use('/api', (_req, res, next) => {
  const orig = res.json.bind(res);
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return orig(body);
  };
  next();
});
app.use('/api', publicRoutes);
// Admin responses (API and the /admin shell) must never be stored by browsers
// or shared caches such as Cloudflare: they can carry per-user data.
app.use(['/admin', '/api/admin'], (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use('/api/admin', (_req, res, next) => {
  const orig = res.json.bind(res);
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return orig(body);
  };
  next();
});
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 400;
  res.status(status).json({ error: err.message || 'Gabim.' });
});

const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  // Vite emits content-hashed filenames under /assets, so they can be cached forever.
  app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true, fallthrough: true }));
  // The Admin SPA shell is served explicitly, before the generic static/fallback
  // handlers, with no-store set on the response itself. sendFile() would otherwise
  // write its own Cache-Control, and cacheControl:false stops it from doing so.
  const adminShell = path.join(dist, 'index.html');
  app.get(['/admin', '/admin/*'], (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(adminShell, { cacheControl: false, lastModified: false, etag: false });
  });
  app.use(express.static(dist, { index: 'index.html' }));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

module.exports = app;
