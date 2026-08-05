import {
  DNA_BONUS_PER_POINT,
  MUTATIONS,
  SAVE_KEY,
  STAGES,
  STAGE_MULTIPLIER,
} from './config'
import type { GameState, MutationDef } from './types'

export function createInitialState(): GameState {
  return {
    energy: 0,
    totalEnergy: 0,
    dna: 0,
    stageIndex: 0,
    clicks: 0,
    mutations: {},
    lastTick: Date.now(),
  }
}

export function getMutation(id: string): MutationDef {
  const def = MUTATIONS.find((m) => m.id === id)
  if (!def) throw new Error(`Unknown mutation: ${id}`)
  return def
}

/** Global multiplier from accumulated DNA and current evolutionary stage. */
export function productionMultiplier(state: GameState): number {
  const dnaMult = 1 + state.dna * DNA_BONUS_PER_POINT
  const stageMult = Math.pow(STAGE_MULTIPLIER, state.stageIndex)
  return dnaMult * stageMult
}

/** Cost of buying the next copy of a mutation, given how many are owned. */
export function mutationCost(id: string, owned: number): number {
  const def = getMutation(id)
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, owned))
}

/** Energy gained per manual click, including bonuses and multipliers. */
export function clickPower(state: GameState): number {
  let flat = 1
  for (const def of MUTATIONS) {
    const owned = state.mutations[def.id] ?? 0
    flat += def.clickBonus * owned
  }
  return flat * productionMultiplier(state)
}

/** Passive energy generated per second from all owned mutations. */
export function energyPerSecond(state: GameState): number {
  let base = 0
  for (const def of MUTATIONS) {
    const owned = state.mutations[def.id] ?? 0
    base += def.eps * owned
  }
  return base * productionMultiplier(state)
}

export function currentStage(state: GameState) {
  return STAGES[state.stageIndex]
}

export function canEvolve(state: GameState): boolean {
  return state.energy >= currentStage(state).evolveCost
}

/** Mutations that are visible/purchasable at the current stage. */
export function availableMutations(state: GameState): MutationDef[] {
  return MUTATIONS.filter((m) => m.unlockStage <= state.stageIndex)
}

export function click(state: GameState): GameState {
  const gain = clickPower(state)
  return {
    ...state,
    energy: state.energy + gain,
    totalEnergy: state.totalEnergy + gain,
    clicks: state.clicks + 1,
  }
}

export function buyMutation(state: GameState, id: string): GameState {
  const owned = state.mutations[id] ?? 0
  const cost = mutationCost(id, owned)
  if (state.energy < cost) return state
  return {
    ...state,
    energy: state.energy - cost,
    mutations: { ...state.mutations, [id]: owned + 1 },
  }
}

export function evolve(state: GameState): GameState {
  if (!canEvolve(state)) return state
  const stage = currentStage(state)
  const nextIndex = Math.min(state.stageIndex + 1, STAGES.length - 1)
  if (nextIndex === state.stageIndex) return state
  return {
    ...state,
    stageIndex: nextIndex,
    dna: state.dna + stage.dnaReward,
    // Evolving is a fresh start on energy but keeps mutations and DNA.
    energy: 0,
  }
}

/** Advance the passive economy by `seconds`. Pure and deterministic. */
export function tick(state: GameState, seconds: number): GameState {
  if (seconds <= 0) return state
  const gain = energyPerSecond(state) * seconds
  if (gain === 0) return { ...state, lastTick: Date.now() }
  return {
    ...state,
    energy: state.energy + gain,
    totalEnergy: state.totalEnergy + gain,
    lastTick: Date.now(),
  }
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<GameState>
    const base = createInitialState()
    const merged: GameState = {
      ...base,
      ...parsed,
      mutations: { ...parsed.mutations },
    }
    // Apply offline progress since the last save, capped to 8 hours.
    const elapsed = Math.min((Date.now() - (parsed.lastTick ?? Date.now())) / 1000, 8 * 3600)
    return tick(merged, elapsed)
  } catch {
    return createInitialState()
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures (e.g. private mode); the game still runs.
  }
}

export function resetState(): GameState {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // Ignore.
  }
  return createInitialState()
}
