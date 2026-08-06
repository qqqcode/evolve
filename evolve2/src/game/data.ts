import type { MutationDef, StageDef } from './types';

/** 离线进度上限：8 小时 */
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

/** DNA 倍率：每点 DNA +10% 全产出 */
export const DNA_BONUS_PER = 0.1;

/** 存档 schema 版本 */
export const SAVE_VERSION = 1;

/** localStorage 键（前端使用） */
export const STORAGE_KEY = 'evolve2-save-v1';

/**
 * 8 个生命阶段：单细胞 → 会思考的生命
 */
export const STAGES: StageDef[] = [
  {
    id: 'microbe',
    name: '单细胞',
    evolveCost: 0,
    mult: 1,
    blurb: '热泉边的一粒微光，靠化学梯度活着。',
    hue: 160,
  },
  {
    id: 'colony',
    name: '细胞集群',
    evolveCost: 250,
    mult: 1.75,
    blurb: '同类开始黏连，分工的雏形出现。',
    hue: 150,
  },
  {
    id: 'multicell',
    name: '多细胞',
    evolveCost: 2_500,
    mult: 3,
    blurb: '组织成形，身体第一次有了内外。',
    hue: 140,
  },
  {
    id: 'aquatic',
    name: '水生生物',
    evolveCost: 25_000,
    mult: 5.5,
    blurb: '鳍划开洋流，感官指向更远的光。',
    hue: 190,
  },
  {
    id: 'amphibian',
    name: '两栖动物',
    evolveCost: 2e5,
    mult: 10,
    blurb: '泥岸与潮汐之间，肺叶学会了呼吸。',
    hue: 95,
  },
  {
    id: 'terrestrial',
    name: '陆地动物',
    evolveCost: 1.5e6,
    mult: 18,
    blurb: '四肢抓住大陆，足迹留在尘土上。',
    hue: 45,
  },
  {
    id: 'primate',
    name: '灵长类',
    evolveCost: 1.2e7,
    mult: 32,
    blurb: '树冠与石器之间，好奇成为一种本能。',
    hue: 25,
  },
  {
    id: 'sapient',
    name: '会思考的生命',
    evolveCost: 1e8,
    mult: 60,
    blurb: '意识点燃：你开始书写自己的进化。',
    hue: 200,
  },
];

export const MUTATIONS: MutationDef[] = [
  {
    id: 'membrane',
    name: '强化细胞膜',
    description: '每次点击吸收更多能量。',
    kind: 'click',
    baseCost: 15,
    costMult: 1.14,
    power: 0.5,
    icon: '🫧',
  },
  {
    id: 'cilia',
    name: '纤毛摆动',
    description: '更快地卷吸周围养分。',
    kind: 'click',
    baseCost: 120,
    costMult: 1.15,
    power: 2,
    icon: '〰️',
  },
  {
    id: 'sensor',
    name: '原始感受器',
    description: '精准定位能量富集区。',
    kind: 'click',
    baseCost: 900,
    costMult: 1.17,
    power: 8,
    icon: '👁️',
  },
  {
    id: 'neuro',
    name: '神经爆发',
    description: '一次点击触发连锁吸收。',
    kind: 'click',
    baseCost: 8_000,
    costMult: 1.2,
    power: 40,
    icon: '⚡',
  },
  {
    id: 'chloroplast',
    name: '叶绿体',
    description: '被动将星光转化为能量。',
    kind: 'passive',
    baseCost: 40,
    costMult: 1.13,
    power: 0.4,
    icon: '🌿',
  },
  {
    id: 'mitochondria',
    name: '线粒体',
    description: '细胞电站，稳定产出。',
    kind: 'passive',
    baseCost: 350,
    costMult: 1.14,
    power: 3,
    icon: '🔆',
  },
  {
    id: 'organ',
    name: '器官分化',
    description: '特化组织大幅提升代谢。',
    kind: 'passive',
    baseCost: 2_800,
    costMult: 1.16,
    power: 22,
    icon: '🫀',
  },
  {
    id: 'metabolism',
    name: '高效代谢',
    description: '几乎不浪费任何营养。',
    kind: 'passive',
    baseCost: 22_000,
    costMult: 1.18,
    power: 160,
    icon: '🔥',
  },
  {
    id: 'colony_mind',
    name: '群体协作',
    description: '无数个体同步吞吐能量。',
    kind: 'passive',
    baseCost: 1.8e5,
    costMult: 1.2,
    power: 1_200,
    icon: '🕸️',
  },
];

export function getMutation(id: string): MutationDef | undefined {
  return MUTATIONS.find((m) => m.id === id);
}

export function getStage(index: number): StageDef {
  const i = Math.max(0, Math.min(STAGES.length - 1, Math.floor(index)));
  return STAGES[i]!;
}
