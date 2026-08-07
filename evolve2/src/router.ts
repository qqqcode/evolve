import express, { Router } from 'express';
import path from 'path';
import { sendHtmlFile } from '../../src/htmlInject';
import { getMeta } from './game/engine';
import { APP_VERSION } from './version';

/** 进化点击：增量游戏路由，挂载于 /evolve2 */
export function createEvolve2Router(): Router {
  const router = Router();
  const publicDir = path.join(process.cwd(), 'evolve2', 'public');
  const indexHtml = path.join(publicDir, 'index.html');

  router.get('/api/meta', (_req, res) => {
    res.json({ ...getMeta(), version: APP_VERSION, title: '进化点击' });
  });

  router.use(express.static(publicDir, { index: false }));

  router.get('/', (_req, res) => {
    sendHtmlFile(res, indexHtml, '/evolve2/');
  });

  router.get('*', (_req, res) => {
    sendHtmlFile(res, indexHtml, '/evolve2/');
  });

  return router;
}
