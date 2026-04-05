import { JarvisShell } from './components/layout/JarvisShell'
import { ControlPanel } from './components/ControlPanel'
import { VehicleStage } from './components/VehicleStage'
import { useVehicleChannel } from './hooks/useVehicleChannel'

export default function App() {
  const { state, status, lastError, retryCount } = useVehicleChannel()

  return (
    <JarvisShell scanlines>
      <div
        style={{
          minHeight: '100%',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <header
          style={{
            borderLeft: '3px solid var(--chrome-corner)',
            paddingLeft: '1rem',
          }}
        >
          <h1 style={{ margin: '0 0 0.35rem', fontWeight: 600, fontSize: '1.25rem' }}>
            Spectra
          </h1>
          <p style={{ margin: 0, color: 'var(--spectra-text-muted)', fontSize: '0.9rem' }}>
            Phase 5 — Control panel (REST actions, WebSocket state, 3D sync)
          </p>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 22rem)',
            gap: '1.25rem',
            alignItems: 'stretch',
          }}
        >
          <VehicleStage vehicleState={state} style={{ minHeight: 0 }} />

          <ControlPanel state={state} status={status} lastError={lastError} retryCount={retryCount} />
        </div>
      </div>
    </JarvisShell>
  )
}
