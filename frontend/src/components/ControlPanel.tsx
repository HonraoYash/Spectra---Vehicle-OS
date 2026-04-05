import type { VehicleChannelStatus } from '../hooks/useVehicleChannel'
import { useVehicleActions } from '../hooks/useVehicleActions'
import type { VehicleState } from '../types/vehicle'
import { PAINT_LABELS } from '../scene/vehicleBindings'
import { GlowToggle } from './ui/GlowToggle'

export type ControlPanelProps = {
  state: VehicleState | null
  status: VehicleChannelStatus
  lastError: string | null
  retryCount: number
}

function paintLabel(index: number | undefined) {
  if (index === undefined) return '—'
  return PAINT_LABELS[index] ?? `#${index}`
}

function statusColor(status: string) {
  switch (status) {
    case 'open':
      return 'var(--spectra-ok)'
    case 'connecting':
      return 'var(--spectra-warn)'
    case 'error':
    case 'closed':
      return 'var(--spectra-error)'
    default:
      return 'var(--spectra-text-muted)'
  }
}

export function ControlPanel({ state, status, lastError, retryCount }: ControlPanelProps) {
  const {
    apiHealth,
    actionError,
    controlsLocked,
    onHeadlights,
    onBrake,
    onCyclePaint,
  } = useVehicleActions(state, status)

  return (
    <div
      className="spectra-mono"
      style={{
        padding: '1rem 1.25rem',
        background: 'var(--spectra-bg-panel)',
        border: '1px solid var(--chrome-line)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 24px rgba(0, 212, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.14em',
          color: 'var(--spectra-text-muted)',
        }}
      >
        CONTROL · LIVE
      </div>

      <div style={{ color: 'var(--spectra-text-dim)', fontSize: '0.78rem' }}>CHANNEL</div>
      <div style={{ marginTop: '-0.35rem' }}>
        <span style={{ color: 'var(--spectra-text-dim)' }}>ws: </span>
        <span style={{ color: statusColor(status) }}>{status}</span>
        {retryCount > 0 ? (
          <span style={{ color: 'var(--spectra-text-dim)', marginLeft: '0.5rem' }}>
            (retry #{retryCount})
          </span>
        ) : null}
      </div>
      {lastError ? <div style={{ color: 'var(--spectra-error)' }}>{lastError}</div> : null}

      <div
        style={{
          borderTop: '1px solid rgba(0, 212, 255, 0.2)',
          paddingTop: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <div style={{ color: 'var(--spectra-text-dim)' }}>headlights</div>
        <div>{state ? String(state.headlights_on) : '…'}</div>
        <div style={{ color: 'var(--spectra-text-dim)', marginTop: '0.35rem' }}>brake lights</div>
        <div>{state ? String(state.brake_lights_on) : '…'}</div>
        <div style={{ color: 'var(--spectra-text-dim)', marginTop: '0.35rem' }}>paint</div>
        <div>{paintLabel(state?.paint_index)}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <GlowToggle
          label="HEADLIGHTS"
          checked={state?.headlights_on ?? false}
          disabled={controlsLocked}
          onCheckedChange={onHeadlights}
        />
        <GlowToggle
          label="BRAKE LIGHTS"
          checked={state?.brake_lights_on ?? false}
          disabled={controlsLocked}
          onCheckedChange={onBrake}
        />
        <button
          type="button"
          disabled={controlsLocked}
          onClick={onCyclePaint}
          className="spectra-mono"
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 2,
            border: '1px solid var(--spectra-glow-magenta-dim)',
            background: 'rgba(255, 0, 170, 0.06)',
            color: 'var(--spectra-text-primary)',
            cursor: controlsLocked ? 'not-allowed' : 'pointer',
            opacity: controlsLocked ? 0.55 : 1,
            font: 'inherit',
            letterSpacing: '0.06em',
            fontSize: '0.82rem',
            boxShadow: '0 0 14px rgba(255, 0, 170, 0.12)',
          }}
        >
          CYCLE PAINT
        </button>
      </div>

      {actionError ? (
        <div style={{ color: 'var(--spectra-error)', fontSize: '0.8rem' }}>{actionError}</div>
      ) : null}

      <div
        style={{
          padding: '0.65rem 0.75rem',
          background: 'var(--spectra-bg-elevated)',
          border: '1px solid var(--spectra-glow-magenta-dim)',
          fontSize: '0.78rem',
        }}
      >
        <span style={{ color: 'var(--spectra-text-dim)' }}>GET /api/health: </span>
        <span
          style={{
            color:
              apiHealth === 'ok'
                ? 'var(--spectra-ok)'
                : apiHealth === 'err'
                  ? 'var(--spectra-error)'
                  : 'var(--spectra-warn)',
          }}
        >
          {apiHealth}
        </span>
      </div>
    </div>
  )
}
