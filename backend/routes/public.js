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
      name: pick(item, 'name', l),
      description: pick(item, 'description', l) || null,
      price: item.price,
      image: item.image
    });
    return m;
  }, {});

  res.json(
    categories.map((c) => ({
      id: c.id,
      name: pick(c, 'name', l),
      type: c.type,
      note: pick(c, 'note', l) || null,
      items: byCat[c.id] || []
    }))
  );
});

router.get('/gallery', (req, res) => {
  const l = lang(req);
  const rows = db.prepare('SELECT * FROM gallery ORDER BY sort, id').all();
  res.json(
    rows.map((p) => ({
      id: p.id,
      image: p.image,
      thumb: p.thumb,
      category: p.category,
      alt: pick(p, 'alt', l) || 'Taverna Menata'
    }))
  );
});

router.get('/videos', (req, res) => {
  const l = lang(req);
  const rows = db.prepare('SELECT * FROM videos ORDER BY sort, id').all();
  res.json(
    rows.map((v) => ({
      id: v.id,
      src: v.src,
      thumb: v.thumb,
      category: v.category,
      title: pick(v, 'title', l) || ''
    }))
  );
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
    drinks_note: localized(raw, 'drinks_note', l)
  };

  res.json(out);
});

module.exports = router;
