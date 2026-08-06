# evolve

进化史文字游戏。

当前版本：**0.9.4**（每次功能修改将 `package.json` 版本号最后一位 +1，并同步页脚展示）。

## 本地开发

```bash
cp .env.example .env   # 可选：填入 DEEPSEEK_API_KEY；留空则用程序化事件
npm install
npm run dev
```

访问：`http://localhost:3000`（未配置密钥时中间事件走程序化兜底）

进入检查点或分支叶节点时，会在后台一次性预载「当前选择 + 后续分支」整棵事件树并写入存档；同批内点选瞬时切换，无需再次请求 DeepSeek。

## Docker Compose 部署

```bash
git clone https://github.com/qqqcode/evolve.git
cd evolve
cp .env.example .env   # 填入密钥与端口
docker compose up -d --build
```

更新代码后重新部署：

```bash
git pull
docker compose up -d --build
```

查看日志 / 停止：

```bash
docker compose logs -f
docker compose down
```

Cloud Agent test
