import { formatNumber } from '../game/format'
import type { Stage } from '../game/types'

interface Props {
  stage: Stage
  nextStage: Stage | null
  energy: number
  canEvolve: boolean
  onEvolve: () => void
}

export function EvolvePanel({ stage, nextStage, energy, canEvolve, onEvolve }: Props) {
  if (!nextStage) {
    return (
      <section className="panel evolve evolve--max">
        <h3 className="panel__title">Apex</h3>
        <p className="evolve__done">
          You have reached <strong>{stage.name}</strong> — the summit of this
          lineage. Keep accumulating energy and DNA!
        </p>
      </section>
    )
  }

  const progress = Math.min(100, (energy / stage.evolveCost) * 100)

  return (
    <section className="panel evolve">
      <h3 className="panel__title">Evolve</h3>
      <p className="evolve__next">
        Next: <span aria-hidden>{nextStage.emoji}</span> {nextStage.name}
      </p>
      <div className="evolve__bar" role="progressbar" aria-valuenow={Math.floor(progress)}>
        <div className="evolve__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="evolve__cost">
        {formatNumber(energy)} / {formatNumber(stage.evolveCost)} ⚡
      </p>
      <button
        className="evolve__button"
        disabled={!canEvolve}
        onClick={onEvolve}
        data-testid="evolve-button"
      >
        {canEvolve ? `Evolve → ${nextStage.name}` : 'Not enough energy'}
      </button>
      <p className="evolve__reward">Reward: +{formatNumber(stage.dnaReward)} 🧬 DNA</p>
    </section>
  )
}
