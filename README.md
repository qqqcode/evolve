# 文字游戏集合

当前版本：**0.9.9**（每次功能修改将根目录 `package.json` 版本号最后一位 +1，并同步页脚展示）。

本仓库是一个文字游戏集合门户：

| 路径 | 说明 |
|---|---|
| `/` | 集合门户，列出全部游戏 |
| `/evolve/` | 《进化史》文字游戏（完整实现） |
| `/evolve2/` | 《进化点击》增量游戏（完整实现） |
| `/legion/` | 《兵阵对决》自走棋对战（原型） |
| `/othername/` | 预留下一款游戏的入口（占位） |

游戏源码按目录隔离：

```
evolve/
  src/          # 进化史逻辑与 /evolve 路由
  public/       # 进化史前端
evolve2/
  src/          # 进化点击纯函数引擎与 /evolve2 路由
  public/       # 进化点击前端（localStorage 存档）
legion/
  src/          # 兵阵对决引擎与 /legion 路由
  public/       # 兵阵对决前端
public/         # 集合门户前端
src/            # 集合入口服务与游戏注册表
```

## 本地开发

```bash
cp .env.example .env   # 可选：填入 DEEPSEEK_API_KEY；留空则用程序化事件
npm install
npm run dev
```

- 门户：`http://localhost:3000/`
- 进化史：`http://localhost:3000/evolve/`
- 进化点击：`http://localhost:3000/evolve2/`
- 兵阵对决：`http://localhost:3000/legion/`

《进化史》会在进入检查点或分支叶节点时后台预载分支树；同批点选瞬时；检查点缓存可在死亡重生时复用。

《进化点击》：点击细胞吸收能量、购买变异、八阶段进化与 DNA 转生；自动存档，离线进度封顶 8 小时。

《兵阵对决》：8×7 方格（上敌下友）+ 备战区；盾/刀/骑/弓/术；两只相同合成升级；布阵后自动战斗。

## 新增游戏

1. 新建目录，例如 `othername/src` + `othername/public`
2. 实现 `createXxxRouter()` 并在 `src/server.ts` 挂载到 `/othername`
3. 在 `src/registry.ts` 登记条目（`ready: true`）

## Docker Compose 部署

```bash
git clone https://github.com/qqqcode/evolve.git
cd evolve
cp .env.example .env
docker compose up -d --build
```

更新：

```bash
git pull
docker compose up -d --build
```

日志 / 停止：

```bash
docker compose logs -f
docker compose down
```
