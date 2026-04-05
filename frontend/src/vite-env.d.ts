/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** REST API origin; no trailing slash */
  readonly VITE_API_BASE_URL?: string
  /** Alias for `VITE_API_BASE_URL` (e.g. single var on Vercel) */
  readonly VITE_API_URL?: string
  /** Full `ws(s)://…/ws/vehicle` URL; if omitted, derived from API origin */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
