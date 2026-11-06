/**
 * Full admin UI + API verification (local or live).
 * Usage: node scripts/verify-admin-ui.mjs [baseUrl]
 *
 * Credentials come from ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD. There is no
 * hardcoded production password here — against localhost, this defaults to
 * the same local-dev placeholder backend/db.js uses when ADMIN_PASSWORD is
 * unset; against anything else, you must supply real env vars yourself.
 */
const BASE = process.argv[2] || 'http://localhost:4000';
const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/.test(BASE);
const EMAIL = process.env.ADMIN_TEST_EMAIL || 'admin@menata.local';
const PASSWORD = process.env.ADMIN_TEST_PASSWORD || (isLocal ? 'local-dev-admin-change-me' : null);

if (!PASSWORD) {
  console.error('Set ADMIN_TEST_PASSWORD (and ADMIN_TEST_EMAIL if not the default) for a non-local target.');
  process.exit(1);
}

function cookieValue(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return null;
  return raw.split(';')[0];
}

async function req(path, { method = 'GET', session, body } = {}) {
  const headers = { 'Content-Type': 'application/json', Origin: BASE };
  if (session) headers.Cookie = session;
  const res = await fetch(`${BASE}/api/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, session: cookieValue(res) || session };
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
    body: { email: EMAIL, password: PASSWORD }
  });
  if (main.status !== 200) fail('Main Admin login', main.data.error);
  if (main.data.admin?.role !== 'main_admin') fail('Main Admin role', main.data.admin?.role);
  if (!main.session) fail('Main Admin login should set a session cookie');
  pass('Main Admin login');
  const mainSession = main.session;

  const me = await req('/me', { session: mainSession });
  if (!me.data.admin?.role) fail('/me returns admin.role');
  pass('Main Admin /me returns role');

  const admins = await req('/admins', { session: mainSession });
  if (admins.status !== 200 || !Array.isArray(admins.data)) fail('Admins list API');
  pass('Admins API accessible to Main Admin');

  const notifs = await req('/notifications', { session: mainSession });
  if (notifs.status !== 200) fail('Notifications API');
  pass('Notifications API accessible to Main Admin');

  const activity = await req('/activity', { session: mainSession });
  if (activity.status !== 200) fail('Activity log API');
  pass('Activity log API accessible to Main Admin');

  const settings = await req('/settings', { session: mainSession });
  if (settings.status !== 200) fail('Settings read API');
  pass('Settings API accessible');

  const pw = await req('/password', {
    method: 'PUT',
    session: mainSession,
    body: { current: 'wrong', next: 'newpass123456' }
  });
  if (pw.status !== 401) fail('Password change should validate current password');
  pass('Settings password endpoint protected (validates password)');

  // Unauthenticated / malformed-session checks
  const noAuth = await req('/admins');
  if (noAuth.status !== 401) fail('Unauthenticated /admins should 401', noAuth.status);
  pass('Unauthenticated admin routes return 401');

  const garbage = await req('/me', { session: 'menata_admin_session=not.a.valid.token' });
  if (garbage.status !== 401) fail('Garbage session should 401', garbage.status);
  pass('Malformed/garbage session rejected');

  // Create editor
  const editorEmail = `editor-${Date.now()}@test.local`;
  const editorPw = 'editor123456';
  const created = await req('/admins', {
    method: 'POST',
    session: mainSession,
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
  const editorSession = editor.session;

  // Editor restrictions
  const blockedAdmins = await req('/admins', { session: editorSession });
  if (blockedAdmins.status !== 403) fail('Editor should be blocked from /admins');
  pass('Editor blocked from Admins API');

  const blockedPw = await req('/password', {
    method: 'PUT',
    session: editorSession,
    body: { current: editorPw, next: 'newpass123456' }
  });
  if (blockedPw.status !== 403) fail('Editor should be blocked from Settings/password');
  pass('Editor blocked from Settings API');

  const blockedNotifs = await req('/notifications', { session: editorSession });
  if (blockedNotifs.status !== 403) fail('Editor should be blocked from notifications');
  pass('Editor blocked from Notifications API');

  // Role-escalation attempt: tampering the body must not grant main_admin.
  const escalate = await req(`/admins/${editorId}/activate`, { method: 'PUT', session: editorSession, body: { role: 'main_admin' } });
  if (escalate.status !== 403) fail('Editor sending role:main_admin must still 403', escalate.status);
  pass('Role escalation via request body rejected');

  // Editor can edit content
  const items = await req('/items', { session: editorSession });
  if (items.status !== 200 || !items.data.length) fail('Editor menu access');
  const item = items.data[0];
  const testName = `Test Dish ${Date.now()}`;
  const updated = await req(`/items/${item.id}`, {
    method: 'PUT',
    session: editorSession,
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
  const notifsAfter = await req('/notifications', { session: mainSession });
  const notification = notifsAfter.data.find((n) => n.message?.includes(editorEmail));
  if (!notification) fail('Main Admin should receive editor notification');
  pass(`Notification received: "${notification.message}"`);

  // Suspend editor -> existing editor session must stop working immediately
  const suspended = await req(`/admins/${editorId}/suspend`, { method: 'PUT', session: mainSession });
  if (suspended.status !== 200) fail('Suspend editor');
  pass('Suspend Website Editor');

  const afterSuspend = await req('/items', { session: editorSession });
  if (afterSuspend.status !== 401) fail('Suspended editor session must be rejected', afterSuspend.status);
  pass('Suspended admin session rejected (401)');

  // Delete editor
  const deleted = await req(`/admins/${editorId}`, { method: 'DELETE', session: mainSession });
  if (deleted.status !== 200) fail('Delete editor');
  pass('Delete Website Editor');

  // Main cannot suspend self
  const selfId = me.data.admin.id;
  const selfSuspend = await req(`/admins/${selfId}/suspend`, { method: 'PUT', session: mainSession });
  if (selfSuspend.status !== 403) fail('Main Admin must not be suspendable');
  pass('Main Admin cannot suspend itself');

  // Restore item name
  await req(`/items/${item.id}`, {
    method: 'PUT',
    session: mainSession,
    body: { ...item, name: item.name }
  });

  console.log('\n=== ALL CHECKS PASSED ===\n');
}

run().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
