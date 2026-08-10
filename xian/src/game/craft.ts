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

export interface PillRecipeDef {
  id: string;
  name: string;
  description: string;
  minRealm: number;
  /** 消耗药材 */
  herbs: Record<string, number>;
  /** 消耗修炼资源 */
  costs: Partial<ResourceMap>;
  /**
   * 炼成后效果：
   * - mastery 在炼成时获得
   * - resources/attrs 在「服下」时生效
   * - combat* 在战前吞服时生效（仅本场）
   */
  effect: {
    resources?: Partial<ResourceMap>;
    attrs?: Partial<AttrMap>;
    /** 永久炼丹精通（炼成时） */
    mastery?: number;
    /** 战前服用：战力倍率 */
    combatPowerMult?: number;
    /** 战前临时属性（仅本场） */
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
    cost: 40,
    minRealm: 0,
    mark: '草',
  },
  {
    id: 'herb_blood_root',
    name: '凝血根',
    description: '淬体常用，气味腥甜。',
    cost: 120,
    minRealm: 1,
    mark: '根',
  },
  {
    id: 'herb_soul_petal',
    name: '神识花瓣',
    description: '凝神开窍的辅材。',
    cost: 280,
    minRealm: 2,
    mark: '瓣',
  },
  {
    id: 'herb_flame_fruit',
    name: '赤焰果',
    description: '入鼎即燃，丹成色正。',
    cost: 900,
    minRealm: 3,
    mark: '果',
  },
  {
    id: 'herb_void_dew',
    name: '虚空露',
    description: '秘境凝露，一滴千金。',
    cost: 6_000,
    minRealm: 5,
    mark: '露',
  },
];

export const PILL_RECIPES: PillRecipeDef[] = [
  {
    id: 'pill_qi',
    name: '聚气丹',
    description: '炼化灵力；炼气破境必备。亦可战前小补。',
    minRealm: 0,
    herbs: { herb_spirit_grass: 2 },
    costs: { jingshen: 8, lingli: 20 },
    effect: {
      resources: { lingli: 120 },
      mastery: 1,
      combatPowerMult: 1.08,
      combatTempAttrs: { spirit: 1 },
    },
    mark: '气',
  },
  {
    id: 'pill_bone',
    name: '锻骨丹',
    description: '丹力入骨；筑基破境必备。战前可壮骨。',
    minRealm: 1,
    herbs: { herb_blood_root: 2, herb_spirit_grass: 1 },
    costs: { jingshen: 20, tishu: 30 },
    effect: {
      resources: { tishu: 200 },
      mastery: 1,
      combatPowerMult: 1.14,
      combatTempAttrs: { bone: 2, def: 1 },
    },
    mark: '骨',
  },
  {
    id: 'pill_mind',
    name: '凝神丹',
    description: '清心凝神；结丹破境必备。战前可凝神识。',
    minRealm: 2,
    herbs: { herb_soul_petal: 2 },
    costs: { jingshen: 40, lingli: 60 },
    effect: {
      resources: { jingshen: 220 },
      attrs: { spirit: 1 },
      mastery: 2,
      combatPowerMult: 1.18,
      combatTempAttrs: { spirit: 3, luck: 1 },
    },
    mark: '神',
  },
  {
    id: 'pill_battle',
    name: '破军丹',
    description: '激发气血，越界对战利器；元婴/化神破境所需。',
    minRealm: 3,
    herbs: { herb_flame_fruit: 1, herb_blood_root: 2 },
    costs: { jingshen: 80, tishu: 50, lingli: 100 },
    effect: {
      attrs: { atk: 1, bone: 1 },
      mastery: 2,
      combatPowerMult: 1.35,
      combatTempAttrs: { atk: 4, bone: 2, spd: 2 },
    },
    mark: '军',
  },
  {
    id: 'pill_dao',
    name: '问道丹',
    description: '丹成悟道；高阶破境核心。越界战时有奇效。',
    minRealm: 5,
    herbs: { herb_void_dew: 1, herb_soul_petal: 2, herb_flame_fruit: 1 },
    costs: { jingshen: 400, lingli: 800, tishu: 200 },
    effect: {
      resources: { lingli: 5_000, tishu: 2_000, jingshen: 3_000 },
      attrs: { spirit: 1, luck: 1 },
      mastery: 4,
      combatPowerMult: 1.55,
      combatTempAttrs: { atk: 5, spirit: 4, bone: 3, luck: 2 },
    },
    mark: '道',
  },
];

/**
 * 各大境界破境所需丹药（从当前境破入下一境）
 * key = 当前 realmIndex
 */
export const BREAKTHROUGH_PILL_NEED: Record<number, { pillId: string; count: number }> = {
  0: { pillId: 'pill_qi', count: 1 },
  1: { pillId: 'pill_bone', count: 1 },
  2: { pillId: 'pill_mind', count: 1 },
  3: { pillId: 'pill_battle', count: 1 },
  4: { pillId: 'pill_battle', count: 2 },
  5: { pillId: 'pill_dao', count: 1 },
  6: { pillId: 'pill_dao', count: 1 },
  7: { pillId: 'pill_dao', count: 2 },
  8: { pillId: 'pill_dao', count: 2 },
  9: { pillId: 'pill_dao', count: 3 },
  10: { pillId: 'pill_dao', count: 3 },
};

export function breakthroughPillNeed(
  realmIndex: number,
): { pillId: string; count: number } | null {
  return BREAKTHROUGH_PILL_NEED[realmIndex] || null;
}

/** 药材回收价（低于买入，鼓励炼丹） */
export function sellHerbValue(herbId: string): number {
  const h = getHerb(herbId);
  if (!h || h.cost <= 0) return 0;
  return Math.max(1, Math.floor(h.cost * 0.62));
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
    (recipe.costs.tishu || 0) * 0.85 +
    (recipe.costs.jingshen || 0) * 0.9;
  return herbCost + res;
}

/** 丹药售价：高于物料成本，买草炼丹再卖可赚灵力 */
export function sellPillValue(pillId: string): number {
  const recipe = getPillRecipe(pillId);
  if (!recipe) return 0;
  const cost = pillCraftCostEstimate(recipe);
  return Math.max(20, Math.floor(cost * 1.55));
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
