import { Bounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { CSSProperties } from 'react'
import { Suspense, useCallback, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three'
import { type StageZoomApi, StageControls } from '../scene/controls'
import { StageLighting } from '../scene/lighting'
import { VehicleModel } from '../scene/VehicleModel'
import { type VehicleState, resolveVehicleState } from '../types/vehicle'

export type VehicleStageProps = {
  /** Live state from WS; when null, defaults match the API until the first message. */
  vehicleState: VehicleState | null
  className?: string
  style?: CSSProperties
}

/**
 * Full-width R3F canvas: cinematic tone mapping, environment lighting, fitted GLB, orbit + idle spin.
 */
export function VehicleStage({ vehicleState, className, style }: VehicleStageProps) {
  const v = resolveVehicleState(vehicleState)
  const zoomRef = useRef<StageZoomApi>({
    zoomIn: () => {},
    zoomOut: () => {},
  })

  const onZoomApi = useCallback((api: StageZoomApi | null) => {
    if (api) zoomRef.current = api
    else zoomRef.current = { zoomIn: () => {}, zoomOut: () => {} }
  }, [])

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 'min(62vh, 580px)',
        border: '1px solid var(--chrome-line)',
        borderRadius: 6,
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #070d18 0%, #050810 55%, #04060e 100%)',
        boxShadow:
          'inset 0 0 60px rgba(0, 212, 255, 0.05), 0 12px 40px rgba(0, 0, 0, 0.35)',
        touchAction: 'none',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [4.4, 1.85, 5.6], fov: 42, near: 0.008, far: 512 }}
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
          {/** No `clip` — drei Bounds.clip overwrites OrbitControls.maxDistance + camera near/far, which fights zoom. */}
          <Bounds fit observe margin={1.22} maxDuration={0.38}>
            <VehicleModel
              headlights_on={v.headlights_on}
              brake_lights_on={v.brake_lights_on}
              paint_index={v.paint_index}
            />
          </Bounds>
          <StageControls onZoomApi={onZoomApi} />
        </Suspense>
      </Canvas>

      <div
        className="spectra-mono"
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pointerEvents: 'auto',
        }}
        aria-label="Camera zoom"
      >
        <button
          type="button"
          className="spectra-zoom-btn"
          aria-label="Zoom in"
          onClick={() => zoomRef.current.zoomIn()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 4,
            border: '1px solid var(--chrome-corner)',
            background: 'rgba(10, 16, 32, 0.88)',
            color: 'var(--spectra-accent)',
            fontSize: '1.2rem',
            lineHeight: 1,
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)',
          }}
        >
          +
        </button>
        <button
          type="button"
          className="spectra-zoom-btn"
          aria-label="Zoom out"
          onClick={() => zoomRef.current.zoomOut()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 4,
            border: '1px solid var(--chrome-line)',
            background: 'rgba(10, 16, 32, 0.88)',
            color: 'var(--spectra-text-primary)',
            fontSize: '1.2rem',
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          −
        </button>
      </div>
    </div>
  )
}
