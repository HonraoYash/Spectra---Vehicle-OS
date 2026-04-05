import { useId, type ButtonHTMLAttributes } from 'react'

export type EnergyCoreToggleProps = {
  checked: boolean
  disabled?: boolean
  onCheckedChange: (next: boolean) => void
  label?: string
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'id'>

/**
 * Circular “energy core” control for headlamps: segmented rings + pulsing core when active.
 */
export function EnergyCoreToggle({
  id,
  checked,
  disabled = false,
  onCheckedChange,
  label = 'HEADLAMPS',
}: EnergyCoreToggleProps) {
  const gradId = useId().replace(/:/g, '')
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`spectra-energy-core ${checked ? 'spectra-energy-core--on' : ''}`}
    >
      <svg className="spectra-energy-core__svg" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <radialGradient id={gradId} cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#b8f8ff" stopOpacity="0.95" />
            <stop offset="55%" stopColor={checked ? '#00e5ff' : '#3a6d7a'} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#082028" stopOpacity="1" />
          </radialGradient>
        </defs>
        <g className="spectra-energy-core__g-outer">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(0, 212, 255, 0.45)"
            strokeWidth="1.35"
            strokeDasharray="10 14"
            strokeDashoffset="0"
          />
        </g>
        <g className="spectra-energy-core__g-inner">
          <circle
            cx="60"
            cy="60"
            r="38"
            fill="none"
            stroke="rgba(0, 229, 255, 0.38)"
            strokeWidth="1.1"
            strokeDasharray="6 18 3 18"
            strokeDashoffset="4"
          />
        </g>
        <circle
          className="spectra-energy-core__core"
          cx="60"
          cy="60"
          r={checked ? 17 : 14}
          fill={`url(#${gradId})`}
          stroke={checked ? 'rgba(0, 229, 255, 0.75)' : 'rgba(0, 212, 255, 0.35)'}
          strokeWidth="1.2"
        />
      </svg>
      <span className="spectra-energy-core__label">{label}</span>
    </button>
  )
}
