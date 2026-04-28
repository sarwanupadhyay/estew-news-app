"use client"

import { useMemo } from "react"

/**
 * ErrorParticles — reusable floating ambient signal particles.
 *
 * Part of the "404 Error Page Animations" system (see globals.css). Renders
 * a full-bleed, non-interactive layer of softly drifting particles tinted
 * with the current theme's --primary color. Designed to sit behind any
 * editorial error / empty-state hero.
 *
 * Implementation notes:
 *  - Particle positions are pre-computed (12 deterministic anchors) so
 *    every visitor sees the same general distribution and the layout
 *    doesn't shift on re-render.
 *  - Per-particle duration / delay / drift / size are randomised once
 *    via useMemo so React doesn't re-randomise on every render.
 *  - Animation lives in CSS (.error-particle) so this stays cheap.
 */

const ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [15, 80],
  [25, 60],
  [45, 70],
  [65, 85],
  [80, 75],
  [90, 60],
  [10, 40],
  [30, 30],
  [55, 50],
  [75, 35],
  [88, 20],
  [50, 90],
]

export function ErrorParticles() {
  const particles = useMemo(
    () =>
      ANCHORS.map(([x, y], i) => {
        const tx = (Math.random() - 0.5) * 80
        const ty = -(60 + Math.random() * 80)
        const duration = 6 + Math.random() * 6
        const size = 1 + Math.random() * 2
        return {
          key: i,
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          // CSS custom props consumed by the .error-particle keyframes.
          // Cast through unknown so TS lets us pass CSS variables.
          style: {
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            ["--dur" as string]: `${duration}s`,
            ["--delay" as string]: `${i * 0.6}s`,
            ["--tx" as string]: `${tx}px`,
            ["--ty" as string]: `${ty}px`,
          } as React.CSSProperties,
        }
      }),
    [],
  )

  return (
    <div className="error-particles" aria-hidden="true">
      {particles.map((p) => (
        <span key={p.key} className="error-particle" style={p.style} />
      ))}
    </div>
  )
}
