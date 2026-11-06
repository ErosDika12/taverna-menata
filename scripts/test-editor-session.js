/**
 * Regression test for the REMOVED token-based admin recreation behavior.
 *
 * Before remediation, a signed token could recreate a deleted admin row
 * (syncAdminFromToken) — a dangerous trust model where the token itself was
 * authoritative for account existence. This test asserts the opposite: once
 * the admins row is gone, the still-correctly-signed session must be
 * rejected with 401, never quietly honored.
 *
 * Usage: node scripts/test-editor-session.js
 * Requires a local server on API_BASE (default http://localhost:4007).
 */
const BASE = process.env.API_BASE || 'http://localhost:4007';
const EMAIL = process.env.ADMIN_TEST_EMAIL || 'admin@menata.local';
const PASSWORD = process.env.ADMIN_TEST_PASSWORD || 'local-dev-admin-change-me';

function cookieValue(res) {
  const raw = res.headers.get('set-cookie');
  return raw ? raw.split(';')[0] : null;
}

async function req(path, { method = 'GET', session, body } = {}) {
  const headers = { 'Content-Type': 'application/json', Origin: BASE };
  if (session) headers.Cookie = session;
  const res = await fetch(`${BASE}/api/admin${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, session: cookieValue(res) || session };
}

async function run() {
  const main = await req('/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  if (main.status !== 200) throw new Error(`Main login failed: ${main.data.error}`);
  const mainSession = main.session;

  const email = `editor-${Date.now()}@test.local`;
  const pw = 'editor123456';
  const created = await req('/admins', {
    method: 'POST',
    session: mainSession,
    body: { email, name: 'Editor Test', password: pw }
  });
  if (created.status !== 200) throw new Error(`Create editor failed: ${created.data.error}`);
  const editorId = created.data.id;

  const editor = await req('/login', { method: 'POST', body: { email, password: pw } });
  if (editor.status !== 200) throw new Error('Editor login failed');
  const editorSession = editor.session;

  const me1 = await req('/me', { session: editorSession });
  if (me1.status !== 200) throw new Error('Editor session should work before deletion');

  // eslint-disable-next-line global-require
  const db = require('../backend/db');
  db.prepare('DELETE FROM admins WHERE id = ?').run(editorId);

  const me2 = await req('/me', { session: editorSession });
  if (me2.status !== 401) {
    throw new Error(
      `SEC-004 REGRESSION: /me returned ${me2.status} after the admin row was deleted — ` +
      'a token must never recreate or revive an account.'
    );
  }
  console.log('OK: session is rejected (401) once its admin row is deleted — no token-based recreation.');

  console.log('\n=== TOKEN-RECREATION REGRESSION TEST PASSED (SEC-004 stays closed) ===\n');
}

run().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
