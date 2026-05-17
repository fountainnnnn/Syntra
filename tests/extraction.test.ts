import { describe, expect, it } from "vitest";
import { fallbackExtract } from "../server/services/extraction";

describe("fallbackExtract", () => {
  it("turns an urgent invoice message into actionable operations state", () => {
    const result = fallbackExtract("We paid for our corporate event package, but no one replied with the invoice. We need confirmation today.");

    expect(result.priority).toBe("high");
    expect(result.sentiment).toBe("frustrated");
    expect(result.tasks).toContain("Send invoice and confirmation");
    expect(result.tasks).toContain("Escalate same-day follow-up");
    expect(result.opportunity?.stage).toBe("Proposal Needed");
    expect(result.issueCluster).toBe("Payments");
  });

  it("keeps a generic customer follow-up usable when no secrets are configured", () => {
    const result = fallbackExtract("Can someone confirm the next step for my booking?");

    expect(result.priority).toBe("medium");
    expect(result.tasks.length).toBeGreaterThan(0);
    expect(result.suggestedAction).toBe(result.tasks[0]);
    expect(result.confidence).toBeGreaterThan(0);
  });
});
