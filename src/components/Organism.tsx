import { useState } from 'react'
import type { Stage } from '../game/types'

interface Props {
  stage: Stage
  stageIndex: number
  totalStages: number
  onAbsorb: () => void
}

export function Organism({ stage, stageIndex, totalStages, onAbsorb }: Props) {
  const [pulses, setPulses] = useState<number[]>([])

  const handleClick = () => {
    onAbsorb()
    const id = Date.now() + Math.random()
    setPulses((p) => [...p, id])
    window.setTimeout(() => {
      setPulses((p) => p.filter((x) => x !== id))
    }, 600)
  }

  return (
    <section className="organism">
      <p className="organism__stage-label">
        Stage {stageIndex + 1} / {totalStages}
      </p>
      <h2 className="organism__name">{stage.name}</h2>
      <button
        className="organism__creature"
        onClick={handleClick}
        aria-label={`Absorb energy as a ${stage.name}`}
      >
        <span className="organism__emoji" aria-hidden>
          {stage.emoji}
        </span>
        {pulses.map((id) => (
          <span key={id} className="organism__pulse" aria-hidden />
        ))}
      </button>
      <p className="organism__blurb">{stage.blurb}</p>
      <p className="organism__hint">Click the organism to absorb energy</p>
    </section>
  )
}
