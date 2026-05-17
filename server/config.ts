import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
dotenv.config({ quiet: true });

export const config = {
  port: Number(process.env.SERVER_PORT ?? 8787),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  dbPath: process.env.SYNTRA_DB_PATH ?? "./data/syntra-state.json",
  businessName: process.env.SYNTRA_BUSINESS_NAME ?? "ApertureOne Events",
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramOutboundEnabled: (process.env.TELEGRAM_ENABLE_OUTBOUND_REPLIES ?? "true") === "true"
};

export function isPlaceholderSecret(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return [
    "",
    "paste_openai_api_key_here",
    "paste_telegram_bot_token_here",
    "your_api_key_here",
    "your_token_here",
    "changeme",
    "placeholder"
  ].includes(normalized);
}

export function redactSecret(value: string | undefined): string {
  if (!value || isPlaceholderSecret(value)) return "not-configured";
  if (value.length <= 8) return "configured";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
