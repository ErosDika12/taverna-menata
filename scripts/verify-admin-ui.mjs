/**
 * Full admin UI + API verification (local or live).
 * Usage: node scripts/verify-admin-ui.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:4000';

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function pass(label) {
  console.log(`  ? ${label}`);
}

function fail(label, detail) {
  console.log(`  ? ${label}${detail ? `: ${detail}` : ''}`);
  throw new Error(label);
}

async function run() {
  console.log(`\nVerifying admin system at ${BASE}\n`);

  // Main Admin login
  const main = await req('/login', {
    method: 'POST',
    body: { email: 'admin@menata.local', password: 'menata2024' }
  });
  if (main.status !== 200) fail('Main Admin login', main.data.error);
  if (main.data.admin?.role !== 'main_admin') fail('Main Admin role', main.data.admin?.role);
  pass('Main Admin login (admin@menata.local / menata2024)');
  const mainToken = main.data.token;

  const me = await req('/me', { token: mainToken });
  if (!me.data.admin?.role) fail('/me returns admin.role');
  pass('Main Admin /me returns role');

  const admins = await req('/admins', { token: mainToken });
  if (admins.status !== 200 || !Array.isArray(admins.data)) fail('Admins list API');
  pass('Admins API accessible to Main Admin');

  const notifs = await req('/notifications', { token: mainToken });
  if (notifs.status !== 200) fail('Notifications API');
  pass('Notifications API accessible to Main Admin');

  const activity = await req('/activity', { token: mainToken });
  if (activity.status !== 200) fail('Activity log API');
  pass('Activity log API accessible to Main Admin');

  const settings = await req('/settings', { token: mainToken });
  if (settings.status !== 200) fail('Settings read API');
  pass('Settings API accessible');

  const pw = await req('/password', {
    method: 'PUT',
    token: mainToken,
    body: { current: 'wrong', next: 'newpass123' }
  });
  if (pw.status !== 401) fail('Password change should validate current password');
  pass('Settings password endpoint protected (validates password)');

  // Create editor
  const editorEmail = `editor-${Date.now()}@test.local`;
  const editorPw = 'editor123456';
  const created = await req('/admins', {
    method: 'POST',
    token: mainToken,
    body: { email: editorEmail, name: 'UI Test Editor', password: editorPw }
  });
  if (created.status !== 200) fail('Create editor', created.data.error);
  const editorId = created.data.id;
  pass('Create Website Editor');

  // Editor login
  const editor = await req('/login', {
    method: 'POST',
    body: { email: editorEmail, password: editorPw }
  });
  if (editor.status !== 200) fail('Editor login');
  if (editor.data.admin?.role !== 'website_editor') fail('Editor role');
  pass('Website Editor login with separate account');
  const editorToken = editor.data.token;

  // Editor restrictions
  const blockedAdmins = await req('/admins', { token: editorToken });
  if (blockedAdmins.status !== 403) fail('Editor should be blocked from /admins');
  pass('Editor blocked from Admins API');

  const blockedPw = await req('/password', {
    method: 'PUT',
    token: editorToken,
    body: { current: editorPw, next: 'newpass123' }
  });
  if (blockedPw.status !== 403) fail('Editor should be blocked from Settings/password');
  pass('Editor blocked from Settings API');

  const blockedNotifs = await req('/notifications', { token: editorToken });
  if (blockedNotifs.status !== 403) fail('Editor should be blocked from notifications');
  pass('Editor blocked from Notifications API');

  // Editor can edit content
  const items = await req('/items', { token: editorToken });
  if (items.status !== 200 || !items.data.length) fail('Editor menu access');
  const item = items.data[0];
  const testName = `Test Dish ${Date.now()}`;
  const updated = await req(`/items/${item.id}`, {
    method: 'PUT',
    token: editorToken,
    body: { ...item, name: testName }
  });
  if (updated.status !== 200) fail('Editor menu edit');
  pass('Website Editor can edit menu content');

  // Public website reflects change
  const pubMenu = await fetch(`${BASE}/api/menu?lang=sq`).then((r) => r.json());
  const pubItem = pubMenu.flatMap((c) => c.items).find((i) => i.id === item.id);
  if (pubItem?.name !== testName) fail('Public menu should show saved change', pubItem?.name);
  pass('Public website shows admin menu changes immediately');

  // Notification to main admin
  const notifsAfter = await req('/notifications', { token: mainToken });
  const notification = notifsAfter.data.find((n) => n.message?.includes(editorEmail));
  if (!notification) fail('Main Admin should receive editor notification');
  pass(`Notification received: "${notification.message}"`);

  // Suspend editor
  const suspended = await req(`/admins/${editorId}/suspend`, { method: 'PUT', token: mainToken });
  if (suspended.status !== 200) fail('Suspend editor');
  pass('Suspend Website Editor');

  // Delete editor
  const deleted = await req(`/admins/${editorId}`, { method: 'DELETE', token: mainToken });
  if (deleted.status !== 200) fail('Delete editor');
  pass('Delete Website Editor');

  // Main cannot suspend self
  const selfId = me.data.admin.id;
  const selfSuspend = await req(`/admins/${selfId}/suspend`, { method: 'PUT', token: mainToken });
  if (selfSuspend.status !== 403) fail('Main Admin must not be suspendable');
  pass('Main Admin cannot suspend itself');

  // Restore item name
  await req(`/items/${item.id}`, {
    method: 'PUT',
    token: mainToken,
    body: { ...item, name: item.name }
  });

  console.log('\n=== ALL CHECKS PASSED ===\n');
}

run().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
