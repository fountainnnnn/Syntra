import dotenv from "dotenv";
import { existsSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const notesPath = path.join(root, "notes.md");
const intervalMs = Number(process.env.SYNTRA_WAIT_INTERVAL_MS ?? 15_000);
const maxMs = Number(process.env.SYNTRA_WAIT_MAX_MS ?? 10 * 60 * 1000);

const placeholders = new Set([
  "",
  "PASTE_OPENAI_API_KEY_HERE",
  "PASTE_TELEGRAM_BOT_TOKEN_HERE",
  "your_api_key_here",
  "your_token_here",
  "changeme",
  "placeholder"
]);

type SecretState = {
  openaiReady: boolean;
  telegramReady: boolean;
};

function loadEnv(): Record<string, string> {
  if (!existsSync(envPath)) {
    return {};
  }

  const parsed = dotenv.parse(readFileSync(envPath));
  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, value.trim()])
  );
}

function hasUsableSecret(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return !placeholders.has(value.trim());
}

function getSecretState(): SecretState {
  const env = loadEnv();
  return {
    openaiReady: hasUsableSecret(env.OPENAI_API_KEY),
    telegramReady: hasUsableSecret(env.TELEGRAM_BOT_TOKEN)
  };
}

function appendNotes(status: string, state: SecretState): void {
  const timestamp = new Date().toISOString();
  const line = [
    "",
    `## Env Check - ${timestamp}`,
    `- status: ${status}`,
    `- secrets_ready=${state.openaiReady && state.telegramReady}`,
    `- openai_secret_ready=${state.openaiReady}`,
    `- telegram_secret_ready=${state.telegramReady}`
  ].join("\n");
  appendFileSync(notesPath, `${line}\n`, "utf8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("ACTION REQUIRED: Fill .env.local now with OPENAI_API_KEY and TELEGRAM_BOT_TOKEN.");
console.log("Codex will wait/check for the secrets before real API verification.");
console.log("Secrets are never printed; only readiness booleans are reported.");

const startedAt = Date.now();
let state = getSecretState();

while (!(state.openaiReady && state.telegramReady) && Date.now() - startedAt < maxMs) {
  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(
    `Waiting for secrets (${elapsedSeconds}s): openai=${state.openaiReady}, telegram=${state.telegramReady}`
  );
  await sleep(intervalMs);
  state = getSecretState();
}

if (state.openaiReady && state.telegramReady) {
  console.log("Secrets ready: openai=true, telegram=true");
  appendNotes("secrets_ready", state);
  process.exit(0);
}

console.log(
  `Secrets still pending after ${Math.round(maxMs / 1000)}s: openai=${state.openaiReady}, telegram=${state.telegramReady}`
);
appendNotes("pending_missing_secret", state);
