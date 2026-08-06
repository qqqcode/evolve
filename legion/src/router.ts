import express, { Router } from 'express';
import path from 'path';
import { getMeta } from './game/engine';
import { APP_VERSION } from './version';

/** 兵阵对决：挂载于 /legion */
export function createLegionRouter(): Router {
  const router = Router();
  const publicDir = path.join(process.cwd(), 'legion', 'public');

  router.get('/api/meta', (_req, res) => {
    res.json({ ...getMeta(), version: APP_VERSION });
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
