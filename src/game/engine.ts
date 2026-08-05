import { STAGE_ORDER, formatYearLabel, getEra, isStageId, nextEraId } from './eras';
import { decideBatchDepth, generateAiBatch, isAiEnabled } from './deepseek';
import { generateProceduralBatch } from './procedural';
import type {
  Choice,
  EnvironmentInfo,
  EventBatch,
  GameSave,
  GameStateView,
  PendingBatchFor,
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

function clearPending(save: GameSave): GameSave {
  return { ...save, pendingBatch: null, pendingFor: null };
}

function pendingMatches(save: GameSave, forKey: PendingBatchFor): boolean {
  const p = save.pendingFor;
  if (!save.pendingBatch || !p) return false;
  return p.kind === forKey.kind && p.eraId === forKey.eraId && p.stepsInEra === forKey.stepsInEra;
}

function isPrefetchReady(save: GameSave): boolean {
  if (save.mode === 'milestone' && save.eraId !== 'ending') {
    return pendingMatches(save, {
      kind: 'after_milestone',
      eraId: save.eraId,
      stepsInEra: 0,
    });
  }
  if (save.mode === 'event' && save.event) {
    const era = getEra(save.eraId);
    const nextSteps = save.stepsInEra + 1;
    if (nextSteps >= era.eventsBeforeNext) return false;
    const hasLeaf = save.event.choices.some(
      (c) => !c.nextNodeId || !save.batch?.nodes[c.nextNodeId!],
    );
    if (!hasLeaf) return false;
    return pendingMatches(save, {
      kind: 'after_path',
      eraId: save.eraId,
      stepsInEra: nextSteps,
    });
  }
  return false;
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
    pendingBatch: null,
    pendingFor: null,
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
    prefetchReady: false,
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
      prefetchReady: false,
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
      prefetchReady: isPrefetchReady(save),
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
    prefetchReady: isPrefetchReady(save),
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
  // 优先消费预缓存：键匹配则瞬时进入，不再请求 DeepSeek
  if (
    save.pendingBatch &&
    save.pendingFor &&
    save.pendingFor.eraId === save.eraId &&
    save.pendingFor.stepsInEra === save.stepsInEra &&
    ((save.pendingFor.kind === 'after_milestone' && save.stepsInEra === 0) ||
      save.pendingFor.kind === 'after_path')
  ) {
    console.log(`[游戏] 使用预缓存分支树 ${save.pendingBatch.id}（无等待）`);
    const batch = save.pendingBatch;
    return applyBatchNode(clearPending(save), batch, batch.startId);
  }

  const batch = await createBatchFor(save);
  console.log(`[游戏] 即时生成分支树 ${batch.id} | 建议在检查点预取以避免等待`);
  return applyBatchNode(clearPending(save), batch, batch.startId);
}

/**
 * 在检查点 / 叶节点提前生成下一段内容并写入 pendingBatch。
 * 前端进入游戏、新游戏、到达固有节点时应调用。
 */
export async function prefetchContent(save: GameSave): Promise<GameStateView> {
  if (save.mode === 'death' || save.mode === 'ending' || save.eraId === 'ending') {
    return toStateView(save);
  }

  // 固有进化检查点：预生成离开后的第一批分支树
  if (save.mode === 'milestone') {
    const key: PendingBatchFor = {
      kind: 'after_milestone',
      eraId: save.eraId,
      stepsInEra: 0,
    };
    if (pendingMatches(save, key)) {
      console.log(`[预取] 已就绪 after_milestone | ${save.eraId}`);
      return toStateView(save);
    }

    console.log(`[预取] 检查点预生成本纪元分支树… | ${save.eraId}`);
    const batch = await createBatchFor({ ...save, stepsInEra: 0 });
    const next: GameSave = {
      ...save,
      pendingBatch: batch,
      pendingFor: key,
      updatedAt: nowIso(),
    };
    console.log(`[预取] 完成 ${batch.id} | 节点=${Object.keys(batch.nodes).length}`);
    return toStateView(next);
  }

  // 事件叶节点：预生成下一批（若纪元未完）
  if (save.mode === 'event' && save.event) {
    const era = getEra(save.eraId);
    const nextSteps = save.stepsInEra + 1;
    const hasLeaf = save.event.choices.some(
      (c) => !c.nextNodeId || !save.batch?.nodes[c.nextNodeId!],
    );

    if (!hasLeaf || nextSteps >= era.eventsBeforeNext) {
      return toStateView(save);
    }

    const key: PendingBatchFor = {
      kind: 'after_path',
      eraId: save.eraId,
      stepsInEra: nextSteps,
    };
    if (pendingMatches(save, key)) {
      console.log(`[预取] 已就绪 after_path | ${save.eraId} steps=${nextSteps}`);
      return toStateView(save);
    }

    console.log(`[预取] 叶节点预生成下一段… | 进度将至 ${nextSteps}/${era.eventsBeforeNext}`);
    const batch = await createBatchFor({
      ...save,
      stepsInEra: nextSteps,
      batch: null,
      batchNodeId: null,
      event: null,
    });
    const next: GameSave = {
      ...save,
      pendingBatch: batch,
      pendingFor: key,
      updatedAt: nowIso(),
    };
    console.log(`[预取] 完成 ${batch.id} | 节点=${Object.keys(batch.nodes).length}`);
    return toStateView(next);
  }

  return toStateView(save);
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
        ...clearPending(save),
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
      ...clearPending(save),
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

  console.log(`[游戏] 到达分支末尾，载入下一段预推演 | 进度 ${steps}/${era.eventsBeforeNext}`);
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
    ...clearPending(save),
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
      // 保留 pendingBatch：enterBatch 会消费 after_milestone 缓存
    };
    if (choice.successText) {
      next.historySummary = pushHistory(next, choice.successText);
    }
    console.log(`[游戏] 离开固有节点，进入预推演分支…`);
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
        ...clearPending(next),
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
  const checkpointId =
    isStageId(save.checkpointEraId) && save.checkpointEraId !== 'ending'
      ? save.checkpointEraId
      : 'microbe';
  const era = getEra(checkpointId);
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
    pendingBatch: null,
    pendingFor: null,
    historySummary: pushHistory(save, `从检查点重生：${era.label}`),
    updatedAt: nowIso(),
  };
  return toStateView(next);
}

function normalizePending(
  data: Partial<GameSave>,
): { pendingBatch: EventBatch | null; pendingFor: PendingBatchFor | null } {
  const pendingBatch = (data.pendingBatch as EventBatch | null) ?? null;
  const pendingFor = (data.pendingFor as PendingBatchFor | null) ?? null;
  if (
    pendingBatch &&
    pendingFor &&
    pendingBatch.startId &&
    pendingBatch.nodes?.[pendingBatch.startId] &&
    (pendingFor.kind === 'after_milestone' || pendingFor.kind === 'after_path')
  ) {
    return { pendingBatch, pendingFor };
  }
  return { pendingBatch: null, pendingFor: null };
}

export function loadSave(raw: unknown): GameSave {
  if (!raw || typeof raw !== 'object') return createNewSave();
  const data = raw as Partial<GameSave>;

  if ('nodeId' in data && !('eraId' in data)) {
    return createNewSave();
  }

  const eraIdRaw = typeof data.eraId === 'string' ? data.eraId : 'microbe';
  if (eraIdRaw === 'ending') {
    const checkpointRaw =
      typeof data.checkpointEraId === 'string' ? data.checkpointEraId : 'tribe';
    const checkpointEraId: StageId =
      isStageId(checkpointRaw) && checkpointRaw !== 'ending' ? checkpointRaw : 'tribe';
    return {
      ...createNewSave(),
      eraId: 'ending',
      checkpointEraId,
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
      pendingBatch: null,
      pendingFor: null,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : nowIso(),
    };
  }

  if (!isStageId(eraIdRaw)) {
    return createNewSave();
  }

  const era = getEra(eraIdRaw);
  const base = createNewSave();
  let batch = (data.batch as EventBatch | null) ?? null;
  let batchNodeId = typeof data.batchNodeId === 'string' ? data.batchNodeId : null;
  let event = data.event ?? null;
  const { pendingBatch, pendingFor } = normalizePending(data);

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

  const checkpointRaw =
    typeof data.checkpointEraId === 'string' ? data.checkpointEraId : era.id;
  const checkpointEraId: StageId =
    isStageId(checkpointRaw) && checkpointRaw !== 'ending' ? checkpointRaw : era.id;

  return {
    eraId: era.id,
    checkpointEraId,
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
    pendingBatch,
    pendingFor,
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
