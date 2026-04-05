import type { ReactNode } from 'react'

type JarvisShellProps = {
  children: ReactNode
  /** Subtle CRT-style scanlines over the shell (cheap CSS, no post-processing). */
  scanlines?: boolean
}

/**
 * Full-viewport chrome for Jarvis-themed layouts. Scanlines are optional and very light.
 */
export function JarvisShell({ children, scanlines = false }: JarvisShellProps) {
  return (
    <div
      className={scanlines ? 'spectra-scanlines' : undefined}
      style={{
        position: 'relative',
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
