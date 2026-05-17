import { appendFileSync, existsSync } from "node:fs";
import path from "node:path";

export type VerificationStatus =
  | "verified_real_api"
  | "pending_missing_secret"
  | "failed_real_api"
  | "verified_mock_only";

export function appendRunLog(target: "QA_REPORT.md" | "notes.md", title: string, lines: string[]): void {
  const filePath = path.join(process.cwd(), target);
  const timestamp = new Date().toISOString();
  const body = ["", `## ${title} - ${timestamp}`, ...lines.map((line) => `- ${line}`), ""].join("\n");

  if (existsSync(filePath)) {
    appendFileSync(filePath, body, "utf8");
  }
}

export function statusLine(name: string, status: VerificationStatus, detail: string): string {
  return `${name}: ${status} (${detail})`;
}
