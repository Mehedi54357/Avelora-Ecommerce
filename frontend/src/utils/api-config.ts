/**
 * AVELORA Frontend API Configuration
 * 
 * In development: defaults to http://localhost:3001
 * In production: reads from NEXT_PUBLIC_API_URL (e.g., https://api.avelora.com)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== ''
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
    : 'http://localhost:3001';

/**
 * Helper to construct full API endpoint URLs
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Get headers including Authorization Bearer token from localStorage
 */
export function getAuthHeaders(customHeaders: HeadersInit = {}): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: Record<string, string> = {};
  if (customHeaders instanceof Headers) {
    customHeaders.forEach((val, key) => {
      headers[key] = val;
    });
  } else if (Array.isArray(customHeaders)) {
    customHeaders.forEach(([key, val]) => {
      headers[key] = val;
    });
  } else if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Universal authenticated fetch helper for admin API requests
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}
