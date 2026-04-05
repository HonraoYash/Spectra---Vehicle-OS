import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

const IDLE_MS = 2600

/** Stronger dolly per UI button click than a single wheel notch */
const BUTTON_DOLLY_FACTOR = Math.pow(0.82, 1.12)

export type StageZoomApi = {
  zoomIn: () => void
  zoomOut: () => void
}

type StageControlsProps = {
  /** Wired from VehicleStage so DOM +/- buttons can call the same dolly as the wheel handler */
  onZoomApi?: (api: StageZoomApi | null) => void
}

/**
 * OrbitControls with damping; auto-rotate resumes after ~2.5s without pointer / wheel / touch.
 * Wheel zoom uses a non-passive listener on the canvas + stopPropagation so Orbit's parent `wheel`
 * handler does not double-apply; enableZoom stays on for pinch + middle-mouse dolly.
 */
export function StageControls({ onZoomApi }: StageControlsProps) {
  const { gl } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bumpIdle = useCallback(() => {
    setAutoRotate(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setAutoRotate(true), IDLE_MS)
  }, [])

  const bumpIdleRef = useRef(bumpIdle)
  bumpIdleRef.current = bumpIdle

  const assignControlsRef = useCallback(
    (node: OrbitControlsImpl | null) => {
      controlsRef.current = node
      if (node && onZoomApi) {
        onZoomApi({
          zoomIn: () => {
            bumpIdleRef.current()
            node.dollyIn(BUTTON_DOLLY_FACTOR)
          },
          zoomOut: () => {
            bumpIdleRef.current()
            node.dollyOut(BUTTON_DOLLY_FACTOR)
          },
        })
      } else if (!node) {
        onZoomApi?.(null)
      }
    },
    [onZoomApi],
  )

  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e: WheelEvent) => {
      const c = controlsRef.current
      if (!c?.enabled) return
      bumpIdleRef.current()
      e.preventDefault()
      e.stopPropagation()
      const steps = Math.min(12, Math.max(1, Math.round(Math.abs(e.deltaY) / 36)))
      if (e.deltaY < 0) {
        for (let i = 0; i < steps; i++) c.dollyIn()
      } else if (e.deltaY > 0) {
        for (let i = 0; i < steps; i++) c.dollyOut()
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [gl])

  useEffect(() => {
    const el = gl.domElement
    el.addEventListener('pointerdown', bumpIdle)
    el.addEventListener('touchstart', bumpIdle, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', bumpIdle)
      el.removeEventListener('touchstart', bumpIdle)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [gl, bumpIdle])

  return (
    <OrbitControls
      ref={assignControlsRef}
      makeDefault
      enablePan
      enableRotate
      enableDamping
      dampingFactor={0.065}
      zoomSpeed={1.15}
      /** Orbit radius vs target — low values allow detail inspection of body/panels; ~0.02 ≈ 2cm in meter-scaled GLBs */
      minDistance={0.02}
      maxDistance={260}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI * 0.485}
      autoRotate={autoRotate}
      autoRotateSpeed={0.42}
      enableZoom
    />
  )
}
