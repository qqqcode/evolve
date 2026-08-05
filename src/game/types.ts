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
}
