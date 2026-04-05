import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

const IDLE_MS = 2600

/**
 * OrbitControls with damping; auto-rotate resumes after ~2.5s without pointer / wheel / touch.
 */
export function StageControls() {
  const { gl } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bumpIdle = useCallback(() => {
    setAutoRotate(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setAutoRotate(true), IDLE_MS)
  }, [])

  useEffect(() => {
    const el = gl.domElement
    el.addEventListener('pointerdown', bumpIdle)
    el.addEventListener('wheel', bumpIdle, { passive: true })
    el.addEventListener('touchstart', bumpIdle, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', bumpIdle)
      el.removeEventListener('wheel', bumpIdle)
      el.removeEventListener('touchstart', bumpIdle)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [gl, bumpIdle])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      enableDamping
      dampingFactor={0.065}
      minDistance={1.8}
      maxDistance={48}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI * 0.485}
      autoRotate={autoRotate}
      autoRotateSpeed={0.42}
    />
  )
}
