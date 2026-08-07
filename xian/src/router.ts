import express, { Router } from 'express';
import path from 'path';
import { sendHtmlFile } from '../../src/htmlInject';
import { getMeta } from './game/engine';
import { APP_VERSION } from './version';

/** 斗气苍穹：修仙增量点击，挂载于 /xian */
export function createXianRouter(): Router {
  const router = Router();
  const publicDir = path.join(process.cwd(), 'xian', 'public');
  const indexHtml = path.join(publicDir, 'index.html');

  router.get('/api/meta', (_req, res) => {
    res.json({ ...getMeta(), version: APP_VERSION, title: '斗气苍穹' });
  });

  router.use(express.static(publicDir, { index: false }));

  router.get('/', (_req, res) => {
    sendHtmlFile(res, indexHtml, '/xian/');
  });

  router.get('*', (_req, res) => {
    sendHtmlFile(res, indexHtml, '/xian/');
  });

  return router;
}
