import {
  DNA_BONUS_PER,
  MAX_OFFLINE_MS,
  MUTATIONS,
  SAVE_VERSION,
  STAGES,
  getMutation,
  getStage,
} from './data';
import type { ActionResult, DerivedStats, GameState, TickResult } from './types';

/** 创建新存档 */
export function createNewState(now = Date.now()): GameState {
  const owned: Record<string, number> = {};
  for (const m of MUTATIONS) owned[m.id] = 0;
  return {
    energy: 0,
    totalEnergy: 0,
    dna: 0,
    owned,
    stageIndex: 0,
    lastTickAt: now,
    prestiges: 0,
    saveVersion: SAVE_VERSION,
  };
}

/** 从未知数据安全解析存档；失败则返回新档 */
export function loadState(raw: unknown, now = Date.now()): GameState {
  const fresh = createNewState(now);
  if (!raw || typeof raw !== 'object') return fresh;
  const data = raw as Partial<GameState>;

  const owned: Record<string, number> = { ...fresh.owned };
  if (data.owned && typeof data.owned === 'object') {
    for (const m of MUTATIONS) {
      const n = Number((data.owned as Record<string, unknown>)[m.id] ?? 0);
      owned[m.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
  }

  const stageIndex = clampInt(data.stageIndex, 0, STAGES.length - 1);
  const energy = Math.max(0, Number(data.energy) || 0);
  const totalEnergy = Math.max(energy, Number(data.totalEnergy) || 0);
  const dna = Math.max(0, Math.floor(Number(data.dna) || 0));
  const prestiges = Math.max(0, Math.floor(Number(data.prestiges) || 0));
  const lastTickAt = Number(data.lastTickAt);
  const safeLast =
    Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;

  return {
    energy,
    totalEnergy,
    dna,
    owned,
    stageIndex,
    lastTickAt: safeLast,
    prestiges,
    saveVersion: SAVE_VERSION,
  };
}

function clampInt(n: unknown, min: number, max: number): number {
  const v = Math.floor(Number(n) || 0);
  return Math.max(min, Math.min(max, v));
}

/** 变异当前价格 */
export function mutationCost(state: GameState, mutationId: string): number | null {
  const def = getMutation(mutationId);
  if (!def) return null;
  const owned = state.owned[mutationId] ?? 0;
  return Math.ceil(def.baseCost * Math.pow(def.costMult, owned));
}

/** DNA 永久倍率 */
export function dnaMultiplier(dna: number): number {
  return 1 + Math.max(0, dna) * DNA_BONUS_PER;
}

/** 由本周目累计能量估算可获得 DNA */
export function calcDnaGain(state: GameState): number {
  // 到达较后阶段或攒够能量才有意义；保底与阶段挂钩
  const fromEnergy = Math.floor(Math.sqrt(state.totalEnergy / 50_000));
  const fromStage = Math.max(0, state.stageIndex - 2);
  return Math.max(0, fromEnergy + fromStage);
}

/** 派生战斗力 / 产出统计（纯函数） */
export function derive(state: GameState): DerivedStats {
  const stage = getStage(state.stageIndex);
  const nextStage =
    state.stageIndex < STAGES.length - 1 ? getStage(state.stageIndex + 1) : null;
  const dnaMult = dnaMultiplier(state.dna);
  const stageMult = stage.mult;

  let clickBase = 1;
  let passiveBase = 0;
  for (const m of MUTATIONS) {
    const n = state.owned[m.id] ?? 0;
    if (n <= 0) continue;
    if (m.kind === 'click') clickBase += m.power * n;
    else passiveBase += m.power * n;
  }

  const clickPower = clickBase * stageMult * dnaMult;
  const energyPerSec = passiveBase * stageMult * dnaMult;
  const canEvolve = Boolean(
    nextStage && state.energy >= nextStage.evolveCost && state.stageIndex < STAGES.length - 1,
  );
  const dnaGain = calcDnaGain(state);
  const canPrestige = dnaGain > 0 && state.stageIndex >= 3;

  return {
    clickPower,
    energyPerSec,
    dnaMult,
    stageMult,
    stage,
    nextStage,
    canEvolve,
    dnaGain,
    canPrestige,
  };
}

function grantEnergy(state: GameState, amount: number): GameState {
  if (amount <= 0) return state;
  return {
    ...state,
    energy: state.energy + amount,
    totalEnergy: state.totalEnergy + amount,
  };
}

/**
 * 推进时间：计算被动产出；离线时间封顶 MAX_OFFLINE_MS。
 */
export function tick(state: GameState, now = Date.now()): TickResult {
  const elapsedRaw = Math.max(0, now - state.lastTickAt);
  const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
  const offlineSeconds = elapsedRaw / 1000;
  const cappedSeconds = elapsed / 1000;
  const { energyPerSec } = derive(state);
  const gained = energyPerSec * cappedSeconds;
  let next = grantEnergy(state, gained);
  next = { ...next, lastTickAt: now };
  return { state: next, gained, cappedSeconds, offlineSeconds };
}

/** 点击吸收能量 */
export function clickAbsorb(state: GameState, now = Date.now()): ActionResult {
  const ticked = tick(state, now).state;
  const { clickPower } = derive(ticked);
  return { ok: true, state: grantEnergy(ticked, clickPower) };
}

/** 购买变异 */
export function buyMutation(
  state: GameState,
  mutationId: string,
  now = Date.now(),
): ActionResult {
  const def = getMutation(mutationId);
  if (!def) return { ok: false, state, reason: '未知变异' };

  const ticked = tick(state, now).state;
  const cost = mutationCost(ticked, mutationId);
  if (cost == null) return { ok: false, state: ticked, reason: '未知变异' };
  if (ticked.energy < cost) {
    return { ok: false, state: ticked, reason: '能量不足' };
  }

  const owned = { ...ticked.owned, [mutationId]: (ticked.owned[mutationId] ?? 0) + 1 };
  return {
    ok: true,
    state: {
      ...ticked,
      energy: ticked.energy - cost,
      owned,
    },
  };
}

/** 进化到下一生命阶段 */
export function evolveStage(state: GameState, now = Date.now()): ActionResult {
  const ticked = tick(state, now).state;
  const stats = derive(ticked);
  if (!stats.nextStage) {
    return { ok: false, state: ticked, reason: '已达最高阶段' };
  }
  if (ticked.energy < stats.nextStage.evolveCost) {
    return { ok: false, state: ticked, reason: '能量不足' };
  }
  return {
    ok: true,
    state: {
      ...ticked,
      energy: ticked.energy - stats.nextStage.evolveCost,
      stageIndex: ticked.stageIndex + 1,
    },
  };
}

/**
 * DNA 转生：重置能量/变异/阶段，保留并增加 DNA（永久提升产出）。
 */
export function prestige(state: GameState, now = Date.now()): ActionResult {
  const ticked = tick(state, now).state;
  const stats = derive(ticked);
  if (!stats.canPrestige || stats.dnaGain <= 0) {
    return { ok: false, state: ticked, reason: '尚未满足转生条件' };
  }

  const fresh = createNewState(now);
  return {
    ok: true,
    state: {
      ...fresh,
      dna: ticked.dna + stats.dnaGain,
      prestiges: ticked.prestiges + 1,
      lastTickAt: now,
    },
  };
}

/** 供前端/API 使用的只读视图 */
export function toView(state: GameState) {
  const stats = derive(state);
  return {
    state,
    stats,
    stages: STAGES,
    mutations: MUTATIONS.map((m) => ({
      ...m,
      owned: state.owned[m.id] ?? 0,
      cost: mutationCost(state, m.id) ?? 0,
    })),
    maxOfflineMs: MAX_OFFLINE_MS,
  };
}

export function getMeta() {
  return {
    version: undefined as string | undefined,
    stages: STAGES.map((s, i) => ({
      index: i,
      id: s.id,
      name: s.name,
      evolveCost: s.evolveCost,
      mult: s.mult,
    })),
    mutations: MUTATIONS.map((m) => ({
      id: m.id,
      name: m.name,
      kind: m.kind,
      baseCost: m.baseCost,
      power: m.power,
    })),
    maxOfflineMs: MAX_OFFLINE_MS,
    dnaBonusPer: DNA_BONUS_PER,
  };
}
