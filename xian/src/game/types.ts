/** 功法类型：吐纳点击 / 运转被动 */
export type ArtKind = 'click' | 'passive';

/** 道途分支（大斗师后选定） */
export type BranchId =
  | 'flame'
  | 'alchemy'
  | 'body'
  | 'soul'
  | 'beast'
  | 'sword';

/** 阵营（斗皇后选定） */
export type FactionId = 'orthodox' | 'dark' | 'hermit';

/** 气运抉择（斗尊后选定） */
export type DestinyId = 'emperor' | 'guardian' | 'void';

export interface RealmDef {
  id: string;
  name: string;
  /** 本境界总倍率 */
  mult: number;
  /** 升星基础斗气消耗（一星→二星） */
  starCostBase: number;
  /** 九星后破境消耗 */
  breakCost: number;
  blurb: string;
  /** 主题色相 */
  hue: number;
}

export interface ArtDef {
  id: string;
  name: string;
  description: string;
  kind: ArtKind;
  baseCost: number;
  costMult: number;
  power: number;
  /** 需要的最低境界下标；0 表示无 */
  minRealm: number;
  /** 需要的道途；空表示通用 */
  branch?: BranchId;
  /** 需要的阵营 */
  faction?: FactionId;
  mark: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  blurb: string;
  /** 选择后写入的字段 */
  set?: Partial<{
    branchId: BranchId;
    factionId: FactionId;
    destinyId: DestinyId;
  }>;
  /** 额外标记 */
  flags?: string[];
  /** 即时斗气奖励/惩罚 */
  douqiDelta?: number;
  /** 气运奖励 */
  qiyunDelta?: number;
}

export interface StoryEventDef {
  id: string;
  title: string;
  body: string;
  /** 触发：达到该境界下标且尚未做过此事件 */
  minRealm: number;
  /** 可选：需要已选道途 */
  requireBranch?: BranchId;
  /** 可选：需要已选阵营 */
  requireFaction?: FactionId;
  /** 可选：需要星级 */
  minStar?: number;
  /** 可选：需要旗帜 */
  requireFlags?: string[];
  options: ChoiceOption[];
}

export interface EndingDef {
  id: string;
  name: string;
  title: string;
  body: string;
  /** 优先级：越大越优先匹配 */
  priority: number;
  /** 需要境界下标 */
  minRealm: number;
  requireBranch?: BranchId;
  requireFaction?: FactionId;
  requireDestiny?: DestinyId;
  requireFlags?: string[];
  /** 需要某功法持有数 */
  requireArts?: Record<string, number>;
  /** 需要最低气运 */
  minQiyun?: number;
}

export interface GameState {
  douqi: number;
  totalDouqi: number;
  qiyun: number;
  owned: Record<string, number>;
  realmIndex: number;
  star: number;
  branchId: BranchId | null;
  factionId: FactionId | null;
  destinyId: DestinyId | null;
  /** 已完成的事件 id */
  doneEvents: string[];
  /** 叙事旗帜 */
  flags: string[];
  /** 已达成结局（可多次轮回收集） */
  endingsUnlocked: string[];
  /** 当前周目是否已触发结局展示 */
  endingId: string | null;
  lastTickAt: number;
  reincarnations: number;
  saveVersion: number;
  /** 近期叙事日志（最多保留若干条） */
  chronicle: string[];
}

export interface DerivedStats {
  clickPower: number;
  douqiPerSec: number;
  qiyunMult: number;
  realmMult: number;
  starMult: number;
  branchMult: number;
  realm: RealmDef;
  nextStarCost: number | null;
  breakCost: number | null;
  canRaiseStar: boolean;
  canBreakthrough: boolean;
  qiyunGain: number;
  canReincarnate: boolean;
  pendingEvent: StoryEventDef | null;
  matchedEnding: EndingDef | null;
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
  message?: string;
}
