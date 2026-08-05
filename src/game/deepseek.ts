import type { EnvironmentInfo, EraDef, EventBatch, GeneratedEvent, GameSave } from './types';
import { formatYearLabel } from './eras';

const API_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export function isAiEnabled(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

/** 本批沿路径事件数：剩余 1→1，2→2，其余 3~4 */
export function decideBatchDepth(remaining: number): number {
  if (remaining <= 1) return 1;
  if (remaining === 2) return 2;
  if (remaining === 3) return 3;
  return 4;
}

interface AiNodePayload {
  id: string;
  title: string;
  text: string;
  environment: {
    habitat: string;
    climate: string;
    suitability: number;
    threats: string[];
    opportunities: string[];
    nearbyLife: string[];
    notes?: string;
  };
  choices: Array<{
    id: string;
    text: string;
    dangerHint?: string;
    successRate?: number;
    successText?: string;
    failText?: string;
    yearAdvanceMa?: number;
    fitnessDelta?: number;
    gainTrait?: string;
    next: string | null;
  }>;
}

interface AiBatchPayload {
  startId: string;
  depth: number;
  nodes: AiNodePayload[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function buildPrompt(era: EraDef, save: GameSave, depth: number): { system: string; user: string } {
  const maxNodes = depth <= 2 ? depth * 3 : Math.min(10, 1 + depth * 2);

  const system = `你是严谨的古生物学/进化史文字游戏叙事引擎。
规则：
1. 只输出合法 JSON，不要 markdown，不要解释。
2. 一次生成一整棵「分支事件树」，玩家可沿不同选项走到不同后续事件。
3. 沿任意成功路径大约经历 ${depth} 次事件（depth=${depth}）。
4. 节点总数控制在 ${Math.max(depth, 3)}~${maxNodes} 个；允许不同选项汇合到同一后续节点，避免指数爆炸。
5. 事件必须符合当前地质年代与生物群，禁止时代错位。
6. 每个节点 3~4 个选项；至少 1 个较安全，至少 1 个带 dangerHint 且 successRate 在 0.35~0.7。
7. 叶节点（路径最后一层）的所有选项 next 必须为 null。
8. 非叶节点的 next 必须指向已存在的节点 id。
9. 文风简洁冷峻，每段叙述不超过 100 字。
10. choices.id、节点 id 用短英文 snake_case。`;

  const user = `请生成一段可本地点选的进化分支树（一次返回整批，不要只返回单事件）。

当前状态：
- 纪元：${era.label}
- 时间：${formatYearLabel(save.yearMa)}（约 ${save.yearMa} Ma）
- 玩家形态：${era.form}
- 适合度：${save.fitness}
- 已有特性：${save.traits.join('、') || '无'}
- 本纪元进度：${save.stepsInEra}/${era.eventsBeforeNext}（本批深度约 ${depth}）
- 近期经历：${save.historySummary.slice(-5).join(' | ') || '无'}

纪元基线环境：
${JSON.stringify(era.baseEnvironment, null, 2)}

输出 JSON：
{
  "startId": "n1",
  "depth": ${depth},
  "nodes": [
    {
      "id": "n1",
      "title": "短标题",
      "text": "事件叙述",
      "environment": {
        "habitat": "栖息环境",
        "climate": "气候要点",
        "suitability": 60,
        "threats": ["威胁1", "威胁2"],
        "opportunities": ["机缘1", "机缘2"],
        "nearbyLife": ["生物1", "生物2"],
        "notes": "备注"
      },
      "choices": [
        {
          "id": "safe_path",
          "text": "选项",
          "successRate": 1,
          "successText": "成功一句",
          "failText": "失败死亡一句",
          "yearAdvanceMa": 8,
          "fitnessDelta": 2,
          "next": "n2a"
        },
        {
          "id": "risk_path",
          "text": "冒险选项",
          "dangerHint": "说明风险",
          "successRate": 0.5,
          "successText": "成功一句",
          "failText": "失败一句",
          "yearAdvanceMa": 12,
          "fitnessDelta": 6,
          "next": "n2b"
        }
      ]
    }
  ]
}

说明：叶层选项 next=null；非叶 next 指向后续节点 id。`;

  return { system, user };
}

function normalizeEnv(raw: AiNodePayload['environment'] | undefined, era: EraDef): EnvironmentInfo {
  return {
    habitat: String(raw?.habitat || era.baseEnvironment.habitat),
    climate: String(raw?.climate || era.baseEnvironment.climate),
    suitability: clamp(Number(raw?.suitability ?? era.baseEnvironment.suitability), 0, 100),
    threats: Array.isArray(raw?.threats) ? raw!.threats.map(String).slice(0, 5) : [...era.baseEnvironment.threats],
    opportunities: Array.isArray(raw?.opportunities)
      ? raw!.opportunities.map(String).slice(0, 5)
      : [...era.baseEnvironment.opportunities],
    nearbyLife: Array.isArray(raw?.nearbyLife)
      ? raw!.nearbyLife.map(String).slice(0, 6)
      : [...era.baseEnvironment.nearbyLife],
    notes: raw?.notes ? String(raw.notes) : era.baseEnvironment.notes,
  };
}

function normalizeNode(raw: AiNodePayload, era: EraDef): GeneratedEvent {
  const choices = (Array.isArray(raw.choices) ? raw.choices : [])
    .filter((c) => c && c.text)
    .slice(0, 4)
    .map((c, i) => ({
      id: String(c.id || `opt_${i}`),
      text: String(c.text),
      dangerHint: c.dangerHint ? String(c.dangerHint) : undefined,
      successRate: c.successRate === undefined ? 1 : clamp(Number(c.successRate), 0.2, 1),
      successText: c.successText ? String(c.successText) : undefined,
      failText: c.failText ? String(c.failText) : undefined,
      yearAdvanceMa: c.yearAdvanceMa === undefined ? undefined : Math.max(0, Number(c.yearAdvanceMa)),
      fitnessDelta: c.fitnessDelta === undefined ? undefined : Number(c.fitnessDelta),
      gainTrait: c.gainTrait ? String(c.gainTrait) : undefined,
      nextNodeId: c.next === undefined || c.next === null ? null : String(c.next),
    }));

  if (choices.length < 2) {
    throw new Error(`节点 ${raw.id} 选项不足`);
  }

  return {
    id: String(raw.id || `node_${Date.now().toString(36)}`),
    title: String(raw.title || '无名波动'),
    text: String(raw.text || '环境悄然变化。'),
    choices,
    environment: normalizeEnv(raw.environment, era),
  };
}

function extractJson(content: string): AiBatchPayload {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fenced ? fenced[1].trim() : trimmed;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('AI 未返回 JSON');
  return JSON.parse(text.slice(start, end + 1)) as AiBatchPayload;
}

function repairBatch(batch: EventBatch, depth: number): EventBatch {
  const ids = new Set(Object.keys(batch.nodes));
  if (!ids.has(batch.startId)) {
    const first = Object.keys(batch.nodes)[0];
    if (!first) throw new Error('分支树为空');
    batch.startId = first;
  }

  for (const node of Object.values(batch.nodes)) {
    for (const choice of node.choices) {
      if (choice.nextNodeId && !ids.has(choice.nextNodeId)) {
        choice.nextNodeId = null;
      }
    }
  }

  batch.depth = depth;
  return batch;
}

export async function generateAiBatch(era: EraDef, save: GameSave, depth: number): Promise<EventBatch> {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) throw new Error('未配置 DEEPSEEK_API_KEY');

  const { system, user } = buildPrompt(era, save, depth);
  const started = Date.now();

  console.log(
    `[DeepSeek] → 预推演分支树 | 模型=${MODEL} | 纪元=${era.label} | 深度=${depth} | 时间=${formatYearLabel(save.yearMa)} | 适应=${save.fitness}`,
  );

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.85,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  const ms = Date.now() - started;

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`[DeepSeek] ✖ 失败 | ${ms}ms | HTTP ${res.status} | ${errText.slice(0, 160)}`);
    throw new Error(`DeepSeek 请求失败 (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error(`[DeepSeek] ✖ 失败 | ${ms}ms | 返回内容为空`);
    throw new Error('DeepSeek 返回为空');
  }

  const raw = extractJson(content);
  const list = Array.isArray(raw.nodes) ? raw.nodes : [];
  if (list.length < Math.max(1, depth)) {
    throw new Error(`分支树节点过少：${list.length}`);
  }

  const nodes: Record<string, GeneratedEvent> = {};
  for (const item of list) {
    const node = normalizeNode(item, era);
    nodes[node.id] = node;
  }

  const batch = repairBatch(
    {
      id: `batch_${Date.now().toString(36)}`,
      startId: String(raw.startId || list[0].id),
      depth: Number(raw.depth) || depth,
      nodes,
    },
    depth,
  );

  if (!batch.nodes[batch.startId]) {
    throw new Error('起始节点无效');
  }

  const usage = data.usage;
  const tokenPart = usage
    ? ` | tokens=${usage.total_tokens ?? '?'}(提示${usage.prompt_tokens ?? '?'}/补全${usage.completion_tokens ?? '?'})`
    : '';

  console.log(
    `[DeepSeek] ← 分支树就绪 | ${ms}ms${tokenPart} | 节点=${Object.keys(batch.nodes).length} | 深度=${batch.depth} | 起点=${batch.startId}`,
  );
  console.log(
    `[DeepSeek]   首事件「${batch.nodes[batch.startId].title}」 | 选项=${batch.nodes[batch.startId].choices.length}`,
  );

  return batch;
}
