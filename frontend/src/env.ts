/** Vite injects these at build time. See `frontend/.env.example`. */

function trimTrailingSlash(s: string): string {
  return s.replace(/\/$/, '')
}

/**
 * REST API origin (no trailing slash).
 * Prefer `VITE_API_BASE_URL`; `VITE_API_URL` is an alias for hosts like Vercel where you set one “API URL” var.
 */
export function getApiBase(): string {
  const raw =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    import.meta.env.VITE_API_URL?.trim()
  if (!raw) {
    throw new Error('Set VITE_API_BASE_URL or VITE_API_URL (REST origin, no trailing slash)')
  }
  return trimTrailingSlash(raw)
}

/**
 * WebSocket URL for vehicle state. If `VITE_WS_URL` is unset, derives
 * `ws(s)://<host>/ws/vehicle` from the API origin (same host as REST, path ignored).
 * Override `VITE_WS_URL` when WS is on a different host or path than this rule.
 */
export function getVehicleWsUrl(): string {
  const explicit = import.meta.env.VITE_WS_URL?.trim()
  if (explicit) return explicit

  const base = getApiBase()
  const u = new URL(base)
  const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${u.host}/ws/vehicle`
}
