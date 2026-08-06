import type { KindDef, UnitKind, UnitStats } from './types';

export const COLS = 8;
/** 战场行数：上 4 敌 + 下 4 友 = 8（备战区另置） */
export const ROWS = 8;
export const ENEMY_ROW_MAX = 3; // 0..3
export const ALLY_ROW_MIN = 4; // 4..7
export const BENCH_SIZE = 8;
export const SHOP_SIZE = 5;
export const MAX_LEVEL = 3;
export const UNIT_BASE_COST = 3;
export const REFRESH_COST = 1;
export const PLAYER_MAX_HP = 10;
export const START_GOLD = 8;

export const KIND_ORDER: UnitKind[] = ['盾', '刀', '骑', '弓', '术'];

export const KINDS: Record<UnitKind, KindDef> = {
  盾: {
    kind: '盾',
    rangeClass: 'melee',
    base: { maxHp: 28, atk: 4, def: 6, range: 1, speed: 12 },
    skills: [
      { id: 'taunt', name: '嘲讽', desc: '受击时反击 30% 攻击' },
      { id: 'fortress', name: '铁壁', desc: '最大生命 +35%' },
    ],
    hue: 200,
  },
  刀: {
    kind: '刀',
    rangeClass: 'melee',
    base: { maxHp: 18, atk: 7, def: 3, range: 1, speed: 9 },
    skills: [
      { id: 'cleave', name: '连斩', desc: '攻击 25% 再打一次' },
      { id: 'crit', name: '破军', desc: '攻击 30% 造成双倍伤害' },
    ],
    hue: 10,
  },
  骑: {
    kind: '骑',
    rangeClass: 'cavalry',
    base: { maxHp: 20, atk: 6, def: 4, range: 2, speed: 7 },
    skills: [
      { id: 'charge', name: '冲锋', desc: '首次攻击伤害 +50%' },
      { id: 'trample', name: '践踏', desc: '攻击溅射相邻敌 40% 伤害' },
    ],
    hue: 35,
  },
  弓: {
    kind: '弓',
    rangeClass: 'ranged',
    base: { maxHp: 12, atk: 6, def: 2, range: 3, speed: 10 },
    skills: [
      { id: 'double', name: '连射', desc: '攻击 30% 追加一箭' },
      { id: 'pierce', name: '穿甲', desc: '伤害忽略目标 25% 等效生命' },
    ],
    hue: 130,
  },
  术: {
    kind: '术',
    rangeClass: 'ranged',
    base: { maxHp: 10, atk: 8, def: 1, range: 3, speed: 11 },
    skills: [
      { id: 'splash', name: '溅射', desc: '攻击波及目标周围敌 35% 伤害' },
      { id: 'freeze', name: '冰结', desc: '攻击 25% 使目标下回合无法行动' },
    ],
    hue: 220,
  },
};

/** 等级缩放：每级约 +40% 属性 */
export function statsFor(kind: UnitKind, level: number): UnitStats {
  const base = KINDS[kind].base;
  const mult = 1 + (level - 1) * 0.4;
  return {
    maxHp: Math.round(base.maxHp * mult),
    atk: Math.round(base.atk * mult),
    def: Math.round(base.def * mult),
    range: base.range,
    speed: Math.max(4, base.speed - (level - 1)),
  };
}

export function skillsFor(kind: UnitKind, level: number): string[] {
  const def = KINDS[kind];
  const out: string[] = [];
  if (level >= 2) out.push(def.skills[0].id);
  if (level >= 3) out.push(def.skills[1].id);
  // 铁壁直接改写在 create 时处理更清晰，这里只返回 id 列表
  return out;
}

export function applyPassiveStats(kind: UnitKind, level: number, stats: UnitStats): UnitStats {
  const skills = skillsFor(kind, level);
  let maxHp = stats.maxHp;
  if (skills.includes('fortress')) {
    maxHp = Math.round(maxHp * 1.35);
  }
  return { ...stats, maxHp };
}

export function kindLabel(kind: UnitKind, level: number): string {
  return level <= 1 ? kind : `${kind}${level}`;
}
