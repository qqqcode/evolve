import { readFileSync } from 'fs';
import path from 'path';

/** 应用版本：以 package.json 为准；每次功能修改将最后一位 +1（如 0.9.3 → 0.9.4） */
export const APP_VERSION: string = (() => {
  try {
    const raw = readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8');
    const version = JSON.parse(raw).version;
    return typeof version === 'string' && version ? version : '0.9.5';
  } catch {
    return '0.9.5';
  }
})();
