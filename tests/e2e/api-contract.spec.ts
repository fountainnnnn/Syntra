import { expect, test } from "@playwright/test";
import { apiURL, normalizePayload, parseJsonResponse } from "./helpers.js";

test.describe("Syntra API contract", () => {
  test("returns JSON for required read endpoints", async ({ request }) => {
    for (const endpoint of [
      "/api/health",
      "/api/snapshot",
      "/api/conversations",
      "/api/telegram/status",
      "/api/system/status",
    ]) {
      const response = await request.get(apiURL(endpoint));
      expect(response.ok(), `${endpoint} should return 2xx`).toBeTruthy();
      expect(
        response.headers()["content-type"] ?? "",
        `${endpoint} should return JSON`,
      ).toContain("application/json");

      const body = await parseJsonResponse(response);
      expect(Object.keys(body).length, `${endpoint} should not return an empty object`).toBeGreaterThan(0);
    }
  });

  test("snapshot contains the dashboard state needed by the demo", async ({ request }) => {
    const response = await request.get(apiURL("/api/snapshot"));
    expect(response.ok(), "snapshot should return 2xx").toBeTruthy();

    const body = normalizePayload(await parseJsonResponse(response));

    for (const key of [
      "metrics",
      "customers",
      "conversations",
      "messages",
      "tasks",
      "opportunities",
      "insights",
      "telegramStatus",
      "openaiStatus",
    ]) {
      expect(body, `snapshot should include ${key}`).toHaveProperty(key);
    }
  });

  test("demo injection endpoint accepts a Telegram-style customer message", async ({
    request,
  }) => {
    const response = await request.post(apiURL("/api/demo/inject"), {
      data: {
        name: "Playwright API Contract",
        text: `Playwright API contract ${Date.now()}: corporate booking invoice follow-up.`,
      },
    });

    expect(response.ok(), "demo injection should return 2xx").toBeTruthy();
    expect(response.headers()["content-type"] ?? "", "demo injection should return JSON").toContain("application/json");

    const body = normalizePayload(await parseJsonResponse(response));
    expect(
      Object.keys(body).length,
      "demo injection should return persisted or processed message data",
    ).toBeGreaterThan(0);
  });
});
