import express, { Router } from 'express';
import path from 'path';
import { getMeta } from './game/engine';
import { APP_VERSION } from './version';

/** 进化点击：增量游戏路由，挂载于 /evolve2 */
export function createEvolve2Router(): Router {
  const router = Router();
  const publicDir = path.join(process.cwd(), 'evolve2', 'public');

  router.get('/api/meta', (_req, res) => {
    res.json({ ...getMeta(), version: APP_VERSION, title: '进化点击' });
  });

  router.use(express.static(publicDir));

  router.get('/', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  router.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return router;
}
