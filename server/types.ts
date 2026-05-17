export type Priority = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "frustrated" | "negative";
export type TaskStatus = "open" | "in_progress" | "blocked" | "done";
export type OpportunityStage =
  | "New Inquiry"
  | "Qualified"
  | "Waiting Reply"
  | "Proposal Needed"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export interface Customer {
  id: string;
  name: string;
  telegramHandle?: string;
  telegramChatId?: string;
  status: "lead" | "active" | "at_risk" | "resolved";
  segment: string;
  sentiment: Sentiment;
  latestIntent: string;
  value: number;
  openIssues: number;
  lastContactAt: string;
  owner: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  title: string;
  intent: string;
  priority: Priority;
  sentiment: Sentiment;
  status: "open" | "waiting_reply" | "resolved";
  owner: string;
  lastMessageAt: string;
  suggestedAction: string;
  aiSummary: string;
  confidence: number;
  source: "seed" | "telegram" | "demo";
}

export interface Message {
  id: string;
  conversationId: string;
  customerId: string;
  direction: "inbound" | "outbound";
  text: string;
  source: "seed" | "telegram" | "demo" | "system";
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  customerId: string;
  conversationId: string;
  sourceMessageId: string;
  owner: string;
  priority: Priority;
  dueAt: string;
  status: TaskStatus;
  sourceText: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  conversationId: string;
  stage: OpportunityStage;
  value: number;
  intent: string;
  sentiment: Sentiment;
  risk: string;
  nextAction: string;
  source: "seed" | "telegram" | "demo";
  updatedAt: string;
}

export interface Insight {
  id: string;
  title: string;
  category: string;
  severity: Priority;
  count: number;
  trend: string;
  recommendation: string;
  evidenceConversationIds: string[];
}

export interface TeamMetric {
  owner: string;
  openTasks: number;
  overdue: number;
  avgResponseTime: string;
  workload: number;
}

export interface ExtractionResult {
  intent: string;
  priority: Priority;
  sentiment: Sentiment;
  summary: string;
  suggestedAction: string;
  tasks: string[];
  opportunity?: {
    value: number;
    stage: OpportunityStage;
    risk: string;
  };
  issueCluster: string;
  confidence: number;
}

export interface ApiStatus {
  configured: boolean;
  status: "verified_real_api" | "pending_missing_secret" | "failed_real_api" | "verified_mock_only";
  lastCheckedAt?: string;
  error?: string;
  model?: string;
}

export interface TelegramStatus extends ApiStatus {
  botUsername?: string;
  botId?: number;
  outboundEnabled: boolean;
  lastPollAt?: string;
  lastMessageAt?: string;
  lastChatId?: string;
  lastUsername?: string;
  lastIntent?: string;
}

export interface SyntraState {
  customers: Customer[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  opportunities: Opportunity[];
  insights: Insight[];
  teamMetrics: TeamMetric[];
  openaiStatus: ApiStatus;
  telegramStatus: TelegramStatus;
  verificationLog: string[];
  seededAt: string;
  updatedAt: string;
}

export interface Snapshot {
  metrics: {
    activeConversations: number;
    revenueAtRisk: number;
    unresolvedIssues: number;
    averageResponseTime: string;
  };
  customers: Customer[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  opportunities: Opportunity[];
  insights: Insight[];
  pipelineCounts: Record<OpportunityStage, number>;
  teamMetrics: TeamMetric[];
  openaiStatus: ApiStatus;
  telegramStatus: TelegramStatus;
  verificationLog: string[];
  updatedAt: string;
}
