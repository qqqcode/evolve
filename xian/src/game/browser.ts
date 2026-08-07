/**
 * 浏览器入口：由 esbuild 打包为 public/engine.js
 */
import {
  ARTS,
  BRANCH_LABELS,
  ENDINGS,
  MAX_OFFLINE_MS,
  MAX_STAR,
  QIYUN_BONUS_PER,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  getEnding,
  getRealm,
} from './data';
import {
  artAvailable,
  artCost,
  breakthrough,
  breakthroughCost,
  buyArt,
  calcQiyunGain,
  clickAbsorb,
  createNewState,
  derive,
  findPendingEvent,
  formatNumber,
  getMeta,
  loadState,
  matchEnding,
  raiseStar,
  raiseStarCost,
  reincarnate,
  resolveEvent,
  tick,
} from './engine';
import type { GameState } from './types';

function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function loadFromStorage(now = Date.now()): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createNewState(now);
    return loadState(JSON.parse(raw), now);
  } catch {
    return createNewState(now);
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const Xian = {
  ARTS,
  BRANCH_LABELS,
  ENDINGS,
  MAX_OFFLINE_MS,
  MAX_STAR,
  QIYUN_BONUS_PER,
  REALMS,
  SAVE_VERSION,
  STORAGE_KEY,
  STORY_EVENTS,
  getEnding,
  getRealm,
  artAvailable,
  artCost,
  breakthrough,
  breakthroughCost,
  buyArt,
  calcQiyunGain,
  clickAbsorb,
  createNewState,
  derive,
  findPendingEvent,
  formatNumber,
  getMeta,
  loadState,
  loadFromStorage,
  matchEnding,
  raiseStar,
  raiseStarCost,
  reincarnate,
  resolveEvent,
  saveToStorage,
  clearStorage,
  tick,
};

declare global {
  interface Window {
    Xian: typeof Xian;
  }
}

(window as Window & { Xian: typeof Xian }).Xian = Xian;
