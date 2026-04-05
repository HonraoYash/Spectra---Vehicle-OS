import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef } from 'react'
import {
  Color,
  type Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SpotLight,
  type Material,
} from 'three'
import type { VehicleState } from '../types/vehicle'
import {
  AUX_BRAKE_POINT,
  AUX_HEADLIGHT_SPOTS,
  BRAKE_EMISSIVE_HEX,
  BRAKE_EMISSIVE_INTENSITY_ON,
  EMISSIVE_LERP_SPEED,
  HEADLIGHT_EMISSIVE_HEX,
  HEADLIGHT_EMISSIVE_INTENSITY_ON,
  MODEL_URL,
  PAINT_PALETTE,
  meshRole,
} from './vehicleBindings'

function isMesh(o: object): o is Mesh {
  return (o as Mesh).isMesh === true
}

function isStdOrPhysical(m: object): m is MeshStandardMaterial | MeshPhysicalMaterial {
  return m instanceof MeshStandardMaterial || m instanceof MeshPhysicalMaterial
}

type BindBucket = {
  paint: (MeshStandardMaterial | MeshPhysicalMaterial)[]
  brake: (MeshStandardMaterial | MeshPhysicalMaterial)[]
  headlight: (MeshStandardMaterial | MeshPhysicalMaterial)[]
}

const CLONE_FLAG = 'spectraMaterialsCloned' as const

function prepareBindings(root: Object3D): BindBucket {
  const bucket: BindBucket = { paint: [], brake: [], headlight: [] }

  root.traverse((o) => {
    if (!isMesh(o)) return
    const role = meshRole(o)
    if (!role) return

    const raw = o.material
    const wasArray = Array.isArray(raw)
    let mats: Material[]

    if (o.userData[CLONE_FLAG]) {
      mats = wasArray ? (raw as Material[]) : [raw as Material]
    } else {
      const src = wasArray ? raw : [raw]
      const cloned = src.map((m) => m.clone())
      o.material = cloned.length === 1 && !wasArray ? cloned[0]! : cloned
      o.userData[CLONE_FLAG] = true
      mats = Array.isArray(o.material) ? (o.material as Material[]) : [o.material as Material]
    }

    for (const m of mats) {
      if (!isStdOrPhysical(m)) continue
      if (role === 'paint') bucket.paint.push(m)
      if (role === 'brake') {
        bucket.brake.push(m)
        m.emissive.setHex(BRAKE_EMISSIVE_HEX)
      }
      if (role === 'headlight') {
        bucket.headlight.push(m)
        m.emissive.setHex(HEADLIGHT_EMISSIVE_HEX)
      }
    }
  })

  return bucket
}

function clampPaintIndex(index: number): number {
  const n = PAINT_PALETTE.length
  const i = Math.floor(Number.isFinite(index) ? index : 0)
  return Math.max(0, Math.min(n - 1, i))
}

export type VehicleModelProps = Pick<VehicleState, 'headlights_on' | 'brake_lights_on' | 'paint_index'>

export function VehicleModel({ headlights_on, brake_lights_on, paint_index }: VehicleModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const bindRef = useRef<BindBucket | null>(null)
  const smoothRef = useRef({ headlights: 0, brakes: 0 })
  const headSpotRefs = useRef<(SpotLight | null)[]>([])
  const brakePointRef = useRef<PointLight | null>(null)
  const paintColorRef = useRef(new Color())

  useLayoutEffect(() => {
    bindRef.current = prepareBindings(scene)
    const b = bindRef.current
    const idx = clampPaintIndex(paint_index)
    paintColorRef.current.setHex(PAINT_PALETTE[idx])
    b.paint.forEach((m) => m.color.copy(paintColorRef.current))
  }, [scene])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    scene.traverse((obj) => {
      if (!isMesh(obj)) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      const matNames = mats.map((m) => ('name' in m ? String(m.name) : '(unnamed)'))
      console.log('[VehicleModel] mesh:', obj.name, 'materials:', matNames)
    })
  }, [scene])

  useEffect(() => {
    const b = bindRef.current
    if (!b) return
    const idx = clampPaintIndex(paint_index)
    paintColorRef.current.setHex(PAINT_PALETTE[idx])
    b.paint.forEach((m) => m.color.copy(paintColorRef.current))
  }, [paint_index])

  useFrame((_, delta) => {
    const b = bindRef.current
    if (!b) return
    const t = 1 - Math.exp(-EMISSIVE_LERP_SPEED * delta)
    const s = smoothRef.current
    s.headlights += ((headlights_on ? 1 : 0) - s.headlights) * t
    s.brakes += ((brake_lights_on ? 1 : 0) - s.brakes) * t

    const headInt = s.headlights * HEADLIGHT_EMISSIVE_INTENSITY_ON
    const brakeInt = s.brakes * BRAKE_EMISSIVE_INTENSITY_ON
    b.headlight.forEach((m) => {
      m.emissiveIntensity = headInt
    })
    b.brake.forEach((m) => {
      m.emissiveIntensity = brakeInt
    })

    headSpotRefs.current.forEach((spot, i) => {
      if (!spot || !AUX_HEADLIGHT_SPOTS[i]) return
      spot.intensity = s.headlights * AUX_HEADLIGHT_SPOTS[i].intensityScale * 42
    })
    const br = brakePointRef.current
    if (br) br.intensity = s.brakes * AUX_BRAKE_POINT.intensityScale * 10
  })

  return (
    <group>
      <primitive object={scene} />
      {AUX_HEADLIGHT_SPOTS.map((cfg, i) => (
        <spotLight
          key={i}
          ref={(el) => {
            headSpotRefs.current[i] = el
          }}
          position={cfg.position}
          angle={cfg.angle}
          penumbra={cfg.penumbra}
          distance={cfg.distance}
          decay={2}
          color={cfg.color}
          intensity={0}
          castShadow={false}
        />
      ))}
      <pointLight
        ref={brakePointRef}
        position={AUX_BRAKE_POINT.position}
        distance={AUX_BRAKE_POINT.distance}
        decay={AUX_BRAKE_POINT.decay}
        color={AUX_BRAKE_POINT.color}
        intensity={0}
      />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
