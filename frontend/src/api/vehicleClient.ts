import type {
  BrakeLightsPatch,
  HeadlightsPatch,
  PaintPatch,
  VehicleState,
} from '../types/vehicle'

export class VehicleApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'VehicleApiError'
    this.status = status
  }
}

function requireApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (!raw) {
    throw new Error('VITE_API_BASE_URL is not set')
  }
  return raw.replace(/\/$/, '')
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new VehicleApiError(res.status, text || res.statusText)
  }
  return res.json() as Promise<T>
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${requireApiBase()}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<T>(res)
}

/** Lightweight health probe for monitors and dev sanity checks. */
export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${requireApiBase()}/api/health`)
  return parseJson(res)
}

export async function getVehicleState(): Promise<VehicleState> {
  const res = await fetch(`${requireApiBase()}/api/vehicle`)
  return parseJson(res)
}

export function patchHeadlights(body: HeadlightsPatch): Promise<VehicleState> {
  return patchJson<VehicleState>('/api/vehicle/headlights', body)
}

export function patchBrakeLights(body: BrakeLightsPatch): Promise<VehicleState> {
  return patchJson<VehicleState>('/api/vehicle/brake-lights', body)
}

export function patchPaint(body: PaintPatch): Promise<VehicleState> {
  return patchJson<VehicleState>('/api/vehicle/paint', body)
}
