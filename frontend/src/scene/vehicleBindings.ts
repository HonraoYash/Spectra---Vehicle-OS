/**
 * Draft mesh → feature bindings for the BMW 430i GLB.
 * Source of truth for names: `public/models/bmw_430i.manifest.json` (inspect via `backend/scripts/inspect_glb.py`).
 */

import manifest from '../../public/models/bmw_430i.manifest.json'

export type VehicleManifest = {
  modelFile: string
  notes?: string
  paintMeshes: string[]
  brakeLightMeshes: string[]
  headlightMeshes: string[]
  paintPaletteLabels: string[]
}

export const vehicleManifest = manifest as VehicleManifest

export const MODEL_URL = `/models/${vehicleManifest.modelFile}`

/** Three.js hex colors — Phase 4 wires these to materials. */
export const PAINT_PALETTE = [
  0x0a0a0c, // Phantom Black
  0x1e3a5f, // Metallic Blue
  0xe8e8e8, // Alpine White
  0x6b6d70, // Mineral Gray
] as const

export const PAINT_LABELS = vehicleManifest.paintPaletteLabels.slice(0, PAINT_PALETTE.length)

/** Emissive + aux light tuning (Phase 4). */
export const EMISSIVE_LERP_SPEED = 12

export const HEADLIGHT_EMISSIVE_HEX = 0xfff2dd as const
export const HEADLIGHT_EMISSIVE_INTENSITY_ON = 2.35

export const BRAKE_EMISSIVE_HEX = 0xff2828 as const
export const BRAKE_EMISSIVE_INTENSITY_ON = 3.1

/**
 * Model-local auxiliary spots (nose toward +Z). Intensity scaled by smoothed headlight factor in scene.
 */
export const AUX_HEADLIGHT_SPOTS = [
  {
    position: [0.78, 0.52, 1.92] as const,
    intensityScale: 1,
    angle: 0.52,
    penumbra: 0.52,
    distance: 15,
    color: '#fff4e8' as const,
  },
  {
    position: [-0.78, 0.52, 1.92] as const,
    intensityScale: 1,
    angle: 0.52,
    penumbra: 0.52,
    distance: 15,
    color: '#fff4e8' as const,
  },
] as const

/** Rear glow in model space (tail toward -Z). */
export const AUX_BRAKE_POINT = {
  position: [0, 0.72, -2.08] as const,
  intensityScale: 1,
  distance: 5.5,
  decay: 2,
  color: '#ff5555' as const,
} as const

const nameSet = (names: readonly string[]) => new Set(names)

const paintNames = nameSet(vehicleManifest.paintMeshes)
const brakeNames = nameSet(vehicleManifest.brakeLightMeshes)
const headlightNames = nameSet(vehicleManifest.headlightMeshes)

/** Any glTF mesh object with a `name` (Three.js Mesh compatible). */
export type NamedMesh = { name: string }

export function meshRole(mesh: NamedMesh): 'paint' | 'brake' | 'headlight' | null {
  const n = mesh.name
  if (paintNames.has(n)) return 'paint'
  if (brakeNames.has(n)) return 'brake'
  if (headlightNames.has(n)) return 'headlight'
  return null
}

export function isPaintMesh(mesh: NamedMesh): boolean {
  return meshRole(mesh) === 'paint'
}

export function isBrakeLightMesh(mesh: NamedMesh): boolean {
  return meshRole(mesh) === 'brake'
}

export function isHeadlightMesh(mesh: NamedMesh): boolean {
  return meshRole(mesh) === 'headlight'
}
