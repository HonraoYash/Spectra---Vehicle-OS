import { useState } from 'react'
import { PAINT_LABELS, PAINT_PALETTE } from '../../scene/vehicleBindings'

const CX = 54
const CY = 54
const R = 46

function wedgePath(d0: number, d1: number): string {
  const a0 = (d0 * Math.PI) / 180
  const a1 = (d1 * Math.PI) / 180
  const x0 = CX + R * Math.cos(a0)
  const y0 = CY + R * Math.sin(a0)
  const x1 = CX + R * Math.cos(a1)
  const y1 = CY + R * Math.sin(a1)
  const large = d1 - d0 > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`
}

function hexString(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`
}

export type MaterialLensSelectorProps = {
  selectedIndex: number
  disabled?: boolean
  onSelect: (index: number) => void
}

/** Iris-style material sectors; hover shows a technical paint readout. */
export function MaterialLensSelector({ selectedIndex, disabled, onSelect }: MaterialLensSelectorProps) {
  const [hover, setHover] = useState<number | null>(null)
  const n = PAINT_PALETTE.length
  const step = 360 / n

  const readoutIndex = hover ?? selectedIndex
  const label = PAINT_LABELS[readoutIndex] ?? `INDEX ${readoutIndex}`
  const finish = readoutIndex % 2 === 0 ? 'METALLIC' : 'PEARL'

  return (
    <div
      className="spectra-material-lens"
      onMouseLeave={() => setHover(null)}
    >
      <svg className="spectra-material-lens__svg" viewBox="0 0 108 108" aria-label="Paint material selector">
        <defs>
          <radialGradient id="spectra-lens-shine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        {PAINT_PALETTE.map((hex, i) => {
          const a0 = -90 + i * step
          const a1 = -90 + (i + 1) * step
          const d = wedgePath(a0, a1)
          const fill = hexString(hex)
          return (
            <path
              key={i}
              d={d}
              fill={fill}
              className={`spectra-material-lens__sector ${
                selectedIndex === i ? 'spectra-material-lens__sector--selected' : ''
              }`}
              onClick={() => !disabled && onSelect(i)}
              onMouseEnter={() => !disabled && setHover(i)}
              onFocus={() => !disabled && setHover(i)}
              onBlur={() => setHover(null)}
              onKeyDown={(e) => {
                if (disabled) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(i)
                }
              }}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              tabIndex={disabled ? -1 : 0}
              role="button"
              aria-pressed={selectedIndex === i}
              aria-label={`Select paint ${PAINT_LABELS[i] ?? i}`}
            />
          )
        })}
        <circle
          cx={CX}
          cy={CY}
          r={19}
          fill="rgba(5, 8, 16, 0.92)"
          stroke="rgba(0, 229, 255, 0.4)"
          strokeWidth="1.2"
        />
        <circle cx={CX} cy={CY} r={17} fill="url(#spectra-lens-shine)" opacity="0.5" />
        <text
          x={CX}
          y={CY + 3}
          textAnchor="middle"
          fill="rgba(232, 244, 255, 0.75)"
          fontFamily="var(--font-display), sans-serif"
          fontSize="6"
          letterSpacing="0.12em"
        >
          Lens
        </text>
      </svg>
      <div className="spectra-material-lens__readout">
        <div>{label.toUpperCase()}</div>
        <div style={{ color: 'rgba(232, 244, 255, 0.45)' }}>FINISH · {finish}</div>
      </div>
    </div>
  )
}
