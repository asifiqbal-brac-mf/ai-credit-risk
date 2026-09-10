// Shared JSON contract. Keep uncertain transition keys across page reloads.
export function clearSession() {
  for (const key of Object.keys(localStorage)) if (key.startsWith('geocredit.')) localStorage.removeItem(key);
  for (const key of Object.keys(sessionStorage)) if (key.startsWith('geocredit.')) sessionStorage.removeItem(key);
}
export async function request(apiBase, token, path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const body = options.body === undefined ? undefined : typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  let retrySlot;
  if (path.endsWith('/transitions') || path.includes('/assessments/')) {
    retrySlot = `geocredit.retry.${path}.${headers.get('If-Match')}.${body}`;
    const key = sessionStorage.getItem(retrySlot) || headers.get('Idempotency-Key') || `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(retrySlot, key);
    headers.set('Idempotency-Key', key);
  }
  const response = await fetch(`${apiBase}${path}`, { ...options, headers, body });
  const raw = await response.text();
  let payload;
  try { payload = JSON.parse(raw); } catch { throw new Error(`Server returned ${response.status}: expected JSON. Check the API service and proxy.`); }
  if (!response.ok) {
    if (retrySlot && response.status >= 400 && response.status < 500) sessionStorage.removeItem(retrySlot);
    const error = new Error(payload?.error?.message ?? payload?.message ?? `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'data')) throw new Error('Server response is missing data');
  if (retrySlot) sessionStorage.removeItem(retrySlot);
  return payload.data;
}
