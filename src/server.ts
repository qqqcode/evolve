import 'dotenv/config';
import express from 'express';
import path from 'path';
import {
  chooseOption,
  createNewSave,
  getMeta,
  loadSave,
  respawnFromCheckpoint,
  toStateView,
} from './game/engine';
import { isAiEnabled } from './game/deepseek';
import type { GameSave } from './game/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/meta', (_req, res) => {
  res.json(getMeta());
});

app.post('/api/game/new', (_req, res) => {
  const save = createNewSave();
  res.json(toStateView(save));
});

app.post('/api/game/load', (req, res) => {
  try {
    const save = loadSave(req.body?.save);
    res.json(toStateView(save));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : '读取失败' });
  }
});

app.post('/api/game/choose', async (req, res) => {
  try {
    const save = loadSave(req.body?.save) as GameSave;
    const choiceId = String(req.body?.choiceId ?? '');
    console.log(`[游戏] 选择 | 纪元=${save.eraId} | mode=${save.mode} | choice=${choiceId}`);
    const view = await chooseOption(save, choiceId);
    console.log(
      `[游戏] 结果 | mode=${view.save.mode} | 「${view.title}」 | 死亡=${view.isDeath} | 检查点=${view.isCheckpoint}`,
    );
    res.json(view);
  } catch (err) {
    console.error('[游戏] 选择失败:', err instanceof Error ? err.message : err);
    res.status(400).json({ error: err instanceof Error ? err.message : '选择失败' });
  }
});

app.post('/api/game/respawn', (req, res) => {
  try {
    const save = loadSave(req.body?.save) as GameSave;
    const view = respawnFromCheckpoint(save);
    res.json(view);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : '复活失败' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`进化史已启动: http://localhost:${PORT}`);
  console.log(
    isAiEnabled()
      ? 'DeepSeek：已启用（中间事件由大模型生成）'
      : 'DeepSeek：未配置 DEEPSEEK_API_KEY，中间事件使用程序化兜底',
  );
});
