import {
  ARTS,
  BIRTHS,
  BODY_STAGES,
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  FREE_POINT_TO_RESOURCE,
  HERBS,
  MAIN_STORY,
  MAX_CHRONICLE,
  MAX_EQUIP_PER_SLOT,
  MAX_MILESTONES,
  MAX_OFFLINE_MS,
  MAX_STAR,
  NATURALS,
  PILL_RECIPES,
  QIYUN_BONUS_PER,
  RANDOM_CHANCE,
  RANDOM_COOLDOWN_MS,
  RANDOM_EVENTS,
  REALMS,
  SAVE_VERSION,
  STORY_EVENTS,
  TREASURES,
  TRIAD_INTERFERE_CAP,
  addAttrs,
  artChannel,
  bodyAttrsBonus,
  bodyMultipliers,
  emptyEquipped,
  emptyHerbs,
  emptyPills,
  getArt,
  getBirth,
  getBodyStage,
  getEnding,
  getEnemy,
  getHerb,
  getNatural,
  getPillRecipe,
  getRealm,
  getTreasure,
  listEquippedIds,
  scaleAttrs,
  slotCapacity,
  zeroAttrs,
  zeroResources,
} from './data';
import type {
  ActionResult,
  ArtDef,
  AttrKey,
  AttrMap,
  CombatResult,
  DerivedStats,
  EndingDef,
  EquipSlot,
  EquippedMap,
  GameState,
  MilestoneEntry,
  MilestoneKind,
  ResourceKey,
  ResourceMap,
  StoryEventDef,
  TickResult,
  TreasureCons,
  TreasureDef,
  TreasureForgeState,
} from './types';
import {
  ATTR_KEYS,
  ATTR_LABELS,
  EQUIP_SLOTS,
  EQUIP_SLOT_LABELS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  TREASURE_TIER_LABELS,
} from './types';

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

function migrateEquipped(raw: unknown, treasures: string[], realmIndex = 0): EquippedMap {
  const eq = emptyEquipped(realmIndex);
  const place = (id: string) => {
    if (!treasures.includes(id)) return;
    const t = getTreasure(id);
    if (!t) return;
    const arr = eq[t.slot];
    const emptyIdx = arr.findIndex((x) => !x);
    if (emptyIdx >= 0 && !listEquippedIds(eq).includes(id)) arr[emptyIdx] = id;
  };

  if (Array.isArray(raw)) {
    for (const id of raw) {
      if (typeof id === 'string') place(id);
    }
    return eq;
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const slot of EQUIP_SLOTS) {
      const val = o[slot];
      if (typeof val === 'string') {
        place(val);
      } else if (Array.isArray(val)) {
        for (const id of val) {
          if (typeof id === 'string') place(id);
        }
      }
    }
  }
  return eq;
}

/** 境界提升后扩充装备格，保留已装备 */
export function syncEquipCapacity(state: GameState): GameState {
  const cap = slotCapacity(state.realmIndex);
  let changed = false;
  const equipped = { ...state.equipped } as EquippedMap;
  for (const slot of EQUIP_SLOTS) {
    const cur = [...(equipped[slot] || [])];
    const need = cap[slot];
    if (cur.length < need) {
      while (cur.length < need) cur.push(null);
      changed = true;
    } else if (cur.length > need) {
      // 缩容：多余的卸下（一般不会发生）
      equipped[slot] = cur.slice(0, need);
      changed = true;
      continue;
    }
    equipped[slot] = cur;
  }
  return changed ? { ...state, equipped } : state;
}

function parseMilestones(raw: unknown): MilestoneEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: MilestoneEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.title !== 'string' || typeof o.detail !== 'string') continue;
    const kind = (o.kind as MilestoneKind) || 'other';
    out.push({
      id: typeof o.id === 'string' ? o.id : `ms_${out.length}`,
      title: o.title,
      detail: o.detail,
      kind,
      realmLabel: typeof o.realmLabel === 'string' ? o.realmLabel : undefined,
      ts: Number(o.ts) || Date.now(),
    });
  }
  return out.slice(-MAX_MILESTONES);
}

function pushMilestone(
  state: GameState,
  entry: Omit<MilestoneEntry, 'ts' | 'realmLabel'> & { realmLabel?: string },
  now = Date.now(),
): GameState {
  const realm = getRealm(state.realmIndex);
  const full: MilestoneEntry = {
    ...entry,
    realmLabel: entry.realmLabel || `${realm.name}${state.star}层`,
    ts: now,
  };
  return {
    ...state,
    milestones: [...state.milestones, full].slice(-MAX_MILESTONES),
  };
}

/** 跨世保留的空壳（未选出身） */
export function createMetaState(now = Date.now()): GameState {
  return {
    lingqi: 0,
    totalLingqi: 0,
    tishu: 0,
    totalTishu: 0,
    jingshen: 0,
    totalJingshen: 0,
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
    treasureForge: {},
    equipped: emptyEquipped(),
    vault: [],
    naturals: [],
    naturalPassive: 0,
    mainChapter: 1,
    milestones: [],
    legacyAttrs: zeroAttrs(),
    peakRealmIndex: 0,
    phase: 'rebirth',
    deathReason: null,
    combatWins: 0,
    combatLosses: 0,
    randomEventId: null,
    lastRandomAt: 0,
    alchemyMastery: 0,
    herbs: emptyHerbs(),
    pills: emptyPills(),
    bodyStage: 0,
    bodyProgress: 0,
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
  const milestones = parseMilestones(data.milestones);
  const treasures = Array.isArray(data.treasures)
    ? data.treasures.filter((f): f is string => typeof f === 'string' && !!getTreasure(f))
    : [];
  const equipped = migrateEquipped(
    data.equipped,
    treasures,
    clampInt(data.realmIndex, 0, REALMS.length - 1),
  );
  const vault = Array.isArray(data.vault)
    ? data.vault.filter((f): f is string => typeof f === 'string' && !!getTreasure(f))
    : [];
  const naturals = Array.isArray(data.naturals)
    ? data.naturals.filter((f): f is string => typeof f === 'string' && !!getNatural(f))
    : [];

  const treasureForge: Record<string, TreasureForgeState> = {};
  const rawForge = (data as { treasureForge?: unknown }).treasureForge;
  if (rawForge && typeof rawForge === 'object') {
    for (const [id, v] of Object.entries(rawForge as Record<string, unknown>)) {
      if (!getTreasure(id)) continue;
      if (!v || typeof v !== 'object') continue;
      const o = v as Record<string, unknown>;
      const def = getTreasure(id)!;
      treasureForge[id] = {
        level: clampInt(o.level, 0, def.maxTemper),
        refined: !!o.refined,
      };
    }
  }

  const lastTickAt = Number(data.lastTickAt);
  const safeLast =
    Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;

  const lingqi = Math.max(0, Number(data.lingqi ?? data.douqi) || 0);
  const totalLingqi = Math.max(lingqi, Number(data.totalLingqi ?? data.totalDouqi) || 0);
  let tishu = Math.max(0, Number(data.tishu) || 0);
  let totalTishu = Math.max(tishu, Number(data.totalTishu) || 0);
  let jingshen = Math.max(0, Number(data.jingshen) || 0);
  let totalJingshen = Math.max(jingshen, Number(data.totalJingshen) || 0);

  // 旧档未分配自由点 → 折算为三资源
  const legacyFree = Math.max(0, Math.floor(Number(data.freePoints) || 0));
  if (legacyFree > 0) {
    const grant = legacyFree * FREE_POINT_TO_RESOURCE;
    tishu += grant;
    totalTishu += grant;
    jingshen += grant;
    totalJingshen += grant;
  }

  const herbs = emptyHerbs();
  if (data.herbs && typeof data.herbs === 'object') {
    for (const h of HERBS) {
      const n = Number((data.herbs as Record<string, unknown>)[h.id] ?? 0);
      herbs[h.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
  }
  const pills = emptyPills();
  if (data.pills && typeof data.pills === 'object') {
    for (const p of PILL_RECIPES) {
      const n = Number((data.pills as Record<string, unknown>)[p.id] ?? 0);
      pills[p.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
  }

  const phase =
    data.phase === 'playing' || data.phase === 'rebirth' || data.phase === 'ended'
      ? data.phase
      : data.birthId
        ? 'playing'
        : 'rebirth';

  const loaded: GameState = {
    lingqi,
    totalLingqi,
    tishu,
    totalTishu,
    jingshen,
    totalJingshen,
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
    freePoints: 0,
    treasures,
    treasureForge,
    equipped,
    vault,
    naturals,
    naturalPassive: Math.max(0, Number(data.naturalPassive) || 0),
    mainChapter: Math.max(1, Math.floor(Number(data.mainChapter) || 1)),
    milestones,
    legacyAttrs: parseAttrs(data.legacyAttrs, zeroAttrs()),
    peakRealmIndex: clampInt(data.peakRealmIndex ?? data.realmIndex, 0, REALMS.length - 1),
    phase: !data.birthId && phase === 'playing' ? 'rebirth' : phase,
    deathReason: typeof data.deathReason === 'string' ? data.deathReason : null,
    combatWins: Math.max(0, Math.floor(Number(data.combatWins) || 0)),
    combatLosses: Math.max(0, Math.floor(Number(data.combatLosses) || 0)),
    randomEventId: typeof data.randomEventId === 'string' ? data.randomEventId : null,
    lastRandomAt: Math.max(0, Number(data.lastRandomAt) || 0),
    alchemyMastery: Math.max(0, Math.floor(Number(data.alchemyMastery) || 0)),
    herbs,
    pills,
    bodyStage: clampInt(data.bodyStage, 0, BODY_STAGES.length),
    bodyProgress: Math.max(0, Number(data.bodyProgress) || 0),
  };
  // 载入时按上限钳制旧档资源
  const caps = resourceCaps(loaded);
  loaded.lingqi = Math.min(loaded.lingqi, caps.lingli);
  loaded.tishu = Math.min(loaded.tishu, caps.tishu);
  loaded.jingshen = Math.min(loaded.jingshen, caps.jingshen);
  return syncEquipCapacity(loaded);
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
  const lifetime =
    state.totalLingqi + state.totalTishu * 0.8 + state.totalJingshen * 0.8;
  const fromLingqi = Math.floor(Math.sqrt(lifetime / 80_000));
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

/** 法宝炼器状态 */
export function getTreasureForge(state: GameState, id: string): TreasureForgeState {
  return state.treasureForge[id] || { level: 0, refined: false };
}

/** 炼器放大正面：每级 +10% */
export function temperScale(level: number): number {
  return 1 + Math.max(0, level) * 0.1;
}

export function temperCost(def: TreasureDef, level: number): number {
  return Math.floor(def.temperBaseCost * Math.pow(1.45, Math.max(0, level)));
}

export function sellValue(state: GameState, id: string): number {
  const def = getTreasure(id);
  if (!def) return 0;
  const forge = getTreasureForge(state, id);
  return Math.floor(def.sellLingli * (1 + forge.level * 0.12) * (forge.refined ? 1.15 : 1));
}

/** 是否应施加负面：非仙品且未洗练 */
export function treasureConsActive(def: TreasureDef, forge: TreasureForgeState): boolean {
  return def.tier !== 'immortal' && !forge.refined && !!def.cons;
}

export interface EffectiveTreasureEffects {
  attrs: AttrMap;
  combatMult: number;
  cultivateClick: number;
  cultivatePassive: number;
  triadDamp: number;
  triadBias: ResourceMap;
  combatEdges: TreasureDef['combatEdges'];
  consActive: boolean;
  level: number;
  refined: boolean;
}

/** 单件法宝有效效果（炼器放大正面；负面按状态） */
export function effectiveTreasureEffects(
  state: GameState,
  id: string,
): EffectiveTreasureEffects | null {
  const def = getTreasure(id);
  if (!def) return null;
  const forge = getTreasureForge(state, id);
  const scale = temperScale(forge.level);
  const consActive = treasureConsActive(def, forge);
  const cons: TreasureCons | undefined = consActive ? def.cons : undefined;

  const attrs = zeroAttrs();
  for (const k of ATTR_KEYS) {
    const base = def.attrs[k] || 0;
    const boosted = base > 0 ? base * scale : base;
    const pen = cons?.attrs?.[k] || 0;
    attrs[k] = boosted + pen;
  }

  let combatMult = 1;
  if (def.combatMult) {
    combatMult = 1 + (def.combatMult - 1) * scale;
  }
  if (cons?.combatMult) combatMult *= cons.combatMult;

  let cultivateClick = (def.cultivateClick || 0) * scale;
  let cultivatePassive = (def.cultivatePassive || 0) * scale;
  if (cons?.cultivateClick) cultivateClick += cons.cultivateClick;
  if (cons?.cultivatePassive) cultivatePassive += cons.cultivatePassive;
  cultivateClick = Math.max(0, cultivateClick);
  cultivatePassive = Math.max(0, cultivatePassive);

  let triadDamp = (def.triadDamp || 0) * (1 + forge.level * 0.04);
  const triadBias = zeroResources();
  if (def.triadBias) {
    for (const key of RESOURCE_KEYS) {
      triadBias[key] += (def.triadBias[key] || 0) * scale;
    }
  }
  if (cons?.triadBias) {
    for (const key of RESOURCE_KEYS) {
      triadBias[key] += cons.triadBias[key] || 0;
    }
  }

  return {
    attrs,
    combatMult,
    cultivateClick,
    cultivatePassive,
    triadDamp,
    triadBias,
    combatEdges: def.combatEdges,
    consActive,
    level: forge.level,
    refined: forge.refined || def.tier === 'immortal',
  };
}

/** 悬停/列表展示用：装备后的属性加成文案 */
export function describeTreasureBonus(state: GameState, id: string): string {
  const def = getTreasure(id);
  const eff = effectiveTreasureEffects(state, id);
  if (!def || !eff) return '';
  const parts: string[] = [];
  parts.push(TREASURE_TIER_LABELS[def.tier]);
  if (eff.level > 0) parts.push(`炼器+${eff.level}`);
  if (eff.refined && def.tier !== 'immortal') parts.push('已洗练');
  for (const k of ATTR_KEYS) {
    if (eff.attrs[k]) {
      const v = Math.round(eff.attrs[k] * 10) / 10;
      parts.push(`${ATTR_LABELS[k]}${v > 0 ? '+' : ''}${v}`);
    }
  }
  if (eff.combatMult !== 1) parts.push(`战力×${eff.combatMult.toFixed(2)}`);
  if (eff.cultivateClick) parts.push(`点击+${eff.cultivateClick.toFixed(1)}`);
  if (eff.cultivatePassive) parts.push(`被动+${eff.cultivatePassive.toFixed(1)}`);
  if (eff.triadDamp) parts.push(`调和${Math.floor(eff.triadDamp * 100)}%`);
  if (def.pros?.length) parts.push('正：' + def.pros.slice(0, 3).join('、'));
  if (eff.consActive && def.cons?.labels?.length) {
    parts.push('负：' + def.cons.labels.join('、'));
  } else if (def.tier === 'immortal') {
    parts.push('仙品无负面');
  } else if (eff.refined) {
    parts.push('负面已洗');
  }
  return parts.join(' · ');
}

/** 法宝提供的属性（已装备，含炼器/负面；合计后取整） */
export function treasureAttrBonus(state: GameState): AttrMap {
  let sum = zeroAttrs();
  for (const id of listEquippedIds(state.equipped)) {
    const eff = effectiveTreasureEffects(state, id);
    if (eff) sum = addAttrs(sum, eff.attrs);
  }
  return {
    atk: Math.floor(sum.atk),
    def: Math.floor(sum.def),
    spd: Math.floor(sum.spd),
    spirit: Math.floor(sum.spirit),
    bone: Math.floor(sum.bone),
    luck: Math.floor(sum.luck),
  };
}

export function cultivateBonuses(state: GameState): { click: number; passive: number } {
  let click = 0;
  let passive = 0;
  for (const id of listEquippedIds(state.equipped)) {
    const eff = effectiveTreasureEffects(state, id);
    if (!eff) continue;
    click += eff.cultivateClick;
    passive += eff.cultivatePassive;
  }
  return { click, passive };
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
  const base = addAttrs(
    addAttrs(addAttrs(state.attrs, state.legacyAttrs), treasureAttrBonus(state)),
    artAttrBonus(state),
  );
  const withBody = addAttrs(base, bodyAttrsBonus(state.bodyStage));
  return addAttrs(withBody, resourceAttrsFromTotals(state));
}

/** 战斗力：属性加权 × 法宝乘区 × 境界系数 × 炼体 */
export function calcCombatPower(state: GameState, attrs?: AttrMap): number {
  const a = attrs || totalAttrs(state);
  const weighted =
    a.atk * 1.2 + a.def * 1.0 + a.spd * 0.9 + a.spirit * 1.1 + a.bone * 0.8 + a.luck * 0.6;
  let mult = 1;
  for (const id of listEquippedIds(state.equipped)) {
    const eff = effectiveTreasureEffects(state, id);
    if (eff && eff.combatMult !== 1) mult *= eff.combatMult;
  }
  const realmMult = 1 + state.realmIndex * 0.08 + state.star * 0.01;
  const bodyMult = bodyMultipliers(state.bodyStage).combatMult;
  return Math.max(1, weighted * mult * realmMult * bodyMult);
}

/** 汇总已装备法宝的越界特效概率（可叠加，上限封顶） */
export function gatherCombatEdges(state: GameState): {
  critChance: number;
  critMult: number;
  dodgeChance: number;
  plotArmorChance: number;
  firstStrikeChance: number;
  firstStrikeBonus: number;
} {
  let critChance = 0;
  let critMult = 1.4;
  let dodgeChance = 0;
  let plotArmorChance = 0;
  let firstStrikeChance = 0;
  let firstStrikeBonus = 0.1;
  for (const id of listEquippedIds(state.equipped)) {
    const e = getTreasure(id)?.combatEdges;
    if (!e) continue;
    critChance += e.critChance || 0;
    if (e.critMult && e.critMult > critMult) critMult = e.critMult;
    dodgeChance += e.dodgeChance || 0;
    plotArmorChance += e.plotArmorChance || 0;
    firstStrikeChance += e.firstStrikeChance || 0;
    if (e.firstStrikeBonus && e.firstStrikeBonus > firstStrikeBonus) {
      firstStrikeBonus = e.firstStrikeBonus;
    }
  }
  const luck = totalAttrs(state).luck;
  critChance = Math.min(0.55, critChance + luck * 0.002);
  dodgeChance = Math.min(0.45, dodgeChance + luck * 0.0015);
  plotArmorChance = Math.min(0.5, plotArmorChance + luck * 0.001);
  firstStrikeChance = Math.min(0.45, firstStrikeChance);
  return { critChance, critMult, dodgeChance, plotArmorChance, firstStrikeChance, firstStrikeBonus };
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

export function findStoryEvent(state: GameState): StoryEventDef | null {
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

export function findPendingEvent(state: GameState): StoryEventDef | null {
  if (state.phase !== 'playing' || state.endingId) return null;

  if (state.randomEventId) {
    const rnd =
      RANDOM_EVENTS.find((e) => e.id === state.randomEventId) ||
      MAIN_STORY.find((e) => e.id === state.randomEventId);
    if (rnd) return rnd;
  }

  return findStoryEvent(state);
}

export type RandomSource = 'click' | 'level' | 'time';

/** 尝试触发随机奇遇（不打断主线剧情） */
export function tryRandomEvent(
  state: GameState,
  source: RandomSource,
  now = Date.now(),
  forceRoll?: number,
): ActionResult {
  if (state.phase !== 'playing' || state.endingId) return { ok: false, state };
  if (state.randomEventId) return { ok: false, state };
  if (findStoryEvent(state)) return { ok: false, state };
  if (now - state.lastRandomAt < RANDOM_COOLDOWN_MS) return { ok: false, state };

  const chance = RANDOM_CHANCE[source];
  const roll = forceRoll != null ? forceRoll : Math.random();
  if (roll > chance) return { ok: false, state };

  // 主线优先：约 35% 权重插入下一章（若境界足够）
  const nextMain = MAIN_STORY.find((e) => e.mainChapter === state.mainChapter);
  if (
    nextMain &&
    state.realmIndex >= nextMain.minRealm &&
    !state.doneEvents.includes(nextMain.id) &&
    Math.random() < 0.35
  ) {
    return {
      ok: true,
      state: {
        ...state,
        randomEventId: nextMain.id,
        lastRandomAt: now,
      },
      message: nextMain.title,
    };
  }

  const pool = RANDOM_EVENTS.filter((e) => {
    if (state.realmIndex < e.minRealm) return false;
    if (e.minStar != null && state.star < e.minStar) return false;
    if (e.requireBranch && e.requireBranch !== state.branchId) return false;
    if (e.requireFaction && e.requireFaction !== state.factionId) return false;
    if (e.requireFlags && !hasFlags(state, e.requireFlags)) return false;
    return true;
  });
  if (!pool.length) return { ok: false, state };

  let total = 0;
  for (const e of pool) total += e.weight || 1;
  let pickRoll = Math.random() * total;
  let picked = pool[0]!;
  for (const e of pool) {
    pickRoll -= e.weight || 1;
    if (pickRoll <= 0) {
      picked = e;
      break;
    }
  }

  return {
    ok: true,
    state: {
      ...state,
      randomEventId: picked.id,
      lastRandomAt: now,
    },
    message: picked.title,
  };
}

function pushChronicle(state: GameState, line: string): GameState {
  return { ...state, chronicle: [...state.chronicle, line].slice(-MAX_CHRONICLE) };
}

/**
 * 三资源容器上限：
 * 基础随境界（突破大涨）与层级；炼体扩体术/灵力；
 * 「洗经伐脉 / 洗髓易筋」等扩容功法按级加上限。
 */
export function resourceCaps(state: GameState): ResourceMap {
  const realm = getRealm(state.realmIndex);
  const starMult = 1 + (state.star - 1) * 0.25;
  const base = realm.starCostBase * 40 * starMult;
  const caps: ResourceMap = {
    lingli: base,
    tishu: base * 0.8,
    jingshen: base * 0.8,
  };
  // 炼体：扩体术容器，顺带拓灵力
  if (state.bodyStage > 0) {
    caps.tishu *= 1 + state.bodyStage * 0.25;
    caps.lingli *= 1 + state.bodyStage * 0.1;
  }
  for (const art of ARTS) {
    if (art.kind !== 'cap') continue;
    const n = state.owned[art.id] ?? 0;
    if (n <= 0 || !artAvailable(state, art)) continue;
    caps[artChannel(art)] += art.power * n;
  }
  return caps;
}

function grantLingqi(state: GameState, amount: number): GameState {
  return grantResource(state, 'lingli', amount);
}

function getResource(state: GameState, key: ResourceKey): number {
  if (key === 'lingli') return state.lingqi;
  if (key === 'tishu') return state.tishu;
  return state.jingshen;
}

function grantResource(state: GameState, key: ResourceKey, amount: number): GameState {
  if (amount === 0) return state;
  if (amount > 0) {
    const caps = resourceCaps(state);
    if (key === 'lingli') {
      const next = Math.min(caps.lingli, state.lingqi + amount);
      return { ...state, lingqi: next, totalLingqi: state.totalLingqi + (next - state.lingqi) };
    }
    if (key === 'tishu') {
      const next = Math.min(caps.tishu, state.tishu + amount);
      return { ...state, tishu: next, totalTishu: state.totalTishu + (next - state.tishu) };
    }
    const next = Math.min(caps.jingshen, state.jingshen + amount);
    return { ...state, jingshen: next, totalJingshen: state.totalJingshen + (next - state.jingshen) };
  }
  if (key === 'lingli') return { ...state, lingqi: Math.max(0, state.lingqi + amount) };
  if (key === 'tishu') return { ...state, tishu: Math.max(0, state.tishu + amount) };
  return { ...state, jingshen: Math.max(0, state.jingshen + amount) };
}

function spendResource(state: GameState, key: ResourceKey, amount: number): GameState | null {
  if (amount <= 0) return state;
  if (getResource(state, key) < amount) return null;
  return grantResource(state, key, -amount);
}

function spendResources(state: GameState, costs: Partial<ResourceMap>): GameState | null {
  let next = state;
  for (const key of RESOURCE_KEYS) {
    const c = costs[key] || 0;
    if (c <= 0) continue;
    const spent = spendResource(next, key, c);
    if (!spent) return null;
    next = spent;
  }
  return next;
}

/** 旧自由点 → 三资源（正数） */
function grantFromFreePoints(state: GameState, points: number): GameState {
  if (points <= 0) return state;
  const amt = points * FREE_POINT_TO_RESOURCE;
  let next = grantResource(state, 'lingli', amt);
  next = grantResource(next, 'tishu', amt);
  next = grantResource(next, 'jingshen', amt);
  return next;
}

/** 由三资源总量衍生六维属性（递减曲线，避免爆炸） */
export function resourceAttrsFromTotals(state: GameState): AttrMap {
  const score = (total: number, scale: number) =>
    Math.floor(Math.log2(1 + Math.max(0, total) / scale) * 3);
  const L = score(state.totalLingqi, 80);
  const T = score(state.totalTishu, 60);
  const J = score(state.totalJingshen, 60);
  return {
    atk: Math.floor(T * 1.0 + L * 0.35),
    def: Math.floor(T * 0.8 + L * 0.25),
    spd: Math.floor(T * 0.4 + J * 0.55),
    spirit: Math.floor(J * 0.75 + L * 0.25),
    bone: Math.floor(T * 1.0 + L * 0.2),
    luck: Math.floor(J * 0.55 + L * 0.4),
  };
}

/** 三资源累计占比（全空时均分） */
export function resourceShares(state: GameState): ResourceMap {
  const L = Math.max(0, state.totalLingqi);
  const T = Math.max(0, state.totalTishu);
  const J = Math.max(0, state.totalJingshen);
  const sum = L + T + J;
  if (sum <= 1e-9) return { lingli: 1 / 3, tishu: 1 / 3, jingshen: 1 / 3 };
  return { lingli: L / sum, tishu: T / sum, jingshen: J / sum };
}

/** 相对均分的超额（0 均分，1 独占） */
function shareExcess(share: number): number {
  return (share - 1 / 3) / (2 / 3);
}

function clampTriad(n: number): number {
  return Math.max(-TRIAD_INTERFERE_CAP, Math.min(TRIAD_INTERFERE_CAP, n));
}

/** 法宝三才调和：阻尼 + 偏置 */
export function treasureTriadSupport(state: GameState): {
  damp: number;
  bias: ResourceMap;
} {
  let damp = 0;
  const bias = zeroResources();
  for (const id of listEquippedIds(state.equipped)) {
    const eff = effectiveTreasureEffects(state, id);
    if (!eff) continue;
    damp += eff.triadDamp;
    for (const key of RESOURCE_KEYS) {
      bias[key] += eff.triadBias[key] || 0;
    }
  }
  return { damp: Math.min(0.85, damp), bias };
}

/**
 * 三才互扰：某途偏高会比例影响另两途产出（封顶 ±15%）
 * 循环：神助灵抑体 · 灵助体抑神 · 体助神抑灵
 * 法宝可 damp 削弱互扰，并以 triadBias 微调
 */
export function calcTriadMods(state: GameState): {
  mods: ResourceMap;
  shares: ResourceMap;
  damp: number;
} {
  const shares = resourceShares(state);
  const eL = shareExcess(shares.lingli);
  const eT = shareExcess(shares.tishu);
  const eJ = shareExcess(shares.jingshen);
  const cap = TRIAD_INTERFERE_CAP;

  // 原始互扰（比例）：高神 → +灵 -体；高灵 → +体 -神；高体 → +神 -灵
  let lingli = eJ * cap - eT * cap;
  let tishu = eL * cap - eJ * cap;
  let jingshen = eT * cap - eL * cap;

  const { damp, bias } = treasureTriadSupport(state);
  const keep = 1 - damp;
  lingli = clampTriad(lingli * keep + bias.lingli);
  tishu = clampTriad(tishu * keep + bias.tishu);
  jingshen = clampTriad(jingshen * keep + bias.jingshen);

  return {
    mods: { lingli, tishu, jingshen },
    shares,
    damp,
  };
}

function grantTreasure(state: GameState, id: string): GameState {
  if (!getTreasure(id)) return state;
  if (state.treasures.includes(id)) return state;
  const t = getTreasure(id)!;
  const treasures = [...state.treasures, id];
  const treasureForge = { ...state.treasureForge };
  if (!treasureForge[id]) treasureForge[id] = { level: 0, refined: false };
  let next = syncEquipCapacity({ ...state, treasures, treasureForge });
  const equipped = {
    combat: [...next.equipped.combat],
    cultivate: [...next.equipped.cultivate],
    assist: [...next.equipped.assist],
  };
  if (!listEquippedIds(equipped).includes(id)) {
    const emptyIdx = equipped[t.slot].findIndex((x) => !x);
    if (emptyIdx >= 0) equipped[t.slot][emptyIdx] = id;
  }
  const tier = TREASURE_TIER_LABELS[t.tier];
  return pushChronicle(
    { ...next, equipped },
    `获得${tier}法宝「${t.name}」〔${EQUIP_SLOT_LABELS[t.slot]}〕【${t.lore}】`,
  );
}

function grantNatural(state: GameState, id: string): GameState {
  const n = getNatural(id);
  if (!n) return state;
  if (state.naturals.includes(id)) {
    // 重复获得：只给灵力，不加被动
    let next = grantLingqi(state, Math.floor(n.lingqiGain * 0.4));
    return pushChronicle(next, `再次寻得「${n.name}」，炼化残力入体。`);
  }
  let next: GameState = {
    ...state,
    naturals: [...state.naturals, id],
    naturalPassive: state.naturalPassive + n.passiveBonus,
  };
  next = grantLingqi(next, n.lingqiGain);
  next = pushChronicle(
    next,
    `获得天才地宝「${n.name}」：灵力 +${Math.floor(n.lingqiGain)}，永久被动 +${n.passiveBonus}/秒【${n.lore}】`,
  );
  if (n.minRealm >= 3 || n.passiveBonus >= 3) {
    next = pushMilestone(
      next,
      {
        id: `nat_${id}`,
        title: `天才地宝·${n.name}`,
        detail: `灵力 +${Math.floor(n.lingqiGain)}，被动 +${n.passiveBonus}/秒（${n.lore}）`,
        kind: 'loot',
      },
    );
  }
  return next;
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
  const resourceAttrs = resourceAttrsFromTotals(state);
  // 产出不用资源衍生属性，避免正反馈爆炸；仅用出身/继承/功法/法宝的骨神运
  const fixedBone =
    state.attrs.bone +
    state.legacyAttrs.bone +
    treasureAttrBonus(state).bone +
    artAttrBonus(state).bone +
    (bodyAttrsBonus(state.bodyStage).bone || 0);
  const fixedSpirit =
    state.attrs.spirit +
    state.legacyAttrs.spirit +
    treasureAttrBonus(state).spirit +
    artAttrBonus(state).spirit;
  const fixedLuck =
    state.attrs.luck +
    state.legacyAttrs.luck +
    treasureAttrBonus(state).luck +
    artAttrBonus(state).luck;
  const boneFactor = 1 + fixedBone * 0.015;
  const spiritFactor = 1 + fixedSpirit * 0.012;
  const luckFactor = 1 + fixedLuck * 0.01;

  const clickBase: ResourceMap = { lingli: 1, tishu: 1, jingshen: 1 };
  const passiveBase: ResourceMap = zeroResources();
  for (const art of ARTS) {
    if (!artAvailable(state, art)) continue;
    const n = state.owned[art.id] ?? 0;
    if (n <= 0) continue;
    const ch = artChannel(art);
    if (art.kind === 'click') clickBase[ch] += art.power * n;
    else if (art.kind === 'passive') passiveBase[ch] += art.power * n;
  }

  const cult = cultivateBonuses(state);
  clickBase.lingli += cult.click;
  passiveBase.lingli += cult.passive + state.naturalPassive;

  const bodyMult = bodyMultipliers(state.bodyStage).tishuMult;
  const alchemyMult = 1 + state.alchemyMastery * 0.01;
  const scale = realmMult * starMult * branchMult * qiyunMult * boneFactor;
  const triad = calcTriadMods(state);
  const triadFactor = (key: ResourceKey) => 1 + triad.mods[key];

  const clickPowers: ResourceMap = {
    lingli: clickBase.lingli * scale * triadFactor('lingli'),
    tishu: clickBase.tishu * scale * bodyMult * triadFactor('tishu'),
    jingshen: clickBase.jingshen * scale * alchemyMult * triadFactor('jingshen'),
  };
  const perSec: ResourceMap = {
    lingli: passiveBase.lingli * scale * spiritFactor * luckFactor * triadFactor('lingli'),
    tishu: passiveBase.tishu * scale * bodyMult * luckFactor * triadFactor('tishu'),
    jingshen:
      passiveBase.jingshen * scale * spiritFactor * alchemyMult * triadFactor('jingshen'),
  };

  const nextStarCost = raiseStarCost(state);
  const breakCost = breakthroughCost(state);
  const playing = state.phase === 'playing' && !state.endingId;
  const canRaiseStar = playing && nextStarCost != null && state.lingqi >= nextStarCost;
  const canBreakthrough = playing && breakCost != null && state.lingqi >= breakCost;

  const peakRealm = getRealm(state.peakRealmIndex);
  const qiyunGain = calcQiyunGain(state);
  const canReincarnate =
    state.phase === 'playing' && (qiyunGain > 0 && state.realmIndex >= 2 || !!state.endingId);

  const stage = state.bodyStage > 0 ? BODY_STAGES[state.bodyStage - 1] : null;

  return {
    clickPowers,
    perSec,
    clickPower: clickPowers.lingli,
    lingqiPerSec: perSec.lingli,
    triadMods: triad.mods,
    resourceShares: triad.shares,
    triadDamp: triad.damp,
    caps: resourceCaps(state),
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
    resourceAttrs,
    treasureAttrs: treasureAttrBonus(state),
    combatPower: calcCombatPower(state, attrs),
    cultivateClickBonus: cult.click,
    cultivatePassiveBonus: cult.passive + state.naturalPassive,
    bodyStageName: stage ? stage.name : '未炼体',
    inheritPreview: {
      attrRate: peakRealm.inheritAttrRate,
      treasureSlots: peakRealm.inheritTreasureSlots,
    },
  };
}

export function tick(state: GameState, now = Date.now()): TickResult {
  if (state.phase !== 'playing') {
    return {
      state: { ...state, lastTickAt: now },
      gained: zeroResources(),
      cappedSeconds: 0,
      offlineSeconds: 0,
    };
  }
  const elapsedRaw = Math.max(0, now - state.lastTickAt);
  const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
  const offlineSeconds = elapsedRaw / 1000;
  const cappedSeconds = elapsed / 1000;
  const { perSec } = derive(state);
  let next = state;
  for (const key of RESOURCE_KEYS) {
    next = grantResource(next, key, perSec[key] * cappedSeconds);
  }
  const gained: ResourceMap = {
    lingli: next.lingqi - state.lingqi,
    tishu: next.tishu - state.tishu,
    jingshen: next.jingshen - state.jingshen,
  };
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

export function clickAbsorb(
  state: GameState,
  channel: ResourceKey = 'lingli',
  now = Date.now(),
): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  if (!RESOURCE_KEYS.includes(channel)) {
    return { ok: false, state, reason: '未知修炼通道' };
  }
  const ticked = tick(state, now).state;
  if (findPendingEvent(ticked)) {
    return { ok: false, state: ticked, reason: '请先完成当前抉择' };
  }
  const { clickPowers } = derive(ticked);
  let next = grantResource(ticked, channel, clickPowers[channel]);
  const rnd = tryRandomEvent(next, 'click', now);
  if (rnd.ok) next = rnd.state;
  return { ok: true, state: next, message: `吐纳·${RESOURCE_LABELS[channel]}` };
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
  const ch = artChannel(def);
  if (cost == null || getResource(ticked, ch) < cost) {
    return { ok: false, state: ticked, reason: `${RESOURCE_LABELS[ch]}不足` };
  }
  const spent = spendResource(ticked, ch, cost);
  if (!spent) return { ok: false, state: ticked, reason: `${RESOURCE_LABELS[ch]}不足` };
  const owned = { ...spent.owned, [artId]: (spent.owned[artId] ?? 0) + 1 };
  return {
    ok: true,
    state: { ...spent, owned },
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
    return { ok: false, state: ticked, reason: '灵力不足' };
  }
  let next = { ...ticked, lingqi: ticked.lingqi - def.cost };
  next = grantTreasure(next, treasureId);
  return { ok: true, state: next, message: `购得「${def.name}」` };
}

export function toggleEquip(state: GameState, treasureId: string, slotIndex?: number): ActionResult {
  const def = getTreasure(treasureId);
  if (!def || !state.treasures.includes(treasureId)) {
    return { ok: false, state, reason: '未持有该法宝' };
  }
  let next = syncEquipCapacity(state);
  const slot = def.slot;
  const equipped = {
    combat: [...next.equipped.combat],
    cultivate: [...next.equipped.cultivate],
    assist: [...next.equipped.assist],
  };
  const arr = equipped[slot];
  const wornAt = arr.findIndex((id) => id === treasureId);
  if (wornAt >= 0) {
    arr[wornAt] = null;
    return {
      ok: true,
      state: { ...next, equipped },
      message: `已卸下〔${slotLabel(slot)}〕`,
    };
  }
  let target =
    typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < arr.length
      ? slotIndex
      : arr.findIndex((x) => !x);
  if (target < 0) {
    // 满了则替换第 0 格
    target = 0;
  }
  arr[target] = treasureId;
  return {
    ok: true,
    state: { ...next, equipped },
    message: `已装备至〔${slotLabel(slot)}〕槽${target + 1}`,
  };
}

/** 体术炼器：强化正面效果 */
export function temperTreasure(state: GameState, treasureId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const def = getTreasure(treasureId);
  if (!def || !state.treasures.includes(treasureId)) {
    return { ok: false, state, reason: '未持有该法宝' };
  }
  const ticked = tick(state, now).state;
  const forge = getTreasureForge(ticked, treasureId);
  if (forge.level >= def.maxTemper) {
    return { ok: false, state: ticked, reason: '已达炼器上限' };
  }
  const cost = temperCost(def, forge.level);
  if (ticked.tishu < cost) {
    return { ok: false, state: ticked, reason: '体术不足' };
  }
  const treasureForge = {
    ...ticked.treasureForge,
    [treasureId]: { ...forge, level: forge.level + 1 },
  };
  let next: GameState = {
    ...ticked,
    tishu: ticked.tishu - cost,
    treasureForge,
  };
  next = pushChronicle(
    next,
    `炼器「${def.name}」至 +${forge.level + 1}，耗体术 ${cost}。正面效果增强。`,
  );
  return { ok: true, state: next, message: `炼器成功 +${forge.level + 1}` };
}

/** 洗练：耗体术清除负面（仙品无需） */
export function refineTreasure(state: GameState, treasureId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const def = getTreasure(treasureId);
  if (!def || !state.treasures.includes(treasureId)) {
    return { ok: false, state, reason: '未持有该法宝' };
  }
  if (def.tier === 'immortal' || !def.cons) {
    return { ok: false, state, reason: '仙品/无负面，无需洗练' };
  }
  const ticked = tick(state, now).state;
  const forge = getTreasureForge(ticked, treasureId);
  if (forge.refined) {
    return { ok: false, state: ticked, reason: '已洗练过' };
  }
  const cost = def.refineCost;
  if (cost <= 0) return { ok: false, state: ticked, reason: '无法洗练' };
  if (ticked.tishu < cost) {
    return { ok: false, state: ticked, reason: '体术不足' };
  }
  const treasureForge = {
    ...ticked.treasureForge,
    [treasureId]: { ...forge, refined: true },
  };
  let next: GameState = {
    ...ticked,
    tishu: ticked.tishu - cost,
    treasureForge,
  };
  next = pushChronicle(next, `洗练「${def.name}」，耗体术 ${cost}，负面尽去。`);
  return { ok: true, state: next, message: `洗练成功` };
}

/** 售卖未装备法宝，换灵力 */
export function sellTreasure(state: GameState, treasureId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const def = getTreasure(treasureId);
  if (!def || !state.treasures.includes(treasureId)) {
    return { ok: false, state, reason: '未持有该法宝' };
  }
  const ticked = tick(state, now).state;
  if (listEquippedIds(ticked.equipped).includes(treasureId)) {
    return { ok: false, state: ticked, reason: '请先卸下再出售' };
  }
  const gain = sellValue(ticked, treasureId);
  const treasures = ticked.treasures.filter((id) => id !== treasureId);
  const treasureForge = { ...ticked.treasureForge };
  delete treasureForge[treasureId];
  let next: GameState = {
    ...ticked,
    treasures,
    treasureForge,
  };
  next = grantLingqi(next, gain);
  const got = Math.floor(next.lingqi - ticked.lingqi);
  next = pushChronicle(next, `售出「${def.name}」，得灵力 ${got}。`);
  return { ok: true, state: next, message: `售出得灵力 ${formatNumber(got)}` };
}

function slotLabel(slot: EquipSlot): string {
  return EQUIP_SLOT_LABELS[slot];
}

export function allocatePoint(_state: GameState, _key: AttrKey): ActionResult {
  return {
    ok: false,
    state: _state,
    reason: '属性由灵力/体术/精神力自动获得，无需手动分配',
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
  if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: '灵力不足' };
  const nextStar = ticked.star + 1;
  let next = updatePeak({
    ...ticked,
    lingqi: ticked.lingqi - cost,
    star: nextStar,
  });
  // 每升 3 层赠三资源
  if (nextStar % 3 === 0) {
    next = grantFromFreePoints(next, 1);
  }
  next = pushChronicle(next, `${getRealm(next.realmIndex).name}${nextStar}层。`);
  const rnd = tryRandomEvent(next, 'level', now);
  if (rnd.ok) next = rnd.state;
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
  if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: '灵力不足' };

  const nextIndex = ticked.realmIndex + 1;
  const nextRealm = getRealm(nextIndex);
  let next: GameState = updatePeak({
    ...ticked,
    lingqi: ticked.lingqi - cost,
    realmIndex: nextIndex,
    star: 1,
  });
  next = grantFromFreePoints(next, 2);
  next = syncEquipCapacity(next);
  next = pushChronicle(next, `破境成功：${nextRealm.name}。${nextRealm.blurb}`);
  if (nextIndex === 1 || nextIndex === 3 || nextIndex === 6 || nextIndex >= 8) {
    next = pushMilestone(
      next,
      {
        id: `break_${nextRealm.id}`,
        title: `破境·${nextRealm.name}`,
        detail: nextRealm.blurb,
        kind: 'other',
      },
      now,
    );
  }

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
      next = pushMilestone(
        next,
        {
          id: `ending_${ending.id}`,
          title: `结局·${ending.name}`,
          detail: ending.title,
          kind: 'destiny',
        },
        now,
      );
    }
  } else {
    const rnd = tryRandomEvent(next, 'level', now);
    if (rnd.ok) next = rnd.state;
  }

  return { ok: true, state: next, message: `破境至「${nextRealm.name}」` };
}

export function startCombat(state: GameState, enemyId: string, now = Date.now()): CombatResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const enemy = getEnemy(enemyId);
  if (!enemy) return { ok: false, state, reason: '未知对手' };
  const ticked = syncEquipCapacity(tick(state, now).state);
  const basePower = calcCombatPower(ticked);
  const ePower = enemyPower(enemy.attrs, ticked.realmIndex);
  const luck = totalAttrs(ticked).luck;
  const edges = gatherCombatEdges(ticked);
  const edgeEvents: string[] = [];

  let pPower = basePower;
  if (Math.random() < edges.firstStrikeChance) {
    pPower *= 1 + edges.firstStrikeBonus;
    edgeEvents.push(`先手·战力×${(1 + edges.firstStrikeBonus).toFixed(2)}`);
  }
  if (Math.random() < edges.critChance) {
    pPower *= edges.critMult;
    edgeEvents.push(`暴击·战力×${edges.critMult.toFixed(2)}`);
  }

  const makeRoll = () => 0.85 + Math.random() * 0.3 + Math.min(0.15, luck * 0.005);
  let roll = makeRoll();
  let won = pPower * roll >= ePower;
  if (!won && Math.random() < edges.dodgeChance) {
    roll = makeRoll();
    won = pPower * roll >= ePower;
    edgeEvents.push(won ? '闪避得手·再战取胜' : '闪避失手·仍败');
  }

  if (won) {
    let next = grantLingqi(ticked, enemy.rewardLingqi);
    next = {
      ...next,
      combatWins: next.combatWins + 1,
    };
    if (enemy.rewardPoints) next = grantFromFreePoints(next, enemy.rewardPoints);
    // 战利品也含体术/精神力残劲
    next = grantResource(next, 'tishu', Math.floor(enemy.rewardLingqi * 0.15));
    next = grantResource(next, 'jingshen', Math.floor(enemy.rewardLingqi * 0.12));
    const lootBits: string[] = [];
    if (enemy.dropTreasureId && Math.random() < (enemy.dropChance || 0)) {
      next = grantTreasure(next, enemy.dropTreasureId);
      lootBits.push(getTreasure(enemy.dropTreasureId)?.name || enemy.dropTreasureId);
    }
    // 额外随机法宝
    if (Math.random() < 0.22) {
      const pool = TREASURES.filter(
        (t) => t.minRealm <= next.realmIndex && !next.treasures.includes(t.id),
      );
      if (pool.length) {
        const pick = pool[Math.floor(Math.random() * pool.length)]!;
        next = grantTreasure(next, pick.id);
        lootBits.push(pick.name);
      }
    }
    // 天才地宝
    if (Math.random() < 0.28) {
      const pool = NATURALS.filter((n) => n.minRealm <= next.realmIndex);
      if (pool.length) {
        let total = 0;
        for (const n of pool) total += n.weight || 1;
        let r = Math.random() * total;
        let pick = pool[0]!;
        for (const n of pool) {
          r -= n.weight || 1;
          if (r <= 0) {
            pick = n;
            break;
          }
        }
        next = grantNatural(next, pick.id);
        lootBits.push(pick.name);
      }
    }
    // 药材掉落
    if (Math.random() < 0.35) {
      const pool = HERBS.filter((h) => h.minRealm <= next.realmIndex);
      if (pool.length) {
        const pick = pool[Math.floor(Math.random() * pool.length)]!;
        const herbs = { ...next.herbs, [pick.id]: (next.herbs[pick.id] || 0) + 1 };
        next = { ...next, herbs };
        lootBits.push(pick.name);
      }
    }
    const loot = lootBits.length ? lootBits.join('、') : undefined;
    const edgeTxt = edgeEvents.length ? ` · ${edgeEvents.join('、')}` : '';
    next = pushChronicle(
      next,
      `对战胜利：击败「${enemy.name}」（${Math.floor(pPower)} vs ${Math.floor(ePower)}）${edgeTxt}${loot ? ' · 缴获 ' + loot : ''}【${enemy.lore}】`,
    );
    return {
      ok: true,
      state: next,
      won: true,
      playerPower: pPower,
      enemyPower: ePower,
      message: `战胜 ${enemy.name}`,
      loot,
      edgeEvents,
    };
  }

  // 战败：低概率身死，否则可能掉段，否则轻伤
  let next: GameState = {
    ...ticked,
    combatLosses: ticked.combatLosses + 1,
  };
  const pressure = Math.min(0.12, 0.04 + Math.max(0, ePower - pPower) / Math.max(ePower, 1) * 0.1);
  const deathRoll = Math.random();
  if (deathRoll < pressure) {
    if (Math.random() < edges.plotArmorChance) {
      edgeEvents.push('剧情护甲·免死');
      next = grantLingqi(next, -Math.floor(enemy.rewardLingqi * 0.12));
      next = pushChronicle(
        next,
        `对战失败：险死还生（${edgeEvents.join('、')}），轻伤逃回（${Math.floor(pPower)} vs ${Math.floor(ePower)}）`,
      );
      return {
        ok: true,
        state: next,
        won: false,
        playerPower: pPower,
        enemyPower: ePower,
        message: `败于 ${enemy.name}，护甲保命`,
        defeatOutcome: 'bruise',
        edgeEvents,
      };
    }
    const dead = die(next, `败于「${enemy.name}」，伤重不治`, now);
    return {
      ok: true,
      state: dead.state,
      won: false,
      playerPower: pPower,
      enemyPower: ePower,
      message: dead.message,
      defeatOutcome: 'death',
      edgeEvents,
    };
  }

  if (Math.random() < 0.38) {
    next = demoteRank(next);
    next = grantLingqi(next, -Math.floor(enemy.rewardLingqi * 0.15));
    const edgeTxt = edgeEvents.length ? ` · ${edgeEvents.join('、')}` : '';
    next = pushChronicle(
      next,
      `对战失败：不敌「${enemy.name}」，境界受挫（现 ${getRealm(next.realmIndex).name}${next.star}层）${edgeTxt}`,
    );
    return {
      ok: true,
      state: next,
      won: false,
      playerPower: pPower,
      enemyPower: ePower,
      message: `败于 ${enemy.name}，掉段`,
      defeatOutcome: 'demote',
      edgeEvents,
    };
  }

  next = grantLingqi(next, -Math.floor(enemy.rewardLingqi * 0.08));
  const edgeTxt = edgeEvents.length ? ` · ${edgeEvents.join('、')}` : '';
  next = pushChronicle(
    next,
    `对战失败：不敌「${enemy.name}」，轻伤逃回（${Math.floor(pPower)} vs ${Math.floor(ePower)}）${edgeTxt}`,
  );
  return {
    ok: true,
    state: next,
    won: false,
    playerPower: pPower,
    enemyPower: ePower,
    message: `败于 ${enemy.name}`,
    defeatOutcome: 'bruise',
    edgeEvents,
  };
}

/** 掉段：优先降层，一层时掉境回九层 */
function demoteRank(state: GameState): GameState {
  if (state.star > 1) {
    return { ...state, star: state.star - 1 };
  }
  if (state.realmIndex > 0) {
    return { ...state, realmIndex: state.realmIndex - 1, star: MAX_STAR };
  }
  return state;
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
  next = pushMilestone(
    next,
    {
      id: `death_${now}`,
      title: '身死道消',
      detail: reason,
      kind: 'combat',
    },
    now,
  );
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
  const equipped = emptyEquipped(0);
  for (const id of bring) {
    const t = getTreasure(id);
    if (!t) continue;
    const emptyIdx = equipped[t.slot].findIndex((x) => !x);
    if (emptyIdx >= 0) equipped[t.slot][emptyIdx] = id;
  }

  const lifeNo = state.deathReason ? state.reincarnations + 1 : Math.max(1, state.reincarnations);
  // 开局三资源皆空，需吐纳/锤炼/凝神点击获取；出身自由点只作叙事，不再赠资源
  const next: GameState = {
    lingqi: 0,
    totalLingqi: 0,
    tishu: 0,
    totalTishu: 0,
    jingshen: 0,
    totalJingshen: 0,
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
      '三才皆空：点击「灵 / 体 / 神」吐纳获取。偏科会比例牵制另两途（最多 ±15%），法宝可调和。',
    ],
    birthId,
    attrs,
    freePoints: 0,
    treasures: [...bring],
    treasureForge: Object.fromEntries(bring.map((id) => [id, { level: 0, refined: false }])),
    equipped,
    vault,
    naturals: [],
    naturalPassive: 0,
    mainChapter: 1,
    milestones: [],
    legacyAttrs,
    peakRealmIndex: 0,
    phase: 'playing',
    deathReason: null,
    combatWins: 0,
    combatLosses: 0,
    randomEventId: null,
    lastRandomAt: 0,
    alchemyMastery: 0,
    herbs: emptyHerbs(),
    pills: emptyPills(),
    bodyStage: 0,
    bodyProgress: 0,
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
    doneEvents: pending.repeatable
      ? ticked.doneEvents
      : [...ticked.doneEvents, eventId],
    randomEventId: null,
  };

  if (pending.mainChapter && pending.mainChapter === ticked.mainChapter) {
    next = { ...next, mainChapter: ticked.mainChapter + 1 };
  }

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
  if (option.tishuDelta) next = grantResource(next, 'tishu', option.tishuDelta);
  if (option.jingshenDelta) next = grantResource(next, 'jingshen', option.jingshenDelta);
  if (option.qiyunDelta) {
    next = { ...next, qiyun: Math.max(0, next.qiyun + option.qiyunDelta) };
  }
  if (option.freePointsDelta && option.freePointsDelta > 0) {
    next = grantFromFreePoints(next, option.freePointsDelta);
  }
  if (option.attrsDelta) {
    next = { ...next, attrs: addAttrs(next.attrs, option.attrsDelta) };
  }
  if (option.grantTreasureId) {
    next = grantTreasure(next, option.grantTreasureId);
  }
  if (option.grantNaturalId) {
    next = grantNatural(next, option.grantNaturalId);
  }
  if (option.grantHerbId && getHerb(option.grantHerbId)) {
    const count = Math.max(1, option.grantHerbCount || 1);
    const herbs = {
      ...next.herbs,
      [option.grantHerbId]: (next.herbs[option.grantHerbId] || 0) + count,
    };
    next = { ...next, herbs };
  }

  next = pushChronicle(
    next,
    `【${pending.title}】你选择了「${option.label}」。${option.blurb}${pending.lore ? `（${pending.lore}）` : ''}`,
  );

  // 重要事件：主线、道途/阵营/气运抉择、非重复剧情
  if (pending.mainChapter) {
    next = pushMilestone(
      next,
      {
        id: `main_${pending.mainChapter}`,
        title: pending.title.replace(/^【主线】/, ''),
        detail: `选择「${option.label}」。${option.blurb}`,
        kind: 'main',
      },
      now,
    );
  } else if (option.set?.branchId || option.set?.factionId || option.set?.destinyId) {
    next = pushMilestone(
      next,
      {
        id: `path_${eventId}_${optionId}`,
        title: pending.title,
        detail: `选择「${option.label}」。${option.blurb}`,
        kind: option.set?.destinyId ? 'destiny' : 'branch',
      },
      now,
    );
  } else if (!pending.repeatable && !RANDOM_EVENTS.some((e) => e.id === eventId)) {
    next = pushMilestone(
      next,
      {
        id: `story_${eventId}`,
        title: pending.title,
        detail: `选择「${option.label}」。${option.blurb}`,
        kind: 'other',
      },
      now,
    );
  }

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
    next = pushMilestone(
      next,
      {
        id: `ending_${ending.id}`,
        title: `结局·${ending.name}`,
        detail: ending.title,
        kind: 'destiny',
      },
      now,
    );
  }

  return { ok: true, state: next, message: option.label };
}

export function buyHerb(state: GameState, herbId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const def = getHerb(herbId);
  if (!def || def.cost <= 0) return { ok: false, state, reason: '无法购买该药材' };
  const ticked = tick(state, now).state;
  if (ticked.realmIndex < def.minRealm) {
    return { ok: false, state: ticked, reason: '境界不足' };
  }
  if (ticked.lingqi < def.cost) return { ok: false, state: ticked, reason: '灵力不足' };
  const herbs = { ...ticked.herbs, [herbId]: (ticked.herbs[herbId] || 0) + 1 };
  return {
    ok: true,
    state: { ...ticked, lingqi: ticked.lingqi - def.cost, herbs },
    message: `购得药材「${def.name}」`,
  };
}

export function craftPill(state: GameState, recipeId: string, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  const recipe = getPillRecipe(recipeId);
  if (!recipe) return { ok: false, state, reason: '未知丹方' };
  const ticked = tick(state, now).state;
  if (ticked.realmIndex < recipe.minRealm) {
    return { ok: false, state: ticked, reason: '境界不足，火候不够' };
  }
  for (const [hid, need] of Object.entries(recipe.herbs)) {
    if ((ticked.herbs[hid] || 0) < need) {
      return { ok: false, state: ticked, reason: `药材不足：${getHerb(hid)?.name || hid}` };
    }
  }
  const spent = spendResources(ticked, recipe.costs);
  if (!spent) return { ok: false, state: ticked, reason: '修炼资源不足' };

  const herbs = { ...spent.herbs };
  for (const [hid, need] of Object.entries(recipe.herbs)) {
    herbs[hid] = Math.max(0, (herbs[hid] || 0) - need);
  }
  let next: GameState = {
    ...spent,
    herbs,
    alchemyMastery: spent.alchemyMastery + (recipe.effect.mastery || 0),
  };
  if (recipe.effect.resources) {
    for (const key of RESOURCE_KEYS) {
      const amt = recipe.effect.resources[key] || 0;
      if (amt) next = grantResource(next, key, amt);
    }
  }
  if (recipe.effect.attrs) {
    next = { ...next, attrs: addAttrs(next.attrs, recipe.effect.attrs) };
  }
  if (recipe.effect.bodyProgress) {
    next = { ...next, bodyProgress: next.bodyProgress + recipe.effect.bodyProgress };
  }
  // 丹成即食
  const pills = { ...next.pills, [recipeId]: (next.pills[recipeId] || 0) + 1 };
  next = { ...next, pills };
  next = pushChronicle(next, `炼成「${recipe.name}」并服下。丹道精通 ${next.alchemyMastery}。`);
  return { ok: true, state: next, message: `炼成「${recipe.name}」` };
}

export function temperBody(state: GameState, now = Date.now()): ActionResult {
  const blocked = ensurePlaying(state);
  if (blocked) return blocked;
  if (state.bodyStage >= BODY_STAGES.length) {
    return { ok: false, state, reason: '肉身已至圣体雏形' };
  }
  const stage = getBodyStage(state.bodyStage);
  if (!stage) return { ok: false, state, reason: '炼体数据缺失' };
  const ticked = tick(state, now).state;
  if (ticked.realmIndex < stage.minRealm) {
    return { ok: false, state: ticked, reason: `需达境界方可锤炼「${stage.name}」` };
  }
  const spent = spendResources(ticked, stage.temperCost);
  if (!spent) return { ok: false, state: ticked, reason: '体术或灵力不足' };

  let progress = spent.bodyProgress + stage.temperGain;
  let bodyStage = spent.bodyStage;
  let msg = `锤炼「${stage.name}」+${stage.temperGain}`;
  let next: GameState = { ...spent, bodyProgress: progress };

  if (progress >= stage.progressNeed) {
    bodyStage += 1;
    progress = 0;
    next = {
      ...next,
      bodyStage,
      bodyProgress: 0,
    };
    next = pushChronicle(
      next,
      `炼体突破：踏入「${stage.name}」。${stage.blurb}`,
    );
    next = pushMilestone(
      next,
      {
        id: `body_${stage.id}`,
        title: `炼体·${stage.name}`,
        detail: stage.blurb,
        kind: 'other',
      },
      now,
    );
    msg = `突破至「${stage.name}」`;
  } else {
    next = pushChronicle(
      next,
      `炼体锤炼：${stage.name} ${Math.floor(progress)}/${stage.progressNeed}`,
    );
  }
  return { ok: true, state: next, message: msg };
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
    maxEquip: MAX_EQUIP_PER_SLOT,
    equipSlots: EQUIP_SLOTS,
    slotCapacityHint: {
      combat: '境0/3/7 解锁 1/2/3 格',
      cultivate: '境0/2/6 解锁 1/2/3 格',
      assist: '境0/4/8 解锁 1/2/3 格',
    },
    naturals: NATURALS.map((n) => ({ id: n.id, name: n.name, minRealm: n.minRealm })),
    mainStory: MAIN_STORY.map((e) => ({ id: e.id, title: e.title, chapter: e.mainChapter })),
    attrKeys: ATTR_KEYS,
    resourceKeys: RESOURCE_KEYS,
    resourceLabels: RESOURCE_LABELS,
    herbs: HERBS.map((h) => ({ id: h.id, name: h.name, cost: h.cost, minRealm: h.minRealm })),
    pills: PILL_RECIPES.map((p) => ({ id: p.id, name: p.name, minRealm: p.minRealm })),
    bodyStages: BODY_STAGES.map((b, i) => ({ index: i, id: b.id, name: b.name })),
  };
}

export {
  BIRTHS,
  TREASURES,
  ENEMIES,
  ATTR_KEYS,
  NATURALS,
  MAIN_STORY,
  EQUIP_SLOTS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  HERBS,
  PILL_RECIPES,
  BODY_STAGES,
  artChannel,
  listEquippedIds,
  slotCapacity,
};
