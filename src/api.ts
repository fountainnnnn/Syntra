import type { Snapshot, TaskStatus, OpportunityStage } from "./types";

export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(new URL(path, apiBaseURL), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers
    }
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return (await response.json()) as T;
}

export function fetchSnapshot(): Promise<Snapshot> {
  return request<Snapshot>("/api/snapshot");
}

export function injectDemo(text?: string) {
  return request("/api/demo/inject", {
    method: "POST",
    body: JSON.stringify({
      name: "Dashboard Demo Lead",
      text: text || "Hi, I booked a corporate event package last week but no one replied with the invoice. We need confirmation today or we'll find another vendor."
    })
  });
}

export function updateTaskStatus(id: string, status: TaskStatus) {
  return request(`/api/tasks/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
}

export function updateOpportunityStage(id: string, stage: OpportunityStage) {
  return request(`/api/opportunities/${id}/stage`, { method: "POST", body: JSON.stringify({ stage }) });
}

export function sendTelegramReply(conversationId: string, text: string) {
  return request("/api/telegram/send-reply", { method: "POST", body: JSON.stringify({ conversationId, text }) });
}

export function seedDemoData() {
  return request("/api/system/seed", { method: "POST", body: "{}" });
}
