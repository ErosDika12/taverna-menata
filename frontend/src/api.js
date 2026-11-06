export function apiUrl(path, lang) {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}lang=${lang}`;
}

export async function apiGet(path, lang) {
  const res = await fetch(apiUrl(path, lang));
  if (!res.ok) throw new Error('API error');
  return res.json();
}

// The admin session lives only in an HttpOnly, SameSite=Strict cookie set by
// the server on login — it is never readable by JavaScript, so there is no
// token for this code to hold or attach. `credentials: 'include'` is what
// makes the browser send that cookie on same-origin admin requests.
export function handleAdminAuthFailure() {
  if (!window.location.pathname.startsWith('/admin/login')) {
    window.location.assign('/admin/login');
  }
}

export async function adminFetch(path, options = {}) {
  const headers = { ...options.headers };
  const body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`/api/admin${path}`, { ...options, headers, credentials: 'same-origin' });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleAdminAuthFailure();
    throw new Error('LOGIN_REQUIRED');
  }
  if (!res.ok) throw new Error(data.error || 'Gabim.');
  return data;
}

export async function adminUpload(path, formData) {
  const res = await fetch(`/api/admin${path}`, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleAdminAuthFailure();
    throw new Error('LOGIN_REQUIRED');
  }
  if (!res.ok) throw new Error(data.error || 'Gabim.');
  return data;
}
