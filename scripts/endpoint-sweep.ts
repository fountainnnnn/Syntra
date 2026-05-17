import { appendRunLog } from "./report.js";

const baseURL = process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8787";

const checks: Array<{ method: "GET" | "POST"; path: string; body?: unknown }> = [
  { method: "GET", path: "/api/health" },
  { method: "GET", path: "/api/snapshot" },
  { method: "GET", path: "/api/conversations" },
  { method: "GET", path: "/api/telegram/status" },
  { method: "GET", path: "/api/system/status" },
  {
    method: "POST",
    path: "/api/demo/inject",
    body: { name: "Endpoint Sweep", text: "I paid yesterday but no one confirmed my booking. This is urgent." }
  }
];

const results: string[] = [];
let failed = false;

for (const check of checks) {
  const response = await fetch(new URL(check.path, baseURL), {
    method: check.method,
    headers: check.body ? { "content-type": "application/json" } : undefined,
    body: check.body ? JSON.stringify(check.body) : undefined
  });
  const contentType = response.headers.get("content-type") ?? "";
  let json: unknown = {};
  try {
    json = await response.json();
  } catch {
    failed = true;
  }
  const ok = response.ok && contentType.includes("application/json") && typeof json === "object" && json !== null;
  failed ||= !ok;
  results.push(`${check.method} ${check.path}: ${ok ? "PASS" : "FAIL"} (${response.status})`);
}

appendRunLog("QA_REPORT.md", "Endpoint Sweep", results);
appendRunLog("notes.md", "Endpoint Sweep", results);
console.log(results.join("\n"));

if (failed) process.exit(1);
