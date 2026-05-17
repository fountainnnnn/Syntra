import { config, isPlaceholderSecret } from "../server/config.js";
import { processIncomingMessage } from "../server/services/process-message.js";
import { deleteTelegramWebhook, getTelegramMe, getTelegramUpdates, sendTelegramMessage } from "../server/services/telegram.js";
import { appendLog, updateState } from "../server/store/state.js";

if (isPlaceholderSecret(config.telegramBotToken)) {
  console.log("[syntra-bot] TELEGRAM_BOT_TOKEN missing. Bot worker is idling so RUN_ALL.bat can still run the demo app.");
  setInterval(() => {
    updateState((state) => {
      state.telegramStatus = {
        ...state.telegramStatus,
        configured: false,
        status: "pending_missing_secret",
        outboundEnabled: config.telegramOutboundEnabled,
        lastPollAt: new Date().toISOString()
      };
    });
  }, 60_000);
} else {
  let offset: number | undefined;
  let sentTestReply = false;
  const me = await getTelegramMe();
  await deleteTelegramWebhook();
  updateState((state) => {
    state.telegramStatus = {
      ...state.telegramStatus,
      configured: true,
      status: "verified_real_api",
      botUsername: me.username,
      botId: me.id,
      outboundEnabled: config.telegramOutboundEnabled,
      lastCheckedAt: new Date().toISOString()
    };
    appendLog(state, `LIVE TELEGRAM TEST: send a customer-service style message to @${me.username}.`);
  });
  console.log(`[syntra-bot] Connected to @${me.username}. Send a customer-service style Telegram message now.`);

  while (true) {
    try {
      const updates = await getTelegramUpdates(offset);
      updateState((state) => {
        state.telegramStatus.lastPollAt = new Date().toISOString();
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        const message = update.message;
        if (!message) continue;

        const chat = message.chat;
        const text = message.text ?? (message.photo ? "[photo received]" : message.document ? "[document received]" : message.voice ? "[voice received]" : "[attachment received]");
        if (text === "/start") {
          await sendTelegramMessage(chat.id, "Syntra demo bot connected. Send a customer-service style message and it will appear in the Syntra dashboard.");
          continue;
        }
        if (text === "/demo") {
          await sendTelegramMessage(chat.id, "Send: I paid yesterday but no one confirmed my booking. This is urgent.");
          continue;
        }

        await processIncomingMessage({
          text,
          name: [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username,
          telegramChatId: String(chat.id),
          telegramUsername: chat.username,
          source: "telegram"
        });

        if (config.telegramOutboundEnabled && !sentTestReply) {
          await sendTelegramMessage(chat.id, "Syntra test received. Your message is now visible in the operations dashboard.");
          sentTestReply = true;
        }
      }
    } catch (error) {
      console.error(`[syntra-bot] ${error instanceof Error ? error.message : "Polling failed"}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
