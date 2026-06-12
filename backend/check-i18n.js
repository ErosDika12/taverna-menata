const db = require('./db');

const keys = ['tagline_sq', 'tagline_en', 'home_intro_sq', 'home_intro_en', 'about_text_sq', 'about_text_en'];
for (const k of keys) {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
  console.log(k, r ? `YES (${r.value.length} chars)` : 'MISSING');
}

const en = db.prepare("SELECT COUNT(*) AS n FROM items WHERE name_en IS NOT NULL AND trim(name_en) != ''").get();
const tot = db.prepare('SELECT COUNT(*) AS n FROM items').get();
const catEn = db.prepare("SELECT COUNT(*) AS n FROM categories WHERE name_en IS NOT NULL AND trim(name_en) != ''").get();
const catTot = db.prepare('SELECT COUNT(*) AS n FROM categories').get();
const galEn = db.prepare("SELECT COUNT(*) AS n FROM gallery WHERE alt_en IS NOT NULL AND trim(alt_en) != ''").get();
const galTot = db.prepare('SELECT COUNT(*) AS n FROM gallery').get();

console.log('categories en:', catEn.n, '/', catTot.n);
console.log('items en:', en.n, '/', tot.n);
console.log('gallery alt_en:', galEn.n, '/', galTot.n);
