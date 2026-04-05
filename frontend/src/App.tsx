import { useEffect, useState } from 'react'
import { getHealth } from './api/vehicleClient'
import { JarvisShell } from './components/layout/JarvisShell'
import { VehicleStage } from './components/VehicleStage'
import { useVehicleChannel } from './hooks/useVehicleChannel'
import { PAINT_LABELS } from './scene/vehicleBindings'

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

export default function App() {
  const { state, status, lastError, retryCount } = useVehicleChannel()
  const [apiHealth, setApiHealth] = useState<'ok' | 'err' | 'pending'>('pending')

  useEffect(() => {
    let alive = true
    getHealth()
      .then(() => {
        if (alive) setApiHealth('ok')
      })
      .catch(() => {
        if (alive) setApiHealth('err')
      })
    return () => {
      alive = false
    }
  }, [])

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
            Phase 4 — Visual state (materials + auxiliary lights, smoothed emissive)
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

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: 0,
            }}
          >
        <section
          className="spectra-mono"
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--spectra-bg-panel)',
            border: '1px solid var(--chrome-line)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ marginBottom: '0.75rem', color: 'var(--spectra-text-muted)' }}>
            LIVE CHANNEL
          </div>
          <div style={{ marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--spectra-text-dim)' }}>ws: </span>
            <span style={{ color: statusColor(status) }}>{status}</span>
            {retryCount > 0 ? (
              <span style={{ color: 'var(--spectra-text-dim)', marginLeft: '0.5rem' }}>
                (retry #{retryCount})
              </span>
            ) : null}
          </div>
          {lastError ? (
            <div style={{ color: 'var(--spectra-error)', marginBottom: '0.5rem' }}>{lastError}</div>
          ) : null}
          <div style={{ color: 'var(--spectra-text-dim)' }}>headlights: </div>
          <div>{state ? String(state.headlights_on) : '…'}</div>
          <div style={{ color: 'var(--spectra-text-dim)', marginTop: '0.35rem' }}>brake: </div>
          <div>{state ? String(state.brake_lights_on) : '…'}</div>
          <div style={{ color: 'var(--spectra-text-dim)', marginTop: '0.35rem' }}>paint: </div>
          <div>{paintLabel(state?.paint_index)}</div>
        </section>

        <section
          className="spectra-mono"
          style={{
            padding: '0.85rem 1.1rem',
            background: 'var(--spectra-bg-elevated)',
            border: '1px solid var(--spectra-glow-magenta-dim)',
            fontSize: '0.8rem',
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
        </section>
          </div>
        </div>
      </div>
    </JarvisShell>
  )
}
