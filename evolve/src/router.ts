import express, { Router } from 'express';
import path from 'path';
import { sendHtmlFile } from '../../src/htmlInject';
import {
  chooseOption,
  createNewSave,
  getMeta,
  loadSave,
  prefetchContent,
  respawnFromCheckpoint,
  toStateView,
} from './game/engine';
import { isAiEnabled } from './game/deepseek';
import type { GameSave } from './game/types';

/** 进化史游戏路由，挂载于 /evolve */
export function createEvolveRouter(): Router {
  const router = Router();
  const publicDir = path.join(process.cwd(), 'evolve', 'public');
  const indexHtml = path.join(publicDir, 'index.html');

  router.get('/api/meta', (_req, res) => {
    res.json(getMeta());
  });

  router.post('/api/game/new', (_req, res) => {
    const save = createNewSave();
    res.json(toStateView(save));
  });

  router.post('/api/game/load', (req, res) => {
    try {
      const save = loadSave(req.body?.save);
      res.json(toStateView(save));
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : '读取失败' });
    }
  });

  router.post('/api/game/prefetch', async (req, res) => {
    try {
      const save = loadSave(req.body?.save) as GameSave;
      console.log(`[evolve/预取] 请求 | 纪元=${save.eraId} | mode=${save.mode}`);
      const view = await prefetchContent(save);
      res.json(view);
    } catch (err) {
      console.error('[evolve/预取] 失败:', err instanceof Error ? err.message : err);
      res.status(400).json({ error: err instanceof Error ? err.message : '预取失败' });
    }
  });

  router.post('/api/game/choose', async (req, res) => {
    try {
      const save = loadSave(req.body?.save) as GameSave;
      const choiceId = String(req.body?.choiceId ?? '');
      console.log(
        `[evolve/游戏] 选择 | 纪元=${save.eraId} | mode=${save.mode} | choice=${choiceId}`,
      );
      const view = await chooseOption(save, choiceId);
      console.log(
        `[evolve/游戏] 结果 | mode=${view.save.mode} | 「${view.title}」 | 死亡=${view.isDeath} | 检查点=${view.isCheckpoint}`,
      );
      res.json(view);
    } catch (err) {
      console.error('[evolve/游戏] 选择失败:', err instanceof Error ? err.message : err);
      res.status(400).json({ error: err instanceof Error ? err.message : '选择失败' });
    }
  });

  router.post('/api/game/respawn', (req, res) => {
    try {
      const save = loadSave(req.body?.save) as GameSave;
      const view = respawnFromCheckpoint(save);
      res.json(view);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : '复活失败' });
    }
  });

  router.use(express.static(publicDir, { index: false }));

  router.get('/', (_req, res) => {
    sendHtmlFile(res, indexHtml, '/evolve/');
  });

  router.get('*', (_req, res) => {
    sendHtmlFile(res, indexHtml, '/evolve/');
  });

  return router;
}

export function logEvolveAiStatus(): void {
  console.log(
    isAiEnabled()
      ? '[evolve] DeepSeek：已启用（中间事件由大模型生成）'
      : '[evolve] DeepSeek：未配置 DEEPSEEK_API_KEY，中间事件使用程序化兜底',
  );
}
