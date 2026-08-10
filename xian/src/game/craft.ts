/**
 * 炼丹 / 炼器 体系
 * 炼器境界由累计体术决定：低阶仅能炼凡品，高阶可炼灵/仙并可升品
 * 丹药炼成入库：可服下、战前强化、破境消耗，亦可出售
 */
import type { AttrMap, ResourceKey, ResourceMap, TreasureTier } from './types';

export interface HerbDef {
  id: string;
  name: string;
  description: string;
  /** 坊市灵力价格；0 仅掉落 */
  cost: number;
  minRealm: number;
  mark: string;
}

/** 丹药主用途标签 */
export type PillKind = 'advance' | 'perm' | 'battle' | 'resource';

export const PILL_KIND_LABELS: Record<PillKind, string> = {
  advance: '进阶',
  perm: '永久战',
  battle: '战前',
  resource: '资源',
};

export interface PillRecipeDef {
  id: string;
  name: string;
  description: string;
  minRealm: number;
  /** 主用途 */
  kind: PillKind;
  /** 消耗药材 */
  herbs: Record<string, number>;
  /** 消耗修炼资源（炼丹成本偏高） */
  costs: Partial<ResourceMap>;
  /** 坊市直购价；>0 可买 */
  shopCost: number;
  /**
   * 炼成后效果：
   * - mastery 在炼成时获得
   * - resources/attrs/combatPowerFlat 在「服下」时生效
   * - combatPowerMult/combatTempAttrs 仅战前一回合
   */
  effect: {
    resources?: Partial<ResourceMap>;
    attrs?: Partial<AttrMap>;
    /** 永久炼丹精通（炼成时） */
    mastery?: number;
    /** 服下：永久固定战力 */
    combatPowerFlat?: number;
    /** 战前一回合：战力倍率 */
    combatPowerMult?: number;
    /** 战前一回合：临时属性 */
    combatTempAttrs?: Partial<AttrMap>;
  };
  mark: string;
}

/** 炼器境界：由累计体术自动达成 */
export interface ForgeRealmDef {
  id: string;
  name: string;
  blurb: string;
  /** 累计体术门槛 */
  needTotalTishu: number;
  /** 可炼器的最高品阶 */
  maxTier: TreasureTier;
  /** 本境可强化至的最高炼器等级（+1~+9） */
  maxLevel: number;
  /**
   * 可升品的起点品阶；达成后可将该品（+满）升一阶
   * 例：mortal → 升为灵品
   */
  canPromoteFrom?: TreasureTier;
  /** 升品体术消耗 */
  promoteCost?: number;
  /** 达成后永久小幅属性（替代旧炼体加成） */
  attrs?: Partial<AttrMap>;
  /** 体术产出微增 */
  tishuMult: number;
  /** 战力微增 */
  combatMult: number;
}

export const TIER_RANK: Record<TreasureTier, number> = {
  mortal: 0,
  spirit: 1,
  immortal: 2,
};

export const TIER_PROMOTE_TARGET: Partial<Record<TreasureTier, TreasureTier>> = {
  mortal: 'spirit',
  spirit: 'immortal',
};

/** 全法宝统一炼器上限 */
export const MAX_TEMPER_LEVEL = 9;

/**
 * 炼器境界（皮肉→器圣）
 * 低阶只能炼凡品；气血起可炼灵品；器圣可炼仙品；脏腑/器圣可升品
 */
export const FORGE_REALMS: ForgeRealmDef[] = [
  {
    id: 'forge_skin',
    name: '皮肉境',
    blurb: '刚开炉火，仅能淬炼凡品，最高炼至 +9。',
    needTotalTishu: 0,
    maxTier: 'mortal',
    maxLevel: 9,
    attrs: { bone: 1 },
    tishuMult: 1.04,
    combatMult: 1.02,
  },
  {
    id: 'forge_tendon',
    name: '筋骨境',
    blurb: '筋骨如钳，凡品炼器更加得心应手。',
    needTotalTishu: 2_000,
    maxTier: 'mortal',
    maxLevel: 9,
    attrs: { bone: 1, def: 1 },
    tishuMult: 1.08,
    combatMult: 1.04,
  },
  {
    id: 'forge_blood',
    name: '气血境',
    blurb: '气血灌器，可炼灵品法宝。',
    needTotalTishu: 1.5e4,
    maxTier: 'spirit',
    maxLevel: 9,
    attrs: { bone: 2, atk: 1 },
    tishuMult: 1.12,
    combatMult: 1.06,
  },
  {
    id: 'forge_organ',
    name: '脏腑境',
    blurb: '五脏为炉：满强凡品可升为灵品。',
    needTotalTishu: 8e4,
    maxTier: 'spirit',
    maxLevel: 9,
    canPromoteFrom: 'mortal',
    promoteCost: 2.5e4,
    attrs: { bone: 2, def: 2, spirit: 1 },
    tishuMult: 1.18,
    combatMult: 1.1,
  },
  {
    id: 'forge_saint',
    name: '器圣境',
    blurb: '器道小成：可炼仙品；满强灵品可升仙品。',
    needTotalTishu: 5e5,
    maxTier: 'immortal',
    maxLevel: 9,
    canPromoteFrom: 'spirit',
    promoteCost: 2e5,
    attrs: { bone: 3, atk: 2, def: 2, spirit: 2 },
    tishuMult: 1.28,
    combatMult: 1.16,
  },
];

export const HERBS: HerbDef[] = [
  {
    id: 'herb_spirit_grass',
    name: '百年灵草',
    description: '最基础的灵药，坊市随处可见。',
    cost: 55,
    minRealm: 0,
    mark: '草',
  },
  {
    id: 'herb_blood_root',
    name: '凝血根',
    description: '淬体常用，气味腥甜。',
    cost: 160,
    minRealm: 1,
    mark: '根',
  },
  {
    id: 'herb_soul_petal',
    name: '神识花瓣',
    description: '凝神开窍的辅材。',
    cost: 380,
    minRealm: 2,
    mark: '瓣',
  },
  {
    id: 'herb_flame_fruit',
    name: '赤焰果',
    description: '入鼎即燃，丹成色正。',
    cost: 1_200,
    minRealm: 3,
    mark: '果',
  },
  {
    id: 'herb_thunder_leaf',
    name: '雷纹叶',
    description: '带电的药叶，战丹常用。',
    cost: 2_800,
    minRealm: 4,
    mark: '叶',
  },
  {
    id: 'herb_void_dew',
    name: '虚空露',
    description: '秘境凝露，一滴千金。',
    cost: 8_000,
    minRealm: 5,
    mark: '露',
  },
  {
    id: 'herb_dragon_bone',
    name: '龙骨碎',
    description: '伪龙残骸，炼永久战丹。',
    cost: 2.2e4,
    minRealm: 6,
    mark: '骨',
  },
];

/**
 * 丹药：炼丹成本偏高；坊市可直购以卡准升层/破境节奏
 * kind: advance 进阶材料 / perm 永久战力 / battle 战前一回合 / resource 资源
 */
export const PILL_RECIPES: PillRecipeDef[] = [
  {
    id: 'pill_yuan',
    name: '培元丹',
    description: '稳固修为。炼气～结丹每次升层必备，坊市常备。',
    minRealm: 0,
    kind: 'advance',
    herbs: { herb_spirit_grass: 3 },
    costs: { jingshen: 25, lingli: 60 },
    shopCost: 180,
    effect: { mastery: 1, resources: { lingli: 40 } },
    mark: '培',
  },
  {
    id: 'pill_qi',
    name: '聚气丹',
    description: '炼化灵力；炼气破境核心。',
    minRealm: 0,
    kind: 'advance',
    herbs: { herb_spirit_grass: 4 },
    costs: { jingshen: 30, lingli: 80 },
    shopCost: 320,
    effect: { resources: { lingli: 200 }, mastery: 1 },
    mark: '气',
  },
  {
    id: 'pill_bone',
    name: '锻骨丹',
    description: '丹力入骨；筑基破境与中期升层所需。',
    minRealm: 1,
    kind: 'advance',
    herbs: { herb_blood_root: 3, herb_spirit_grass: 2 },
    costs: { jingshen: 50, tishu: 80, lingli: 40 },
    shopCost: 720,
    effect: { resources: { tishu: 280 }, mastery: 1 },
    mark: '骨',
  },
  {
    id: 'pill_mind',
    name: '凝神丹',
    description: '清心凝神；结丹破境必备。',
    minRealm: 2,
    kind: 'advance',
    herbs: { herb_soul_petal: 3, herb_spirit_grass: 1 },
    costs: { jingshen: 120, lingli: 180 },
    shopCost: 1_600,
    effect: { resources: { jingshen: 320 }, attrs: { spirit: 1 }, mastery: 2 },
    mark: '神',
  },
  {
    id: 'pill_infant',
    name: '婴变丹',
    description: '元婴前后升层与破境常用。',
    minRealm: 3,
    kind: 'advance',
    herbs: { herb_flame_fruit: 2, herb_soul_petal: 2, herb_blood_root: 2 },
    costs: { jingshen: 220, tishu: 160, lingli: 400 },
    shopCost: 6_500,
    effect: { resources: { lingli: 800, jingshen: 400 }, mastery: 2 },
    mark: '婴',
  },
  {
    id: 'pill_dao',
    name: '问道丹',
    description: '高阶破境与升层核心丹。',
    minRealm: 5,
    kind: 'advance',
    herbs: { herb_void_dew: 2, herb_soul_petal: 3, herb_flame_fruit: 2 },
    costs: { jingshen: 900, lingli: 2_200, tishu: 600 },
    shopCost: 4.5e4,
    effect: {
      resources: { lingli: 4_000, tishu: 1_500, jingshen: 2_500 },
      attrs: { spirit: 1, luck: 1 },
      mastery: 3,
    },
    mark: '道',
  },
  {
    id: 'pill_void',
    name: '虚空丹',
    description: '炼虚之后的进阶丹，破境极耗。',
    minRealm: 6,
    kind: 'advance',
    herbs: { herb_void_dew: 3, herb_dragon_bone: 1, herb_thunder_leaf: 2 },
    costs: { jingshen: 2_500, lingli: 1.2e4, tishu: 2_000 },
    shopCost: 2.8e5,
    effect: {
      resources: { lingli: 2e4, tishu: 8_000, jingshen: 1.2e4 },
      mastery: 4,
    },
    mark: '虚',
  },
  {
    id: 'pill_iron',
    name: '铁骨丹',
    description: '服下永久增加战力。低阶战丹。',
    minRealm: 1,
    kind: 'perm',
    herbs: { herb_blood_root: 4, herb_spirit_grass: 2 },
    costs: { tishu: 120, jingshen: 60, lingli: 80 },
    shopCost: 1_100,
    effect: { combatPowerFlat: 8, attrs: { bone: 1 }, mastery: 1 },
    mark: '铁',
  },
  {
    id: 'pill_kill',
    name: '杀伐丹',
    description: '服下永久战力大增，攻伐入髓。',
    minRealm: 3,
    kind: 'perm',
    herbs: { herb_flame_fruit: 2, herb_blood_root: 3, herb_thunder_leaf: 1 },
    costs: { tishu: 280, jingshen: 160, lingli: 500 },
    shopCost: 8_800,
    effect: { combatPowerFlat: 28, attrs: { atk: 2, bone: 1 }, mastery: 2 },
    mark: '杀',
  },
  {
    id: 'pill_immortal_body',
    name: '金身丹',
    description: '服下永久战力与防御。高阶战丹。',
    minRealm: 5,
    kind: 'perm',
    herbs: { herb_dragon_bone: 2, herb_void_dew: 1, herb_thunder_leaf: 2 },
    costs: { tishu: 1_200, jingshen: 800, lingli: 3_000 },
    shopCost: 9.5e4,
    effect: { combatPowerFlat: 90, attrs: { def: 3, bone: 2, atk: 1 }, mastery: 3 },
    mark: '金',
  },
  {
    id: 'pill_blood',
    name: '活血丹',
    description: '战前一回合小幅爆发，便宜应急。',
    minRealm: 0,
    kind: 'battle',
    herbs: { herb_spirit_grass: 2, herb_blood_root: 1 },
    costs: { jingshen: 20, tishu: 30, lingli: 40 },
    shopCost: 260,
    effect: {
      mastery: 1,
      combatPowerMult: 1.12,
      combatTempAttrs: { atk: 2, spd: 1 },
    },
    mark: '血',
  },
  {
    id: 'pill_battle',
    name: '破军丹',
    description: '战前一回合大幅强化，越界对战主力。',
    minRealm: 2,
    kind: 'battle',
    herbs: { herb_flame_fruit: 2, herb_blood_root: 3, herb_thunder_leaf: 1 },
    costs: { jingshen: 160, tishu: 120, lingli: 280 },
    shopCost: 4_200,
    effect: {
      mastery: 2,
      combatPowerMult: 1.32,
      combatTempAttrs: { atk: 5, bone: 2, spd: 2 },
    },
    mark: '军',
  },
  {
    id: 'pill_war_god',
    name: '战神丹',
    description: '战前一回合极致爆发，绝境/越界翻盘用。',
    minRealm: 4,
    kind: 'battle',
    herbs: { herb_thunder_leaf: 3, herb_flame_fruit: 2, herb_void_dew: 1 },
    costs: { jingshen: 600, tishu: 400, lingli: 1_500 },
    shopCost: 3.2e4,
    effect: {
      mastery: 3,
      combatPowerMult: 1.55,
      combatTempAttrs: { atk: 8, spirit: 4, bone: 3, spd: 3, luck: 2 },
    },
    mark: '战',
  },
  {
    id: 'pill_triad',
    name: '三才丹',
    description: '服下三资源齐补，渡资源瓶颈。',
    minRealm: 2,
    kind: 'resource',
    herbs: { herb_soul_petal: 2, herb_blood_root: 2, herb_spirit_grass: 3 },
    costs: { jingshen: 100, tishu: 100, lingli: 100 },
    shopCost: 2_400,
    effect: {
      resources: { lingli: 600, tishu: 600, jingshen: 600 },
      mastery: 2,
    },
    mark: '三',
  },
];

/**
 * 升层丹药：每一层都要；随境界与层数略增
 * 卡点：坊市可买，炼丹更贵，刚好卡在灵力+丹药双门槛
 */
export function raiseStarPillNeed(state: {
  realmIndex: number;
  star: number;
}): { pillId: string; count: number } | null {
  if (state.star >= 9) return null;
  const r = state.realmIndex;
  const late = state.star >= 6;
  if (r <= 1) return { pillId: 'pill_yuan', count: late ? 2 : 1 };
  if (r === 2) return { pillId: 'pill_yuan', count: late ? 3 : 2 };
  if (r === 3) return { pillId: 'pill_infant', count: late ? 2 : 1 };
  if (r === 4) return { pillId: 'pill_infant', count: late ? 2 : 1 };
  if (r === 5) return { pillId: 'pill_dao', count: 1 };
  if (r <= 7) return { pillId: 'pill_dao', count: late ? 2 : 1 };
  return { pillId: 'pill_void', count: late ? 2 : 1 };
}

/**
 * 各大境界破境所需丹药（从当前境破入下一境）
 * key = 当前 realmIndex
 */
export const BREAKTHROUGH_PILL_NEED: Record<number, { pillId: string; count: number }> = {
  0: { pillId: 'pill_qi', count: 2 },
  1: { pillId: 'pill_bone', count: 2 },
  2: { pillId: 'pill_mind', count: 2 },
  3: { pillId: 'pill_infant', count: 2 },
  4: { pillId: 'pill_infant', count: 3 },
  5: { pillId: 'pill_dao', count: 2 },
  6: { pillId: 'pill_void', count: 1 },
  7: { pillId: 'pill_void', count: 2 },
  8: { pillId: 'pill_void', count: 2 },
  9: { pillId: 'pill_void', count: 3 },
  10: { pillId: 'pill_void', count: 3 },
};

export function breakthroughPillNeed(
  realmIndex: number,
): { pillId: string; count: number } | null {
  return BREAKTHROUGH_PILL_NEED[realmIndex] || null;
}

/** 药材回收价（低于买入） */
export function sellHerbValue(herbId: string): number {
  const h = getHerb(herbId);
  if (!h || h.cost <= 0) return 0;
  return Math.max(1, Math.floor(h.cost * 0.55));
}

/** 估算炼丹物料成本（灵力当量） */
export function pillCraftCostEstimate(recipe: PillRecipeDef): number {
  let herbCost = 0;
  for (const [hid, n] of Object.entries(recipe.herbs)) {
    const h = getHerb(hid);
    herbCost += (h?.cost || 40) * n;
  }
  const res =
    (recipe.costs.lingli || 0) +
    (recipe.costs.tishu || 0) * 0.9 +
    (recipe.costs.jingshen || 0) * 0.95;
  return herbCost + res;
}

/**
 * 丹药回收价：略低于坊市价，避免买了倒卖；炼丹因成本高通常不靠倒卖赚钱
 */
export function sellPillValue(pillId: string): number {
  const recipe = getPillRecipe(pillId);
  if (!recipe) return 0;
  const craft = pillCraftCostEstimate(recipe);
  const byShop = recipe.shopCost > 0 ? recipe.shopCost * 0.72 : craft * 0.85;
  return Math.max(15, Math.floor(Math.min(byShop, craft * 0.9)));
}

/** 是否为战前一回合丹 */
export function isBattlePill(recipe: PillRecipeDef): boolean {
  return recipe.kind === 'battle' || !!(recipe.effect.combatPowerMult || recipe.effect.combatTempAttrs);
}

export function getHerb(id: string): HerbDef | undefined {
  return HERBS.find((h) => h.id === id);
}

export function getPillRecipe(id: string): PillRecipeDef | undefined {
  return PILL_RECIPES.find((p) => p.id === id);
}

export function getForgeRealm(index: number): ForgeRealmDef {
  const i = Math.max(0, Math.min(FORGE_REALMS.length - 1, index));
  return FORGE_REALMS[i]!;
}

/** 由累计体术判定炼器境界下标 */
export function forgeRealmIndexFromTotal(totalTishu: number): number {
  let idx = 0;
  for (let i = 0; i < FORGE_REALMS.length; i++) {
    if (totalTishu >= FORGE_REALMS[i]!.needTotalTishu) idx = i;
  }
  return idx;
}

export function tierAllowed(realmMax: TreasureTier, treasureTier: TreasureTier): boolean {
  return TIER_RANK[treasureTier] <= TIER_RANK[realmMax];
}

/** 当前炼器境界乘区（已达成最高境） */
export function forgeMultipliers(realmIndex: number): { tishuMult: number; combatMult: number } {
  const stage = getForgeRealm(realmIndex);
  return { tishuMult: stage.tishuMult, combatMult: stage.combatMult };
}

/** 已达成各炼器境的属性合计 */
export function forgeAttrsBonus(realmIndex: number): Partial<AttrMap> {
  const sum: Partial<AttrMap> = {};
  for (let i = 0; i <= realmIndex && i < FORGE_REALMS.length; i++) {
    const a = FORGE_REALMS[i]!.attrs;
    if (!a) continue;
    for (const [k, v] of Object.entries(a)) {
      const key = k as keyof AttrMap;
      sum[key] = (sum[key] || 0) + (v || 0);
    }
  }
  return sum;
}

export function emptyHerbs(): Record<string, number> {
  const o: Record<string, number> = {};
  for (const h of HERBS) o[h.id] = 0;
  return o;
}

export function emptyPills(): Record<string, number> {
  const o: Record<string, number> = {};
  for (const p of PILL_RECIPES) o[p.id] = 0;
  return o;
}

export const RESOURCE_COST_LABEL: Record<ResourceKey, string> = {
  lingli: '灵力',
  tishu: '体术',
  jingshen: '精神力',
};

/** @deprecated 兼容旧引用 */
export const BODY_STAGES = FORGE_REALMS;
/** @deprecated */
export function getBodyStage(index: number): ForgeRealmDef | undefined {
  return FORGE_REALMS[index];
}
/** @deprecated */
export function bodyStageIndexFromTotal(total: number): number {
  return forgeRealmIndexFromTotal(total);
}
/** @deprecated */
export const bodyMultipliers = forgeMultipliers;
/** @deprecated */
export const bodyAttrsBonus = forgeAttrsBonus;
