export function apiUrl(path, lang) {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}lang=${lang}`;
}

export async function apiGet(path, lang) {
  const res = await fetch(apiUrl(path, lang));
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem('menata-admin-token');
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(`/api/admin${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gabim.');
  return data;
}
