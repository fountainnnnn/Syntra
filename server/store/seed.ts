import type { SyntraState } from "../types.js";
import { config } from "../config.js";

const now = new Date("2026-05-17T04:00:00.000Z").toISOString();

export function createSeedState(): SyntraState {
  return {
    seededAt: now,
    updatedAt: now,
    customers: [
      customer("cus_sarah", "Sarah Tan", "@sarahtan", "at_risk", "Existing client", "negative", "Refund complaint", 180, 1, "Maya"),
      customer("cus_jason", "Jason Lim", "@jasonlim", "lead", "Corporate", "frustrated", "Corporate invoice request", 3000, 0, "Ilya"),
      customer("cus_aisyah", "Nur Aisyah", "@nuraisyah", "at_risk", "Wedding", "frustrated", "Delivery delay", 400, 1, "Maya"),
      customer("cus_clara", "Clara Wong", "@claraw", "active", "Booking", "frustrated", "Payment confirmation", 900, 1, "Ravi"),
      customer("cus_marcus", "Marcus Ong", "@marcusong", "lead", "Upsell", "positive", "Package upgrade", 650, 0, "Ilya"),
      customer("cus_wei", "Wei Studio", "@weistudio", "lead", "Partnership", "positive", "Corporate partnership", 5200, 0, "Ilya"),
      customer("cus_nadine", "Nadine Lee", "@nadinelee", "active", "Support", "neutral", "Album delivery question", 120, 0, "Ravi")
    ],
    conversations: [
      conversation("con_sarah", "cus_sarah", "Refund Complaint", "Refund request", "high", "negative", "open", "Maya", "Check refund status", "Sarah has asked three times about a missing refund.", 0.91, "seed"),
      conversation("con_jason", "cus_jason", "Corporate Event Lead", "Corporate quotation and invoice", "high", "frustrated", "waiting_reply", "Ilya", "Send quote and invoice today", "Jason is a high-value corporate lead waiting for confirmation.", 0.88, "seed"),
      conversation("con_aisyah", "cus_aisyah", "Delivery Delay", "Photo delivery delay", "medium", "frustrated", "open", "Maya", "Update delivery ETA", "Delivery date was missed and sentiment is deteriorating.", 0.84, "seed"),
      conversation("con_clara", "cus_clara", "Payment Confirmation", "Payment confirmation", "high", "frustrated", "waiting_reply", "Ravi", "Confirm payment transfer", "Clara paid yesterday and needs booking confirmation.", 0.86, "seed"),
      conversation("con_marcus", "cus_marcus", "Package Upgrade", "Package upgrade", "medium", "positive", "open", "Ilya", "Prepare upgrade options", "Marcus wants same-day highlights added to his package.", 0.79, "seed"),
      conversation("con_wei", "cus_wei", "Partnership Inquiry", "Corporate partnership", "medium", "positive", "open", "Ilya", "Prepare quote deck", "Wei Studio may need 200-pax coverage and pricing.", 0.82, "seed"),
      conversation("con_nadine", "cus_nadine", "Album Delivery", "Album delivery question", "low", "neutral", "open", "Ravi", "Send album delivery update", "Nadine needs an album delivery update.", 0.73, "seed")
    ],
    messages: [
      message("msg_sarah", "con_sarah", "cus_sarah", "Still haven't received my refund. I've asked three times already.", "seed"),
      message("msg_jason", "con_jason", "cus_jason", "We need a corporate event photographer next Friday. Can you send quotation today?", "seed"),
      message("msg_aisyah", "con_aisyah", "cus_aisyah", "The photos were supposed to arrive yesterday. Any update?", "seed"),
      message("msg_clara", "con_clara", "cus_clara", "I paid yesterday but no one confirmed my booking.", "seed"),
      message("msg_marcus", "con_marcus", "cus_marcus", "Can I upgrade my package to include same-day highlights?", "seed"),
      message("msg_wei", "con_wei", "cus_wei", "Our company may need coverage for 200 pax. Please send pricing.", "seed"),
      message("msg_nadine", "con_nadine", "cus_nadine", "When will my album be delivered?", "seed")
    ],
    tasks: [
      task("task_refund", "Check refund status", "cus_sarah", "con_sarah", "msg_sarah", "Maya", "high"),
      task("task_invoice", "Send corporate invoice", "cus_jason", "con_jason", "msg_jason", "Ilya", "high"),
      task("task_eta", "Update delivery ETA", "cus_aisyah", "con_aisyah", "msg_aisyah", "Maya", "medium"),
      task("task_payment", "Confirm payment transfer", "cus_clara", "con_clara", "msg_clara", "Ravi", "high"),
      task("task_upgrade", "Prepare upgrade options", "cus_marcus", "con_marcus", "msg_marcus", "Ilya", "medium"),
      task("task_quote", "Prepare quote deck", "cus_wei", "con_wei", "msg_wei", "Ilya", "medium")
    ],
    opportunities: [
      opportunity("opp_jason", "cus_jason", "con_jason", "Proposal Needed", 3000, "Corporate quotation", "frustrated", "Revenue risk if invoice misses today", "Send quote and invoice", "seed"),
      opportunity("opp_marcus", "cus_marcus", "con_marcus", "Qualified", 650, "Package upgrade", "positive", "Low risk", "Send upgrade options", "seed"),
      opportunity("opp_wei", "cus_wei", "con_wei", "New Inquiry", 5200, "Corporate partnership", "positive", "Needs fast pricing response", "Prepare quote deck", "seed")
    ],
    insights: [
      insight("ins_refund", "Refund complaints increased this week", "Refunds", "high", 3, "+28%", "Assign finance owner for refund tickets today.", ["con_sarah"]),
      insight("ins_invoice", "Corporate leads are waiting for invoices", "Pipeline", "high", 2, "+16%", "Create a same-day invoice SLA for corporate leads.", ["con_jason", "con_wei"]),
      insight("ins_payment", "Payment confirmations are recurring support work", "Payments", "medium", 4, "+11%", "Automate payment acknowledgement checks.", ["con_clara"]),
      insight("ins_response", "Slow response correlates with negative sentiment", "Response time", "medium", 5, "+9%", "Escalate conversations with no reply after 2 hours.", ["con_sarah", "con_aisyah", "con_clara"])
    ],
    teamMetrics: [
      { owner: "Maya", openTasks: 3, overdue: 1, avgResponseTime: "2h 10m", workload: 82 },
      { owner: "Ilya", openTasks: 4, overdue: 0, avgResponseTime: "1h 25m", workload: 76 },
      { owner: "Ravi", openTasks: 2, overdue: 1, avgResponseTime: "2h 40m", workload: 64 }
    ],
    openaiStatus: {
      configured: false,
      status: "verified_mock_only",
      model: config.openaiModel
    },
    telegramStatus: {
      configured: false,
      status: "pending_missing_secret",
      outboundEnabled: config.telegramOutboundEnabled
    },
    verificationLog: [`${new Date().toISOString()} Seeded ${config.businessName} demo data.`]
  };
}

function customer(id: string, name: string, handle: string, status: SyntraState["customers"][number]["status"], segment: string, sentiment: SyntraState["customers"][number]["sentiment"], intent: string, value: number, openIssues: number, owner: string) {
  return { id, name, telegramHandle: handle, status, segment, sentiment, latestIntent: intent, value, openIssues, lastContactAt: now, owner };
}

function conversation(id: string, customerId: string, title: string, intent: string, priority: SyntraState["conversations"][number]["priority"], sentiment: SyntraState["conversations"][number]["sentiment"], status: SyntraState["conversations"][number]["status"], owner: string, suggestedAction: string, aiSummary: string, confidence: number, source: SyntraState["conversations"][number]["source"]) {
  return { id, customerId, title, intent, priority, sentiment, status, owner, lastMessageAt: now, suggestedAction, aiSummary, confidence, source };
}

function message(id: string, conversationId: string, customerId: string, text: string, source: SyntraState["messages"][number]["source"]) {
  return { id, conversationId, customerId, direction: "inbound" as const, text, source, createdAt: now };
}

function task(id: string, title: string, customerId: string, conversationId: string, sourceMessageId: string, owner: string, priority: SyntraState["tasks"][number]["priority"]) {
  return { id, title, customerId, conversationId, sourceMessageId, owner, priority, dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: "open" as const, sourceText: title };
}

function opportunity(id: string, customerId: string, conversationId: string, stage: SyntraState["opportunities"][number]["stage"], value: number, intent: string, sentiment: SyntraState["opportunities"][number]["sentiment"], risk: string, nextAction: string, source: SyntraState["opportunities"][number]["source"]) {
  return { id, customerId, conversationId, stage, value, intent, sentiment, risk, nextAction, source, updatedAt: now };
}

function insight(id: string, title: string, category: string, severity: SyntraState["insights"][number]["severity"], count: number, trend: string, recommendation: string, evidenceConversationIds: string[]) {
  return { id, title, category, severity, count, trend, recommendation, evidenceConversationIds };
}
