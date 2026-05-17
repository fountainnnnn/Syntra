import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import type { OpportunityStage, Snapshot, SyntraState } from "../types.js";
import { createSeedState } from "./seed.js";

const statePath = path.resolve(process.cwd(), config.dbPath);

export function getStatePath(): string {
  return statePath;
}

export function ensureState(): SyntraState {
  if (!existsSync(statePath)) {
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }

  return JSON.parse(readFileSync(statePath, "utf8")) as SyntraState;
}

export function saveState(state: SyntraState): void {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2), "utf8");
}

export function resetState(): SyntraState {
  const seed = createSeedState();
  saveState(seed);
  return seed;
}

export function updateState(mutator: (state: SyntraState) => void): SyntraState {
  const state = ensureState();
  mutator(state);
  state.updatedAt = new Date().toISOString();
  saveState(state);
  return state;
}

export function appendLog(state: SyntraState, line: string): void {
  state.verificationLog = [`${new Date().toISOString()} ${line}`, ...state.verificationLog].slice(0, 30);
}

export function buildSnapshot(state = ensureState()): Snapshot {
  const revenueAtRisk = state.opportunities
    .filter((opportunity) => /risk|urgent|miss|delay|churn|vendor/i.test(opportunity.risk))
    .reduce((sum, opportunity) => sum + opportunity.value, 0);

  const pipelineCounts = state.opportunities.reduce((acc, opportunity) => {
    acc[opportunity.stage] = (acc[opportunity.stage] ?? 0) + 1;
    return acc;
  }, {} as Record<OpportunityStage, number>);

  for (const stage of ["New Inquiry", "Qualified", "Waiting Reply", "Proposal Needed", "Proposal Sent", "Negotiation", "Won", "Lost"] as OpportunityStage[]) {
    pipelineCounts[stage] ??= 0;
  }

  return {
    metrics: {
      activeConversations: state.conversations.filter((conversation) => conversation.status !== "resolved").length,
      revenueAtRisk,
      unresolvedIssues: state.tasks.filter((task) => task.status !== "done").length,
      averageResponseTime: "1h 58m"
    },
    customers: state.customers,
    conversations: [...state.conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    messages: [...state.messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    tasks: state.tasks,
    opportunities: state.opportunities,
    insights: state.insights,
    pipelineCounts,
    teamMetrics: state.teamMetrics,
    openaiStatus: state.openaiStatus,
    telegramStatus: state.telegramStatus,
    verificationLog: state.verificationLog,
    updatedAt: state.updatedAt
  };
}
