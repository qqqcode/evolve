import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createEvolveRouter, logEvolveAiStatus } from '../evolve/src/router';
import { createEvolve2Router } from '../evolve2/src/router';
import { createLegionRouter } from '../legion/src/router';
import { GAMES } from './registry';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const hubPublic = path.join(process.cwd(), 'public');

app.use(express.json({ limit: '1mb' }));

/** 游戏集合 API */
app.get('/api/games', (_req, res) => {
  res.json({ games: GAMES });
});

/** 进化史：/evolve 与 /evolve/* */
app.use('/evolve', createEvolveRouter());

/** 进化点击：/evolve2 与 /evolve2/* */
app.use('/evolve2', createEvolve2Router());

/** 兵阵对决：/legion 与 /legion/* */
app.use('/legion', createLegionRouter());

/** 集合门户静态页 */
app.use(express.static(hubPublic));

app.get('/', (_req, res) => {
  res.sendFile(path.join(hubPublic, 'index.html'));
});

/** 未上线游戏的占位页 */
app.get(['/othername', '/othername/*'], (_req, res) => {
  res.status(503).sendFile(path.join(hubPublic, 'coming-soon.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`文字游戏集合已启动: http://${HOST}:${PORT}`);
  console.log(`门户: http://${HOST}:${PORT}/`);
  console.log(`进化史: http://${HOST}:${PORT}/evolve/`);
  console.log(`进化点击: http://${HOST}:${PORT}/evolve2/`);
  console.log(`兵阵对决: http://${HOST}:${PORT}/legion/`);
  console.log(`本机局域网可访问: http://<你的IP>:${PORT}`);
  logEvolveAiStatus();
});
