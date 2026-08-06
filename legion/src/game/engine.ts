import {
  ALLY_ROW_MIN,
  BENCH_SIZE,
  COLS,
  ENEMY_ROW_MAX,
  KIND_ORDER,
  MAX_LEVEL,
  PLAYER_MAX_HP,
  REFRESH_COST,
  ROWS,
  SHOP_SIZE,
  START_GOLD,
  UNIT_BASE_COST,
  applyPassiveStats,
  skillsFor,
  statsFor,
} from './data';
import type {
  BattleFrame,
  BattleResult,
  GameState,
  ShopOffer,
  TeamId,
  UnitInstance,
  UnitKind,
} from './types';

let seq = 1;
function uid(prefix = 'u'): string {
  seq += 1;
  return `${prefix}${seq}_${Math.floor(Math.random() * 1e5)}`;
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** 简单可种子 RNG */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function createUnit(
  kind: UnitKind,
  level: number,
  team: TeamId,
  pos?: { row: number; col: number } | { benchIndex: number },
): UnitInstance {
  const lv = clamp(level, 1, MAX_LEVEL);
  const raw = statsFor(kind, lv);
  const st = applyPassiveStats(kind, lv, raw);
  const skills = skillsFor(kind, lv);
  const u: UnitInstance = {
    id: uid(kind),
    kind,
    level: lv,
    team,
    row: null,
    col: null,
    benchIndex: null,
    hp: st.maxHp,
    maxHp: st.maxHp,
    atk: st.atk,
    def: st.def,
    range: st.range,
    speed: st.speed,
    skills,
  };
  if (pos && 'benchIndex' in pos) {
    u.benchIndex = pos.benchIndex;
  } else if (pos && 'row' in pos) {
    u.row = pos.row;
    u.col = pos.col;
  }
  return u;
}

export function createNewGame(seed = Date.now()): GameState {
  const rng = mulberry32(seed);
  return {
    round: 1,
    gold: START_GOLD,
    hp: PLAYER_MAX_HP,
    phase: 'prep',
    units: [],
    shop: rollShop(rng, 1),
    selectedUnitId: null,
    lastResult: null,
    battleLog: [],
  };
}

export function rollShop(rng: () => number, round: number): ShopOffer[] {
  const offers: ShopOffer[] = [];
  for (let i = 0; i < SHOP_SIZE; i++) {
    const kind = KIND_ORDER[Math.floor(rng() * KIND_ORDER.length)]!;
    // 后期略贵
    const cost = UNIT_BASE_COST + Math.floor((round - 1) / 3);
    offers.push({ kind, cost });
  }
  return offers;
}

function allyUnits(state: GameState): UnitInstance[] {
  return state.units.filter((u) => u.team === 'ally');
}

function freeBenchIndex(state: GameState): number | null {
  const used = new Set(
    allyUnits(state)
      .filter((u) => u.benchIndex != null)
      .map((u) => u.benchIndex as number),
  );
  for (let i = 0; i < BENCH_SIZE; i++) if (!used.has(i)) return i;
  return null;
}

export function refreshShop(state: GameState, seed = Date.now()): GameState {
  if (state.phase !== 'prep') return state;
  if (state.gold < REFRESH_COST) return state;
  const rng = mulberry32(seed);
  return {
    ...state,
    gold: state.gold - REFRESH_COST,
    shop: rollShop(rng, state.round),
  };
}

export function buyOffer(state: GameState, shopIndex: number): GameState {
  if (state.phase !== 'prep') return state;
  const offer = state.shop[shopIndex];
  if (!offer) return state;
  if (state.gold < offer.cost) return state;
  const bench = freeBenchIndex(state);
  if (bench == null) return state;

  let next: GameState = {
    ...state,
    gold: state.gold - offer.cost,
    shop: state.shop.map((o, i) => (i === shopIndex ? { ...o, kind: o.kind, cost: o.cost } : o)),
    units: [
      ...state.units,
      createUnit(offer.kind, 1, 'ally', { benchIndex: bench }),
    ],
  };
  // 买完该格置空：用 cost=-1 标记已售
  next = {
    ...next,
    shop: next.shop.map((o, i) => (i === shopIndex ? { kind: o.kind, cost: -1 } : o)),
  };
  return tryAutoMerge(next);
}

/** 两只同种同级合成更高一级 */
export function tryAutoMerge(state: GameState): GameState {
  let units = [...state.units];
  let changed = true;
  while (changed) {
    changed = false;
    const allies = units.filter((u) => u.team === 'ally' && u.level < MAX_LEVEL);
    const groups = new Map<string, UnitInstance[]>();
    for (const u of allies) {
      const key = `${u.kind}:${u.level}`;
      const g = groups.get(key) ?? [];
      g.push(u);
      groups.set(key, g);
    }
    for (const [, g] of groups) {
      if (g.length < 2) continue;
      // 优先合成备战区，再场上
      g.sort((a, b) => {
        const ab = a.benchIndex != null ? 0 : 1;
        const bb = b.benchIndex != null ? 0 : 1;
        return ab - bb;
      });
      const a = g[0]!;
      const b = g[1]!;
      const keepPos =
        a.row != null && a.col != null
          ? { row: a.row, col: a.col }
          : b.row != null && b.col != null
            ? { row: b.row, col: b.col }
            : { benchIndex: a.benchIndex ?? b.benchIndex ?? 0 };
      const merged = createUnit(a.kind, a.level + 1, 'ally', keepPos);
      units = units.filter((u) => u.id !== a.id && u.id !== b.id);
      units.push(merged);
      changed = true;
      break;
    }
  }
  return { ...state, units };
}

export function selectUnit(state: GameState, unitId: string | null): GameState {
  return { ...state, selectedUnitId: unitId };
}

export function isAllyCell(row: number): boolean {
  return row >= ALLY_ROW_MIN && row < ROWS;
}

export function isEnemyCell(row: number): boolean {
  return row >= 0 && row <= ENEMY_ROW_MAX;
}

/** 将选中单位放到友方格，或与同格交换；点击备战格则下阵 */
export function placeSelected(state: GameState, row: number, col: number): GameState {
  if (state.phase !== 'prep' || !state.selectedUnitId) return state;
  if (!isAllyCell(row) || col < 0 || col >= COLS) return state;
  const unit = state.units.find((u) => u.id === state.selectedUnitId && u.team === 'ally');
  if (!unit) return state;

  const occupant = state.units.find(
    (u) => u.team === 'ally' && u.row === row && u.col === col && u.id !== unit.id,
  );

  let units = state.units.map((u) => ({ ...u }));
  const me = units.find((u) => u.id === unit.id)!;

  if (occupant) {
    const other = units.find((u) => u.id === occupant.id)!;
    const or = me.row;
    const oc = me.col;
    const ob = me.benchIndex;
    me.row = other.row;
    me.col = other.col;
    me.benchIndex = null;
    other.row = or;
    other.col = oc;
    other.benchIndex = ob;
  } else {
    me.row = row;
    me.col = col;
    me.benchIndex = null;
  }

  return tryAutoMerge({ ...state, units, selectedUnitId: null });
}

export function moveToBench(state: GameState, unitId: string): GameState {
  if (state.phase !== 'prep') return state;
  const unit = state.units.find((u) => u.id === unitId && u.team === 'ally');
  if (!unit) return state;
  if (unit.benchIndex != null) return { ...state, selectedUnitId: unitId };

  const bench = freeBenchIndex(state);
  if (bench == null) return state;
  const units = state.units.map((u) =>
    u.id === unitId ? { ...u, row: null, col: null, benchIndex: bench } : u,
  );
  return tryAutoMerge({ ...state, units, selectedUnitId: null });
}

export function sellSelected(state: GameState): GameState {
  if (state.phase !== 'prep' || !state.selectedUnitId) return state;
  const unit = state.units.find((u) => u.id === state.selectedUnitId && u.team === 'ally');
  if (!unit) return state;
  const refund = UNIT_BASE_COST * unit.level;
  return {
    ...state,
    gold: state.gold + refund,
    units: state.units.filter((u) => u.id !== unit.id),
    selectedUnitId: null,
  };
}

function dist(a: { row: number; col: number }, b: { row: number; col: number }): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function neighbors4(row: number, col: number): Array<{ row: number; col: number }> {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ].filter((p) => p.row >= 0 && p.row < ROWS && p.col >= 0 && p.col < COLS);
}

interface CombatUnit extends UnitInstance {
  cd: number;
  charged: boolean;
  frozen: number;
  dead: boolean;
}

function toFrame(units: CombatUnit[], events: string[]): BattleFrame {
  return {
    units: units.map((u) => ({
      id: u.id,
      kind: u.kind,
      level: u.level,
      team: u.team,
      row: u.row ?? 0,
      col: u.col ?? 0,
      hp: Math.max(0, u.hp),
      maxHp: u.maxHp,
      atk: u.atk,
      def: u.def,
      dead: u.dead,
    })),
    events: [...events],
  };
}

function findTarget(self: CombatUnit, enemies: CombatUnit[]): CombatUnit | null {
  const alive = enemies.filter((e) => !e.dead && e.row != null && e.col != null);
  if (!alive.length) return null;
  alive.sort((a, b) => {
    const da = dist({ row: self.row!, col: self.col! }, { row: a.row!, col: a.col! });
    const db = dist({ row: self.row!, col: self.col! }, { row: b.row!, col: b.col! });
    if (da !== db) return da - db;
    return a.hp - b.hp;
  });
  return alive[0] ?? null;
}

function dealDamage(
  attacker: CombatUnit,
  target: CombatUnit,
  raw: number,
  all: CombatUnit[],
  events: string[],
): void {
  let dmg = raw;
  if (attacker.skills.includes('pierce')) {
    dmg = Math.round(dmg + target.maxHp * 0.05);
  }
  if (attacker.skills.includes('crit') && Math.random() < 0.3) {
    dmg *= 2;
    events.push(`${attacker.kind}破军暴击！`);
  }
  // 防御减免：约 def/(def+12) 比例减伤，至少造成 1 点
  const mitigated = Math.max(1, Math.round(dmg * (12 / (12 + Math.max(0, target.def)))));
  dmg = mitigated;
  target.hp -= dmg;
  events.push(`${attacker.kind}${attacker.level} → ${target.kind}${target.level} 造成 ${dmg}`);
  if (target.hp <= 0) {
    target.hp = 0;
    target.dead = true;
    events.push(`${target.kind}${target.level} 阵亡`);
  } else if (target.skills.includes('taunt')) {
    const reflect = Math.max(1, Math.round(attacker.atk * 0.3));
    attacker.hp -= reflect;
    events.push(`${target.kind}嘲讽反击 ${reflect}`);
    if (attacker.hp <= 0) {
      attacker.hp = 0;
      attacker.dead = true;
      events.push(`${attacker.kind}${attacker.level} 阵亡`);
    }
  }

  if (attacker.skills.includes('freeze') && Math.random() < 0.25 && !target.dead) {
    target.frozen = 1;
    events.push(`${target.kind} 被冰结`);
  }

  const splashRatio = attacker.skills.includes('trample')
    ? 0.4
    : attacker.skills.includes('splash')
      ? 0.35
      : 0;
  if (splashRatio > 0 && target.row != null && target.col != null) {
    for (const n of neighbors4(target.row, target.col)) {
      const vic = all.find(
        (u) =>
          !u.dead &&
          u.team !== attacker.team &&
          u.row === n.row &&
          u.col === n.col &&
          u.id !== target.id,
      );
      if (!vic) continue;
      const sd = Math.max(1, Math.round(dmg * splashRatio));
      vic.hp -= sd;
      events.push(`溅射 ${vic.kind} -${sd}`);
      if (vic.hp <= 0) {
        vic.hp = 0;
        vic.dead = true;
        events.push(`${vic.kind}${vic.level} 阵亡`);
      }
    }
  }
}

function tryMoveToward(self: CombatUnit, target: CombatUnit, occupied: Set<string>): boolean {
  const tr = target.row!;
  const tc = target.col!;
  const sr = self.row!;
  const sc = self.col!;
  const options = neighbors4(sr, sc).filter((p) => !occupied.has(`${p.row},${p.col}`));
  if (!options.length) return false;
  options.sort(
    (a, b) =>
      dist(a, { row: tr, col: tc }) - dist(b, { row: tr, col: tc }) ||
      Math.abs(a.row - tr) - Math.abs(b.row - tr),
  );
  const best = options[0]!;
  if (dist(best, { row: tr, col: tc }) >= dist({ row: sr, col: sc }, { row: tr, col: tc })) {
    // 允许同距侧移
  }
  occupied.delete(`${sr},${sc}`);
  self.row = best.row;
  self.col = best.col;
  occupied.add(`${best.row},${best.col}`);
  return true;
}

function attackOnce(attacker: CombatUnit, target: CombatUnit, all: CombatUnit[], events: string[]) {
  let dmg = attacker.atk;
  if (attacker.skills.includes('charge') && !attacker.charged) {
    dmg = Math.round(dmg * 1.5);
    attacker.charged = true;
    events.push(`${attacker.kind}冲锋！`);
  }
  dealDamage(attacker, target, dmg, all, events);

  const extra =
    (attacker.skills.includes('cleave') && Math.random() < 0.25) ||
    (attacker.skills.includes('double') && Math.random() < 0.3);
  if (extra && !target.dead && !attacker.dead) {
    events.push(`${attacker.kind}追加攻击`);
    dealDamage(attacker, target, Math.round(attacker.atk * 0.8), all, events);
  }
}

/** 生成敌方阵容 */
export function spawnEnemies(round: number, rng: () => number): UnitInstance[] {
  const count = clamp(3 + Math.floor(round * 0.7), 3, 10);
  const levelBias = round >= 6 ? 2 : round >= 3 ? 1 : 0;
  const enemies: UnitInstance[] = [];
  const occ = new Set<string>();
  for (let i = 0; i < count; i++) {
    const kind = KIND_ORDER[Math.floor(rng() * KIND_ORDER.length)]!;
    let level = 1 + (rng() < 0.25 + round * 0.04 ? levelBias : 0);
    level = clamp(level, 1, MAX_LEVEL);
    let placed = false;
    for (let t = 0; t < 40; t++) {
      const row = Math.floor(rng() * (ENEMY_ROW_MAX + 1));
      const col = Math.floor(rng() * COLS);
      const key = `${row},${col}`;
      if (occ.has(key)) continue;
      occ.add(key);
      enemies.push(createUnit(kind, level, 'enemy', { row, col }));
      placed = true;
      break;
    }
    if (!placed) break;
  }
  return enemies;
}

/**
 * 纯函数战斗模拟，返回回放帧。
 */
export function simulateBattle(allyBoard: UnitInstance[], enemies: UnitInstance[]): BattleResult {
  const units: CombatUnit[] = [...allyBoard, ...enemies].map((u) => ({
    ...u,
    row: u.row!,
    col: u.col!,
    cd: u.speed,
    charged: false,
    frozen: 0,
    dead: false,
  }));

  const frames: BattleFrame[] = [];
  frames.push(toFrame(units, ['战斗开始']));

  const maxTicks = 120;
  for (let tick = 0; tick < maxTicks; tick++) {
    const events: string[] = [];
    const alliesAlive = units.filter((u) => u.team === 'ally' && !u.dead);
    const enemiesAlive = units.filter((u) => u.team === 'enemy' && !u.dead);
    if (!alliesAlive.length || !enemiesAlive.length) break;

    const order = shuffle(
      units.filter((u) => !u.dead),
      Math.random,
    ).sort((a, b) => a.speed - b.speed || a.id.localeCompare(b.id));

    for (const self of order) {
      if (self.dead) continue;
      if (self.frozen > 0) {
        self.frozen -= 1;
        events.push(`${self.kind}冰结中`);
        continue;
      }
      self.cd -= 1;
      if (self.cd > 0) continue;
      self.cd = self.speed;

      const foes = units.filter((u) => u.team !== self.team && !u.dead);
      const target = findTarget(self, foes);
      if (!target) continue;

      const d = dist(
        { row: self.row!, col: self.col! },
        { row: target.row!, col: target.col! },
      );
      if (d <= self.range) {
        attackOnce(self, target, units, events);
      } else {
        const occ = new Set(
          units.filter((u) => !u.dead && u.row != null).map((u) => `${u.row},${u.col}`),
        );
        tryMoveToward(self, target, occ);
      }
    }

    if (events.length) frames.push(toFrame(units, events));
    else if (tick % 4 === 0) frames.push(toFrame(units, []));

    if (
      !units.some((u) => u.team === 'ally' && !u.dead) ||
      !units.some((u) => u.team === 'enemy' && !u.dead)
    ) {
      break;
    }
  }

  const allyLeft = units.some((u) => u.team === 'ally' && !u.dead);
  const enemyLeft = units.some((u) => u.team === 'enemy' && !u.dead);
  const winner: BattleResult['winner'] =
    allyLeft && !enemyLeft ? 'ally' : enemyLeft && !allyLeft ? 'enemy' : 'draw';
  frames.push(
    toFrame(units, [
      winner === 'ally' ? '胜利！' : winner === 'enemy' ? '败北…' : '平局',
    ]),
  );
  return { frames, winner };
}

export function startBattle(state: GameState, seed = Date.now()): {
  state: GameState;
  battle: BattleResult;
} {
  if (state.phase !== 'prep') return { state, battle: { frames: [], winner: 'draw' } };
  const boardAllies = state.units.filter(
    (u) => u.team === 'ally' && u.row != null && u.col != null,
  );
  if (!boardAllies.length) return { state, battle: { frames: [], winner: 'draw' } };

  const rng = mulberry32(seed);
  const enemies = spawnEnemies(state.round, rng);
  const battle = simulateBattle(boardAllies, enemies);

  // 战斗阶段：把敌方临时并入展示用 units（客户端用 frames 播放）
  const next: GameState = {
    ...state,
    phase: 'battle',
    units: [...state.units.filter((u) => u.team === 'ally'), ...enemies],
    selectedUnitId: null,
    battleLog: battle.frames.flatMap((f) => f.events).slice(-12),
  };
  return { state: next, battle };
}

export function applyBattleResult(state: GameState, winner: BattleResult['winner']): GameState {
  let hp = state.hp;
  let gold = state.gold;
  let lastResult: GameState['lastResult'] = 'draw';
  if (winner === 'ally') {
    lastResult = 'win';
    gold += 4 + Math.floor(state.round / 2);
  } else if (winner === 'enemy') {
    lastResult = 'lose';
    hp -= 1 + Math.floor(state.round / 4);
    gold += 2;
  } else {
    gold += 3;
  }
  gold += 3; // 回合收入
  // 利息
  gold += Math.min(5, Math.floor(gold / 10));

  const allies = state.units
    .filter((u) => u.team === 'ally')
    .map((u) => {
      const st = applyPassiveStats(u.kind, u.level, statsFor(u.kind, u.level));
      return {
        ...u,
        hp: st.maxHp,
        maxHp: st.maxHp,
        atk: st.atk,
        def: st.def,
        range: st.range,
        speed: st.speed,
      };
    });

  const rng = mulberry32(state.round * 999 + gold + hp);
  return {
    ...state,
    round: state.round + 1,
    gold,
    hp: clamp(hp, 0, PLAYER_MAX_HP),
    phase: hp <= 0 ? 'result' : 'prep',
    units: allies,
    shop: rollShop(rng, state.round + 1),
    selectedUnitId: null,
    lastResult,
    battleLog: state.battleLog,
  };
}

export function getMeta() {
  return {
    title: '兵阵对决',
    cols: COLS,
    rows: ROWS,
    kinds: KIND_ORDER,
    maxLevel: MAX_LEVEL,
  };
}

export function boardAllyCount(state: GameState): number {
  return state.units.filter((u) => u.team === 'ally' && u.row != null).length;
}
