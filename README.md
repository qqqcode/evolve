# evolve

进化史文字游戏。

## 本地开发

```bash
cp .env.example .env   # 填入 DEEPSEEK_API_KEY
npm install
npm run dev
```

访问：`http://localhost:3000`

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
