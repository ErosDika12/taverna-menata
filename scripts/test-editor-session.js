/**
 * Simulates Vercel serverless: editor exists at login, row missing on next request.
 */
const BASE = process.env.API_BASE || 'http://localhost:4007';

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api/admin${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  const main = await req('/login', {
    method: 'POST',
    body: { email: 'admin@menata.local', password: 'menata2024' }
  });
  if (main.status !== 200) throw new Error('Main login failed');

  const email = `editor-${Date.now()}@test.local`;
  const pw = 'editor123456';
  const created = await req('/admins', {
    method: 'POST',
    token: main.data.token,
    body: { email, name: 'Editor Test', password: pw }
  });
  if (created.status !== 200) throw new Error('Create editor failed');

  const editor = await req('/login', { method: 'POST', body: { email, password: pw } });
  if (editor.status !== 200) throw new Error('Editor login failed');
  const token = editor.data.token;

  const db = require('../backend/db');
  db.prepare('DELETE FROM admins WHERE email = ?').run(email);

  const me = await req('/me', { token });
  if (me.status !== 200 || me.data.admin?.role !== 'website_editor') {
    throw new Error(`/me failed after row delete: ${me.status}`);
  }
  console.log('OK /me works after admin row deleted (JWT fallback)');

  const items = await req('/items', { token });
  if (items.status !== 200 || !items.data.length) throw new Error('Cannot load items');
  const item = items.data[0];
  const save = await req(`/items/${item.id}`, {
    method: 'PUT',
    token,
    body: { ...item, name: `${item.name} X` }
  });
  if (save.status !== 200) throw new Error(`Save failed with ${save.status}: ${save.data.error}`);
  console.log('OK Editor can save after admin row deleted (JWT fallback)');

  db.prepare('DELETE FROM admins WHERE email = ?').run(email);
  await req(`/items/${item.id}`, { method: 'PUT', token: main.data.token, body: item });

  console.log('\n=== EDITOR SESSION FIX VERIFIED ===\n');
}

run().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
