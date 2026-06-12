const fs = require('fs');
const path = require('path');
const http = require('http');
const Database = require(path.join(__dirname, '..', 'backend', 'node_modules', 'better-sqlite3'));

const ROOT = path.join(__dirname, '..');
const UPLOADS = path.join(ROOT, 'backend', 'uploads');
const DB_PATH = path.join(ROOT, 'backend', 'menata.db');
const BASE = process.env.MEDIA_BASE || 'http://localhost:4000';

function fileExists(rel) {
  const p = path.join(ROOT, 'backend', rel.replace(/^\//, '').replace(/\//g, path.sep));
  return fs.existsSync(p);
}

function head(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        res.resume();
        resolve({ status: res.statusCode, type: res.headers['content-type'] });
      })
      .on('error', (e) => resolve({ status: 0, error: e.message }));
  });
}

async function main() {
  const report = {
    sourcePhotos: 0,
    optimizedGallery: 0,
    optimizedThumbs: 0,
    videosOnDisk: 0,
    dbGallery: 0,
    dbVideos: 0,
    dbMenuImages: 0,
    diskOk: 0,
    diskMissing: [],
    httpOk: 0,
    httpFail: []
  };

  const srcDir = path.join(ROOT, '..', 'extracted', 'photos', 'Fotot Menata');
  if (fs.existsSync(srcDir)) {
    report.sourcePhotos = fs.readdirSync(srcDir).filter((f) => /\.(jpe?g)$/i.test(f)).length;
  }

  const gal = path.join(UPLOADS, 'gallery');
  const thumbs = path.join(gal, 'thumbs');
  const vids = path.join(UPLOADS, 'videos');
  if (fs.existsSync(gal)) report.optimizedGallery = fs.readdirSync(gal).filter((f) => /\.jpe?g$/i.test(f)).length;
  if (fs.existsSync(thumbs)) report.optimizedThumbs = fs.readdirSync(thumbs).filter((f) => /\.jpe?g$/i.test(f)).length;
  if (fs.existsSync(vids)) {
    report.videosOnDisk = fs.readdirSync(vids, { recursive: true }).filter((f) => typeof f === 'string' && /\.(mp4|webm|mov)$/i.test(f)).length;
  }

  if (!fs.existsSync(DB_PATH)) {
    console.log(JSON.stringify({ error: 'Database not found', report }, null, 2));
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  const gallery = db.prepare('SELECT id, image, thumb FROM gallery ORDER BY id').all();
  const videos = db.prepare('SELECT id, src, thumb FROM videos ORDER BY id').all();
  const items = db.prepare('SELECT id, name, image FROM items WHERE image IS NOT NULL').all();
  const hero = db.prepare("SELECT value FROM settings WHERE key = 'hero_image'").get();

  report.dbGallery = gallery.length;
  report.dbVideos = videos.length;
  report.dbMenuImages = items.length;

  const urls = new Set();
  gallery.forEach((g) => {
    urls.add(g.image);
    urls.add(g.thumb);
  });
  videos.forEach((v) => {
    urls.add(v.src);
    if (v.thumb) urls.add(v.thumb);
  });
  items.forEach((i) => urls.add(i.image));
  if (hero?.value) urls.add(hero.value);

  for (const url of urls) {
    const rel = url;
    if (fileExists(rel)) report.diskOk++;
    else report.diskMissing.push(rel);
  }

  for (const url of [...urls].slice(0, 30)) {
    const r = await head(`${BASE}${url}`);
    if (r.status === 200) report.httpOk++;
    else report.httpFail.push({ url, ...r });
  }

  // full http check for all if server up
  if (report.httpOk > 0) {
    report.httpOk = 0;
    report.httpFail = [];
    for (const url of urls) {
      const r = await head(`${BASE}${url}`);
      if (r.status === 200) report.httpOk++;
      else report.httpFail.push({ url, ...r });
    }
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
