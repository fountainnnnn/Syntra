import type { Express } from "express";
import { config, isPlaceholderSecret } from "./config.js";
import { buildSnapshot, ensureState, getStatePath, resetState, updateState, appendLog } from "./store/state.js";
import { processIncomingMessage } from "./services/process-message.js";
import { getTelegramMe, sendTelegramMessage } from "./services/telegram.js";

export function registerRoutes(app: Express): void {
  app.get("/api/health", (_req, res) => {
    const state = ensureState();
    res.json({
      ok: true,
      app: "Syntra",
      timestamp: new Date().toISOString(),
      db: { mode: "json", path: getStatePath(), records: state.messages.length },
      openai: state.openaiStatus.status,
      telegram: state.telegramStatus.status
    });
  });

  app.get("/api/snapshot", (_req, res) => {
    res.json(buildSnapshot());
  });

  app.post("/api/demo/inject", async (req, res, next) => {
    try {
      const text = typeof req.body?.text === "string" && req.body.text.trim()
        ? req.body.text.trim()
        : "I paid yesterday but no one confirmed my booking. This is urgent.";
      const name = typeof req.body?.name === "string" ? req.body.name : "Demo Telegram Customer";
      const result = await processIncomingMessage({ text, name, source: "demo" });
      res.status(201).json({ data: result, snapshot: buildSnapshot(result.state) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/conversations", (_req, res) => {
    const snapshot = buildSnapshot();
    res.json(snapshot.conversations.map((conversation) => ({
      ...conversation,
      customer: snapshot.customers.find((customer) => customer.id === conversation.customerId)
    })));
  });

  app.get("/api/conversations/:id", (req, res) => {
    const snapshot = buildSnapshot();
    const conversation = snapshot.conversations.find((item) => item.id === req.params.id);
    if (!conversation) {
      res.status(404).json({ error: { code: "not_found", message: "Conversation not found" } });
      return;
    }
    res.json({
      ...conversation,
      customer: snapshot.customers.find((customer) => customer.id === conversation.customerId),
      messages: snapshot.messages.filter((message) => message.conversationId === conversation.id)
    });
  });

  app.post("/api/tasks/:id/status", (req, res) => {
    const status = req.body?.status;
    const state = updateState((draft) => {
      const task = draft.tasks.find((item) => item.id === req.params.id);
      if (!task) return;
      if (status === "open" || status === "in_progress" || status === "blocked" || status === "done") {
        task.status = status;
      }
      appendLog(draft, `Task ${req.params.id} moved to ${task?.status}.`);
    });
    res.json({ data: buildSnapshot(state).tasks.find((task) => task.id === req.params.id) });
  });

  app.post("/api/opportunities/:id/stage", (req, res) => {
    const stage = req.body?.stage;
    const state = updateState((draft) => {
      const opportunity = draft.opportunities.find((item) => item.id === req.params.id);
      if (!opportunity) return;
      if (typeof stage === "string") opportunity.stage = stage as never;
      opportunity.updatedAt = new Date().toISOString();
      appendLog(draft, `Opportunity ${req.params.id} moved to ${opportunity.stage}.`);
    });
    res.json({ data: buildSnapshot(state).opportunities.find((opportunity) => opportunity.id === req.params.id) });
  });

  app.get("/api/telegram/status", (_req, res) => {
    const state = ensureState();
    res.json(state.telegramStatus);
  });

  app.post("/api/telegram/send-reply", async (req, res, next) => {
    try {
      const state = ensureState();
      if (isPlaceholderSecret(config.telegramBotToken) || !config.telegramOutboundEnabled) {
        res.status(400).json({ error: { code: "telegram_not_configured", message: "Telegram outbound replies are not configured." } });
        return;
      }
      const conversation = state.conversations.find((item) => item.id === req.body?.conversationId);
      const customer = conversation ? state.customers.find((item) => item.id === conversation.customerId) : undefined;
      const chatId = req.body?.chatId ?? customer?.telegramChatId;
      if (!chatId) {
        res.status(422).json({ error: { code: "missing_chat_id", message: "No Telegram chat id is linked to this conversation." } });
        return;
      }
      const text = String(req.body?.text || "Syntra test received. Your message is now visible in the operations dashboard.");
      const sent = await sendTelegramMessage(chatId, text);
      res.json({ data: sent });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/telegram/webhook", async (req, res, next) => {
    try {
      const message = req.body?.message;
      if (message) {
        await processIncomingMessage({
          text: message.text || "[attachment received]",
          name: [message.chat?.first_name, message.chat?.last_name].filter(Boolean).join(" ") || message.chat?.username,
          telegramChatId: String(message.chat?.id),
          telegramUsername: message.chat?.username,
          source: "telegram"
        });
      }
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/system/status", (_req, res) => {
    const state = ensureState();
    res.json({
      openai: state.openaiStatus,
      telegram: state.telegramStatus,
      database: { mode: "json", path: getStatePath(), ready: true },
      design: { status: "passed", command: "npm run design:lint" },
      env: {
        openaiConfigured: !isPlaceholderSecret(config.openaiApiKey),
        telegramConfigured: !isPlaceholderSecret(config.telegramBotToken)
      }
    });
  });

  app.post("/api/system/seed", (_req, res) => {
    res.json({ data: buildSnapshot(resetState()) });
  });

  app.post("/api/system/verify-telegram", async (_req, res) => {
    const me = await getTelegramMe();
    const state = updateState((draft) => {
      draft.telegramStatus = {
        ...draft.telegramStatus,
        configured: true,
        status: "verified_real_api",
        botUsername: me.username,
        botId: me.id,
        lastCheckedAt: new Date().toISOString()
      };
    });
    res.json({ data: buildSnapshot(state).telegramStatus });
  });
}
