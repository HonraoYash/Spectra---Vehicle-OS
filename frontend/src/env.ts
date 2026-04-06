/** Vite injects these at build time. See `frontend/.env.example`. */

function trimTrailingSlash(s: string): string {
  return s.replace(/\/$/, '')
}

/**
 * REST API origin (no trailing slash).
 * If unset, uses same-origin relative URLs (`/api/...`) — use with Vercel rewrites or the Vite dev proxy.
 */
export function getApiBase(): string {
  const raw =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    import.meta.env.VITE_API_URL?.trim()
  if (!raw) return ''
  return trimTrailingSlash(raw)
}

/**
 * WebSocket URL for vehicle state.
 * - Prefer explicit `VITE_WS_URL` (required when REST is same-origin via a proxy).
 * - Otherwise derives `ws(s)://<api-host>/ws/vehicle` from `VITE_API_BASE_URL` / `VITE_API_URL`.
 */
export function getVehicleWsUrl(): string {
  const explicit = import.meta.env.VITE_WS_URL?.trim()
  if (explicit) return explicit

  const apiOrigin =
    import.meta.env.VITE_API_BASE_URL?.trim() || import.meta.env.VITE_API_URL?.trim()
  if (!apiOrigin) {
    throw new Error(
      'Set VITE_WS_URL (e.g. wss://your-api.onrender.com/ws/vehicle) when REST uses same-origin /api',
    )
  }
  const u = new URL(trimTrailingSlash(apiOrigin))
  const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${u.host}/ws/vehicle`
}
