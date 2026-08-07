import {
  ARTS,
  BRANCH_LABELS,
  ENDINGS,
  MAX_CHRONICLE,
  MAX_OFFLINE_MS,
  MAX_STAR,
  QIYUN_BONUS_PER,
  REALMS,
  SAVE_VERSION,
  STORY_EVENTS,
  getArt,
  getEnding,
  getRealm,
} from './data';
import type {
  ActionResult,
  ArtDef,
  DerivedStats,
  EndingDef,
  GameState,
  StoryEventDef,
  TickResult,
} from './types';

function emptyOwned(): Record<string, number> {
  const owned: Record<string, number> = {};
  for (const a of ARTS) owned[a.id] = 0;
  return owned;
}

export function createNewState(now = Date.now()): GameState {
  return {
    douqi: 0,
    totalDouqi: 0,
    qiyun: 0,
    owned: emptyOwned(),
    realmIndex: 0,
    star: 1,
    branchId: null,
    factionId: null,
    destinyId: null,
    doneEvents: [],
    flags: [],
    endingsUnlocked: [],
    endingId: null,
    lastTickAt: now,
    reincarnations: 0,
    saveVersion: SAVE_VERSION,
    chronicle: ['气感初开。你自荒野拾起第一缕斗气。'],
  };
}

function clampInt(n: unknown, min: number, max: number): number {
  const v = Math.floor(Number(n) || 0);
  return Math.max(min, Math.min(max, v));
}

export function loadState(raw: unknown, now = Date.now()): GameState {
  const fresh = createNewState(now);
  if (!raw || typeof raw !== 'object') return fresh;
  const data = raw as Partial<GameState>;

  const owned: Record<string, number> = { ...fresh.owned };
  if (data.owned && typeof data.owned === 'object') {
    for (const a of ARTS) {
      const n = Number((data.owned as Record<string, unknown>)[a.id] ?? 0);
      owned[a.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
  }

  const flags = Array.isArray(data.flags)
    ? data.flags.filter((f): f is string => typeof f === 'string')
    : [];
  const doneEvents = Array.isArray(data.doneEvents)
    ? data.doneEvents.filter((f): f is string => typeof f === 'string')
    : [];
  const endingsUnlocked = Array.isArray(data.endingsUnlocked)
    ? data.endingsUnlocked.filter((f): f is string => typeof f === 'string')
    : [];
  const chronicle = Array.isArray(data.chronicle)
    ? data.chronicle.filter((f): f is string => typeof f === 'string').slice(-MAX_CHRONICLE)
    : fresh.chronicle;

  const lastTickAt = Number(data.lastTickAt);
  const safeLast =
    Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;

  return {
    douqi: Math.max(0, Number(data.douqi) || 0),
    totalDouqi: Math.max(0, Number(data.totalDouqi) || 0),
    qiyun: Math.max(0, Math.floor(Number(data.qiyun) || 0)),
    owned,
    realmIndex: clampInt(data.realmIndex, 0, REALMS.length - 1),
    star: clampInt(data.star, 1, MAX_STAR),
    branchId: (data.branchId as GameState['branchId']) || null,
    factionId: (data.factionId as GameState['factionId']) || null,
    destinyId: (data.destinyId as GameState['destinyId']) || null,
    doneEvents,
    flags,
    endingsUnlocked,
    endingId: typeof data.endingId === 'string' ? data.endingId : null,
    lastTickAt: safeLast,
    reincarnations: Math.max(0, Math.floor(Number(data.reincarnations) || 0)),
    saveVersion: SAVE_VERSION,
    chronicle,
  };
}

export function artAvailable(state: GameState, art: ArtDef): boolean {
  if (state.realmIndex < art.minRealm) return false;
  if (art.branch && art.branch !== state.branchId) return false;
  if (art.faction && art.faction !== state.factionId) return false;
  return true;
}

export function artCost(state: GameState, artId: string): number | null {
  const def = getArt(artId);
  if (!def || !artAvailable(state, def)) return null;
  const owned = state.owned[artId] ?? 0;
  return Math.ceil(def.baseCost * Math.pow(def.costMult, owned));
}

export function qiyunMultiplier(qiyun: number): number {
  return 1 + Math.max(0, qiyun) * QIYUN_BONUS_PER;
}

/** 星级倍率：每星 +6% */
export function starMultiplier(star: number): number {
  return 1 + Math.max(0, star - 1) * 0.06;
}

export function raiseStarCost(state: GameState): number | null {
  if (state.star >= MAX_STAR) return null;
  const realm = getRealm(state.realmIndex);
  return Math.ceil(realm.starCostBase * Math.pow(1.72, state.star - 1));
}

export function breakthroughCost(state: GameState): number | null {
  if (state.realmIndex >= REALMS.length - 1) return null;
  if (state.star < MAX_STAR) return null;
  return getRealm(state.realmIndex).breakCost;
}

export function calcQiyunGain(state: GameState): number {
  const fromDouqi = Math.floor(Math.sqrt(state.totalDouqi / 80_000));
  const fromRealm = Math.max(0, state.realmIndex - 2);
  const fromFlags = state.flags.includes('survived_tribulation') ? 2 : 0;
  return Math.max(0, fromDouqi + fromRealm + fromFlags);
}

function hasFlags(state: GameState, need?: string[]): boolean {
  if (!need || need.length === 0) return true;
  return need.every((f) => state.flags.includes(f));
}

function hasArts(state: GameState, need?: Record<string, number>): boolean {
  if (!need) return true;
  return Object.entries(need).every(([id, n]) => (state.owned[id] ?? 0) >= n);
}

export function matchEnding(state: GameState): EndingDef | null {
  const candidates = ENDINGS.filter((e) => {
    if (e.id === 'fallen_wild') return false;
    if (state.realmIndex < e.minRealm) return false;
    if (e.requireBranch && e.requireBranch !== state.branchId) return false;
    if (e.requireFaction && e.requireFaction !== state.factionId) return false;
    if (e.requireDestiny && e.requireDestiny !== state.destinyId) return false;
    if (e.minQiyun != null && state.qiyun < e.minQiyun) return false;
    if (!hasFlags(state, e.requireFlags)) return false;
    if (!hasArts(state, e.requireArts)) return false;
    return true;
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0]!;
}

export function findPendingEvent(state: GameState): StoryEventDef | null {
  if (state.endingId) return null;
  for (const ev of STORY_EVENTS) {
    if (state.doneEvents.includes(ev.id)) continue;
    if (state.realmIndex < ev.minRealm) continue;
    if (ev.minStar != null && state.star < ev.minStar) continue;
    if (ev.requireBranch && ev.requireBranch !== state.branchId) continue;
    if (ev.requireFaction && ev.requireFaction !== state.factionId) continue;
    if (!hasFlags(state, ev.requireFlags)) continue;
    // 道途选择事件：已有道途则跳过
    if (ev.id === 'choose_branch' && state.branchId) continue;
    if (ev.id === 'choose_faction' && state.factionId) continue;
    if (ev.id === 'choose_destiny' && state.destinyId) continue;
    return ev;
  }
  return null;
}

function pushChronicle(state: GameState, line: string): GameState {
  const chronicle = [...state.chronicle, line].slice(-MAX_CHRONICLE);
  return { ...state, chronicle };
}

function grantDouqi(state: GameState, amount: number): GameState {
  if (amount === 0) return state;
  const next = Math.max(0, state.douqi + amount);
  const total =
    amount > 0 ? state.totalDouqi + amount : state.totalDouqi;
  return { ...state, douqi: next, totalDouqi: total };
}

export function derive(state: GameState): DerivedStats {
  const realm = getRealm(state.realmIndex);
  const qiyunMult = qiyunMultiplier(state.qiyun);
  const realmMult = realm.mult;
  const starMult = starMultiplier(state.star);
  const branchMult = state.branchId ? BRANCH_LABELS[state.branchId].mult : 1;

  let clickBase = 1;
  let passiveBase = 0;
  for (const art of ARTS) {
    if (!artAvailable(state, art)) continue;
    const n = state.owned[art.id] ?? 0;
    if (n <= 0) continue;
    if (art.kind === 'click') clickBase += art.power * n;
    else passiveBase += art.power * n;
  }

  const scale = realmMult * starMult * branchMult * qiyunMult;
  const clickPower = clickBase * scale;
  const douqiPerSec = passiveBase * scale;

  const nextStarCost = raiseStarCost(state);
  const breakCost = breakthroughCost(state);
  const canRaiseStar = nextStarCost != null && state.douqi >= nextStarCost;
  const canBreakthrough = breakCost != null && state.douqi >= breakCost;

  const qiyunGain = calcQiyunGain(state);
  const canReincarnate = qiyunGain > 0 && state.realmIndex >= 3;

  return {
    clickPower,
    douqiPerSec,
    qiyunMult,
    realmMult,
    starMult,
    branchMult,
    realm,
    nextStarCost,
    breakCost,
    canRaiseStar,
    canBreakthrough,
    qiyunGain,
    canReincarnate,
    pendingEvent: findPendingEvent(state),
    matchedEnding: matchEnding(state),
  };
}

export function tick(state: GameState, now = Date.now()): TickResult {
  const elapsedRaw = Math.max(0, now - state.lastTickAt);
  const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
  const offlineSeconds = elapsedRaw / 1000;
  const cappedSeconds = elapsed / 1000;
  const { douqiPerSec } = derive(state);
  const gained = douqiPerSec * cappedSeconds;
  let next = grantDouqi(state, gained);
  next = { ...next, lastTickAt: now };
  return { state: next, gained, cappedSeconds, offlineSeconds };
}

export function clickAbsorb(state: GameState, now = Date.now()): ActionResult {
  if (state.endingId) return { ok: false, state, reason: '此世已落幕' };
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const { clickPower } = derive(ticked);
  return { ok: true, state: grantDouqi(ticked, clickPower) };
}

export function buyArt(state: GameState, artId: string, now = Date.now()): ActionResult {
  if (state.endingId) return { ok: false, state, reason: '此世已落幕' };
  const def = getArt(artId);
  if (!def) return { ok: false, state, reason: '未知功法' };
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  if (!artAvailable(ticked, def)) {
    return { ok: false, state: ticked, reason: '尚未解锁该功法' };
  }
  const cost = artCost(ticked, artId);
  if (cost == null || ticked.douqi < cost) {
    return { ok: false, state: ticked, reason: '斗气不足' };
  }
  const owned = { ...ticked.owned, [artId]: (ticked.owned[artId] ?? 0) + 1 };
  return {
    ok: true,
    state: { ...ticked, douqi: ticked.douqi - cost, owned },
    message: `修习「${def.name}」`,
  };
}

export function raiseStar(state: GameState, now = Date.now()): ActionResult {
  if (state.endingId) return { ok: false, state, reason: '此世已落幕' };
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const cost = raiseStarCost(ticked);
  if (cost == null) return { ok: false, state: ticked, reason: '已满九星，可尝试破境' };
  if (ticked.douqi < cost) return { ok: false, state: ticked, reason: '斗气不足' };
  const nextStar = ticked.star + 1;
  let next = {
    ...ticked,
    douqi: ticked.douqi - cost,
    star: nextStar,
  };
  next = pushChronicle(next, `${getRealm(next.realmIndex).name}${nextStar}星。气海又阔一分。`);
  return { ok: true, state: next, message: `升至 ${nextStar} 星` };
}

export function breakthrough(state: GameState, now = Date.now()): ActionResult {
  if (state.endingId) return { ok: false, state, reason: '此世已落幕' };
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const cost = breakthroughCost(ticked);
  if (cost == null) {
    return { ok: false, state: ticked, reason: '无法破境（需九星且未至斗帝）' };
  }
  if (ticked.douqi < cost) return { ok: false, state: ticked, reason: '斗气不足' };

  const nextIndex = ticked.realmIndex + 1;
  const nextRealm = getRealm(nextIndex);
  let next: GameState = {
    ...ticked,
    douqi: ticked.douqi - cost,
    realmIndex: nextIndex,
    star: 1,
  };
  next = pushChronicle(next, `破境成功：${nextRealm.name}。${nextRealm.blurb}`);

  // 踏入斗帝时尝试结算结局
  if (nextIndex >= REALMS.length - 1) {
    const ending = matchEnding(next);
    if (ending) {
      const unlocked = next.endingsUnlocked.includes(ending.id)
        ? next.endingsUnlocked
        : [...next.endingsUnlocked, ending.id];
      next = {
        ...next,
        endingId: ending.id,
        endingsUnlocked: unlocked,
      };
      next = pushChronicle(next, `【结局】${ending.name}——${ending.title}`);
    }
  }

  return { ok: true, state: next, message: `破境至「${nextRealm.name}」` };
}

export function resolveEvent(
  state: GameState,
  eventId: string,
  optionId: string,
  now = Date.now(),
): ActionResult {
  if (state.endingId) return { ok: false, state, reason: '此世已落幕' };
  const ticked = tick(state, now).state;
  const pending = findPendingEvent(ticked);
  if (!pending || pending.id !== eventId) {
    return { ok: false, state: ticked, reason: '当前没有该事件' };
  }
  const option = pending.options.find((o) => o.id === optionId);
  if (!option) return { ok: false, state: ticked, reason: '未知选项' };

  let next: GameState = {
    ...ticked,
    doneEvents: [...ticked.doneEvents, eventId],
  };

  if (option.set?.branchId) next = { ...next, branchId: option.set.branchId };
  if (option.set?.factionId) next = { ...next, factionId: option.set.factionId };
  if (option.set?.destinyId) next = { ...next, destinyId: option.set.destinyId };

  if (option.flags?.length) {
    const flags = [...next.flags];
    for (const f of option.flags) {
      if (!flags.includes(f)) flags.push(f);
    }
    next = { ...next, flags };
  }

  if (option.douqiDelta) next = grantDouqi(next, option.douqiDelta);
  if (option.qiyunDelta) {
    next = {
      ...next,
      qiyun: Math.max(0, next.qiyun + option.qiyunDelta),
    };
  }

  next = pushChronicle(
    next,
    `【${pending.title}】你选择了「${option.label}」。${option.blurb}`,
  );

  // 帝门等事件后可能立刻匹配结局（因果陨落等）
  const ending = matchEnding(next);
  if (
    ending &&
    (ending.id === 'karmic_fall' ||
      (next.realmIndex >= REALMS.length - 1 && !next.endingId))
  ) {
    const unlocked = next.endingsUnlocked.includes(ending.id)
      ? next.endingsUnlocked
      : [...next.endingsUnlocked, ending.id];
    next = {
      ...next,
      endingId: ending.id,
      endingsUnlocked: unlocked,
    };
    next = pushChronicle(next, `【结局】${ending.name}——${ending.title}`);
  }

  return { ok: true, state: next, message: option.label };
}

/**
 * 轮回：保留气运与已收集结局；重置境界/功法/分支；可触发「陨落荒野」收藏。
 */
export function reincarnate(state: GameState, now = Date.now()): ActionResult {
  const ticked = tick(state, now).state;
  const stats = derive(ticked);
  if (!stats.canReincarnate && !ticked.endingId) {
    return { ok: false, state: ticked, reason: '需达大斗师以上且有气运收益，或已触发结局' };
  }

  const gain = Math.max(stats.qiyunGain, ticked.endingId ? 1 : 0);
  let endingsUnlocked = [...ticked.endingsUnlocked];

  // 低收益且无结局时记入陨落
  if (!ticked.endingId && gain <= 1 && ticked.realmIndex < 5) {
    const fallen = getEnding('fallen_wild');
    if (fallen && !endingsUnlocked.includes(fallen.id)) {
      endingsUnlocked.push(fallen.id);
    }
  }

  const fresh = createNewState(now);
  const next: GameState = {
    ...fresh,
    qiyun: ticked.qiyun + gain,
    endingsUnlocked,
    reincarnations: ticked.reincarnations + 1,
    chronicle: [
      `第 ${ticked.reincarnations + 1} 次轮回。气运 +${gain}，累计气运 ${ticked.qiyun + gain}。`,
      '气感再开。此世道路，或与上世不同。',
    ],
  };
  return {
    ok: true,
    state: next,
    message: `轮回成功，气运 +${gain}`,
  };
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs < 1000) return String(Math.floor(n * 10) / 10);
  const units = [
    { v: 1e14, s: '亿亿' },
    { v: 1e12, s: '万亿' },
    { v: 1e8, s: '亿' },
    { v: 1e4, s: '万' },
  ];
  for (const u of units) {
    if (abs >= u.v) {
      const val = n / u.v;
      return (Math.abs(val) >= 100 ? val.toFixed(0) : val.toFixed(2)) + u.s;
    }
  }
  return String(Math.floor(n));
}

export function getMeta() {
  return {
    version: undefined as string | undefined,
    realms: REALMS.map((r, i) => ({
      index: i,
      id: r.id,
      name: r.name,
      mult: r.mult,
      breakCost: r.breakCost,
    })),
    arts: ARTS.map((a) => ({
      id: a.id,
      name: a.name,
      kind: a.kind,
      minRealm: a.minRealm,
      branch: a.branch ?? null,
      faction: a.faction ?? null,
    })),
    branches: Object.entries(BRANCH_LABELS).map(([id, v]) => ({ id, ...v })),
    endings: ENDINGS.map((e) => ({
      id: e.id,
      name: e.name,
      title: e.title,
      priority: e.priority,
    })),
    events: STORY_EVENTS.map((e) => ({
      id: e.id,
      title: e.title,
      minRealm: e.minRealm,
    })),
    maxOfflineMs: MAX_OFFLINE_MS,
    qiyunBonusPer: QIYUN_BONUS_PER,
    maxStar: MAX_STAR,
  };
}
