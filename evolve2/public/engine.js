/**
 * evolve2 客户端纯函数引擎（与 evolve2/src/game/engine.ts 对齐）
 */
(function (global) {
  'use strict';

  const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
  const DNA_BONUS_PER = 0.1;
  const SAVE_VERSION = 1;
  const STORAGE_KEY = 'evolve2-save-v1';

  const STAGES = [
    { id: 'microbe', name: '单细胞', evolveCost: 0, mult: 1, blurb: '热泉边的一粒微光，靠化学梯度活着。', hue: 160 },
    { id: 'colony', name: '细胞集群', evolveCost: 250, mult: 1.75, blurb: '同类开始黏连，分工的雏形出现。', hue: 150 },
    { id: 'multicell', name: '多细胞', evolveCost: 2500, mult: 3, blurb: '组织成形，身体第一次有了内外。', hue: 140 },
    { id: 'aquatic', name: '水生生物', evolveCost: 25000, mult: 5.5, blurb: '鳍划开洋流，感官指向更远的光。', hue: 190 },
    { id: 'amphibian', name: '两栖动物', evolveCost: 2e5, mult: 10, blurb: '泥岸与潮汐之间，肺叶学会了呼吸。', hue: 95 },
    { id: 'terrestrial', name: '陆地动物', evolveCost: 1.5e6, mult: 18, blurb: '四肢抓住大陆，足迹留在尘土上。', hue: 45 },
    { id: 'primate', name: '灵长类', evolveCost: 1.2e7, mult: 32, blurb: '树冠与石器之间，好奇成为一种本能。', hue: 25 },
    { id: 'sapient', name: '会思考的生命', evolveCost: 1e8, mult: 60, blurb: '意识点燃：你开始书写自己的进化。', hue: 200 },
  ];

  const MUTATIONS = [
    { id: 'membrane', name: '强化细胞膜', description: '每次点击吸收更多能量。', kind: 'click', baseCost: 15, costMult: 1.14, power: 0.5, icon: '🫧' },
    { id: 'cilia', name: '纤毛摆动', description: '更快地卷吸周围养分。', kind: 'click', baseCost: 120, costMult: 1.15, power: 2, icon: '〰️' },
    { id: 'sensor', name: '原始感受器', description: '精准定位能量富集区。', kind: 'click', baseCost: 900, costMult: 1.17, power: 8, icon: '👁️' },
    { id: 'neuro', name: '神经爆发', description: '一次点击触发连锁吸收。', kind: 'click', baseCost: 8000, costMult: 1.2, power: 40, icon: '⚡' },
    { id: 'chloroplast', name: '叶绿体', description: '被动将星光转化为能量。', kind: 'passive', baseCost: 40, costMult: 1.13, power: 0.4, icon: '🌿' },
    { id: 'mitochondria', name: '线粒体', description: '细胞电站，稳定产出。', kind: 'passive', baseCost: 350, costMult: 1.14, power: 3, icon: '🔆' },
    { id: 'organ', name: '器官分化', description: '特化组织大幅提升代谢。', kind: 'passive', baseCost: 2800, costMult: 1.16, power: 22, icon: '🫀' },
    { id: 'metabolism', name: '高效代谢', description: '几乎不浪费任何营养。', kind: 'passive', baseCost: 22000, costMult: 1.18, power: 160, icon: '🔥' },
    { id: 'colony_mind', name: '群体协作', description: '无数个体同步吞吐能量。', kind: 'passive', baseCost: 1.8e5, costMult: 1.2, power: 1200, icon: '🕸️' },
  ];

  function getMutation(id) {
    return MUTATIONS.find((m) => m.id === id);
  }

  function getStage(index) {
    const i = Math.max(0, Math.min(STAGES.length - 1, Math.floor(index)));
    return STAGES[i];
  }

  function createNewState(now) {
    now = now == null ? Date.now() : now;
    const owned = {};
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

  function clampInt(n, min, max) {
    const v = Math.floor(Number(n) || 0);
    return Math.max(min, Math.min(max, v));
  }

  function loadState(raw, now) {
    now = now == null ? Date.now() : now;
    const fresh = createNewState(now);
    if (!raw || typeof raw !== 'object') return fresh;
    const owned = Object.assign({}, fresh.owned);
    if (raw.owned && typeof raw.owned === 'object') {
      for (const m of MUTATIONS) {
        const n = Number(raw.owned[m.id] || 0);
        owned[m.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
      }
    }
    const energy = Math.max(0, Number(raw.energy) || 0);
    return {
      energy,
      totalEnergy: Math.max(energy, Number(raw.totalEnergy) || 0),
      dna: Math.max(0, Math.floor(Number(raw.dna) || 0)),
      owned,
      stageIndex: clampInt(raw.stageIndex, 0, STAGES.length - 1),
      lastTickAt: (function () {
        const t = Number(raw.lastTickAt);
        return Number.isFinite(t) && t > 0 ? Math.min(t, now) : now;
      })(),
      prestiges: Math.max(0, Math.floor(Number(raw.prestiges) || 0)),
      saveVersion: SAVE_VERSION,
    };
  }

  function mutationCost(state, mutationId) {
    const def = getMutation(mutationId);
    if (!def) return null;
    const owned = state.owned[mutationId] || 0;
    return Math.ceil(def.baseCost * Math.pow(def.costMult, owned));
  }

  function dnaMultiplier(dna) {
    return 1 + Math.max(0, dna) * DNA_BONUS_PER;
  }

  function calcDnaGain(state) {
    const fromEnergy = Math.floor(Math.sqrt(state.totalEnergy / 50000));
    const fromStage = Math.max(0, state.stageIndex - 2);
    return Math.max(0, fromEnergy + fromStage);
  }

  function derive(state) {
    const stage = getStage(state.stageIndex);
    const nextStage = state.stageIndex < STAGES.length - 1 ? getStage(state.stageIndex + 1) : null;
    const dnaMult = dnaMultiplier(state.dna);
    const stageMult = stage.mult;
    let clickBase = 1;
    let passiveBase = 0;
    for (const m of MUTATIONS) {
      const n = state.owned[m.id] || 0;
      if (n <= 0) continue;
      if (m.kind === 'click') clickBase += m.power * n;
      else passiveBase += m.power * n;
    }
    const clickPower = clickBase * stageMult * dnaMult;
    const energyPerSec = passiveBase * stageMult * dnaMult;
    const canEvolve = !!(nextStage && state.energy >= nextStage.evolveCost);
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

  function grantEnergy(state, amount) {
    if (amount <= 0) return state;
    return Object.assign({}, state, {
      energy: state.energy + amount,
      totalEnergy: state.totalEnergy + amount,
    });
  }

  function tick(state, now) {
    now = now == null ? Date.now() : now;
    const elapsedRaw = Math.max(0, now - state.lastTickAt);
    const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
    const offlineSeconds = elapsedRaw / 1000;
    const cappedSeconds = elapsed / 1000;
    const energyPerSec = derive(state).energyPerSec;
    const gained = energyPerSec * cappedSeconds;
    let next = grantEnergy(state, gained);
    next = Object.assign({}, next, { lastTickAt: now });
    return { state: next, gained, cappedSeconds, offlineSeconds };
  }

  function clickAbsorb(state, now) {
    now = now == null ? Date.now() : now;
    const ticked = tick(state, now).state;
    const clickPower = derive(ticked).clickPower;
    return { ok: true, state: grantEnergy(ticked, clickPower) };
  }

  function buyMutation(state, mutationId, now) {
    now = now == null ? Date.now() : now;
    const def = getMutation(mutationId);
    if (!def) return { ok: false, state: state, reason: '未知变异' };
    const ticked = tick(state, now).state;
    const cost = mutationCost(ticked, mutationId);
    if (cost == null) return { ok: false, state: ticked, reason: '未知变异' };
    if (ticked.energy < cost) return { ok: false, state: ticked, reason: '能量不足' };
    const owned = Object.assign({}, ticked.owned);
    owned[mutationId] = (owned[mutationId] || 0) + 1;
    return {
      ok: true,
      state: Object.assign({}, ticked, { energy: ticked.energy - cost, owned: owned }),
    };
  }

  function evolveStage(state, now) {
    now = now == null ? Date.now() : now;
    const ticked = tick(state, now).state;
    const stats = derive(ticked);
    if (!stats.nextStage) return { ok: false, state: ticked, reason: '已达最高阶段' };
    if (ticked.energy < stats.nextStage.evolveCost) {
      return { ok: false, state: ticked, reason: '能量不足' };
    }
    return {
      ok: true,
      state: Object.assign({}, ticked, {
        energy: ticked.energy - stats.nextStage.evolveCost,
        stageIndex: ticked.stageIndex + 1,
      }),
    };
  }

  function prestige(state, now) {
    now = now == null ? Date.now() : now;
    const ticked = tick(state, now).state;
    const stats = derive(ticked);
    if (!stats.canPrestige || stats.dnaGain <= 0) {
      return { ok: false, state: ticked, reason: '尚未满足转生条件' };
    }
    const fresh = createNewState(now);
    return {
      ok: true,
      state: Object.assign({}, fresh, {
        dna: ticked.dna + stats.dnaGain,
        prestiges: ticked.prestiges + 1,
        lastTickAt: now,
      }),
    };
  }

  function formatNumber(n) {
    if (!Number.isFinite(n)) return '0';
    const abs = Math.abs(n);
    if (abs < 1000) return (Math.round(n * 10) / 10).toLocaleString('zh-CN');
    const units = [
      { v: 1e15, s: 'Qa' },
      { v: 1e12, s: 'T' },
      { v: 1e9, s: 'B' },
      { v: 1e6, s: 'M' },
      { v: 1e3, s: 'K' },
    ];
    for (const u of units) {
      if (abs >= u.v) return (n / u.v).toFixed(2).replace(/\.?0+$/, '') + u.s;
    }
    return String(Math.round(n));
  }

  function saveToStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function loadFromStorage(now) {
    now = now == null ? Date.now() : now;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return loadState(JSON.parse(raw), now);
    } catch {
      return null;
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  global.Evolve2 = {
    MAX_OFFLINE_MS,
    DNA_BONUS_PER,
    SAVE_VERSION,
    STORAGE_KEY,
    STAGES,
    MUTATIONS,
    createNewState,
    loadState,
    mutationCost,
    dnaMultiplier,
    calcDnaGain,
    derive,
    tick,
    clickAbsorb,
    buyMutation,
    evolveStage,
    prestige,
    formatNumber,
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
})(typeof window !== 'undefined' ? window : globalThis);
