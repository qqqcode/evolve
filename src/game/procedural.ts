import type { EraDef, EventBatch, GeneratedEvent, GameSave } from './types';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function makeNode(
  era: EraDef,
  save: GameSave,
  id: string,
  title: string,
  text: string,
  nextIds: Array<string | null>,
): GeneratedEvent {
  const threat = pick(era.baseEnvironment.threats);
  const opportunity = pick(era.baseEnvironment.opportunities);
  const life = pickN(era.baseEnvironment.nearbyLife, 3);
  const suitability = Math.max(
    10,
    Math.min(95, era.baseEnvironment.suitability + Math.round((Math.random() - 0.5) * 16)),
  );

  const targets = nextIds.length >= 3 ? nextIds : [...nextIds, ...Array(3 - nextIds.length).fill(nextIds[0] ?? null)];

  return {
    id,
    title,
    text,
    environment: {
      ...era.baseEnvironment,
      suitability,
      threats: pickN(era.baseEnvironment.threats, 3),
      opportunities: pickN(era.baseEnvironment.opportunities, 3),
      nearbyLife: life,
      notes: `主要压力：${threat}；可见机缘：${opportunity}`,
    },
    choices: [
      {
        id: `${id}_cautious`,
        text: '保守求生，优先躲避风险',
        successRate: 1,
        successText: '你避开锋芒，缓慢积蓄优势。',
        yearAdvanceMa: Math.max(0.001, era.yearMa * 0.008),
        fitnessDelta: 2,
        nextNodeId: targets[0],
      },
      {
        id: `${id}_seize`,
        text: `抓住机缘：${opportunity}`,
        dangerHint: '机会常与风险同在',
        successRate: 0.62,
        successText: `你把握住了「${opportunity}」。`,
        failText: `争夺「${opportunity}」失败，演化线在此断裂。`,
        yearAdvanceMa: Math.max(0.001, era.yearMa * 0.012),
        fitnessDelta: 6,
        gainTrait: opportunity.slice(0, 8),
        nextNodeId: targets[1] ?? targets[0],
      },
      {
        id: `${id}_confront`,
        text: `直面威胁：${threat}`,
        dangerHint: '对抗失败即死亡',
        successRate: 0.45,
        successText: `你从「${threat}」中活了下来。`,
        failText: `${threat}终结了这一支谱系。`,
        yearAdvanceMa: Math.max(0.001, era.yearMa * 0.015),
        fitnessDelta: 8,
        nextNodeId: targets[2] ?? targets[0],
      },
      {
        id: `${id}_migrate`,
        text: '迁往新的微生境',
        successRate: 0.75,
        successText: '你找到一片暂时更合适的角落。',
        failText: '迁徙途中耗尽储备，沉入黑暗。',
        yearAdvanceMa: Math.max(0.001, era.yearMa * 0.01),
        fitnessDelta: 3,
        nextNodeId: targets[0],
      },
    ],
  };
}

/** 程序化分支树：主路径 depth 层，并分出 1~2 条旁支后汇合 */
export function generateProceduralBatch(era: EraDef, save: GameSave, depth: number): EventBatch {
  const nodes: Record<string, GeneratedEvent> = {};
  const threat = pick(era.baseEnvironment.threats);
  const opportunity = pick(era.baseEnvironment.opportunities);

  if (depth === 1) {
    nodes.n1 = makeNode(
      era,
      save,
      'n1',
      `机缘与危机：${opportunity}`,
      `作为${era.form}，你同时感知到「${opportunity}」与「${threat}」。这是本段演化的关键抉择。`,
      [null, null, null],
    );
    return { id: `proc_${Date.now().toString(36)}`, startId: 'n1', depth, nodes };
  }

  // layer 1
  const nextMain = depth >= 3 ? 'n2a' : 'n2';
  const nextSide = depth >= 3 ? 'n2b' : 'n2';
  nodes.n1 = makeNode(
    era,
    save,
    'n1',
    `开端波动：${threat}`,
    `夜色深处，${threat}的迹象逼近。你也可以转向「${opportunity}」这条缝隙。`,
    [nextMain, nextSide, nextMain],
  );

  if (depth === 2) {
    nodes.n2 = makeNode(
      era,
      save,
      'n2',
      `收束：${opportunity}`,
      `前路收窄。周围仍是${era.baseEnvironment.habitat}。一次选择将结束本段推演。`,
      [null, null, null],
    );
  } else {
    const leaf = depth === 3 ? 'n3' : 'n3';
    nodes.n2a = makeNode(
      era,
      save,
      'n2a',
      '稳健支路',
      `你选择了更稳妥的微生境。${era.baseEnvironment.climate}`,
      [leaf, leaf, leaf],
    );
    nodes.n2b = makeNode(
      era,
      save,
      'n2b',
      '激进支路',
      `你押注高风险机遇「${opportunity}」，局势更尖锐。`,
      [leaf, leaf, null],
    );
    nodes.n3 = makeNode(
      era,
      save,
      'n3',
      depth >= 4 ? '中盘汇合' : `终局试炼：${threat}`,
      depth >= 4
        ? '两条支路在此汇合，更艰难的考验还在后面。'
        : `本段推演的最后关口。${threat}与${opportunity}同时压来。`,
      depth >= 4 ? ['n4', 'n4', 'n4'] : [null, null, null],
    );
    if (depth >= 4) {
      nodes.n4 = makeNode(
        era,
        save,
        'n4',
        `终局试炼：${threat}`,
        `本段最后一次选择。活过这里，演化将继续向前。`,
        [null, null, null],
      );
    }
  }

  console.log(`[程序化] 分支树 | 深度=${depth} | 节点=${Object.keys(nodes).length}`);
  return {
    id: `proc_${Date.now().toString(36)}`,
    startId: 'n1',
    depth,
    nodes,
  };
}
