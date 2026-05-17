import { randomUUID } from "node:crypto";
import type { Customer, Message } from "../types.js";
import { appendLog, updateState } from "../store/state.js";
import { extractMessage } from "./extraction.js";

interface IncomingMessageInput {
  text: string;
  name?: string;
  telegramChatId?: string;
  telegramUsername?: string;
  source: "telegram" | "demo";
}

export async function processIncomingMessage(input: IncomingMessageInput) {
  const extraction = await extractMessage(input.text);
  const timestamp = new Date().toISOString();
  const ids = {
    customerId: "",
    conversationId: "",
    messageId: `msg_${randomUUID()}`
  };

  const state = updateState((draft) => {
    let customer = findCustomer(draft.customers, input);
    if (!customer) {
      customer = {
        id: `cus_${randomUUID()}`,
        name: input.name || input.telegramUsername || `Telegram ${input.telegramChatId ?? "Customer"}`,
        telegramHandle: input.telegramUsername ? `@${input.telegramUsername.replace(/^@/, "")}` : undefined,
        telegramChatId: input.telegramChatId,
        status: extraction.result.priority === "high" ? "at_risk" : extraction.result.opportunity ? "lead" : "active",
        segment: extraction.result.opportunity ? "Lead" : "Support",
        sentiment: extraction.result.sentiment,
        latestIntent: extraction.result.intent,
        value: extraction.result.opportunity?.value ?? 0,
        openIssues: extraction.result.priority === "high" ? 1 : 0,
        lastContactAt: timestamp,
        owner: extraction.result.priority === "high" ? "Maya" : "Ilya"
      };
      draft.customers.push(customer);
    }

    customer.sentiment = extraction.result.sentiment;
    customer.latestIntent = extraction.result.intent;
    customer.lastContactAt = timestamp;
    customer.status = extraction.result.priority === "high" ? "at_risk" : customer.status;
    if (input.telegramChatId) customer.telegramChatId = input.telegramChatId;
    if (input.telegramUsername) customer.telegramHandle = `@${input.telegramUsername.replace(/^@/, "")}`;

    let conversation = draft.conversations.find(
      (item) => item.customerId === customer.id && item.status !== "resolved"
    );
    if (!conversation) {
      conversation = {
        id: `con_${randomUUID()}`,
        customerId: customer.id,
        title: extraction.result.intent,
        intent: extraction.result.intent,
        priority: extraction.result.priority,
        sentiment: extraction.result.sentiment,
        status: extraction.result.priority === "high" ? "waiting_reply" : "open",
        owner: customer.owner,
        lastMessageAt: timestamp,
        suggestedAction: extraction.result.suggestedAction,
        aiSummary: extraction.result.summary,
        confidence: extraction.result.confidence,
        source: input.source
      };
      draft.conversations.push(conversation);
    }

    conversation.intent = extraction.result.intent;
    conversation.priority = extraction.result.priority;
    conversation.sentiment = extraction.result.sentiment;
    conversation.status = extraction.result.priority === "high" ? "waiting_reply" : conversation.status;
    conversation.lastMessageAt = timestamp;
    conversation.suggestedAction = extraction.result.suggestedAction;
    conversation.aiSummary = extraction.result.summary;
    conversation.confidence = extraction.result.confidence;
    conversation.source = input.source;

    const message: Message = {
      id: ids.messageId,
      conversationId: conversation.id,
      customerId: customer.id,
      direction: "inbound",
      text: input.text,
      source: input.source,
      createdAt: timestamp
    };
    draft.messages.push(message);

    for (const title of extraction.result.tasks) {
      draft.tasks.push({
        id: `task_${randomUUID()}`,
        title,
        customerId: customer.id,
        conversationId: conversation.id,
        sourceMessageId: message.id,
        owner: conversation.owner,
        priority: extraction.result.priority,
        dueAt: new Date(Date.now() + (extraction.result.priority === "high" ? 4 : 24) * 60 * 60 * 1000).toISOString(),
        status: "open",
        sourceText: input.text
      });
    }

    if (extraction.result.opportunity) {
      draft.opportunities.push({
        id: `opp_${randomUUID()}`,
        customerId: customer.id,
        conversationId: conversation.id,
        stage: extraction.result.opportunity.stage,
        value: extraction.result.opportunity.value,
        intent: extraction.result.intent,
        sentiment: extraction.result.sentiment,
        risk: extraction.result.opportunity.risk,
        nextAction: extraction.result.suggestedAction,
        source: input.source,
        updatedAt: timestamp
      });
      customer.value = Math.max(customer.value, extraction.result.opportunity.value);
    }

    const cluster = draft.insights.find((item) => item.category === extraction.result.issueCluster);
    if (cluster) {
      cluster.count += 1;
      cluster.evidenceConversationIds = Array.from(new Set([conversation.id, ...cluster.evidenceConversationIds])).slice(0, 5);
    } else {
      draft.insights.unshift({
        id: `ins_${randomUUID()}`,
        title: `${extraction.result.issueCluster} cluster detected`,
        category: extraction.result.issueCluster,
        severity: extraction.result.priority,
        count: 1,
        trend: "new",
        recommendation: extraction.result.suggestedAction,
        evidenceConversationIds: [conversation.id]
      });
    }

    draft.openaiStatus = {
      configured: extraction.mode === "real",
      status: extraction.mode === "real" ? "verified_real_api" : "verified_mock_only",
      model: draft.openaiStatus.model,
      error: extraction.error,
      lastCheckedAt: timestamp
    };

    draft.telegramStatus.lastMessageAt = input.source === "telegram" ? timestamp : draft.telegramStatus.lastMessageAt;
    draft.telegramStatus.lastChatId = input.telegramChatId ?? draft.telegramStatus.lastChatId;
    draft.telegramStatus.lastUsername = input.telegramUsername ?? draft.telegramStatus.lastUsername;
    draft.telegramStatus.lastIntent = extraction.result.intent;
    appendLog(draft, `Processed ${input.source} message for ${customer.name}: ${extraction.result.intent}.`);

    ids.customerId = customer.id;
    ids.conversationId = conversation.id;
  });

  return { state, extraction: extraction.result, ids };
}

function findCustomer(customers: Customer[], input: IncomingMessageInput): Customer | undefined {
  if (input.telegramChatId) {
    const byChat = customers.find((customer) => customer.telegramChatId === input.telegramChatId);
    if (byChat) return byChat;
  }

  if (input.name) {
    return customers.find((customer) => customer.name.toLowerCase() === input.name?.toLowerCase());
  }

  return undefined;
}
