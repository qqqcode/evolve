/**
 * 对外访问前缀（nginx 子路径）。
 * 例：BASE_PATH=/webgame → 浏览器访问 /webgame/hub.css
 * Express 仍挂在根路径；常见 nginx 配置会把 /webgame/ 反代并去掉前缀。
 */
export function normalizeBasePath(raw?: string): string {
  if (!raw) return '';
  let p = String(raw).trim();
  if (!p || p === '/') return '';
  if (!p.startsWith('/')) p = `/${p}`;
  return p.replace(/\/+$/, '');
}

export const BASE_PATH = normalizeBasePath(process.env.BASE_PATH);

/** 拼出带前缀的绝对路径 */
export function withBase(path = '/'): string {
  if (!path) return BASE_PATH || '/';
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!BASE_PATH) return p;
  if (p === '/') return `${BASE_PATH}/`;
  return `${BASE_PATH}${p}`;
}
