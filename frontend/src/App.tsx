import { JarvisShell } from './components/layout/JarvisShell'
import { VehicleHudOverlay } from './components/hud/VehicleHudOverlay'
import { VehicleStage } from './components/VehicleStage'
import { useVehicleActions } from './hooks/useVehicleActions'
import { useVehicleChannel } from './hooks/useVehicleChannel'

export default function App() {
  const { state, status, lastError, retryCount } = useVehicleChannel()
  const hud = useVehicleActions(state, status)

  return (
    <JarvisShell scanlines>
      <div
        style={{
          height: '100%',
          minHeight: 0,
          padding: '0.65rem',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <VehicleStage
          vehicleState={state}
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
          }}
          overlay={
            <VehicleHudOverlay
              state={state}
              status={status}
              lastError={lastError}
              retryCount={retryCount}
              apiHealth={hud.apiHealth}
              actionError={hud.actionError}
              controlsLocked={hud.controlsLocked}
              onHeadlights={hud.onHeadlights}
              onBrake={hud.onBrake}
              onSetPaint={hud.onSetPaint}
            />
          }
        />
      </div>
    </JarvisShell>
  )
}
