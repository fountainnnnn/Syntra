import { spawnSync } from "node:child_process";
import { appendRunLog } from "./report.js";

const commands = [
  ["OpenAI", "scripts/verify-openai.ts"],
  ["Telegram", "scripts/verify-telegram.ts"]
] as const;

const lines: string[] = [];
let failed = false;

for (const [name, script] of commands) {
  const npmScript = script.includes("openai") ? "verify:openai" : "verify:telegram";
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/c", "npm", "run", npmScript] : ["run", npmScript];
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.error) lines.push(`${name}: ${result.error.message}`);
  if (output) lines.push(`${name}: ${output.split(/\r?\n/).at(-1) ?? output}`);
  if (result.status !== 0) failed = true;
}

appendRunLog("QA_REPORT.md", "Real API Verification", lines);
appendRunLog("notes.md", "Real API Verification", lines);
console.log(lines.join("\n"));

if (failed) process.exitCode = 1;
