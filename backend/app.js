const fs = require('fs');
const path = require('path');
const express = require('express');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { uploadsRoot } = require('./upload');

const app = express();

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
  res.status(400).json({ error: err.message || 'Gabim.' });
});

const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist, { index: 'index.html' }));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

module.exports = app;
