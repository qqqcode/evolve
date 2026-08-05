import { STAGE_ORDER, formatYearLabel, getEra, nextEraId } from './eras';
import { decideBatchDepth, generateAiBatch, isAiEnabled } from './deepseek';
import { generateProceduralBatch } from './procedural';
import type {
  Choice,
  EnvironmentInfo,
  EventBatch,
  GameSave,
  GameStateView,
  GeneratedEvent,
  StageId,
} from './types';

const ENDING_TEXT =
  '洪水与寒潮都曾差点抹去你们的名字。最终，高地上的新火亮起，泥土里冒出麦苗的第一点绿。\n\n从热泉单细胞到部落炊烟——固有进化节点已走完。中间无数偶然，由环境书写。夜仍深，但故事已够照亮前路。';

function cloneEnv(env: EnvironmentInfo): EnvironmentInfo {
  return {
    ...env,
    threats: [...env.threats],
    opportunities: [...env.opportunities],
    nearbyLife: [...env.nearbyLife],
  };
}

function clampFitness(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function nowIso(): string {
  return new Date().toISOString();
}

function pushHistory(save: GameSave, line: string): string[] {
  return [...save.historySummary, line].slice(-12);
}

function applyBatchNode(save: GameSave, batch: EventBatch, nodeId: string): GameSave {
  const node = batch.nodes[nodeId];
  if (!node) throw new Error(`分支节点不存在: ${nodeId}`);
  return {
    ...save,
    mode: 'event',
    batch,
    batchNodeId: nodeId,
    event: node,
    death: null,
    environment: cloneEnv(node.environment),
    updatedAt: nowIso(),
  };
}

function batchProgressLabel(save: GameSave): string | undefined {
  if (!save.batch || !save.batchNodeId) return undefined;
  const total = save.batch.depth;
  // approximate: steps already done in era within this batch path isn't tracked separately;
  // show remaining era steps + batch size
  return `预推演分支 · ${Object.keys(save.batch.nodes).length}节点 / 路径约${total}步 · 纪元 ${save.stepsInEra}/${getEra(save.eraId).eventsBeforeNext}`;
}

export function createNewSave(): GameSave {
  const era = getEra('microbe');
  return {
    eraId: era.id,
    checkpointEraId: era.id,
    mode: 'milestone',
    event: null,
    batch: null,
    batchNodeId: null,
    death: null,
    stepsInEra: 0,
    yearMa: era.yearMa,
    traits: [],
    fitness: 55,
    deaths: 0,
    historySummary: [`抵达${era.label}`],
    environment: cloneEnv(era.baseEnvironment),
    updatedAt: nowIso(),
  };
}

function endingView(save: GameSave): GameStateView {
  return {
    save,
    stageLabel: '文明曙光',
    stageIndex: STAGE_ORDER.length - 1,
    stageTotal: STAGE_ORDER.length - 1,
    yearLabel: formatYearLabel(save.yearMa),
    form: '部族文明萌芽',
    title: '文明曙光',
    text: ENDING_TEXT,
    choices: [],
    isCheckpoint: true,
    isDeath: false,
    isEnding: true,
    aiEnabled: isAiEnabled(),
  };
}

export function toStateView(save: GameSave): GameStateView {
  if (save.mode === 'ending' || save.eraId === 'ending') {
    return endingView(save);
  }

  if (save.mode === 'death' && save.death) {
    const era = getEra(save.checkpointEraId);
    return {
      save,
      stageLabel: era.label,
      stageIndex: Math.max(0, STAGE_ORDER.indexOf(save.eraId)),
      stageTotal: STAGE_ORDER.length - 1,
      yearLabel: formatYearLabel(save.yearMa),
      form: era.form,
      title: save.death.title,
      text: save.death.text,
      choices: [],
      isCheckpoint: false,
      isDeath: true,
      isEnding: false,
      aiEnabled: isAiEnabled(),
    };
  }

  const era = getEra(save.eraId);

  if (save.mode === 'event' && save.event) {
    return {
      save,
      stageLabel: era.label,
      stageIndex: Math.max(0, STAGE_ORDER.indexOf(era.id)),
      stageTotal: STAGE_ORDER.length - 1,
      yearLabel: formatYearLabel(save.yearMa),
      form: era.form,
      title: save.event.title,
      text: save.event.text,
      choices: save.event.choices,
      isCheckpoint: false,
      isDeath: false,
      isEnding: false,
      aiEnabled: isAiEnabled(),
      batchInfo: batchProgressLabel(save),
    };
  }

  return {
    save,
    stageLabel: era.label,
    stageIndex: Math.max(0, STAGE_ORDER.indexOf(era.id)),
    stageTotal: STAGE_ORDER.length - 1,
    yearLabel: formatYearLabel(save.yearMa),
    form: era.form,
    title: era.milestoneTitle,
    text: era.milestoneText,
    choices: era.choices,
    isCheckpoint: true,
    isDeath: false,
    isEnding: false,
    aiEnabled: isAiEnabled(),
  };
}

async function createBatchFor(save: GameSave): Promise<EventBatch> {
  const era = getEra(save.eraId);
  const remaining = Math.max(1, era.eventsBeforeNext - save.stepsInEra);
  const depth = decideBatchDepth(remaining);

  if (isAiEnabled()) {
    try {
      return await generateAiBatch(era, save, depth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[DeepSeek] ↷ 回退程序化分支树 | 原因=${msg}`);
    }
  } else {
    console.log('[DeepSeek] － 未配置密钥，使用程序化分支树');
  }

  return generateProceduralBatch(era, save, depth);
}

async function enterBatch(save: GameSave): Promise<GameSave> {
  const batch = await createBatchFor(save);
  console.log(`[游戏] 载入分支树 ${batch.id} | 本地可点选，走完叶节点才请求下一批`);
  return applyBatchNode(save, batch, batch.startId);
}

function applySuccess(save: GameSave, choice: Choice, summary: string): GameSave {
  const yearAdvance = choice.yearAdvanceMa ?? Math.max(0.001, save.yearMa * 0.008);
  const nextYear = Math.max(0.01, save.yearMa - yearAdvance);
  const traits =
    choice.gainTrait && !save.traits.includes(choice.gainTrait)
      ? [...save.traits, choice.gainTrait]
      : [...save.traits];

  return {
    ...save,
    yearMa: nextYear,
    fitness: clampFitness(save.fitness + (choice.fitnessDelta ?? 0)),
    traits,
    historySummary: pushHistory(save, summary),
    updatedAt: nowIso(),
  };
}

async function afterPathStep(save: GameSave): Promise<GameSave> {
  const era = getEra(save.eraId);
  const steps = save.stepsInEra + 1;

  if (steps >= era.eventsBeforeNext) {
    const nextId = nextEraId(era.id);
    if (nextId === 'ending') {
      return {
        ...save,
        eraId: 'ending',
        mode: 'ending',
        event: null,
        batch: null,
        batchNodeId: null,
        death: null,
        stepsInEra: steps,
        checkpointEraId: era.id,
        historySummary: pushHistory(save, '抵达文明曙光'),
        updatedAt: nowIso(),
      };
    }

    const next = getEra(nextId);
    console.log(`[游戏] 纪元完成，进入固有进化：${next.label}`);
    return {
      ...save,
      eraId: next.id,
      checkpointEraId: next.id,
      mode: 'milestone',
      event: null,
      batch: null,
      batchNodeId: null,
      death: null,
      stepsInEra: 0,
      yearMa: Math.min(save.yearMa, next.yearMa),
      environment: cloneEnv(next.baseEnvironment),
      historySummary: pushHistory(save, `【固有进化】进入${next.label}`),
      fitness: clampFitness(save.fitness + 3),
      updatedAt: nowIso(),
    };
  }

  // 本批结束且纪元未完 → 请求下一批
  console.log(`[游戏] 到达分支末尾，请求下一段预推演 | 进度 ${steps}/${era.eventsBeforeNext}`);
  return enterBatch({
    ...save,
    stepsInEra: steps,
    batch: null,
    batchNodeId: null,
    event: null,
  });
}

function die(save: GameSave, title: string, text: string): GameSave {
  return {
    ...save,
    mode: 'death',
    event: null,
    batch: null,
    batchNodeId: null,
    death: { title, text },
    deaths: save.deaths + 1,
    historySummary: pushHistory(save, `死亡：${title}`),
    updatedAt: nowIso(),
  };
}

function roll(rate = 1): boolean {
  return Math.random() <= rate;
}

export async function chooseOption(save: GameSave, choiceId: string): Promise<GameStateView> {
  if (save.mode === 'death' || save.mode === 'ending') {
    throw new Error('当前无法选择');
  }

  if (save.mode === 'milestone') {
    const era = getEra(save.eraId);
    const choice = era.choices.find((c) => c.id === choiceId);
    if (!choice) throw new Error('无效选项');

    if (!roll(choice.successRate ?? 1)) {
      return toStateView(
        die(save, '演化中断', choice.failText || '这一次选择把谱系带进了死局。'),
      );
    }

    let next = applySuccess(save, choice, `${era.label}：${choice.text}`);
    next = {
      ...next,
      checkpointEraId: era.id,
      stepsInEra: 0,
      batch: null,
      batchNodeId: null,
      event: null,
    };
    if (choice.successText) {
      next.historySummary = pushHistory(next, choice.successText);
    }
    console.log(`[游戏] 离开固有节点，预推演本纪元分支树…`);
    next = await enterBatch(next);
    return toStateView(next);
  }

  const event = save.event;
  const batch = save.batch;
  if (!event) throw new Error('当前没有事件');

  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error('无效选项');

  if (!roll(choice.successRate ?? 1)) {
    return toStateView(
      die(
        { ...save, environment: cloneEnv(event.environment) },
        '演化中断',
        choice.failText || '环境没有放过你。',
      ),
    );
  }

  let next = applySuccess(
    { ...save, environment: cloneEnv(event.environment) },
    choice,
    `${event.title}→${choice.text}`,
  );
  if (choice.successText) {
    next.historySummary = pushHistory(next, choice.successText);
  }

  const nextNodeId = choice.nextNodeId ?? null;

  // 同批内跳转：本地瞬时，不打 DeepSeek
  if (nextNodeId && batch?.nodes[nextNodeId]) {
    next = {
      ...next,
      stepsInEra: next.stepsInEra + 1,
    };
    const eraNow = getEra(next.eraId);
    if (next.stepsInEra >= eraNow.eventsBeforeNext) {
      console.log(`[游戏] 路径中已达纪元进度，结束分支并进入固有进化`);
      next = {
        ...next,
        batch: null,
        batchNodeId: null,
        event: null,
        stepsInEra: next.stepsInEra - 1,
      };
      next = await afterPathStep(next);
      return toStateView(next);
    }
    console.log(`[游戏] 本地分支跳转 → ${nextNodeId}「${batch.nodes[nextNodeId].title}」(无 DeepSeek 请求)`);
    next = applyBatchNode(next, batch, nextNodeId);
    return toStateView(next);
  }

  // 叶节点 / 无效 next：本批结束
  next = {
    ...next,
    batch: null,
    batchNodeId: null,
    event: null,
  };
  next = await afterPathStep(next);
  return toStateView(next);
}

export function respawnFromCheckpoint(save: GameSave): GameStateView {
  const era = getEra(save.checkpointEraId || 'microbe');
  const next: GameSave = {
    ...save,
    eraId: era.id,
    mode: 'milestone',
    event: null,
    batch: null,
    batchNodeId: null,
    death: null,
    stepsInEra: 0,
    yearMa: era.yearMa,
    fitness: Math.max(40, Math.min(save.fitness, 70)),
    environment: cloneEnv(era.baseEnvironment),
    historySummary: pushHistory(save, `从检查点重生：${era.label}`),
    updatedAt: nowIso(),
  };
  return toStateView(next);
}

export function loadSave(raw: unknown): GameSave {
  if (!raw || typeof raw !== 'object') return createNewSave();
  const data = raw as Partial<GameSave>;

  if ('nodeId' in data && !('eraId' in data)) {
    return createNewSave();
  }

  const eraIdRaw = typeof data.eraId === 'string' ? data.eraId : 'microbe';
  if (eraIdRaw === 'ending') {
    return {
      ...createNewSave(),
      eraId: 'ending',
      checkpointEraId: (typeof data.checkpointEraId === 'string'
        ? data.checkpointEraId
        : 'tribe') as StageId,
      mode: 'ending',
      event: null,
      batch: null,
      batchNodeId: null,
      death: null,
      stepsInEra: typeof data.stepsInEra === 'number' ? data.stepsInEra : 0,
      yearMa: typeof data.yearMa === 'number' ? data.yearMa : 0.01,
      traits: Array.isArray(data.traits) ? data.traits.filter((x) => typeof x === 'string') : [],
      fitness: typeof data.fitness === 'number' ? clampFitness(data.fitness) : 70,
      deaths: typeof data.deaths === 'number' ? data.deaths : 0,
      historySummary: Array.isArray(data.historySummary)
        ? data.historySummary.filter((x) => typeof x === 'string')
        : [],
      environment: createNewSave().environment,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : nowIso(),
    };
  }

  const era = getEra(eraIdRaw as StageId);
  const base = createNewSave();
  let batch = (data.batch as EventBatch | null) ?? null;
  let batchNodeId = typeof data.batchNodeId === 'string' ? data.batchNodeId : null;
  let event = data.event ?? null;

  // 若有批次，以批次节点为准
  if (batch && batchNodeId && batch.nodes?.[batchNodeId]) {
    event = batch.nodes[batchNodeId];
  } else if (batch && batch.startId && batch.nodes?.[batch.startId]) {
    batchNodeId = batch.startId;
    event = batch.nodes[batch.startId];
  } else {
    batch = null;
    batchNodeId = null;
  }

  return {
    eraId: era.id,
    checkpointEraId: (typeof data.checkpointEraId === 'string'
      ? data.checkpointEraId
      : era.id) as StageId,
    mode: (data.mode as GameSave['mode']) || 'milestone',
    event,
    batch,
    batchNodeId,
    death: data.death ?? null,
    stepsInEra: typeof data.stepsInEra === 'number' ? data.stepsInEra : 0,
    yearMa: typeof data.yearMa === 'number' ? data.yearMa : era.yearMa,
    traits: Array.isArray(data.traits) ? data.traits.filter((x) => typeof x === 'string') : [],
    fitness: typeof data.fitness === 'number' ? clampFitness(data.fitness) : base.fitness,
    deaths: typeof data.deaths === 'number' ? data.deaths : 0,
    historySummary: Array.isArray(data.historySummary)
      ? data.historySummary.filter((x) => typeof x === 'string')
      : [],
    environment:
      data.environment && typeof data.environment === 'object'
        ? {
            habitat: String(data.environment.habitat || era.baseEnvironment.habitat),
            climate: String(data.environment.climate || era.baseEnvironment.climate),
            suitability: clampFitness(
              Number(data.environment.suitability ?? era.baseEnvironment.suitability),
            ),
            threats: Array.isArray(data.environment.threats)
              ? data.environment.threats.map(String)
              : [...era.baseEnvironment.threats],
            opportunities: Array.isArray(data.environment.opportunities)
              ? data.environment.opportunities.map(String)
              : [...era.baseEnvironment.opportunities],
            nearbyLife: Array.isArray(data.environment.nearbyLife)
              ? data.environment.nearbyLife.map(String)
              : [...era.baseEnvironment.nearbyLife],
            notes: data.environment.notes
              ? String(data.environment.notes)
              : era.baseEnvironment.notes,
          }
        : cloneEnv(era.baseEnvironment),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : nowIso(),
  };
}

export function getMeta() {
  return {
    stages: STAGE_ORDER.filter((s) => s !== 'ending').map((id) => {
      const era = getEra(id);
      return { id, label: era.label, yearLabel: era.yearLabel };
    }),
    aiEnabled: isAiEnabled(),
  };
}
