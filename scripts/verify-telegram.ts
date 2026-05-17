import { config, isPlaceholderSecret } from "../server/config.js";
import { deleteTelegramWebhook, getTelegramMe } from "../server/services/telegram.js";
import { appendLog, updateState } from "../server/store/state.js";
import { appendRunLog, statusLine, type VerificationStatus } from "./report.js";

let status: VerificationStatus = "pending_missing_secret";
let detail = "TELEGRAM_BOT_TOKEN is missing or placeholder";

if (!isPlaceholderSecret(config.telegramBotToken)) {
  try {
    const me = await getTelegramMe();
    await deleteTelegramWebhook();
    status = "verified_real_api";
    detail = `bot=@${me.username}, id=${me.id}`;
    updateState((state) => {
      state.telegramStatus = {
        ...state.telegramStatus,
        configured: true,
        status,
        botUsername: me.username,
        botId: me.id,
        outboundEnabled: config.telegramOutboundEnabled,
        lastCheckedAt: new Date().toISOString()
      };
      appendLog(state, statusLine("Telegram", status, detail));
    });
  } catch (error) {
    status = "failed_real_api";
    detail = error instanceof Error ? error.message : "Telegram verification failed";
    updateState((state) => {
      state.telegramStatus = {
        ...state.telegramStatus,
        configured: true,
        status,
        error: detail,
        outboundEnabled: config.telegramOutboundEnabled,
        lastCheckedAt: new Date().toISOString()
      };
      appendLog(state, statusLine("Telegram", status, detail));
    });
  }
} else {
  updateState((state) => {
    state.telegramStatus = {
      ...state.telegramStatus,
      configured: false,
      status,
      outboundEnabled: config.telegramOutboundEnabled,
      lastCheckedAt: new Date().toISOString()
    };
    appendLog(state, statusLine("Telegram", status, detail));
  });
}

appendRunLog("QA_REPORT.md", "Telegram Verification", [statusLine("Telegram", status, detail)]);
appendRunLog("notes.md", "Telegram Verification", [statusLine("Telegram", status, detail)]);
console.log(statusLine("Telegram", status, detail));

if (status === "failed_real_api") process.exitCode = 1;
