import OpenAI from "openai";
import { config, isPlaceholderSecret } from "../server/config.js";
import { fallbackExtract, extractMessage } from "../server/services/extraction.js";
import { appendLog, updateState } from "../server/store/state.js";
import { appendRunLog, statusLine, type VerificationStatus } from "./report.js";

let status: VerificationStatus = "pending_missing_secret";
let detail = "OPENAI_API_KEY is missing or placeholder";

if (!isPlaceholderSecret(config.openaiApiKey)) {
  try {
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    let text = "";
    for (let attempt = 0; attempt < 2 && !text.includes("SYNTRA_OPENAI_OK"); attempt += 1) {
      const response = await client.responses.create({
        model: config.openaiModel,
        instructions: "Follow the user's instruction exactly.",
        input: "Return exactly this text and nothing else: SYNTRA_OPENAI_OK",
        max_output_tokens: 20
      });
      text = response.output_text ?? "";
    }
    if (!text.includes("SYNTRA_OPENAI_OK")) {
      throw new Error("OpenAI response did not include SYNTRA_OPENAI_OK");
    }

    const extraction = await extractMessage("Hi, I booked a corporate event package last week but no one replied with the invoice. We need confirmation today or we'll find another vendor.");
    if (
      extraction.mode !== "real" ||
      extraction.result.priority === "low" ||
      extraction.result.tasks.length < 1 ||
      !extraction.result.opportunity ||
      extraction.result.confidence <= 0
    ) {
      throw new Error("Structured extraction assertion failed");
    }

    status = "verified_real_api";
    detail = `model=${config.openaiModel}, extraction=${extraction.mode}`;
  } catch (error) {
    status = "failed_real_api";
    detail = error instanceof Error ? error.message : "OpenAI verification failed";
    fallbackExtract("fallback smoke test");
  }
}

updateState((state) => {
  state.openaiStatus = {
    configured: !isPlaceholderSecret(config.openaiApiKey),
    status,
    model: config.openaiModel,
    error: status === "failed_real_api" ? detail : undefined,
    lastCheckedAt: new Date().toISOString()
  };
  appendLog(state, statusLine("OpenAI", status, detail));
});

appendRunLog("QA_REPORT.md", "OpenAI Verification", [statusLine("OpenAI", status, detail)]);
appendRunLog("notes.md", "OpenAI Verification", [statusLine("OpenAI", status, detail)]);
console.log(statusLine("OpenAI", status, detail));

if (status === "failed_real_api") process.exitCode = 1;
