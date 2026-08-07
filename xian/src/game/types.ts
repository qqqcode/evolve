/** 功法：吐纳点击 / 运转被动 */
export type ArtKind = 'click' | 'passive';

/** 凡人修仙式大道倾向（中期选定） */
export type BranchId =
  | 'flame' // 斗破·异火
  | 'alchemy' // 凡人·炼丹
  | 'body' // 遮天·体修
  | 'soul' // 仙逆·神魂
  | 'beast' // 凡人·驭兽
  | 'sword'; // 诸天·剑修

export type FactionId = 'orthodox' | 'dark' | 'hermit';
export type DestinyId = 'emperor' | 'guardian' | 'void';

/** 六维属性（对战拼点核心） */
export type AttrKey = 'atk' | 'def' | 'spd' | 'spirit' | 'bone' | 'luck';

export const ATTR_KEYS: AttrKey[] = ['atk', 'def', 'spd', 'spirit', 'bone', 'luck'];

export const ATTR_LABELS: Record<AttrKey, string> = {
  atk: '攻伐',
  def: '护体',
  spd: '身法',
  spirit: '神识',
  bone: '根骨',
  luck: '气机',
};

export type AttrMap = Record<AttrKey, number>;

export interface RealmDef {
  id: string;
  name: string;
  mult: number;
  starCostBase: number;
  breakCost: number;
  blurb: string;
  hue: number;
  /** 达到本境可继承的属性比例 0~1 */
  inheritAttrRate: number;
  /** 达到本境可从宝库携带的法宝数 */
  inheritTreasureSlots: number;
}

export interface BirthDef {
  id: string;
  name: string;
  blurb: string;
  /** 出身赠送属性 */
  attrs: Partial<AttrMap>;
  /** 额外自由属性点 */
  freePoints: number;
  /** 开局灵气 */
  startLingqi: number;
  flags?: string[];
  mark: string;
}

export interface ArtDef {
  id: string;
  name: string;
  description: string;
  kind: ArtKind;
  baseCost: number;
  costMult: number;
  power: number;
  minRealm: number;
  branch?: BranchId;
  faction?: FactionId;
  /** 每级额外属性 */
  attrs?: Partial<AttrMap>;
  mark: string;
}

export interface TreasureDef {
  id: string;
  name: string;
  description: string;
  /** 出处梗标签 */
  lore: string;
  /** 获得价格（灵气）；0 表示仅剧情/掉落 */
  cost: number;
  minRealm: number;
  attrs: Partial<AttrMap>;
  /** 对战斗力额外乘区 */
  combatMult?: number;
  mark: string;
  /** 可跨世存入宝库（达到继承境界后） */
  vaultable: boolean;
}

export interface EnemyDef {
  id: string;
  name: string;
  blurb: string;
  minRealm: number;
  maxRealm: number;
  /** 敌人基础属性 */
  attrs: AttrMap;
  /** 战胜奖励灵气 */
  rewardLingqi: number;
  /** 战胜奖励自由属性点 */
  rewardPoints?: number;
  /** 可能掉落法宝 */
  dropTreasureId?: string;
  dropChance?: number;
  lore: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  blurb: string;
  set?: Partial<{
    branchId: BranchId;
    factionId: FactionId;
    destinyId: DestinyId;
  }>;
  flags?: string[];
  lingqiDelta?: number;
  qiyunDelta?: number;
  freePointsDelta?: number;
  attrsDelta?: Partial<AttrMap>;
  grantTreasureId?: string;
  /** 触发一场对战 */
  combatEnemyId?: string;
  /** 失败则死亡 */
  deathOnLose?: boolean;
  /** 直接死亡（作死选项） */
  forceDeath?: boolean;
  deathReason?: string;
}

export interface StoryEventDef {
  id: string;
  title: string;
  body: string;
  minRealm: number;
  requireBranch?: BranchId;
  requireFaction?: FactionId;
  minStar?: number;
  requireFlags?: string[];
  requireBirth?: string;
  lore?: string;
  options: ChoiceOption[];
}

export interface EndingDef {
  id: string;
  name: string;
  title: string;
  body: string;
  priority: number;
  minRealm: number;
  requireBranch?: BranchId;
  requireFaction?: FactionId;
  requireDestiny?: DestinyId;
  requireFlags?: string[];
  requireArts?: Record<string, number>;
  requireTreasures?: string[];
  minQiyun?: number;
  minAttrs?: Partial<AttrMap>;
}

/** 轮回待选阶段（死亡或主动轮回后） */
export type LifePhase = 'playing' | 'rebirth' | 'ended';

export interface GameState {
  /** 灵气（本世资源） */
  lingqi: number;
  totalLingqi: number;
  /** 跨世气运（永久产出加成） */
  qiyun: number;
  owned: Record<string, number>;
  realmIndex: number;
  star: number;
  branchId: BranchId | null;
  factionId: FactionId | null;
  destinyId: DestinyId | null;
  doneEvents: string[];
  flags: string[];
  endingsUnlocked: string[];
  endingId: string | null;
  lastTickAt: number;
  reincarnations: number;
  saveVersion: number;
  chronicle: string[];

  /** 出身 */
  birthId: string | null;
  /** 本世分配后的属性 */
  attrs: AttrMap;
  /** 未分配自由点 */
  freePoints: number;
  /** 本世持有法宝 id */
  treasures: string[];
  /** 装备中的法宝（最多 3） */
  equipped: string[];
  /** 跨世宝库 */
  vault: string[];
  /** 跨世永久属性（继承累积） */
  legacyAttrs: AttrMap;
  /** 本世峰值境界（用于继承结算） */
  peakRealmIndex: number;
  /** 生命阶段 */
  phase: LifePhase;
  /** 死亡原因 */
  deathReason: string | null;
  /** 本世战斗胜场 */
  combatWins: number;
  combatLosses: number;
}

export interface DerivedStats {
  clickPower: number;
  lingqiPerSec: number;
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
  /** 属性 = 本世 + 永久 + 法宝 */
  totalAttrs: AttrMap;
  treasureAttrs: AttrMap;
  combatPower: number;
  inheritPreview: { attrRate: number; treasureSlots: number };
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

export interface CombatResult extends ActionResult {
  won?: boolean;
  playerPower?: number;
  enemyPower?: number;
}
