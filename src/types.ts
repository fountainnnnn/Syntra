export type Priority = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "frustrated" | "negative";
export type TaskStatus = "open" | "in_progress" | "blocked" | "done";
export type OpportunityStage = "New Inquiry" | "Qualified" | "Waiting Reply" | "Proposal Needed" | "Proposal Sent" | "Negotiation" | "Won" | "Lost";

export interface Customer {
  id: string;
  name: string;
  telegramHandle?: string;
  telegramChatId?: string;
  status: string;
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
  status: string;
  owner: string;
  lastMessageAt: string;
  suggestedAction: string;
  aiSummary: string;
  confidence: number;
  source: string;
}

export interface Message {
  id: string;
  conversationId: string;
  customerId: string;
  direction: "inbound" | "outbound";
  text: string;
  source: string;
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
  source: string;
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
  teamMetrics: Array<{ owner: string; openTasks: number; overdue: number; avgResponseTime: string; workload: number }>;
  openaiStatus: { configured: boolean; status: string; model?: string; error?: string; lastCheckedAt?: string };
  telegramStatus: { configured: boolean; status: string; botUsername?: string; outboundEnabled: boolean; lastPollAt?: string; lastMessageAt?: string; lastIntent?: string };
  verificationLog: string[];
  updatedAt: string;
}
