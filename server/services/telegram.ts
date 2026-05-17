import { config, isPlaceholderSecret } from "../config.js";

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; username?: string; first_name?: string; last_name?: string };
    from?: { username?: string; first_name?: string; last_name?: string };
    photo?: unknown;
    document?: unknown;
    voice?: unknown;
  };
}

function token(): string | null {
  return isPlaceholderSecret(config.telegramBotToken) ? null : config.telegramBotToken ?? null;
}

async function telegramCall<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const current = token();
  if (!current) throw new Error("TELEGRAM_BOT_TOKEN is missing or placeholder.");
  const response = await fetch(`https://api.telegram.org/bot${current}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description ?? `Telegram ${method} failed.`);
  return data.result as T;
}

export async function getTelegramMe() {
  return telegramCall<{ id: number; username: string; first_name?: string }>("getMe");
}

export async function deleteTelegramWebhook() {
  return telegramCall<boolean>("deleteWebhook", { drop_pending_updates: false });
}

export async function getTelegramUpdates(offset?: number) {
  return telegramCall<TelegramUpdate[]>("getUpdates", { timeout: 25, offset, allowed_updates: ["message"] });
}

export async function sendTelegramMessage(chatId: string | number, text: string) {
  return telegramCall<{ message_id: number }>("sendMessage", { chat_id: chatId, text });
}
