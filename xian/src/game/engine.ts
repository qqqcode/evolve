import {
  ARTS,
  BIRTHS,
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  MAX_CHRONICLE,
  MAX_EQUIP,
  MAX_OFFLINE_MS,
  MAX_STAR,
  QIYUN_BONUS_PER,
  REALMS,
  SAVE_VERSION,
  STORY_EVENTS,
  TREASURES,
  addAttrs,
  getArt,
  getBirth,
  getEnding,
  getEnemy,
  getRealm,
  getTreasure,
  scaleAttrs,
  zeroAttrs,
} from './data';
import type {
  ActionResult,
  ArtDef,
  AttrKey,
  AttrMap,
  CombatResult,
  DerivedStats,
  EndingDef,
  GameState,
  StoryEventDef,
  TickResult,
} from './types';
import { ATTR_KEYS } from './types';

function emptyOwned(): Record<string, number> {
  const owned: Record<string, number> = {};
  for (const a of ARTS) owned[a.id] = 0;
  return owned;
}

function clampInt(n: unknown, min: number, max: number): number {
  const v = Math.floor(Number(n) || 0);
  return Math.max(min, Math.min(max, v));
}

function parseAttrs(raw: unknown, fallback: AttrMap): AttrMap {
  const base = { ...fallback };
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  for (const k of ATTR_KEYS) {
    const n = Number(o[k]);
    base[k] = Number.isFinite(n) ? Math.floor(n) : base[k];
  }
  return base;
}

/** 跨世保留的空壳（未选出身） */
export function createMetaState(now = Date.now()): GameState {
  return {
    lingqi: 0,
    totalLingqi: 0,
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
    chronicle: ['轮回之门半开。请择一出身，再入仙途。'],
    birthId: null,
    attrs: zeroAttrs(),
    freePoints: 0,
    treasures: [],
    equipped: [],
    vault: [],
    legacyAttrs: zeroAttrs(),
    peakRealmIndex: 0,
    phase: 'rebirth',
    deathReason: null,
    combatWins: 0,
    combatLosses: 0,
  };
}

export function createNewState(now = Date.now()): GameState {
  return createMetaState(now);
}

export function loadState(raw: unknown, now = Date.now()): GameState {
  const fresh = createMetaState(now);
  if (!raw || typeof raw !== 'object') return fresh;
  const data = raw as Partial<GameState> & { douqi?: number; totalDouqi?: number };

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
  const treasures = Array.isArray(data.treasures)
    ? data.treasures.filter((f): f is string => typeof f === 'string' && !!getTreasure(f))
    : [];
  const equipped = Array.isArray(data.equipped)
    ? data.equipped.filter((f): f is string => typeof f === 'string' && treasures.includes(f)).slice(0, MAX_EQUIP)
    : [];
  const vault = Array.isArray(data.vault)
    ? data.vault.filter((f): f is string => typeof f === 'string' && !!getTreasure(f))
    : [];

  const lastTickAt = Number(data.lastTickAt);
  const safeLast =
    Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;

  const lingqi = Math.max(0, Number(data.lingqi ?? data.douqi) || 0);
  const totalLingqi = Math.max(lingqi, Number(data.totalLingqi ?? data.totalDouqi) || 0);

  const phase =
    data.phase === 'playing' || data.phase === 'rebirth' || data.phase === 'ended'
      ? data.phase
      : data.birthId
        ? 'playing'
        : 'rebirth';

  return {
    lingqi,
    totalLingqi,
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
    birthId: typeof data.birthId === 'string' ? data.birthId : null,
    attrs: parseAttrs(data.attrs, zeroAttrs()),
    freePoints: Math.max(0, Math.floor(Number(data.freePoints) || 0)),
    treasures,
    equipped,
    vault,
    legacyAttrs: parseAttrs(data.legacyAttrs, zeroAttrs()),
    peakRealmIndex: clampInt(data.peakRealmIndex ?? data.realmIndex, 0, REALMS.length - 1),
    phase: !data.birthId && phase === 'playing' ? 'rebirth' : phase,
    deathReason: typeof data.deathReason === 'string' ? data.deathReason : null,
    combatWins: Math.max(0, Math.floor(Number(data.combatWins) || 0)),
    combatLosses: Math.max(0, Math.floor(Number(data.combatLosses) || 0)),
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
  const fromLingqi = Math.floor(Math.sqrt(state.totalLingqi / 80_000));
  const fromRealm = Math.max(0, state.peakRealmIndex - 2);
  const fromFlags = state.flags.includes('survived_tribulation') ? 2 : 0;
  const fromCombat = Math.floor(state.combatWins / 3);
  return Math.max(0, fromLingqi + fromRealm + fromFlags + fromCombat);
}

function hasFlags(state: GameState, need?: string[]): boolean {
  if (!need || need.length === 0) return true;
  return need.every((f) => state.flags.includes(f));
}

function hasArts(state: GameState, need?: Record<string, number>): boolean {
  if (!need) return true;
  return Object.entries(need).every(([id, n]) => (state.owned[id] ?? 0) >= n);
}

function hasTreasures(state: GameState, need?: string[]): boolean {
  if (!need || !need.length) return true;
  return need.every((id) => state.treasures.includes(id) || state.vault.includes(id));
}

function hasMinAttrs(total: AttrMap, need?: Partial<AttrMap>): boolean {
  if (!need) return true;
  return ATTR_KEYS.every((k) => total[k] >= (need[k] || 0));
}

/** 法宝提供的属性（已装备） */
export function treasureAttrBonus(state: GameState): AttrMap {
  let sum = zeroAttrs();
  for (const id of state.equipped) {
    const t = getTreasure(id);
    if (t) sum = addAttrs(sum, t.attrs);
  }
  return sum;
}

/** 功法每级属性（持有数 × 每级） */
export function artAttrBonus(state: GameState): AttrMap {
  let sum = zeroAttrs();
  for (const art of ARTS) {
    const n = state.owned[art.id] ?? 0;
    if (n <= 0 || !art.attrs) continue;
    const scaled: Partial<AttrMap> = {};
    for (const k of ATTR_KEYS) {
      if (art.attrs[k]) scaled[k] = art.attrs[k]! * n;
    }
    sum = addAttrs(sum, scaled);
  }
  // 属性加成以整数计入战斗
  return {
    atk: Math.floor(sum.atk),
    def: Math.floor(sum.def),
    spd: Math.floor(sum.spd),
    spirit: Math.floor(sum.spirit),
    bone: Math.floor(sum.bone),
    luck: Math.floor(sum.luck),
  };
}

export function totalAttrs(state: GameState): AttrMap {
  return addAttrs(
    addAttrs(addAttrs(state.attrs, state.legacyAttrs), treasureAttrBonus(state)),
    artAttrBonus(state),
  );
}

/** 战斗力：属性加权 × 法宝乘区 × 境界系数 */
export function calcCombatPower(state: GameState, attrs?: AttrMap): number {
  const a = attrs || totalAttrs(state);
  const weighted =
    a.atk * 1.2 + a.def * 1.0 + a.spd * 0.9 + a.spirit * 1.1 + a.bone * 0.8 + a.luck * 0.6;
  let mult = 1;
  for (const id of state.equipped) {
    const t = getTreasure(id);
    if (t?.combatMult) mult *= t.combatMult;
  }
  const realmMult = 1 + state.realmIndex * 0.08 + state.star * 0.01;
  return Math.max(1, weighted * mult * realmMult);
}

export function enemyPower(enemyAttrs: AttrMap, realmIndex: number): number {
  const weighted =
    enemyAttrs.atk * 1.2 +
    enemyAttrs.def * 1.0 +
    enemyAttrs.spd * 0.9 +
    enemyAttrs.spirit * 1.1 +
    enemyAttrs.bone * 0.8 +
    enemyAttrs.luck * 0.6;
  return Math.max(1, weighted * (1 + realmIndex * 0.05));
}

export function matchEnding(state: GameState): EndingDef | null {
  const attrs = totalAttrs(state);
  const candidates = ENDINGS.filter((e) => {
    if (e.id === 'fallen_wild') return false;
    if (state.realmIndex < e.minRealm) return false;
    if (e.requireBranch && e.requireBranch !== state.branchId) return false;
    if (e.requireFaction && e.requireFaction !== state.factionId) return false;
    if (e.requireDestiny && e.requireDestiny !== state.destinyId) return false;
    if (e.minQiyun != null && state.qiyun < e.minQiyun) return false;
    if (!hasFlags(state, e.requireFlags)) return false;
    if (!hasArts(state, e.requireArts)) return false;
    if (!hasTreasures(state, e.requireTreasures)) return false;
    if (!hasMinAttrs(attrs, e.minAttrs)) return false;
    return true;
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0]!;
}

export function findPendingEvent(state: GameState): StoryEventDef | null {
  if (state.phase !== 'playing' || state.endingId) return null;
  for (const ev of STORY_EVENTS) {
    if (state.doneEvents.includes(ev.id)) continue;
    if (state.realmIndex < ev.minRealm) continue;
    if (ev.minStar != null && state.star < ev.minStar) continue;
    if (ev.requireBranch && ev.requireBranch !== state.branchId) continue;
    if (ev.requireFaction && ev.requireFaction !== state.factionId) continue;
    if (ev.requireBirth && ev.requireBirth !== state.birthId) continue;
    if (!hasFlags(state, ev.requireFlags)) continue;
    if (ev.id === 'choose_branch' && state.branchId) continue;
    if (ev.id === 'choose_faction' && state.factionId) continue;
    if (ev.id === 'choose_destiny' && state.destinyId) continue;
    return ev;
  }
  return null;
}

function pushChronicle(state: GameState, line: string): GameState {
  return { ...state, chronicle: [...state.chronicle, line].slice(-MAX_CHRONICLE) };
}

function grantLingqi(state: GameState, amount: number): GameState {
  if (amount === 0) return state;
  const next = Math.max(0, state.lingqi + amount);
  const total = amount > 0 ? state.totalLingqi + amount : state.totalLingqi;
  return { ...state, lingqi: next, totalLingqi: total };
}

function grantTreasure(state: GameState, id: string): GameState {
  if (!getTreasure(id)) return state;
  if (state.treasures.includes(id)) return state;
  const treasures = [...state.treasures, id];
  let equipped = state.equipped;
  if (equipped.length < MAX_EQUIP) equipped = [...equipped, id];
  return pushChronicle(
    { ...state, treasures, equipped },
    `获得法宝「${getTreasure(id)!.name}」【${getTreasure(id)!.lore}】`,
  );
}

function updatePeak(state: GameState): GameState {
  if (state.realmIndex > state.peakRealmIndex) {
    return { ...state, peakRealmIndex: state.realmIndex };
  }
  return state;
}

export function derive(state: GameState): DerivedStats {
  const realm = getRealm(state.realmIndex);
  const qiyunMult = qiyunMultiplier(state.qiyun);
  const realmMult = realm.mult;
  const starMult = starMultiplier(state.star);
  const branchMult = state.branchId ? BRANCH_LABELS[state.branchId].mult : 1;
  const attrs = totalAttrs(state);
  const boneFactor = 1 + attrs.bone * 0.015;
  const spiritFactor = 1 + attrs.spirit * 0.012;
  const luckFactor = 1 + attrs.luck * 0.01;

  let clickBase = 1;
  let passiveBase = 0;
  for (const art of ARTS) {
    if (!artAvailable(state, art)) continue;
    const n = state.owned[art.id] ?? 0;
    if (n <= 0) continue;
    if (art.kind === 'click') clickBase += art.power * n;
    else passiveBase += art.power * n;
  }

  const scale = realmMult * starMult * branchMult * qiyunMult * boneFactor;
  const clickPower = clickBase * scale;
  const lingqiPerSec = passiveBase * scale * spiritFactor * luckFactor;

  const nextStarCost = raiseStarCost(state);
  const breakCost = breakthroughCost(state);
  const playing = state.phase === 'playing' && !state.endingId;
  const canRaiseStar = playing && nextStarCost != null && state.lingqi >= nextStarCost;
  const canBreakthrough = playing && breakCost != null && state.lingqi >= breakCost;

  const peakRealm = getRealm(state.peakRealmIndex);
  const qiyunGain = calcQiyunGain(state);
  const canReincarnate =
    state.phase === 'playing' && (qiyunGain > 0 && state.realmIndex >= 2 || !!state.endingId);

  return {
    clickPower,
    lingqiPerSec,
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
    totalAttrs: attrs,
    treasureAttrs: treasureAttrBonus(state),
    combatPower: calcCombatPower(state, attrs),
    inheritPreview: {
      attrRate: peakRealm.inheritAttrRate,
      treasureSlots: peakRealm.inheritTreasureSlots,
    },
  };
}

export function tick(state: GameState, now = Date.now()): TickResult {
  if (state.phase !== 'playing') {
    return { state: { ...state, lastTickAt: now }, gained: 0, cappedSeconds: 0, offlineSeconds: 0 };
  }
  const elapsedRaw = Math.max(0, now - state.lastTickAt);
  const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
  const offlineSeconds = elapsedRaw / 1000;
  const cappedSeconds = elapsed / 1000;
  const { lingqiPerSec } = derive(state);
  const gained = lingqiPerSec * cappedSeconds;
  let next = grantLingqi(state, gained);
  next = { ...next, lastTickAt: now };
  return { state: next, gained, cappedSeconds, offlineSeconds };
}

function ensurePlaying(state: GameState): ActionResult | null {
  if (state.phase === 'rebirth') {
    return { ok: false, state, reason: '请先选择出身转生' };
  }
  if (state.phase === 'ended' || state.endingId) {
    return { ok: false, state, reason: '此世已落幕，可轮回' };
  }
  return null;
}

export function clickAbsorb(state: GameState, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const { clickPower } = derive(ticked);
  return { ok: true, state: grantLingqi(ticked, clickPower) };
}

export function buyArt(state: GameState, artId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
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
  if (cost == null || ticked.lingqi < cost) {
    return { ok: false, state: ticked, reason: '灵气不足' };
  }
  const owned = { ...ticked.owned, [artId]: (ticked.owned[artId] ?? 0) + 1 };
  return {
    ok: true,
    state: { ...ticked, lingqi: ticked.lingqi - cost, owned },
    message: `修习「${def.name}」`,
  };
}

export function buyTreasure(state: GameState, treasureId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const def = getTreasure(treasureId);
  if (!def || def.cost <= 0) return { ok: false, state, reason: '无法购买该法宝' };
  const ticked = tick(state, now).state;
  if (ticked.treasures.includes(treasureId)) {
    return { ok: false, state: ticked, reason: '已拥有该法宝' };
  }
  if (ticked.realmIndex < def.minRealm) {
    return { ok: false, state: ticked, reason: '境界不足' };
  }
  if (ticked.lingqi < def.cost) {
    return { ok: false, state: ticked, reason: '灵气不足' };
  }
  let next = { ...ticked, lingqi: ticked.lingqi - def.cost };
  next = grantTreasure(next, treasureId);
  return { ok: true, state: next, message: `购得「${def.name}」` };
}

export function toggleEquip(state: GameState, treasureId: string): ActionResult {
  if (!state.treasures.includes(treasureId)) {
    return { ok: false, state, reason: '未持有该法宝' };
  }
  if (state.equipped.includes(treasureId)) {
    return {
      ok: true,
      state: { ...state, equipped: state.equipped.filter((id) => id !== treasureId) },
      message: '已卸下',
    };
  }
  if (state.equipped.length >= MAX_EQUIP) {
    return { ok: false, state, reason: `最多装备 ${MAX_EQUIP} 件法宝` };
  }
  return {
    ok: true,
    state: { ...state, equipped: [...state.equipped, treasureId] },
    message: '已装备',
  };
}

export function allocatePoint(state: GameState, key: AttrKey): ActionResult {
  if (state.phase === 'ended') return { ok: false, state, reason: '此世已落幕' };
  if (state.freePoints <= 0) return { ok: false, state, reason: '没有可分配属性点' };
  if (!ATTR_KEYS.includes(key)) return { ok: false, state, reason: '未知属性' };
  return {
    ok: true,
    state: {
      ...state,
      freePoints: state.freePoints - 1,
      attrs: { ...state.attrs, [key]: state.attrs[key] + 1 },
    },
  };
}

export function raiseStar(state: GameState, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const cost = raiseStarCost(ticked);
  if (cost == null) return { ok: false, state: ticked, reason: '已满九层，可尝试破境' };
  if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: '灵气不足' };
  const nextStar = ticked.star + 1;
  let next = updatePeak({
    ...ticked,
    lingqi: ticked.lingqi - cost,
    star: nextStar,
  });
  // 每升 3 层送 1 自由点
  if (nextStar % 3 === 0) {
    next = { ...next, freePoints: next.freePoints + 1 };
  }
  next = pushChronicle(next, `${getRealm(next.realmIndex).name}${nextStar}层。`);
  return { ok: true, state: next, message: `升至 ${nextStar} 层` };
}

export function breakthrough(state: GameState, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const cost = breakthroughCost(ticked);
  if (cost == null) {
    return { ok: false, state: ticked, reason: '无法破境（需九层且未至大道）' };
  }
  if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: '灵气不足' };

  const nextIndex = ticked.realmIndex + 1;
  const nextRealm = getRealm(nextIndex);
  let next: GameState = updatePeak({
    ...ticked,
    lingqi: ticked.lingqi - cost,
    realmIndex: nextIndex,
    star: 1,
    freePoints: ticked.freePoints + 2,
  });
  next = pushChronicle(next, `破境成功：${nextRealm.name}。${nextRealm.blurb}`);

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
        phase: 'ended',
      };
      next = pushChronicle(next, `【结局】${ending.name}——${ending.title}`);
    }
  }

  return { ok: true, state: next, message: `破境至「${nextRealm.name}」` };
}

export function startCombat(state: GameState, enemyId: string, now = Date.now()): CombatResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const enemy = getEnemy(enemyId);
  if (!enemy) return { ok: false, state, reason: '未知对手' };
  const ticked = tick(state, now).state;
  const pPower = calcCombatPower(ticked);
  const ePower = enemyPower(enemy.attrs, ticked.realmIndex);
  // 气机参与随机浮动
  const luck = totalAttrs(ticked).luck;
  const roll = 0.85 + Math.random() * 0.3 + Math.min(0.15, luck * 0.005);
  const won = pPower * roll >= ePower;

  if (won) {
    let next = grantLingqi(ticked, enemy.rewardLingqi);
    next = {
      ...next,
      combatWins: next.combatWins + 1,
      freePoints: next.freePoints + (enemy.rewardPoints || 0),
    };
    if (enemy.dropTreasureId && Math.random() < (enemy.dropChance || 0)) {
      next = grantTreasure(next, enemy.dropTreasureId);
    }
    next = pushChronicle(
      next,
      `对战胜利：击败「${enemy.name}」（战力 ${Math.floor(pPower)} vs ${Math.floor(ePower)}）【${enemy.lore}】`,
    );
    return {
      ok: true,
      state: next,
      won: true,
      playerPower: pPower,
      enemyPower: ePower,
      message: `战胜 ${enemy.name}`,
    };
  }

  let next: GameState = {
    ...ticked,
    combatLosses: ticked.combatLosses + 1,
  };
  next = pushChronicle(
    next,
    `对战失败：不敌「${enemy.name}」（战力 ${Math.floor(pPower)} vs ${Math.floor(ePower)}）`,
  );
  return {
    ok: true,
    state: next,
    won: false,
    playerPower: pPower,
    enemyPower: ePower,
    message: `败于 ${enemy.name}`,
  };
}

/** 可选对手：当前境界附近 */
export function listCombatEnemies(state: GameState) {
  return ENEMIES.filter(
    (e) => state.realmIndex >= e.minRealm && state.realmIndex <= e.maxRealm + 1,
  );
}

export function die(state: GameState, reason: string, now = Date.now()): ActionResult {
  const ticked = tick(state, now).state;
  let next = updatePeak(ticked);
  next = pushChronicle(next, `【身死】${reason}`);
  // 进入轮回准备：结算气运，但不立刻清零——由 chooseBirth 继承
  const gain = Math.max(1, calcQiyunGain(next));
  let endingsUnlocked = [...next.endingsUnlocked];
  if (next.peakRealmIndex < 2 && !endingsUnlocked.includes('fallen_wild')) {
    endingsUnlocked.push('fallen_wild');
  }
  next = {
    ...next,
    phase: 'rebirth',
    deathReason: reason,
    qiyun: next.qiyun + gain,
    endingsUnlocked,
    endingId: null,
  };
  next = pushChronicle(
    next,
    `轮回将启。本世峰值「${getRealm(next.peakRealmIndex).name}」，气运 +${gain}。可继承属性约 ${Math.floor(getRealm(next.peakRealmIndex).inheritAttrRate * 100)}%，法宝栏 ${getRealm(next.peakRealmIndex).inheritTreasureSlots}。`,
  );
  return { ok: true, state: next, message: reason };
}

/**
 * 主动轮回（未死）：同样进入出身选择，并按峰值继承。
 */
export function beginReincarnation(state: GameState, now = Date.now()): ActionResult {
  const ticked = tick(state, now).state;
  const stats = derive(ticked);
  if (ticked.phase === 'rebirth') {
    return { ok: false, state: ticked, reason: '已在轮回选择中' };
  }
  if (!stats.canReincarnate && ticked.phase !== 'ended') {
    return { ok: false, state: ticked, reason: '需达筑基以上且有气运收益，或已触发结局' };
  }
  return die(
    ticked,
    ticked.endingId ? '道成身退，主动轮回' : '散功轮回，另辟仙途',
    now,
  );
}

/**
 * 选择出身并开启新世：继承永久属性与宝库法宝。
 */
export function chooseBirth(
  state: GameState,
  birthId: string,
  bringTreasureIds: string[] = [],
  now = Date.now(),
): ActionResult {
  if (state.phase !== 'rebirth') {
    return { ok: false, state, reason: '当前不在轮回选择中' };
  }
  const birth = getBirth(birthId);
  if (!birth) return { ok: false, state, reason: '未知出身' };

  const peak = getRealm(state.peakRealmIndex);
  const inheritRate = state.reincarnations === 0 && !state.deathReason ? 0 : peak.inheritAttrRate;
  const slots = state.reincarnations === 0 && !state.deathReason ? 0 : peak.inheritTreasureSlots;

  // 本世属性折入永久
  const fromLife = scaleAttrs(addAttrs(state.attrs, artAttrBonus(state)), inheritRate);
  const legacyAttrs = addAttrs(state.legacyAttrs, fromLife);

  // 宝库：把可存法宝入库
  let vault = [...state.vault];
  for (const id of state.treasures) {
    const t = getTreasure(id);
    if (t?.vaultable && !vault.includes(id)) vault.push(id);
  }

  const bring = bringTreasureIds
    .filter((id) => vault.includes(id))
    .slice(0, Math.max(0, slots));

  const attrs = addAttrs(zeroAttrs(), birth.attrs);
  const flags = [...(birth.flags || [])];

  const lifeNo = state.deathReason ? state.reincarnations + 1 : Math.max(1, state.reincarnations);
  const next: GameState = {
    lingqi: birth.startLingqi,
    totalLingqi: birth.startLingqi,
    qiyun: state.qiyun,
    owned: emptyOwned(),
    realmIndex: 0,
    star: 1,
    branchId: null,
    factionId: null,
    destinyId: null,
    doneEvents: [],
    flags,
    endingsUnlocked: state.endingsUnlocked,
    endingId: null,
    lastTickAt: now,
    reincarnations: state.deathReason ? state.reincarnations + 1 : state.reincarnations,
    saveVersion: SAVE_VERSION,
    chronicle: [
      `第 ${lifeNo} 世：出身「${birth.name}」。${birth.blurb}`,
      inheritRate > 0
        ? `继承永久属性（${Math.floor(inheritRate * 100)}%），携法宝 ${bring.length}/${slots}。`
        : '初入仙途，尚无继承。好好活着。',
    ],
    birthId,
    attrs,
    freePoints: birth.freePoints,
    treasures: [...bring],
    equipped: bring.slice(0, MAX_EQUIP),
    vault,
    legacyAttrs,
    peakRealmIndex: 0,
    phase: 'playing',
    deathReason: null,
    combatWins: 0,
    combatLosses: 0,
  };

  return { ok: true, state: next, message: `转生为「${birth.name}」` };
}

export function resolveEvent(
  state: GameState,
  eventId: string,
  optionId: string,
  now = Date.now(),
): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const ticked = tick(state, now).state;
  const pending = findPendingEvent(ticked);
  if (!pending || pending.id !== eventId) {
    return { ok: false, state: ticked, reason: '当前没有该事件' };
  }
  const option = pending.options.find((o) => o.id === optionId);
  if (!option) return { ok: false, state: ticked, reason: '未知选项' };

  if (option.forceDeath) {
    return die(ticked, option.deathReason || '作死身亡', now);
  }

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

  if (option.lingqiDelta) next = grantLingqi(next, option.lingqiDelta);
  if (option.qiyunDelta) {
    next = { ...next, qiyun: Math.max(0, next.qiyun + option.qiyunDelta) };
  }
  if (option.freePointsDelta) {
    next = { ...next, freePoints: Math.max(0, next.freePoints + option.freePointsDelta) };
  }
  if (option.attrsDelta) {
    next = { ...next, attrs: addAttrs(next.attrs, option.attrsDelta) };
  }
  if (option.grantTreasureId) {
    next = grantTreasure(next, option.grantTreasureId);
  }

  next = pushChronicle(
    next,
    `【${pending.title}】你选择了「${option.label}」。${option.blurb}${pending.lore ? `（${pending.lore}）` : ''}`,
  );

  if (option.combatEnemyId) {
    const combat = startCombat(next, option.combatEnemyId, now);
    next = combat.state;
    if (!combat.won && option.deathOnLose) {
      return die(next, option.deathReason || `败于强敌，身死道消`, now);
    }
    if (!combat.ok) {
      return { ok: false, state: next, reason: combat.reason };
    }
  }

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
      phase: 'ended',
    };
    next = pushChronicle(next, `【结局】${ending.name}——${ending.title}`);
  }

  return { ok: true, state: next, message: option.label };
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
      inheritAttrRate: r.inheritAttrRate,
      inheritTreasureSlots: r.inheritTreasureSlots,
    })),
    births: BIRTHS.map((b) => ({
      id: b.id,
      name: b.name,
      blurb: b.blurb,
      freePoints: b.freePoints,
    })),
    treasures: TREASURES.map((t) => ({
      id: t.id,
      name: t.name,
      lore: t.lore,
      cost: t.cost,
      minRealm: t.minRealm,
      vaultable: t.vaultable,
    })),
    enemies: ENEMIES.map((e) => ({
      id: e.id,
      name: e.name,
      lore: e.lore,
      minRealm: e.minRealm,
      maxRealm: e.maxRealm,
    })),
    endings: ENDINGS.map((e) => ({ id: e.id, name: e.name, title: e.title })),
    branches: Object.entries(BRANCH_LABELS).map(([id, v]) => ({ id, ...v })),
    maxOfflineMs: MAX_OFFLINE_MS,
    qiyunBonusPer: QIYUN_BONUS_PER,
    maxStar: MAX_STAR,
    maxEquip: MAX_EQUIP,
    attrKeys: ATTR_KEYS,
  };
}

export { BIRTHS, TREASURES, ENEMIES, ATTR_KEYS };
