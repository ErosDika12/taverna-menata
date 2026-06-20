export function apiUrl(path, lang) {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}lang=${lang}`;
}

export async function apiGet(path, lang) {
  const res = await fetch(apiUrl(path, lang));
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export function handleAdminAuthFailure() {
  localStorage.removeItem('menata-admin-token');
  if (!window.location.pathname.startsWith('/admin/login')) {
    window.location.assign('/admin/login');
  }
}

export function adminAuthHeaders(extra = {}) {
  const token = localStorage.getItem('menata-admin-token');
  const headers = { ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function adminFetch(path, options = {}) {
  const headers = adminAuthHeaders({ ...options.headers });
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(`/api/admin${path}`, { ...options, headers });
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
    headers: adminAuthHeaders(),
    body: formData
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleAdminAuthFailure();
    throw new Error('LOGIN_REQUIRED');
  }
  if (!res.ok) throw new Error(data.error || 'Gabim.');
  return data;
}
