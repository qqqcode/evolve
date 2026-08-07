export interface GameEntry {
  id: string;
  title: string;
  path: string;
  blurb: string;
  ready: boolean;
}

/** 文字游戏集合目录：新增游戏时在此登记，并挂载对应路由 */
export const GAMES: GameEntry[] = [
  {
    id: 'evolve',
    title: '进化史',
    path: '/evolve/',
    blurb: '从热泉单细胞到部落炊烟——固有纪元与分支预推演文字进化。',
    ready: true,
  },
  {
    id: 'evolve2',
    title: '进化点击',
    path: '/evolve2/',
    blurb: '点击吸收能量、购买变异、跨越八阶段进化，DNA 永久提升产出。',
    ready: true,
  },
  {
    id: 'legion',
    title: '兵阵对决',
    path: '/legion/',
    blurb: '8×8 方格自走棋：盾刀骑弓术，合成升级，布阵后自动战斗。',
    ready: true,
  },
  {
    id: 'xian',
    title: '斗气苍穹',
    path: '/xian/',
    blurb: '三途修炼：灵力 / 体术 / 精神力；炼丹炼体；属性随资源自动增长；出身轮回与诸天剧情梗。',
    ready: true,
  },
  {
    id: 'othername',
    title: 'Other Name（占位）',
    path: '/othername/',
    blurb: '下一个文字游戏的预留入口，完成后在此启用。',
    ready: false,
  },
];
