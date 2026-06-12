const db = require('./db');

const keys = ['tagline_sq', 'home_intro_sq', 'about_text_sq', 'address_sq', 'hours_sq'];
for (const k of keys) {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
  console.log(k + ':', r?.value?.slice(0, 80) || 'MISSING');
}

const badItems = db.prepare("SELECT name FROM items WHERE name LIKE '%\ufffd%' OR name LIKE '%?%' LIMIT 10").all();
const badCats = db.prepare("SELECT name FROM categories WHERE name LIKE '%\ufffd%' OR name LIKE '%?%'").all();
console.log('bad categories:', badCats.length, badCats.map((c) => c.name));
console.log('bad items sample:', badItems.length);

const sample = db.prepare('SELECT name, description FROM items WHERE description IS NOT NULL LIMIT 3').all();
console.log('sample items:', sample);
