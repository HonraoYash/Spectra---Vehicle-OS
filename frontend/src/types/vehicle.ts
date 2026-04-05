/** Mirrors backend `app.schemas` — keep in sync on schema changes. */

export interface VehicleState {
  headlights_on: boolean
  brake_lights_on: boolean
  paint_index: number
}

/** Matches `VehicleState` defaults in `app.schemas` when WebSocket has not delivered yet. */
export const DEFAULT_VEHICLE_STATE: VehicleState = {
  headlights_on: false,
  brake_lights_on: false,
  paint_index: 0,
}

export function resolveVehicleState(state: VehicleState | null): VehicleState {
  return state ?? DEFAULT_VEHICLE_STATE
}

export interface HeadlightsPatch {
  on: boolean
}

export interface BrakeLightsPatch {
  on: boolean
}

export interface PaintPatch {
  index: number
}

export interface VehicleStateMessage {
  type: 'vehicle_state'
  data: VehicleState
}

export function isVehicleStateMessage(v: unknown): v is VehicleStateMessage {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return o.type === 'vehicle_state' && o.data !== null && typeof o.data === 'object'
}
