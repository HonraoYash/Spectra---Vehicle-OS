import { Bounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { CSSProperties } from 'react'
import { Suspense } from 'react'
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three'
import { StageControls } from '../scene/controls'
import { StageLighting } from '../scene/lighting'
import { VehicleModel } from '../scene/VehicleModel'

export type VehicleStageProps = {
  className?: string
  style?: CSSProperties
}

/**
 * Full-width R3F canvas: cinematic tone mapping, environment lighting, fitted GLB, orbit + idle spin.
 */
export function VehicleStage({ className, style }: VehicleStageProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 'min(62vh, 580px)',
        border: '1px solid var(--chrome-line)',
        borderRadius: 6,
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #070d18 0%, #050810 55%, #04060e 100%)',
        boxShadow:
          'inset 0 0 60px rgba(0, 212, 255, 0.05), 0 12px 40px rgba(0, 0, 0, 0.35)',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [4.4, 1.85, 5.6], fov: 42, near: 0.08, far: 128 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
          outputColorSpace: SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <StageLighting />
          <Bounds fit clip observe margin={1.22} maxDuration={0.38}>
            <VehicleModel />
          </Bounds>
          <StageControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
