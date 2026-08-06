/** 变异类型：点击力或被动产出 */
export type MutationKind = 'click' | 'passive';

export interface MutationDef {
  id: string;
  name: string;
  description: string;
  kind: MutationKind;
  /** 基础价格（能量） */
  baseCost: number;
  /** 每次购买后价格乘数 */
  costMult: number;
  /** 每级提供的点击力（kind=click）或每秒产出（kind=passive） */
  power: number;
  /** 图标（emoji） */
  icon: string;
}

export interface StageDef {
  id: string;
  name: string;
  /** 进化到本阶段所需能量（第 0 阶为 0） */
  evolveCost: number;
  /** 产出/点击倍率 */
  mult: number;
  blurb: string;
  /** 细胞视觉主题色 */
  hue: number;
}

export interface GameState {
  energy: number;
  /** 本周目累计获得能量（用于 DNA 结算） */
  totalEnergy: number;
  dna: number;
  /** 各变异持有数量 */
  owned: Record<string, number>;
  /** 当前生命阶段下标 0..7 */
  stageIndex: number;
  /** 上次结算时间戳（ms） */
  lastTickAt: number;
  /** 转生次数 */
  prestiges: number;
  /** 存档版本，便于迁移 */
  saveVersion: number;
}

export interface DerivedStats {
  clickPower: number;
  energyPerSec: number;
  dnaMult: number;
  stageMult: number;
  stage: StageDef;
  nextStage: StageDef | null;
  canEvolve: boolean;
  dnaGain: number;
  canPrestige: boolean;
}

export interface TickResult {
  state: GameState;
  gained: number;
  cappedSeconds: number;
  offlineSeconds: number;
}

export interface ActionResult {
  ok: boolean;
  state: GameState;
  reason?: string;
}
