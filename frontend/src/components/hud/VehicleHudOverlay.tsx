import type { CSSProperties } from 'react'
import type { VehicleChannelStatus } from '../../hooks/useVehicleChannel'
import { PAINT_LABELS } from '../../scene/vehicleBindings'
import type { VehicleState } from '../../types/vehicle'
import { BrakePedalToggle } from './BrakePedalToggle'
import { EnergyCoreToggle } from './EnergyCoreToggle'
import { MaterialLensSelector } from './MaterialLensSelector'

type ApiHealth = 'ok' | 'err' | 'pending'

export type VehicleHudOverlayProps = {
  state: VehicleState | null
  status: VehicleChannelStatus
  lastError: string | null
  retryCount: number
  apiHealth: ApiHealth
  actionError: string | null
  controlsLocked: boolean
  onHeadlights: (on: boolean) => void
  onBrake: (on: boolean) => void
  onSetPaint: (index: number) => void
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

function CornerBracket({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s = 44
  const t = 14
  const base: CSSProperties = {
    position: 'absolute',
    width: s,
    height: s,
    pointerEvents: 'none',
    borderColor: 'rgba(0, 229, 255, 0.52)',
    borderStyle: 'solid',
    borderWidth: 0,
    boxShadow: '0 0 12px rgba(0, 212, 255, 0.12)',
  }
  const pos =
    corner === 'tl'
      ? { top: t, left: t, borderTopWidth: 2, borderLeftWidth: 2 }
      : corner === 'tr'
        ? { top: t, right: t, borderTopWidth: 2, borderRightWidth: 2 }
        : corner === 'bl'
          ? { bottom: t, left: t, borderBottomWidth: 2, borderLeftWidth: 2 }
          : { bottom: t, right: t, borderBottomWidth: 2, borderRightWidth: 2 }
  return <div style={{ ...base, ...pos }} aria-hidden />
}

export function VehicleHudOverlay({
  state,
  status,
  lastError,
  retryCount,
  apiHealth,
  actionError,
  controlsLocked,
  onHeadlights,
  onBrake,
  onSetPaint,
}: VehicleHudOverlayProps) {
  const paintName = state ? PAINT_LABELS[state.paint_index] ?? `#${state.paint_index}` : '—'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <div className="spectra-hud-scanline" />

      <CornerBracket corner="tl" />
      <CornerBracket corner="tr" />
      <CornerBracket corner="bl" />
      <CornerBracket corner="br" />

      {/* Leader lines toward center (decorative) */}
      <svg
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
        aria-hidden
      >
        <line
          x1="12%"
          y1="50%"
          x2="42%"
          y2="50%"
          stroke="rgba(0, 229, 255, 0.25)"
          strokeWidth="1"
          strokeDasharray="4 10"
        />
        <line
          x1="88%"
          y1="50%"
          x2="58%"
          y2="50%"
          stroke="rgba(0, 229, 255, 0.25)"
          strokeWidth="1"
          strokeDasharray="4 10"
        />
      </svg>

      <header
        style={{
          position: 'absolute',
          left: '1.25rem',
          right: '1.25rem',
          top: '1rem',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div className="spectra-hud-title">SPECTRA // VEHICLE OS</div>
        <div
          className="spectra-mono"
          style={{
            marginTop: '0.35rem',
            fontSize: '0.68rem',
            letterSpacing: '0.24em',
            color: 'var(--spectra-text-dim)',
          }}
        >
          TACTICAL VISUALIZATION · LIVE MESH
        </div>
      </header>

      {/* Left instrument column */}
      <aside
        style={{
          position: 'absolute',
          left: '1.15rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.1rem',
          pointerEvents: 'none',
          maxWidth: 'min(200px, 26vw)',
        }}
      >
        <svg
          width={118}
          height={118}
          viewBox="0 0 100 100"
          style={{ opacity: 0.92 }}
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(0, 212, 255, 0.12)"
            strokeWidth="1"
          />
          <g style={{ transformOrigin: '50px 50px', animation: 'spectra-ring-cw 24s linear infinite' }}>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(0, 229, 255, 0.35)"
              strokeWidth="1.2"
              strokeDasharray="20 18"
            />
          </g>
          <g
            style={{
              transformOrigin: '50px 50px',
              animation: 'spectra-ring-ccw 18s linear infinite',
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="rgba(0, 212, 255, 0.28)"
              strokeWidth="1"
              strokeDasharray="8 14"
            />
          </g>
          <text
            x="50"
            y="46"
            textAnchor="middle"
            fill="rgba(232, 244, 255, 0.55)"
            fontFamily="var(--font-display), sans-serif"
            fontSize="6.5"
            letterSpacing="0.2em"
          >
            SYS
          </text>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fill="rgba(0, 229, 255, 0.55)"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
          >
            {status === 'open' ? 'OK' : status === 'connecting' ? '···' : '!'}
          </text>
        </svg>

        <div
          className="spectra-mono"
          style={{
            textAlign: 'left',
            width: '100%',
            padding: '0.65rem 0.75rem',
            background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.06), transparent)',
            borderLeft: '2px solid rgba(0, 229, 255, 0.35)',
            fontSize: '0.68rem',
            lineHeight: 1.55,
            color: 'var(--spectra-text-muted)',
          }}
        >
          <div style={{ color: 'var(--spectra-text-dim)', letterSpacing: '0.14em', marginBottom: '0.35rem' }}>
            STATE VECTOR
          </div>
          <div>
            <span style={{ color: 'var(--spectra-text-dim)' }}>HLM </span>
            {state ? (state.headlights_on ? 'ARMED' : 'STBY') : '…'}
          </div>
          <div>
            <span style={{ color: 'var(--spectra-text-dim)' }}>BRK </span>
            {state ? (state.brake_lights_on ? 'ENGAGED' : 'IDLE') : '…'}
          </div>
          <div>
            <span style={{ color: 'var(--spectra-text-dim)' }}>MAT </span>
            {paintName}
          </div>
        </div>
      </aside>

      {/* Command column */}
      <nav
        aria-label="Vehicle controls"
        style={{
          position: 'absolute',
          right: 'max(1rem, 2vw)',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.35rem',
          pointerEvents: 'auto',
          padding: '0.75rem 0.6rem',
          background: 'linear-gradient(270deg, rgba(5, 10, 24, 0.75) 0%, rgba(5, 10, 24, 0.2) 100%)',
          borderLeft: '1px solid rgba(0, 229, 255, 0.18)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="spectra-mono"
          style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--spectra-text-dim)' }}
        >
          OPTICS
        </div>
        <EnergyCoreToggle
          checked={state?.headlights_on ?? false}
          disabled={controlsLocked}
          onCheckedChange={onHeadlights}
        />

        <div
          className="spectra-mono"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            color: 'var(--spectra-text-dim)',
            marginTop: '0.15rem',
          }}
        >
          DECEL
        </div>
        <BrakePedalToggle
          active={state?.brake_lights_on ?? false}
          disabled={controlsLocked}
          onActiveChange={onBrake}
        />

        <div
          className="spectra-mono"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            color: 'var(--spectra-text-dim)',
            marginTop: '0.15rem',
          }}
        >
          MATERIAL
        </div>
        <MaterialLensSelector
          selectedIndex={state?.paint_index ?? 0}
          disabled={controlsLocked}
          onSelect={onSetPaint}
        />
      </nav>

      {/* Bottom telemetry bar */}
      <footer
        className="spectra-mono"
        style={{
          position: 'absolute',
          left: '1.25rem',
          right: '1.25rem',
          bottom: '0.85rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem 1.25rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          pointerEvents: 'none',
          color: 'var(--spectra-text-muted)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <span>
            <span style={{ color: 'var(--spectra-text-dim)' }}>WS </span>
            <span style={{ color: statusColor(status) }}>{status}</span>
            {retryCount > 0 ? ` · retry ${retryCount}` : ''}
          </span>
          <span>
            <span style={{ color: 'var(--spectra-text-dim)' }}>REST </span>
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
          </span>
        </div>
        {lastError ? (
          <span style={{ color: 'var(--spectra-error)', pointerEvents: 'auto' }}>{lastError}</span>
        ) : null}
        {actionError ? (
          <span style={{ color: 'var(--spectra-error)', pointerEvents: 'auto' }}>{actionError}</span>
        ) : (
          <span style={{ color: 'var(--spectra-text-dim)' }}>UPLINK SECURE</span>
        )}
      </footer>
    </div>
  )
}
