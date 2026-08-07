import fs from 'fs';
import type { Response } from 'express';
import { BASE_PATH, withBase } from './basePath';

/** 向 HTML 注入 <base>、APP_BASE，并改写根路径链接 */
export function injectBasePath(html: string, pageMount = '/'): string {
  const publicBase = withBase(pageMount.endsWith('/') ? pageMount : `${pageMount}/`);
  const appBase = BASE_PATH; // '' 或 '/webgame'
  const hubHome = withBase('/');

  let out = html;

  // 注入或替换 <base href="...">
  if (/<base\s+href=/i.test(out)) {
    out = out.replace(/<base\s+href=["'][^"']*["']\s*\/?>/i, `<base href="${publicBase}" />`);
  } else {
    out = out.replace(/<head([^>]*)>/i, `<head$1>\n    <base href="${publicBase}" />`);
  }

  // 注入 window.APP_BASE（供门户脚本使用）
  const boot = `<script>window.APP_BASE=${JSON.stringify(appBase)};</script>`;
  if (!/window\.APP_BASE\s*=/.test(out)) {
    if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `    ${boot}\n  </head>`);
    } else {
      out = `${boot}\n${out}`;
    }
  }

  // 绝对根路径静态资源 → 相对（交给 <base>）
  out = out.replace(/(href|src)=["']\/(hub\.(?:css|js))["']/gi, '$1="$2"');

  // 回集合链接
  out = out.replace(
    /(<a\b[^>]*\bhref=["'])\/(["'][^>]*>)/gi,
    `$1${hubHome}$2`,
  );
  // class hub-link 等可能写成 href="/"
  out = out.replace(/(class="hub-link"[^>]*href=["'])\/(["'])/gi, `$1${hubHome}$2`);
  out = out.replace(/(href=["'])\/(["'][^>]*class="hub-link")/gi, `$1${hubHome}$2`);

  return out;
}

export function sendHtmlFile(res: Response, filePath: string, pageMount = '/'): void {
  const html = fs.readFileSync(filePath, 'utf8');
  res.type('html').send(injectBasePath(html, pageMount));
}
