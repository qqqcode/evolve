import { EvolvePanel } from './components/EvolvePanel'
import { MutationList } from './components/MutationList'
import { Organism } from './components/Organism'
import { StatsBar } from './components/StatsBar'
import { STAGES } from './game/config'
import {
  availableMutations,
  canEvolve,
  clickPower,
  currentStage,
  energyPerSecond,
} from './game/engine'
import { useGame } from './hooks/useGame'

export default function App() {
  const { state, doClick, doBuy, doEvolve, doReset } = useGame()

  const stage = currentStage(state)
  const nextStage = state.stageIndex < STAGES.length - 1 ? STAGES[state.stageIndex + 1] : null
  const eps = energyPerSecond(state)
  const perClick = clickPower(state)

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span aria-hidden>🧬</span> Evolve
        </h1>
        <p className="app__subtitle">
          Guide a single cell across billions of years into a thinking being.
        </p>
      </header>

      <StatsBar energy={state.energy} eps={eps} dna={state.dna} clickPower={perClick} />

      <main className="app__grid">
        <div className="app__col app__col--center">
          <Organism
            stage={stage}
            stageIndex={state.stageIndex}
            totalStages={STAGES.length}
            onAbsorb={doClick}
          />
          <EvolvePanel
            stage={stage}
            nextStage={nextStage}
            energy={state.energy}
            canEvolve={canEvolve(state)}
            onEvolve={doEvolve}
          />
        </div>

        <div className="app__col app__col--side">
          <MutationList
            state={state}
            mutations={availableMutations(state)}
            onBuy={doBuy}
          />
        </div>
      </main>

      <footer className="app__footer">
        <span>Total energy absorbed: {Math.floor(state.totalEnergy).toLocaleString()} ⚡</span>
        <button className="app__reset" onClick={doReset}>
          Reset progress
        </button>
      </footer>
    </div>
  )
}
