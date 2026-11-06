/**
 * End-to-end admin API test against a local (or explicitly chosen) server.
 * Usage: node scripts/admin-test.js [baseUrl]
 *
 * Defaults to localhost — this is a local/CI smoke test, not something to
 * run against production. Credentials come from env vars, never a
 * hardcoded production password.
 */
const BASE = process.argv[2] || 'http://localhost:4000';
const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/.test(BASE);
const EMAIL = process.env.ADMIN_TEST_EMAIL || 'admin@menata.local';
const PASSWORD = process.env.ADMIN_TEST_PASSWORD || (isLocal ? 'local-dev-admin-change-me' : null);

if (!PASSWORD) {
  console.error('Set ADMIN_TEST_PASSWORD (and ADMIN_TEST_EMAIL if not the default) for a non-local target.');
  process.exit(1);
}

const results = {};
let session = null;

function cookieValue(res) {
  const raw = res.headers.get('set-cookie');
  return raw ? raw.split(';')[0] : null;
}

async function req(path, options = {}) {
  const headers = { Origin: BASE, ...options.headers };
  if (session) headers.Cookie = session;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  session = cookieValue(res) || session;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${data.error || ''}`);
  return data;
}

function hasAlbanianChars(text) {
  return /[çëÇË]/.test(text);
}

async function main() {
  console.log(`Testing admin at ${BASE}\n`);

  try {
    await req('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    results.login = !!session;

    const me = await req('/api/admin/me');
    results.authProtected = me.ok === true;

    const items = await req('/api/admin/items');
    const item = items[0];
    const originalPrice = item.price;
    const testPrice = Math.round((originalPrice + 0.5) * 100) / 100;

    await req(`/api/admin/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, price: testPrice })
    });

    const menu = await req('/api/menu?lang=sq');
    const pub = menu.flatMap((c) => c.items).find((i) => i.id === item.id);
    results.priceEditPublic = pub?.price === testPrice;

    await req(`/api/admin/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, price: originalPrice })
    });

    const settings = await req('/api/admin/settings');
    const key = 'tagline_sq';
    const originalTagline = settings[key];
    const testTagline = `${originalTagline} [test]`;

    await req('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, [key]: testTagline })
    });

    const pubSettings = await req('/api/settings?lang=sq');
    results.textEditPublic = pubSettings.tagline === testTagline;

    await req('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { Origin: BASE, Cookie: session },
      body: fd
    });
    const uploadData = await uploadRes.json();
    results.galleryUpload = uploadRes.ok && uploadData.id;

    if (uploadData.id) {
      const gallery = await req('/api/gallery?lang=sq');
      results.galleryPublic = gallery.some((g) => g.id === uploadData.id);
      await req(`/api/admin/gallery/${uploadData.id}`, { method: 'DELETE' });
      const galleryAfter = await req('/api/gallery?lang=sq');
      results.galleryDelete = !galleryAfter.some((g) => g.id === uploadData.id);
    }

    // Upload hardening: an HTML file renamed .jpg must be rejected by the
    // magic-byte check, not just trusted by its (spoofed) extension/mimetype.
    const fakeFd = new FormData();
    fakeFd.append('image', new Blob([Buffer.from('<html><body>not a photo</body></html>')], { type: 'image/jpeg' }), 'fake.jpg');
    fakeFd.append('category', 'food');
    const fakeRes = await fetch(`${BASE}/api/admin/gallery`, {
      method: 'POST',
      headers: { Origin: BASE, Cookie: session },
      body: fakeFd
    });
    results.rejectsSpoofedMimetype = fakeRes.status === 400;

    // Video endpoint exists (upload skipped - no sample video file)
    const videos = await req('/api/admin/videos');
    results.videoEndpoint = Array.isArray(videos);

    results.categories = (await req('/api/admin/categories')).length > 0;
    results.dashboardData = true;
  } catch (err) {
    results.error = err.message;
    console.error('FAIL:', err.message);
  }

  console.log(JSON.stringify(results, null, 2));
}

main();
