import { Bounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'
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
  /** HUD / chrome layered above the canvas (use pointer-events on children as needed). */
  overlay?: ReactNode
}

/**
 * Full-width R3F canvas: cinematic tone mapping, environment lighting, fitted GLB, orbit + idle spin.
 */
export function VehicleStage({ vehicleState, className, style, overlay }: VehicleStageProps) {
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
        minHeight: 'min(72vh, 720px)',
        border: '1px solid var(--chrome-line)',
        borderRadius: 2,
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

      {overlay ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {overlay}
        </div>
      ) : null}

      <div
        className="spectra-mono"
        style={{
          position: 'absolute',
          right: 10,
          bottom: 56,
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pointerEvents: 'auto',
        }}
        aria-label="Camera zoom"
      >
        <button
          type="button"
          className="spectra-zoom-btn spectra-zoom-btn--hud"
          aria-label="Zoom in"
          onClick={() => zoomRef.current.zoomIn()}
          style={{
            width: 40,
            height: 40,
            border: '1px solid var(--chrome-corner)',
            background: 'rgba(10, 16, 32, 0.88)',
            color: 'var(--spectra-accent)',
            fontSize: '1.15rem',
            lineHeight: 1,
            cursor: 'pointer',
            boxShadow: '0 0 14px rgba(0, 212, 255, 0.22)',
          }}
        >
          +
        </button>
        <button
          type="button"
          className="spectra-zoom-btn spectra-zoom-btn--hud"
          aria-label="Zoom out"
          onClick={() => zoomRef.current.zoomOut()}
          style={{
            width: 40,
            height: 40,
            border: '1px solid var(--chrome-line)',
            background: 'rgba(10, 16, 32, 0.88)',
            color: 'var(--spectra-text-primary)',
            fontSize: '1.15rem',
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
