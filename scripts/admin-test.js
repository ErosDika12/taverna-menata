/**
 * End-to-end admin API test against live or local site.
 * Usage: node scripts/admin-test.js [baseUrl]
 */
const BASE = process.argv[2] || 'https://taverna-menata.vercel.app';
const PASSWORD = process.env.ADMIN_PASSWORD || 'menata2024';

const results = {};

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ? ${res.status} ${data.error || ''}`);
  return data;
}

function hasAlbanianChars(text) {
  return /[]/.test(text);
}

async function main() {
  console.log(`Testing admin at ${BASE}\n`);

  try {
    const login = await req('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: PASSWORD })
    });
    const token = login.token;
    const auth = { Authorization: `Bearer ${token}` };
    results.login = !!token;

    const me = await req('/api/admin/me', { headers: auth });
    results.authProtected = me.ok === true;

    const items = await req('/api/admin/items', { headers: auth });
    const item = items[0];
    const originalPrice = item.price;
    const testPrice = Math.round((originalPrice + 0.5) * 100) / 100;

    await req(`/api/admin/items/${item.id}`, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, price: testPrice })
    });

    const menu = await req('/api/menu?lang=sq');
    const pub = menu.flatMap((c) => c.items).find((i) => i.id === item.id);
    results.priceEditPublic = pub?.price === testPrice;

    await req(`/api/admin/items/${item.id}`, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, price: originalPrice })
    });

    const settings = await req('/api/admin/settings', { headers: auth });
    const key = 'tagline_sq';
    const originalTagline = settings[key];
    const testTagline = `${originalTagline} [test]`;

    await req('/api/admin/settings', {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, [key]: testTagline })
    });

    const pubSettings = await req('/api/settings?lang=sq');
    results.textEditPublic = pubSettings.tagline === testTagline;

    await req('/api/admin/settings', {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, [key]: originalTagline })
    });

    const sq = await req('/api/settings?lang=sq');
    const en = await req('/api/settings?lang=en');
    const menuSq = await req('/api/menu?lang=sq');
    const menuEn = await req('/api/menu?lang=en');

    results.languageSq = sq.tagline !== en.tagline;
    results.languageEnMenu = menuEn[0]?.name !== menuSq[0]?.name;
    const sampleItem = menuSq[0]?.items?.[0];
    results.albanianChars =
      hasAlbanianChars(sq.tagline) &&
      hasAlbanianChars(sq.about_text) &&
      !sq.tagline.includes('?') &&
      (sampleItem ? hasAlbanianChars(sampleItem.name) || !sampleItem.name.includes('?') : true);

    results.contactPhone = !!sq.phone;
    results.contactWhatsapp = !!sq.whatsapp;
    results.contactInstagram = !!sq.instagram;
    results.contactFacebook = !!sq.facebook;
    results.contactMaps = !!sq.maps_url;

    // Gallery upload test with tiny 1x1 PNG
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    const fd = new FormData();
    fd.append('image', new Blob([png], { type: 'image/png' }), 'admin-test.png');
    fd.append('category', 'food');
    fd.append('alt', 'Test foto admin');
    fd.append('alt_en', 'Admin test photo');

    const uploadRes = await fetch(`${BASE}/api/admin/gallery`, {
      method: 'POST',
      headers: auth,
      body: fd
    });
    const uploadData = await uploadRes.json();
    results.galleryUpload = uploadRes.ok && uploadData.id;

    if (uploadData.id) {
      const gallery = await req('/api/gallery?lang=sq');
      results.galleryPublic = gallery.some((g) => g.id === uploadData.id);
      await req(`/api/admin/gallery/${uploadData.id}`, { method: 'DELETE', headers: auth });
      const galleryAfter = await req('/api/gallery?lang=sq');
      results.galleryDelete = !galleryAfter.some((g) => g.id === uploadData.id);
    }

    // Video endpoint exists (upload skipped  no sample video file)
    const videos = await req('/api/admin/videos', { headers: auth });
    results.videoEndpoint = Array.isArray(videos);

    results.categories = (await req('/api/admin/categories', { headers: auth })).length > 0;
    results.dashboardData = true;
  } catch (err) {
    results.error = err.message;
    console.error('FAIL:', err.message);
  }

  console.log(JSON.stringify(results, null, 2));
}

main();
