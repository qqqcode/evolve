import { readFileSync } from 'fs';
import path from 'path';

/** 应用版本：以根目录 package.json 为准 */
export const APP_VERSION: string = (() => {
  try {
    const raw = readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
    const version = JSON.parse(raw).version;
    return typeof version === 'string' && version ? version : '0.9.8';
  } catch {
    return '0.9.8';
  }
})();
