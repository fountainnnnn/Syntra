import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Telegram outbound policy", () => {
  const bannedAutomaticAck = ["Syntra test", " received"].join("");

  it("does not let the bot worker send automatic customer messages", () => {
    const botWorker = readFileSync("scripts/telegram-bot.ts", "utf8");

    expect(botWorker).not.toContain("sendTelegramMessage");
    expect(botWorker).not.toContain(bannedAutomaticAck);
  });

  it("requires dashboard reply text before the API can send Telegram", () => {
    const routes = readFileSync("server/routes.ts", "utf8");

    expect(routes).toContain("missing_reply_text");
    expect(routes).not.toContain(bannedAutomaticAck);
  });
});
