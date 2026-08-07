/**
 * 浏览器入口：由 esbuild 打包为 public/engine.js
 */
import {
  ARTS,
  BIRTHS,
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  MAIN_STORY,
  MAX_EQUIP,
  MAX_OFFLINE_MS,
  MAX_STAR,
  NATURALS,
  QIYUN_BONUS_PER,
  RANDOM_EVENTS,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
  getEnding,
  getEnemy,
  getNatural,
  getRealm,
  getTreasure,
} from './data';
import {
  allocatePoint,
  artAvailable,
  artCost,
  beginReincarnation,
  breakthrough,
  breakthroughCost,
  buyArt,
  buyTreasure,
  calcCombatPower,
  calcQiyunGain,
  chooseBirth,
  clickAbsorb,
  createNewState,
  derive,
  die,
  findPendingEvent,
  formatNumber,
  getMeta,
  listCombatEnemies,
  loadState,
  matchEnding,
  raiseStar,
  raiseStarCost,
  resolveEvent,
  startCombat,
  tick,
  toggleEquip,
  totalAttrs,
  tryRandomEvent,
} from './engine';
import type { GameState } from './types';
import { ATTR_KEYS, ATTR_LABELS, EQUIP_SLOTS, EQUIP_SLOT_LABELS } from './types';

const LEGACY_SAVE_KEYS = ['xian-save-v4', 'xian-save-v3', 'xian-save-v2', 'xian-save-v1'] as const;

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
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  EQUIP_SLOTS,
  EQUIP_SLOT_LABELS,
  MAIN_STORY,
  MAX_EQUIP,
  MAX_OFFLINE_MS,
  MAX_STAR,
  NATURALS,
  QIYUN_BONUS_PER,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
  RANDOM_EVENTS,
  getEnding,
  getEnemy,
  getNatural,
  getRealm,
  getTreasure,
  allocatePoint,
  artAvailable,
  artCost,
  beginReincarnation,
  breakthrough,
  breakthroughCost,
  buyArt,
  buyTreasure,
  calcCombatPower,
  calcQiyunGain,
  chooseBirth,
  clickAbsorb,
  createNewState,
  derive,
  die,
  findPendingEvent,
  formatNumber,
  getMeta,
  listCombatEnemies,
  loadState,
  loadFromStorage,
  matchEnding,
  raiseStar,
  raiseStarCost,
  resolveEvent,
  saveToStorage,
  clearStorage,
  startCombat,
  tick,
  toggleEquip,
  totalAttrs,
  tryRandomEvent,
};

declare global {
  interface Window {
    Xian: typeof Xian;
  }
}

(window as Window & { Xian: typeof Xian }).Xian = Xian;
