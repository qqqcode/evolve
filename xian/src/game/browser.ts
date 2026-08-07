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
  HERBS,
  MAIN_STORY,
  MAX_EQUIP_PER_SLOT,
  MAX_OFFLINE_MS,
  MAX_STAR,
  NATURALS,
  PILL_RECIPES,
  QIYUN_BONUS_PER,
  RANDOM_EVENTS,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
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
  listCombatEnemies,
  loadState,
  matchEnding,
  raiseStar,
  raiseStarCost,
  resolveEvent,
  resourceAttrsFromTotals,
  resourceCaps,
  startCombat,
  syncEquipCapacity,
  temperBody,
  temperCost,
  temperTreasure,
  refineTreasure,
  sellTreasure,
  sellValue,
  getTreasureForge,
  describeTreasureBonus,
  effectiveTreasureEffects,
  tick,
  toggleEquip,
  totalAttrs,
  tryRandomEvent,
  enemyPower,
} from './engine';
import type { GameState } from './types';
import {
  ATTR_KEYS,
  ATTR_LABELS,
  EQUIP_SLOTS,
  EQUIP_SLOT_LABELS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  TREASURE_TIER_LABELS,
} from './types';

const LEGACY_SAVE_KEYS = [
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
  buyArt,
  buyHerb,
  buyTreasure,
  calcCombatPower,
  calcQiyunGain,
  calcTriadMods,
  chooseBirth,
  clickAbsorb,
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
  matchEnding,
  raiseStar,
  raiseStarCost,
  refineTreasure,
  resolveEvent,
  resourceAttrsFromTotals,
  resourceCaps,
  saveToStorage,
  clearStorage,
  sellTreasure,
  sellValue,
  startCombat,
  syncEquipCapacity,
  temperBody,
  temperCost,
  temperTreasure,
  tick,
  toggleEquip,
  totalAttrs,
  tryRandomEvent,
  enemyPower,
};

declare global {
  interface Window {
    Xian: typeof Xian;
  }
}

(window as Window & { Xian: typeof Xian }).Xian = Xian;
