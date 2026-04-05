import { useLayoutEffect, useRef } from 'react'
import { Object3D } from 'three'
import type { SpotLight as SpotLightImpl } from 'three'

export type StageLightingProps = {
  aim?: readonly [number, number, number]
}

export function StageLighting({ aim }: StageLightingProps = {}) {
  const [ax, ay, az] = (aim ?? [0, 0, 0]) as [number, number, number]

  const overheadRef = useRef<SpotLightImpl>(null)
  const targetRef = useRef(new Object3D())

  useLayoutEffect(() => {
    targetRef.current.position.set(ax, ay, az)
    targetRef.current.updateMatrixWorld()
    const overhead = overheadRef.current
    if (overhead) {
      overhead.target = targetRef.current
      overhead.shadow.mapSize.set(2048, 2048)
      overhead.shadow.bias = -0.00015
      overhead.shadow.normalBias = 0.02
      overhead.shadow.radius = 4
    }
  }, [ax, ay, az])

  return (
    <>
      <color attach="background" args={['#1a1c20']} />
      <fog attach="fog" args={['#1a1c20', 18, 70]} />

      <primitive object={targetRef.current} />

      {/* Base ambient */}
      <ambientLight intensity={1.6} color="#c0c8d8" />
      <hemisphereLight args={['#d0d8e8', '#222830', 0.8]} />

      {/* ── OVERHEAD GARAGE SPOTLIGHT ── */}
      <spotLight
        ref={overheadRef}
        position={[ax, ay + 14, az]}
        color="#ffffff"
        intensity={120}
        angle={0.6}
        penumbra={0.35}
        decay={1.0}
        distance={150}
        castShadow
      />

      {/* Warm key — top-right fills roof and door panels */}
      <directionalLight
        position={[ax + 7, ay + 9, az + 8]}
        color="#ffe8c8"
        intensity={1.4}
        castShadow={false}
      />

      {/* Cool blue rim — NFS edge highlight from rear-left */}
      <directionalLight
        position={[ax - 7, ay + 8, az - 7]}
        color="#88ccff"
        intensity={0.9}
        castShadow={false}
      />

      {/* Front fill — lifts bumper */}
      <directionalLight
        position={[ax, ay + 2, az + 10]}
        color="#ffffff"
        intensity={0.2}
        castShadow={false}
      />
    </>
  )
}