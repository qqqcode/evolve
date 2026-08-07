import { readFileSync } from 'fs';
import path from 'path';

export const APP_VERSION: string = (() => {
  try {
    const raw = readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
    const version = JSON.parse(raw).version;
    return typeof version === 'string' && version ? version : '0.9.28';
  } catch {
    return '0.9.28';
  }
})();
