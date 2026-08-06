# 进化点击（evolve2）

集合内的增量 / 放置游戏。由根服务挂载在 **`/evolve2/`**。

- 逻辑：`evolve2/src/game/`（纯函数引擎）
- 前端：`evolve2/public/`（localStorage 存档 + 离线封顶）
- 路由工厂：`evolve2/src/router.ts` → `createEvolve2Router()`

## 玩法摘要

1. 点击细胞吸收能量 ⚡
2. 购买变异：提升点击力或被动产出
3. 跨越 8 个生命阶段进化（单细胞 → 会思考的生命）
4. 转生获得 DNA 🧬，永久提升全产出
