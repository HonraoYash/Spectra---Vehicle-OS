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

      {/* Symmetric wall washes — same intensity & neutral color from all four sides */}
      <directionalLight position={[ax - 22, ay + 7, az]} intensity={0.5} color="#dde2eb" castShadow={false}>
        <object3D position={[ax, ay + 1.2, az]} attach="target" />
      </directionalLight>
      <directionalLight position={[ax + 22, ay + 7, az]} intensity={0.5} color="#dde2eb" castShadow={false}>
        <object3D position={[ax, ay + 1.2, az]} attach="target" />
      </directionalLight>
      <directionalLight position={[ax, ay + 7, az - 22]} intensity={0.5} color="#dde2eb" castShadow={false}>
        <object3D position={[ax, ay + 1.2, az]} attach="target" />
      </directionalLight>
      <directionalLight position={[ax, ay + 7, az + 22]} intensity={0.5} color="#dde2eb" castShadow={false}>
        <object3D position={[ax, ay + 1.2, az]} attach="target" />
      </directionalLight>

      {/* Balanced diagonal accents — warm + cool in opposing corners so no single wall is tinted */}
      <directionalLight position={[ax + 9, ay + 11, az + 9]} color="#f0e8dc" intensity={0.35} castShadow={false}>
        <object3D position={[ax, ay, az]} attach="target" />
      </directionalLight>
      <directionalLight position={[ax - 9, ay + 11, az - 9]} color="#f0e8dc" intensity={0.35} castShadow={false}>
        <object3D position={[ax, ay, az]} attach="target" />
      </directionalLight>
      <directionalLight position={[ax - 9, ay + 11, az + 9]} color="#dce8f4" intensity={0.35} castShadow={false}>
        <object3D position={[ax, ay, az]} attach="target" />
      </directionalLight>
      <directionalLight position={[ax + 9, ay + 11, az - 9]} color="#dce8f4" intensity={0.35} castShadow={false}>
        <object3D position={[ax, ay, az]} attach="target" />
      </directionalLight>
    </>
  )
}