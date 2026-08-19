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
