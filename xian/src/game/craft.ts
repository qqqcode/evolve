/**
 * 炼丹 / 炼器 体系
 * 炼器境界由累计体术决定：低阶仅能炼凡品，高阶可炼灵/仙并可升品
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
  /** 炼成后立即生效 */
  effect: {
    resources?: Partial<ResourceMap>;
    attrs?: Partial<AttrMap>;
    /** 永久炼丹精通 */
    mastery?: number;
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
    description: '最基础的药引，凡人药园常见。',
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
    description: '炼化灵力，稳固气海。',
    minRealm: 0,
    herbs: { herb_spirit_grass: 2 },
    costs: { jingshen: 8, lingli: 20 },
    effect: { resources: { lingli: 120 }, mastery: 1 },
    mark: '气',
  },
  {
    id: 'pill_bone',
    name: '锻骨丹',
    description: '丹力入骨，体术大涨，助推炼器境界。',
    minRealm: 1,
    herbs: { herb_blood_root: 2, herb_spirit_grass: 1 },
    costs: { jingshen: 20, tishu: 30 },
    effect: { resources: { tishu: 200 }, mastery: 1 },
    mark: '骨',
  },
  {
    id: 'pill_mind',
    name: '凝神丹',
    description: '清心凝神，精神力暴涨。',
    minRealm: 2,
    herbs: { herb_soul_petal: 2 },
    costs: { jingshen: 40, lingli: 60 },
    effect: { resources: { jingshen: 220 }, attrs: { spirit: 1 }, mastery: 2 },
    mark: '神',
  },
  {
    id: 'pill_battle',
    name: '破军丹',
    description: '短期激发气血，攻伐大增。',
    minRealm: 3,
    herbs: { herb_flame_fruit: 1, herb_blood_root: 2 },
    costs: { jingshen: 80, tishu: 50, lingli: 100 },
    effect: { attrs: { atk: 2, bone: 1 }, mastery: 2 },
    mark: '军',
  },
  {
    id: 'pill_dao',
    name: '问道丹',
    description: '丹成悟道，三才齐增。',
    minRealm: 5,
    herbs: { herb_void_dew: 1, herb_soul_petal: 2, herb_flame_fruit: 1 },
    costs: { jingshen: 400, lingli: 800, tishu: 200 },
    effect: {
      resources: { lingli: 5_000, tishu: 2_000, jingshen: 3_000 },
      attrs: { spirit: 2, luck: 1 },
      mastery: 4,
    },
    mark: '道',
  },
];

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
export const bodyMultipliers = forgeMultipliers;
/** @deprecated */
export const bodyAttrsBonus = forgeAttrsBonus;
