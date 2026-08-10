/**
 * 浏览器入口：由 esbuild 打包为 public/engine.js
 */
import {
  ARTS,
  BIRTHS,
  BODY_STAGES,
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  FORGE_REALMS,
  HERBS,
  MAIN_STORY,
  MAX_EQUIP_PER_SLOT,
  MAX_OFFLINE_MS,
  MAX_STAR,
  MAX_TEMPER_LEVEL,
  NATURALS,
  PILL_RECIPES,
  QIYUN_BONUS_PER,
  RANDOM_EVENTS,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
  TIER_RANK,
  artChannel,
  breakthroughPillNeed,
  getEnding,
  getEnemy,
  getHerb,
  getNatural,
  getPillRecipe,
  getRealm,
  getTreasure,
  isBattlePill,
  listEquippedIds,
  PILL_KIND_LABELS,
  raiseStarPillNeed,
  sellHerbValue,
  sellPillValue,
  slotCapacity,
} from './data';
import {
  allocatePoint,
  artAvailable,
  artCost,
  beginReincarnation,
  breakthrough,
  breakthroughCost,
  buyArt,
  buyHerb,
  buyPill,
  buyTreasure,
  calcCombatPower,
  calcQiyunGain,
  calcTriadMods,
  chooseBirth,
  clickAbsorb,
  craftPill,
  createNewState,
  derive,
  die,
  findPendingEvent,
  formatNumber,
  gatherCombatEdges,
  getMeta,
  buildCombatEncounter,
  combatBaselineReward,
  combatRewardMultiplier,
  listCombatEnemies,
  loadState,
  makeCombatEncounterId,
  matchEnding,
  parseCombatEncounterId,
  raiseStar,
  raiseStarCost,
  resolveCombatEncounter,
  resolveEvent,
  resourceAttrsFromTotals,
  resourceCaps,
  sellHerb,
  sellPill,
  startCombat,
  syncEquipCapacity,
  temperBody,
  temperCost,
  temperTreasure,
  promoteTreasure,
  refineTreasure,
  sellTreasure,
  sellValue,
  getTreasureForge,
  treasureEffectiveTier,
  currentForgeRealm,
  currentForgeRealmIndex,
  describeTreasureBonus,
  effectiveTreasureEffects,
  tick,
  toggleEquip,
  totalAttrs,
  tryRandomEvent,
  enemyPower,
  usePill,
} from './engine';
import type { GameState } from './types';
import {
  ATTR_KEYS,
  ATTR_LABELS,
  COMBAT_DIFFICULTY_LABELS,
  EQUIP_SLOTS,
  EQUIP_SLOT_LABELS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  TREASURE_TIER_LABELS,
} from './types';

const LEGACY_SAVE_KEYS = [
  'xian-save-v11',
  'xian-save-v10',
  'xian-save-v9',
  'xian-save-v8',
  'xian-save-v7',
  'xian-save-v6',
  'xian-save-v5',
  'xian-save-v4',
  'xian-save-v3',
  'xian-save-v2',
  'xian-save-v1',
] as const;

function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function loadFromStorage(now = Date.now()): GameState {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_SAVE_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return createNewState(now);
    return loadState(JSON.parse(raw), now);
  } catch {
    return createNewState(now);
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const Xian = {
  ARTS,
  ATTR_KEYS,
  ATTR_LABELS,
  BIRTHS,
  BODY_STAGES,
  COMBAT_DIFFICULTY_LABELS,
  FORGE_REALMS,
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  EQUIP_SLOTS,
  EQUIP_SLOT_LABELS,
  HERBS,
  MAIN_STORY,
  MAX_EQUIP_PER_SLOT,
  MAX_OFFLINE_MS,
  MAX_STAR,
  MAX_TEMPER_LEVEL,
  NATURALS,
  PILL_RECIPES,
  QIYUN_BONUS_PER,
  REALMS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
  TREASURE_TIER_LABELS,
  TIER_RANK,
  RANDOM_EVENTS,
  artChannel,
  getEnding,
  getEnemy,
  getHerb,
  getNatural,
  getPillRecipe,
  getRealm,
  getTreasure,
  listEquippedIds,
  slotCapacity,
  allocatePoint,
  artAvailable,
  artCost,
  beginReincarnation,
  breakthrough,
  breakthroughCost,
  breakthroughPillNeed,
  buyArt,
  buyHerb,
  buyPill,
  buyTreasure,
  isBattlePill,
  PILL_KIND_LABELS,
  raiseStarPillNeed,
  buildCombatEncounter,
  calcCombatPower,
  calcQiyunGain,
  calcTriadMods,
  chooseBirth,
  clickAbsorb,
  combatBaselineReward,
  combatRewardMultiplier,
  craftPill,
  createNewState,
  derive,
  describeTreasureBonus,
  die,
  effectiveTreasureEffects,
  findPendingEvent,
  formatNumber,
  gatherCombatEdges,
  getMeta,
  getTreasureForge,
  listCombatEnemies,
  loadState,
  loadFromStorage,
  makeCombatEncounterId,
  matchEnding,
  parseCombatEncounterId,
  raiseStar,
  raiseStarCost,
  refineTreasure,
  resolveCombatEncounter,
  resolveEvent,
  resourceAttrsFromTotals,
  resourceCaps,
  saveToStorage,
  clearStorage,
  sellHerb,
  sellHerbValue,
  sellPill,
  sellPillValue,
  sellTreasure,
  sellValue,
  startCombat,
  syncEquipCapacity,
  temperBody,
  temperCost,
  temperTreasure,
  promoteTreasure,
  tick,
  toggleEquip,
  totalAttrs,
  tryRandomEvent,
  enemyPower,
  treasureEffectiveTier,
  currentForgeRealm,
  currentForgeRealmIndex,
  usePill,
};

declare global {
  interface Window {
    Xian: typeof Xian;
  }
}

(window as Window & { Xian: typeof Xian }).Xian = Xian;
