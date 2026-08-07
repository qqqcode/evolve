/** 功法：吐纳点击 / 运转被动 */
export type ArtKind = 'click' | 'passive';

/** 三修炼资源：灵力 / 体术 / 精神力 */
export type ResourceKey = 'lingli' | 'tishu' | 'jingshen';

export const RESOURCE_KEYS: ResourceKey[] = ['lingli', 'tishu', 'jingshen'];

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  lingli: '灵力',
  tishu: '体术',
  jingshen: '精神力',
};

export type ResourceMap = Record<ResourceKey, number>;

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

/** 六维属性（对战拼点核心；由三资源自动衍生，不可手动加点） */
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
  /** 出身赠送固定属性（事件/出身基底，不含资源衍生） */
  attrs: Partial<AttrMap>;
  /**
   * 旧版自由属性点；现折算为开局体术/精神力
   * @deprecated 保留字段以兼容出身数据
   */
  freePoints: number;
  /** 开局灵力 */
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
  /** 作用通道；缺省按分支推断 */
  channel?: ResourceKey;
  mark: string;
}

export interface TreasureDef {
  id: string;
  name: string;
  description: string;
  /** 出处梗标签 */
  lore: string;
  /** 获得价格（灵力）；0 表示仅剧情/掉落 */
  cost: number;
  minRealm: number;
  attrs: Partial<AttrMap>;
  /** 装备槽：战斗 / 修炼 / 辅助，互不干扰 */
  slot: EquipSlot;
  /** 对战斗力额外乘区（战斗槽为主） */
  combatMult?: number;
  /**
   * 越界战斗特效（概率触发，不只比战力）
   * crit：暴击加乘；dodge：闪避重掷；plotArmor：免死；firstStrike：先手加力
   */
  combatEdges?: {
    critChance?: number;
    critMult?: number;
    dodgeChance?: number;
    plotArmorChance?: number;
    firstStrikeChance?: number;
    firstStrikeBonus?: number;
  };
  /** 修炼槽：点击加成（默认加在灵力通道） */
  cultivateClick?: number;
  /** 修炼槽：被动每秒加成（默认加在灵力通道） */
  cultivatePassive?: number;
  mark: string;
  /** 可跨世存入宝库 */
  vaultable: boolean;
}

/** 装备槽位 */
export type EquipSlot = 'combat' | 'cultivate' | 'assist';

export const EQUIP_SLOTS: EquipSlot[] = ['combat', 'cultivate', 'assist'];

export const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  combat: '战斗',
  cultivate: '修炼',
  assist: '辅助',
};

/**
 * 每类槽位为数组：下标 0 为基础槽，随境界解锁更多格
 * 旧档 string|null 会在 migrate 时包成单元素数组
 */
export type EquippedMap = Record<EquipSlot, (string | null)[]>;

/** 天才地宝：不占装备槽，直接提升灵力/永久被动 */
export interface NaturalDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  minRealm: number;
  /** 立即获得灵力 */
  lingqiGain: number;
  /** 本世永久每秒灵力 */
  passiveBonus: number;
  mark: string;
  weight?: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  blurb: string;
  minRealm: number;
  maxRealm: number;
  /** 敌人基础属性 */
  attrs: AttrMap;
  /** 战胜奖励灵力 */
  rewardLingqi: number;
  /**
   * 旧版自由点奖励；现折算为三资源
   * @deprecated
   */
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
  tishuDelta?: number;
  jingshenDelta?: number;
  qiyunDelta?: number;
  /**
   * 旧版自由点；正数折算为三资源，不再进手动加点池
   * @deprecated
   */
  freePointsDelta?: number;
  attrsDelta?: Partial<AttrMap>;
  grantTreasureId?: string;
  /** 获得天才地宝 */
  grantNaturalId?: string;
  /** 获得药材 */
  grantHerbId?: string;
  grantHerbCount?: number;
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
  /** 可重复触发的随机奇遇（不进 doneEvents） */
  repeatable?: boolean;
  /** 随机池权重，默认 1 */
  weight?: number;
  /** 主线章节序号（从 1 起）；触发后推进 mainChapter */
  mainChapter?: number;
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

export type LifePhase = 'rebirth' | 'playing' | 'ended';

export type MilestoneKind = 'main' | 'branch' | 'combat' | 'loot' | 'destiny' | 'other';

export interface MilestoneEntry {
  id: string;
  title: string;
  detail: string;
  kind: MilestoneKind;
  /** 记录时的境界名，便于时间线对照 */
  realmLabel?: string;
  ts: number;
}

export interface GameState {
  /**
   * 灵力（本世资源；字段名 lingqi 兼容旧档）
   * UI 展示为「灵力」
   */
  lingqi: number;
  totalLingqi: number;
  /** 体术 */
  tishu: number;
  totalTishu: number;
  /** 精神力 */
  jingshen: number;
  totalJingshen: number;
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
  /** 本世固定属性（出身/事件/丹药；不含资源衍生） */
  attrs: AttrMap;
  /**
   * 已废弃的手动加点池；加载时折算为资源后清零
   * @deprecated
   */
  freePoints: number;
  /** 本世持有法宝 id */
  treasures: string[];
  /** 分槽装备：战斗 / 修炼 / 辅助 */
  equipped: EquippedMap;
  /** 跨世宝库 */
  vault: string[];
  /** 本世已获天才地宝 */
  naturals: string[];
  /** 天才地宝累计的永久被动灵力/秒 */
  naturalPassive: number;
  /** 主线进度：下一章编号（从 1 开始） */
  mainChapter: number;
  /**
   * 重要事件记录（不含日常吐纳流水）
   * kind: main 主线 / branch 道途阵营 / combat 生死战 / loot 重宝 / destiny 气运 / other
   */
  milestones: MilestoneEntry[];
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
  /** 当前随机奇遇（可重复池） */
  randomEventId: string | null;
  /** 上次随机奇遇触发时间 */
  lastRandomAt: number;
  /** 炼丹精通 */
  alchemyMastery: number;
  /** 持有药材 */
  herbs: Record<string, number>;
  /** 持有丹药（库存；当前丹成即食，保留字段） */
  pills: Record<string, number>;
  /** 已完成炼体阶数 */
  bodyStage: number;
  /** 当前阶炼体进度 */
  bodyProgress: number;
}

export interface DerivedStats {
  /** 各通道点击产出 */
  clickPowers: ResourceMap;
  /** 各通道每秒产出 */
  perSec: ResourceMap;
  /** @deprecated 等同 clickPowers.lingli */
  clickPower: number;
  /** @deprecated 等同 perSec.lingli */
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
  /** 属性 = 固定 + 永久 + 法宝 + 功法 + 炼体 + 资源衍生 */
  totalAttrs: AttrMap;
  /** 仅由三资源总量衍生的属性 */
  resourceAttrs: AttrMap;
  treasureAttrs: AttrMap;
  combatPower: number;
  cultivateClickBonus: number;
  cultivatePassiveBonus: number;
  bodyStageName: string;
  inheritPreview: { attrRate: number; treasureSlots: number };
}

export interface TickResult {
  state: GameState;
  gained: ResourceMap;
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
  /** 掉落描述 */
  loot?: string;
  /** 战败后果 */
  defeatOutcome?: 'death' | 'demote' | 'bruise';
  /** 法宝越界特效描述 */
  edgeEvents?: string[];
}
