export type StageId =
  | 'microbe'
  | 'multicell'
  | 'fish'
  | 'amphibian'
  | 'reptile'
  | 'mammal'
  | 'primate'
  | 'human'
  | 'tribe'
  | 'ending';

export type NodeMode = 'milestone' | 'event' | 'death' | 'ending';

export interface Choice {
  id: string;
  text: string;
  dangerHint?: string;
  successRate?: number;
  successText?: string;
  failText?: string;
  yearAdvanceMa?: number;
  fitnessDelta?: number;
  gainTrait?: string;
  /** 成功后进入同批节点；null/缺省且无下一批时表示本批结束 */
  nextNodeId?: string | null;
}

export interface EnvironmentInfo {
  habitat: string;
  climate: string;
  suitability: number;
  threats: string[];
  opportunities: string[];
  nearbyLife: string[];
  notes?: string;
}

export interface GeneratedEvent {
  id: string;
  title: string;
  text: string;
  choices: Choice[];
  environment: EnvironmentInfo;
}

/** 一次 DeepSeek 预生成的分支树（沿任意路径约 depth 次事件） */
export interface EventBatch {
  id: string;
  startId: string;
  depth: number;
  nodes: Record<string, GeneratedEvent>;
}

export interface MilestoneChoice extends Choice {
  enterEvents?: boolean;
}

export interface EraDef {
  id: StageId;
  label: string;
  yearLabel: string;
  yearMa: number;
  form: string;
  milestoneTitle: string;
  milestoneText: string;
  eventsBeforeNext: number;
  baseEnvironment: EnvironmentInfo;
  choices: MilestoneChoice[];
}

/** 预缓存下一段分支树的匹配键 */
export interface PendingBatchFor {
  kind: 'after_milestone' | 'after_path';
  eraId: StageId;
  stepsInEra: number;
}

export interface GameSave {
  eraId: StageId;
  checkpointEraId: StageId;
  mode: NodeMode;
  event: GeneratedEvent | null;
  batch: EventBatch | null;
  batchNodeId: string | null;
  death: { title: string; text: string } | null;
  stepsInEra: number;
  yearMa: number;
  traits: string[];
  fitness: number;
  deaths: number;
  historySummary: string[];
  environment: EnvironmentInfo;
  /** 已预生成、待进入的下一段分支树 */
  pendingBatch: EventBatch | null;
  pendingFor: PendingBatchFor | null;
  /**
   * 绑定到固有检查点的分支树缓存。
   * 死亡重生回检查点时可直接复用，无需重新请求 DeepSeek。
   */
  checkpointBatch: EventBatch | null;
  checkpointBatchEraId: StageId | null;
  updatedAt: string;
}

export interface GameStateView {
  save: GameSave;
  stageLabel: string;
  stageIndex: number;
  stageTotal: number;
  yearLabel: string;
  form: string;
  title: string;
  text: string;
  choices: Choice[];
  isCheckpoint: boolean;
  isDeath: boolean;
  isEnding: boolean;
  aiEnabled: boolean;
  batchInfo?: string;
  generating?: boolean;
  /** 下一段内容是否已预缓存，点击可瞬时进入 */
  prefetchReady?: boolean;
  /** 当前页是否需要下一段分支树（离开检查点 / 走出本批叶节点） */
  prefetchNeeded?: boolean;
}
