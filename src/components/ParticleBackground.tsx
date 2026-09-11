import type { CSSProperties } from 'react'

export default function ParticleBackground() {
  return <div className="particle-background" aria-hidden="true">
    {Array.from({ length: 32 }, (_, index) => <span key={index} style={{
      left: `${(index * 37 + 11) % 100}%`,
      top: `${(index * 61 + 7) % 100}%`,
      '--size': `${2 + index % 3}px`,
      '--duration': `${18 + index % 11}s`,
      '--delay': `${-index * 3}s`,
      '--drift': `${(index % 5 - 2) * 16}px`,
    } as CSSProperties} />)}
  </div>
}
