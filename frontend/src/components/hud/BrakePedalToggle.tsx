import type { ButtonHTMLAttributes } from 'react'

export type BrakePedalToggleProps = {
  active: boolean
  disabled?: boolean
  onActiveChange: (next: boolean) => void
  label?: string
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'id'>

/**
 * Side-view brake pedal schematic — neon schematic idle, red pulse when engaged.
 */
export function BrakePedalToggle({
  id,
  active,
  disabled = false,
  onActiveChange,
  label = 'BRAKE',
}: BrakePedalToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={active}
      disabled={disabled}
      onClick={() => onActiveChange(!active)}
      className={`spectra-brake-pedal ${active ? 'spectra-brake-pedal--active' : ''}`}
    >
      <svg className="spectra-brake-pedal__svg" viewBox="0 0 120 72" aria-hidden>
        {/* Firewall / mount */}
        <path className="spectra-brake-pedal__stroke" d="M12 8 v52" />
        <path className="spectra-brake-pedal__stroke" d="M12 14 h18" />
        <path className="spectra-brake-pedal__stroke" d="M30 14 L30 22" />
        {/* Pivot */}
        <circle className="spectra-brake-pedal__stroke" cx="30" cy="26" r="3.2" fill="none" />
        {/* Linkage */}
        <path className="spectra-brake-pedal__stroke" d="M30 26 L52 44" />
        <path className="spectra-brake-pedal__stroke" d="M52 44 L58 40" />
        {/* Pedal arm */}
        <path
          className="spectra-brake-pedal__hot"
          d={active ? 'M30 26 L68 56 L78 52' : 'M30 26 L62 48 L74 46'}
        />
        {/* Pedal pad */}
        <path
          className="spectra-brake-pedal__hot"
          d={active ? 'M72 54 L104 62 L108 56 L76 48 Z' : 'M76 46 L108 54 L112 48 L80 42 Z'}
        />
        {/* Floor reference */}
        <path className="spectra-brake-pedal__stroke" d="M8 58 h108" opacity="0.55" />
        <path className="spectra-brake-pedal__stroke" d="M14 58 l6 6 M104 58 l-6 6" opacity="0.45" />
        {/* Hydraulic accent */}
        <path
          className="spectra-brake-pedal__stroke"
          d="M22 36 L22 50 M19 50 L25 50"
          opacity="0.65"
        />
      </svg>
      <span className="spectra-brake-pedal__label">{label}</span>
    </button>
  )
}
