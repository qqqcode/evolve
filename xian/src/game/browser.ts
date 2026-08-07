/**
 * 浏览器入口：由 esbuild 打包为 public/engine.js
 */
import {
  ARTS,
  BIRTHS,
  BRANCH_LABELS,
  ENDINGS,
  ENEMIES,
  MAX_EQUIP,
  MAX_OFFLINE_MS,
  MAX_STAR,
  QIYUN_BONUS_PER,
  RANDOM_EVENTS,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
  getEnding,
  getEnemy,
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
import { ATTR_KEYS, ATTR_LABELS } from './types';

function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // 清理旧档键
    localStorage.removeItem('xian-save-v1');
  } catch {
    /* ignore */
  }
}

function loadFromStorage(now = Date.now()): GameState {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('xian-save-v2') ||
      localStorage.getItem('xian-save-v1');
    if (!raw) return createNewState(now);
    return loadState(JSON.parse(raw), now);
  } catch {
    return createNewState(now);
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('xian-save-v2');
    localStorage.removeItem('xian-save-v1');
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
  MAX_EQUIP,
  MAX_OFFLINE_MS,
  MAX_STAR,
  QIYUN_BONUS_PER,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  TREASURES,
  RANDOM_EVENTS,
  getEnding,
  getEnemy,
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
