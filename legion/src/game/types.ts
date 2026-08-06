/** 兵种 */
export type UnitKind = '盾' | '刀' | '骑' | '弓' | '术';

export type TeamId = 'ally' | 'enemy';

export type RangeClass = 'melee' | 'cavalry' | 'ranged';

export interface UnitStats {
  maxHp: number;
  atk: number;
  /** 攻击距离（格） */
  range: number;
  /** 行动间隔权重，越小越快 */
  speed: number;
}

export interface SkillDef {
  id: string;
  name: string;
  desc: string;
}

export interface KindDef {
  kind: UnitKind;
  rangeClass: RangeClass;
  base: UnitStats;
  /** index 0 = 升到 2 级获得；index 1 = 升到 3 级获得 */
  skills: [SkillDef, SkillDef];
  hue: number;
}

export interface UnitInstance {
  id: string;
  kind: UnitKind;
  level: number; // 1..3
  team: TeamId;
  /** 棋盘坐标；备战区为 null */
  row: number | null;
  col: number | null;
  /** 备战区下标；在场上为 null */
  benchIndex: number | null;
  hp: number;
  maxHp: number;
  atk: number;
  range: number;
  speed: number;
  /** 已学会技能 id */
  skills: string[];
}

export interface ShopOffer {
  kind: UnitKind;
  cost: number;
}

export type Phase = 'prep' | 'battle' | 'result';

export interface GameState {
  round: number;
  gold: number;
  hp: number; // 玩家生命
  phase: Phase;
  units: UnitInstance[];
  shop: ShopOffer[];
  selectedUnitId: string | null;
  lastResult: 'win' | 'lose' | 'draw' | null;
  battleLog: string[];
}

/** 战斗回放的一帧 */
export interface BattleFrame {
  units: Array<{
    id: string;
    kind: UnitKind;
    level: number;
    team: TeamId;
    row: number;
    col: number;
    hp: number;
    maxHp: number;
    dead?: boolean;
  }>;
  events: string[];
}

export interface BattleResult {
  frames: BattleFrame[];
  winner: 'ally' | 'enemy' | 'draw';
}
