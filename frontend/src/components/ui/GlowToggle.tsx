import type { ButtonHTMLAttributes } from 'react'

export type GlowToggleProps = {
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (next: boolean) => void
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'id'>

/**
 * Jarvis-style neon row toggle. Calls `onCheckedChange` with the toggled value.
 * Parent should gate `disabled` while REST is in flight.
 */
export function GlowToggle({
  id,
  label,
  checked,
  disabled = false,
  onCheckedChange,
}: GlowToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="spectra-glow-toggle"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: 2,
        border: `1px solid ${checked ? 'var(--chrome-corner)' : 'var(--chrome-line)'}`,
        background: checked ? 'rgba(0, 212, 255, 0.08)' : 'rgba(10, 16, 32, 0.45)',
        boxShadow: checked
          ? '0 0 12px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.04)'
          : 'none',
        color: 'var(--spectra-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        font: 'inherit',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>{label}</span>
      <span
        aria-hidden
        style={{
          position: 'relative',
          width: 44,
          height: 22,
          flexShrink: 0,
          borderRadius: 999,
          background: checked ? 'var(--spectra-accent-dim)' : 'rgba(232, 244, 255, 0.12)',
          border: `1px solid ${checked ? 'var(--spectra-accent)' : 'var(--chrome-line)'}`,
          transition: 'background 0.15s ease, border-color 0.15s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: checked ? 'var(--spectra-accent)' : 'var(--spectra-text-muted)',
            boxShadow: checked ? '0 0 10px var(--spectra-accent)' : 'none',
            transition: 'left 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
          }}
        />
      </span>
    </button>
  )
}
