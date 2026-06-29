/**
 * Migrates legacy settings keys and populates Albanian/English content in the database.
 * Safe to run on every server start — only fills missing translations.
 */
const seed = require('./seed-data');
const sq = require('./sq-content');
const { CATEGORY_EN, itemEn, galleryAltEn } = require('./i18n-content');

const LEGACY_MAP = {
  tagline: 'tagline_sq',
  home_intro: 'home_intro_sq',
  about_text: 'about_text_sq',
  hours: 'hours_sq',
  drinks_note: 'drinks_note_sq',
  address: 'address_sq'
};

function upsertSetting(db, key, value) {
  if (value == null || value === '') return;
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value);
}

function ensureI18n(db) {
  const get = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value;

  // Legacy single-key settings → _sq bilingual keys
  for (const [legacy, sqKey] of Object.entries(LEGACY_MAP)) {
    const legacyVal = get(legacy);
    if (legacyVal && !get(sqKey)) {
      upsertSetting(db, sqKey, legacyVal);
    }
  }

  // Seed Albanian settings if still missing
  for (const [key, value] of Object.entries(seed.settings)) {
    if (key.endsWith('_sq') || ['phone', 'whatsapp', 'instagram', 'facebook', 'maps_url', 'hero_image', 'site_name'].includes(key)) {
      if (!get(key)) upsertSetting(db, key, value);
    }
  }

  // Albanian settings — always sync from clean UTF-8 source
  for (const [key, value] of Object.entries(sq)) {
    upsertSetting(db, key, value);
  }

  // Fill any missing _sq fields from legacy keys (first run only)
  for (const [legacy, sqKey] of Object.entries(LEGACY_MAP)) {
    if (!get(sqKey) && get(legacy)) upsertSetting(db, sqKey, get(legacy));
  }

  // English settings (always sync — clean UTF-8 source of truth)
  const EN_SETTINGS = {
    site_name_en: 'Tavern Menata',
    address_en: 'Faton Shabani St., 10000 Prishtina, Kosovo',
    tagline_en: 'Fortune follows the brave; good company brings cheer.',
    home_intro_en:
      'A traditional tavern in the heart of Prishtina - from early breakfasts to late-night meze. ' +
      'A place you come for the food, and stay for the atmosphere.',
    about_text_en:
      'Taverna Menata is one of those places where the day can start early and end late - ' +
      'always with good food, good company and a warm atmosphere.\n\n' +
      'In the morning, Menata welcomes you with fresh, simple dishes, just like at home. At lunch, ' +
      'the tables fill with warm plates, traditional cooking and flavours that bring back the family table. ' +
      'In the evening, the place takes on a different rhythm - cold beer, grilled meat, music and friends ' +
      'that make the atmosphere come alive.\n\n' +
      'It is this mix of good food, hospitality and time spent with people you care about that has made ' +
      'Menata one of the most loved spots in Prishtina. A tavern you visit for the food - and stay longer for the atmosphere.',
    hours_en: 'Every day - 07:00 - 03:00',
    drinks_note_en: 'Prices after midnight are +20%'
  };
  for (const [key, value] of Object.entries(EN_SETTINGS)) {
    upsertSetting(db, key, value);
  }

  if (!get('site_name_sq')) {
    upsertSetting(db, 'site_name_sq', get('site_name') || 'Taverna Menata');
  }

  // Categories
  const updateCategory = db.prepare('UPDATE categories SET name_en = ?, note_en = ? WHERE id = ?');
  const categories = db.prepare('SELECT id, name, note FROM categories').all();
  for (const cat of categories) {
    const tr = CATEGORY_EN[cat.name] || seed.categoryTranslations?.[cat.name] || {};
    if (tr.name_en) {
      updateCategory.run(tr.name_en, tr.note_en || null, cat.id);
    }
  }

  const updateItem = db.prepare('UPDATE items SET name_en = ?, description_en = ? WHERE id = ?');
  const items = db.prepare(
    `SELECT i.id, i.name, i.description, c.name AS category
     FROM items i JOIN categories c ON c.id = i.category_id`
  ).all();

  for (const item of items) {
    const en = itemEn(item.category, item.name, item.description);
    if (en?.name_en) {
      updateItem.run(en.name_en, en.description_en || null, item.id);
    }
  }

  // Gallery alt text
  const updateGallery = db.prepare('UPDATE gallery SET alt_en = ? WHERE id = ?');
  const photos = db.prepare('SELECT id, image, alt FROM gallery').all();
  for (const photo of photos) {
    const file = photo.image.split('/').pop();
    const altEn = galleryAltEn[file];
    if (altEn) updateGallery.run(altEn, photo.id);
  }

  console.log('i18n content verified.');
}

module.exports = { ensureI18n };
