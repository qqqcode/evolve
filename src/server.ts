import 'dotenv/config';
import express from 'express';
import path from 'path';
import { BASE_PATH, withBase } from './basePath';
import { sendHtmlFile } from './htmlInject';
import { createEvolveRouter, logEvolveAiStatus } from '../evolve/src/router';
import { createEvolve2Router } from '../evolve2/src/router';
import { createLegionRouter } from '../legion/src/router';
import { GAMES } from './registry';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const hubPublic = path.join(process.cwd(), 'public');

app.use(express.json({ limit: '1mb' }));

/** 供前端探测前缀 */
app.get(['/api/base', '/api/meta/base'], (_req, res) => {
  res.json({ basePath: BASE_PATH || '' });
});

/** 游戏集合 API（path 带对外前缀，便于子路径部署） */
app.get('/api/games', (_req, res) => {
  res.json({
    basePath: BASE_PATH || '',
    games: GAMES.map((g) => ({
      ...g,
      path: withBase(g.path),
    })),
  });
});

/** 进化史：/evolve 与 /evolve/* */
app.use('/evolve', createEvolveRouter());

/** 进化点击：/evolve2 与 /evolve2/* */
app.use('/evolve2', createEvolve2Router());

/** 兵阵对决：/legion 与 /legion/* */
app.use('/legion', createLegionRouter());

/** 集合门户静态资源（css/js）；禁用自动 index，首页走注入逻辑 */
app.use(express.static(hubPublic, { index: false }));

app.get('/', (_req, res) => {
  sendHtmlFile(res, path.join(hubPublic, 'index.html'), '/');
});

/** 未上线游戏的占位页 */
app.get(['/othername', '/othername/*'], (_req, res) => {
  res.status(503);
  sendHtmlFile(res, path.join(hubPublic, 'coming-soon.html'), '/');
});

app.listen(PORT, HOST, () => {
  const pub = BASE_PATH || '';
  console.log(`文字游戏集合已启动: http://${HOST}:${PORT}${pub}/`);
  if (BASE_PATH) {
    console.log(`对外路径前缀 BASE_PATH=${BASE_PATH}（配合 nginx 子路径反代）`);
  }
  console.log(`门户: http://${HOST}:${PORT}${pub}/`);
  console.log(`进化史: http://${HOST}:${PORT}${pub}/evolve/`);
  console.log(`进化点击: http://${HOST}:${PORT}${pub}/evolve2/`);
  console.log(`兵阵对决: http://${HOST}:${PORT}${pub}/legion/`);
  console.log(`本机局域网可访问: http://<你的IP>:${PORT}${pub}/`);
  logEvolveAiStatus();
});
