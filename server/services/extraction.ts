import OpenAI from "openai";
import { config, isPlaceholderSecret } from "../config.js";
import type { ExtractionResult, OpportunityStage, Priority, Sentiment } from "../types.js";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: { type: "string" },
    priority: { type: "string", enum: ["low", "medium", "high"] },
    sentiment: { type: "string", enum: ["positive", "neutral", "frustrated", "negative"] },
    summary: { type: "string" },
    suggestedAction: { type: "string" },
    tasks: { type: "array", items: { type: "string" } },
    opportunity: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            value: { type: "number" },
            stage: { type: "string" },
            risk: { type: "string" }
          },
          required: ["value", "stage", "risk"]
        },
        { type: "null" }
      ]
    },
    issueCluster: { type: "string" },
    confidence: { type: "number" }
  },
  required: ["intent", "priority", "sentiment", "summary", "suggestedAction", "tasks", "opportunity", "issueCluster", "confidence"]
} as const;

export async function extractMessage(text: string): Promise<{ result: ExtractionResult; mode: "real" | "fallback"; error?: string }> {
  if (!isPlaceholderSecret(config.openaiApiKey)) {
    try {
      const client = new OpenAI({ apiKey: config.openaiApiKey });
      const response = await client.responses.create({
        model: config.openaiModel,
        input: [
          {
            role: "system",
            content: "Extract customer operations state from Telegram support messages for an event photography company. Return only valid structured JSON."
          },
          { role: "user", content: text }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "syntra_extraction",
            schema,
            strict: true
          }
        }
      });
      const raw = response.output_text ?? "{}";
      return { result: normalizeExtraction(JSON.parse(raw) as Partial<ExtractionResult>, text), mode: "real" };
    } catch (error) {
      return {
        result: fallbackExtract(text),
        mode: "fallback",
        error: error instanceof Error ? error.message : "OpenAI extraction failed"
      };
    }
  }

  return { result: fallbackExtract(text), mode: "fallback" };
}

export function fallbackExtract(text: string): ExtractionResult {
  const highRisk = /(urgent|today|no one replied|another vendor|refund|paid|invoice|complaint|angry|three times)/i.test(text);
  const corporate = /(corporate|company|pax|invoice|quotation|quote|vendor)/i.test(text);
  const payment = /(paid|payment|invoice|transfer|confirm)/i.test(text);
  const delivery = /(deliver|delivery|photos|album|yesterday|eta)/i.test(text);
  const refund = /(refund|cancel|churn|angry|three times)/i.test(text);
  const upgrade = /(upgrade|same-day|highlights|package)/i.test(text);

  const priority: Priority = highRisk ? "high" : corporate || delivery || payment ? "medium" : "low";
  const sentiment: Sentiment = refund ? "negative" : highRisk || delivery || payment ? "frustrated" : upgrade || corporate ? "positive" : "neutral";
  const intent = refund
    ? "Refund complaint"
    : corporate
      ? "Corporate invoice and quotation"
      : payment
        ? "Payment confirmation"
        : delivery
          ? "Delivery delay"
          : upgrade
            ? "Package upgrade"
            : "Customer follow-up";

  const tasks = [
    payment || corporate ? "Send invoice and confirmation" : undefined,
    refund ? "Check refund status" : undefined,
    delivery ? "Update delivery ETA" : undefined,
    upgrade ? "Send upgrade options" : undefined,
    highRisk ? "Escalate same-day follow-up" : undefined
  ].filter(Boolean) as string[];

  if (tasks.length === 0) tasks.push("Reply to customer with next step");

  return {
    intent,
    priority,
    sentiment,
    summary: text.length > 140 ? `${text.slice(0, 137)}...` : text,
    suggestedAction: tasks[0] ?? "Reply to customer",
    tasks,
    opportunity: corporate || upgrade || /vendor|booking/i.test(text)
      ? {
          value: corporate ? 3000 : upgrade ? 650 : 900,
          stage: corporate ? "Proposal Needed" : "Qualified",
          risk: highRisk ? "Revenue risk if follow-up misses today" : "Needs timely follow-up"
        }
      : refund || highRisk
        ? { value: 180, stage: "Waiting Reply", risk: "Churn or refund risk" }
        : undefined,
    issueCluster: refund ? "Refunds" : payment ? "Payments" : delivery ? "Delivery" : corporate ? "Corporate leads" : "General support",
    confidence: 0.74
  };
}

function normalizeExtraction(input: Partial<ExtractionResult>, text: string): ExtractionResult {
  const fallback = fallbackExtract(text);
  const validStage = (input.opportunity?.stage ?? fallback.opportunity?.stage ?? "Qualified") as OpportunityStage;

  return {
    intent: input.intent || fallback.intent,
    priority: isPriority(input.priority) ? input.priority : fallback.priority,
    sentiment: isSentiment(input.sentiment) ? input.sentiment : fallback.sentiment,
    summary: input.summary || fallback.summary,
    suggestedAction: input.suggestedAction || fallback.suggestedAction,
    tasks: input.tasks?.length ? input.tasks : fallback.tasks,
    opportunity: input.opportunity
      ? {
          value: Number(input.opportunity.value || fallback.opportunity?.value || 0),
          stage: validStage,
          risk: input.opportunity.risk || fallback.opportunity?.risk || "Needs follow-up"
        }
      : fallback.opportunity,
    issueCluster: input.issueCluster || fallback.issueCluster,
    confidence: Math.max(0.1, Math.min(0.99, Number(input.confidence || fallback.confidence)))
  };
}

function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

function isSentiment(value: unknown): value is Sentiment {
  return value === "positive" || value === "neutral" || value === "frustrated" || value === "negative";
}
