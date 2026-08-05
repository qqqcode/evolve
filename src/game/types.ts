export interface Stage {
  id: string
  name: string
  emoji: string
  blurb: string
  /** Energy required to evolve into the NEXT stage. */
  evolveCost: number
  /** DNA awarded when evolving out of this stage. */
  dnaReward: number
}

export interface MutationDef {
  id: string
  name: string
  emoji: string
  description: string
  baseCost: number
  /** Multiplicative cost growth per owned copy. */
  costGrowth: number
  /** Energy produced per second per owned copy. */
  eps: number
  /** Flat bonus added to click power per owned copy. */
  clickBonus: number
  /** Minimum stage index at which this mutation becomes available. */
  unlockStage: number
}

export interface GameState {
  energy: number
  totalEnergy: number
  dna: number
  stageIndex: number
  clicks: number
  /** Owned count keyed by mutation id. */
  mutations: Record<string, number>
  lastTick: number
}
