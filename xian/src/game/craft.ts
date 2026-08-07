/**
 * 炼丹 / 炼体 体系
 */
import type { AttrMap, ResourceKey, ResourceMap } from './types';

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
    /** 体修进度 */
    bodyProgress?: number;
  };
  mark: string;
}

export interface BodyStageDef {
  id: string;
  name: string;
  blurb: string;
  /** 升至本阶所需体修进度 */
  progressNeed: number;
  /** 锤炼一次消耗 */
  temperCost: Partial<ResourceMap>;
  /** 锤炼一次获得进度 */
  temperGain: number;
  /** 体术产出乘区 */
  tishuMult: number;
  /** 战力乘区 */
  combatMult: number;
  /** 达成后永久属性 */
  attrs: Partial<AttrMap>;
  minRealm: number;
}

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
    description: '丹力入骨，助推炼体。',
    minRealm: 1,
    herbs: { herb_blood_root: 2, herb_spirit_grass: 1 },
    costs: { jingshen: 20, tishu: 30 },
    effect: { bodyProgress: 12, resources: { tishu: 80 }, mastery: 1 },
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

/** bodyStage 为已达成阶数（0=未炼体，最高 = BODY_STAGES.length） */
export const BODY_STAGES: BodyStageDef[] = [
  {
    id: 'body_skin',
    name: '皮肉境',
    blurb: '锤皮炼肉，抗击打略增。',
    progressNeed: 40,
    temperCost: { tishu: 25, lingli: 10 },
    temperGain: 8,
    tishuMult: 1.08,
    combatMult: 1.04,
    attrs: { def: 1, bone: 1 },
    minRealm: 0,
  },
  {
    id: 'body_tendon',
    name: '筋骨境',
    blurb: '筋如弓弦，骨如精铁。',
    progressNeed: 90,
    temperCost: { tishu: 80, lingli: 40 },
    temperGain: 10,
    tishuMult: 1.16,
    combatMult: 1.08,
    attrs: { atk: 1, def: 1, bone: 2 },
    minRealm: 1,
  },
  {
    id: 'body_blood',
    name: '气血境',
    blurb: '气血如潮，拳可崩石。',
    progressNeed: 180,
    temperCost: { tishu: 220, lingli: 120, jingshen: 30 },
    temperGain: 12,
    tishuMult: 1.28,
    combatMult: 1.14,
    attrs: { atk: 2, spd: 1, bone: 2 },
    minRealm: 3,
  },
  {
    id: 'body_organ',
    name: '脏腑境',
    blurb: '五脏如炉，力从中生。',
    progressNeed: 360,
    temperCost: { tishu: 600, lingli: 400, jingshen: 80 },
    temperGain: 14,
    tishuMult: 1.42,
    combatMult: 1.22,
    attrs: { atk: 2, def: 2, bone: 3 },
    minRealm: 5,
  },
  {
    id: 'body_saint',
    name: '圣体雏形',
    blurb: '肉身近圣，一步一震。',
    progressNeed: 720,
    temperCost: { tishu: 2_000, lingli: 1_500, jingshen: 300 },
    temperGain: 16,
    tishuMult: 1.65,
    combatMult: 1.35,
    attrs: { atk: 4, def: 3, bone: 4, spd: 2 },
    minRealm: 7,
  },
];

export function getHerb(id: string): HerbDef | undefined {
  return HERBS.find((h) => h.id === id);
}

export function getPillRecipe(id: string): PillRecipeDef | undefined {
  return PILL_RECIPES.find((p) => p.id === id);
}

export function getBodyStage(index: number): BodyStageDef | undefined {
  return BODY_STAGES[index];
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

/** 当前炼体乘区（已完成的最高阶） */
export function bodyMultipliers(bodyStage: number): { tishuMult: number; combatMult: number } {
  if (bodyStage <= 0) return { tishuMult: 1, combatMult: 1 };
  const stage = BODY_STAGES[Math.min(bodyStage, BODY_STAGES.length) - 1];
  if (!stage) return { tishuMult: 1, combatMult: 1 };
  return { tishuMult: stage.tishuMult, combatMult: stage.combatMult };
}

export function bodyAttrsBonus(bodyStage: number): Partial<AttrMap> {
  const sum: Partial<AttrMap> = {};
  for (let i = 0; i < bodyStage && i < BODY_STAGES.length; i++) {
    const a = BODY_STAGES[i]!.attrs;
    for (const [k, v] of Object.entries(a)) {
      const key = k as keyof AttrMap;
      sum[key] = (sum[key] || 0) + (v || 0);
    }
  }
  return sum;
}

export const RESOURCE_COST_LABEL: Record<ResourceKey, string> = {
  lingli: '灵力',
  tishu: '体术',
  jingshen: '精神力',
};
