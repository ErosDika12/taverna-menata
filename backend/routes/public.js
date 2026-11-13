const { Router } = require('express');
const db = require('../db');

const router = Router();

function lang(req) {
  return req.query.lang === 'en' ? 'en' : 'sq';
}

function pick(row, field, l) {
  if (l === 'en') {
    const v = row[`${field}_en`];
    return v != null && String(v).trim() !== '' ? v : '';
  }
  return row[field] || '';
}

// Product/category names must never be blank: if the English name is missing,
// fall back to the original Albanian/base name (traditional dish and brand
// names are intentionally left untranslated).
function pickName(row, l) {
  if (l === 'en') {
    const v = row.name_en;
    if (v != null && String(v).trim() !== '') return v;
  }
  return row.name || '';
}

function localized(raw, base, l) {
  const suffix = l === 'en' ? '_en' : '_sq';
  const val = raw[`${base}${suffix}`];
  if (val != null && String(val).trim() !== '') return val;
  if (l === 'sq' && raw[base]) return raw[base];
  return '';
}

router.get('/menu', (req, res) => {
  const l = lang(req);
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort, id').all();
  const items = db.prepare('SELECT * FROM items ORDER BY sort, id').all();
  const byCat = items.reduce((m, item) => {
    if (!item.available) return m;
    (m[item.category_id] = m[item.category_id] || []).push({
      id: item.id,
      category_id: item.category_id,
      name: pickName(item, l),
      description: pick(item, 'description', l) || null,
      price: item.price,
      image: item.image
    });
    return m;
  }, {});

  res.json(
    categories.map((c) => ({
      id: c.id,
      name: pickName(c, l),
      type: c.type,
      note: pick(c, 'note', l) || null,
      items: byCat[c.id] || []
    }))
  );
});

function parseVariants(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function photoRow(p, l) {
  return {
    id: p.id,
    type: 'photo',
    image: p.image,
    thumb: p.thumb,
    orientation: p.orientation || null,
    width: p.width || null,
    height: p.height || null,
    variants: parseVariants(p.variants),
    category: p.category,
    created_at: p.created_at,
    alt: pick(p, 'alt', l) || 'Taverna Menata'
  };
}

function videoRow(v, l) {
  return {
    id: v.id,
    type: 'video',
    src: v.src,
    thumb: v.thumb,
    poster: v.thumb,
    category: v.category,
    created_at: v.created_at,
    title: pick(v, 'title', l) || ''
  };
}

router.get('/gallery', (req, res) => {
  const l = lang(req);
  const rows = db.prepare('SELECT * FROM gallery ORDER BY created_at, sort, id').all();
  res.json(rows.map((p) => photoRow(p, l)));
});

router.get('/videos', (req, res) => {
  const l = lang(req);
  const rows = db.prepare('SELECT * FROM videos ORDER BY created_at, sort, id').all();
  res.json(rows.map((v) => videoRow(v, l)));
});

/**
 * One chronological feed of photos and videos, newest first. `created_at` is
 * the persistent ordering key, so media type never decides the position and a
 * fresh upload appears at the top on its own. Ties break deterministically.
 */
router.get('/media', (req, res) => {
  const l = lang(req);
  const photos = db.prepare('SELECT * FROM gallery').all().map((p) => photoRow(p, l));
  const videos = db.prepare('SELECT * FROM videos').all().map((v) => videoRow(v, l));
  const media = [...photos, ...videos].sort((a, b) => {
    const at = (b.created_at ?? 0) - (a.created_at ?? 0);
    if (at !== 0) return at;
    if (a.id !== b.id) return b.id - a.id;
    if (a.type === b.type) return 0;
    return a.type === 'photo' ? -1 : 1;
  });
  res.json(media);
});

router.get('/settings', (req, res) => {
  const l = lang(req);
  const rows = db.prepare("SELECT key, value FROM settings WHERE key NOT LIKE 'admin_%'").all();
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const out = {
    site_name: localized(raw, 'site_name', l) || (l === 'en' ? 'Tavern Menata' : 'Taverna Menata'),
    phone: raw.phone,
    whatsapp: raw.whatsapp,
    instagram: raw.instagram,
    facebook: raw.facebook,
    address: localized(raw, 'address', l),
    maps_url: raw.maps_url,
    hero_image: raw.hero_image,
    tagline: localized(raw, 'tagline', l),
    home_intro: localized(raw, 'home_intro', l),
    about_text: localized(raw, 'about_text', l),
    hours: localized(raw, 'hours', l),
    drinks_note: localized(raw, 'drinks_note', l),
    review_url: raw.review_url || raw.maps_url
  };

  res.json(out);
});

module.exports = router;
