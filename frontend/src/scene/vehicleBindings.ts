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
