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
    id: 'othername',
    title: 'Other Name（占位）',
    path: '/othername/',
    blurb: '下一个文字游戏的预留入口，完成后在此启用。',
    ready: false,
  },
];
