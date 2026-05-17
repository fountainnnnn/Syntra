import { expect, test } from "@playwright/test";
import { apiURL, normalizePayload, parseJsonResponse } from "./helpers.js";

test.describe("Syntra interaction polish", () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post(apiURL("/api/system/seed"));
    expect(response.ok(), "seed endpoint should reset deterministic demo state").toBeTruthy();
  });

  test("opens pipeline lead detail without changing the lead stage", async ({ page, request }) => {
    const before = normalizePayload(await parseJsonResponse(await request.get(apiURL("/api/snapshot"))));
    const opportunities = before.opportunities as Array<{ id: string; stage: string }>;
    const tracked = opportunities.find((opportunity) => opportunity.stage !== "Negotiation") ?? opportunities[0];

    await page.goto("/pipeline");
    await page.getByTestId(`lead-card-${tracked.id}`).getByRole("button", { name: /open lead detail/i }).click();

    await expect(page.getByRole("heading", { name: /lead detail/i })).toBeVisible();
    await expect(page.getByText(tracked.id).first()).toBeVisible();

    const afterOpen = normalizePayload(await parseJsonResponse(await request.get(apiURL("/api/snapshot"))));
    const opened = (afterOpen.opportunities as Array<{ id: string; stage: string }>).find((opportunity) => opportunity.id === tracked.id);
    expect(opened?.stage, "opening detail must not move a lead to another stage").toBe(tracked.stage);

    await page.getByRole("button", { name: /move to negotiation/i }).click();
    await expect(page.getByText(/moved to negotiation/i).first()).toBeVisible();

    const afterMove = normalizePayload(await parseJsonResponse(await request.get(apiURL("/api/snapshot"))));
    const moved = (afterMove.opportunities as Array<{ id: string; stage: string }>).find((opportunity) => opportunity.id === tracked.id);
    expect(moved?.stage).toBe("Negotiation");
  });

  test("keeps long operational panes bounded with internal scrolling", async ({ page }) => {
    await page.goto("/pipeline");

    const pipelineScroll = await page.locator(".kanban").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        maxHeight: style.maxHeight,
      };
    });

    expect(pipelineScroll.overflowX).toMatch(/auto|scroll/);
    expect(pipelineScroll.overflowY).toMatch(/auto|scroll/);
    expect(pipelineScroll.maxHeight).not.toBe("none");

    const columnScroll = await page.locator(".kanban-column").first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { overflowY: style.overflowY, maxHeight: style.maxHeight };
    });

    expect(columnScroll.overflowY).toMatch(/auto|scroll/);
    expect(columnScroll.maxHeight).not.toBe("none");
  });

  test("visible command buttons provide feedback instead of silent no-ops", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /assign urgent queue/i }).click();
    await expect(page.getByRole("status")).toContainText(/urgent queue assigned/i);

    await page.getByRole("button", { name: /draft follow-ups/i }).click();
    await expect(page.getByRole("status")).toContainText(/draft follow-ups/i);

    await page.goto("/inbox");
    await page.getByRole("button", { name: /use reply/i }).click();
    await expect(page.getByRole("status")).toContainText(/reply copied/i);

    await page.getByRole("button", { name: /edit reply/i }).click();
    await expect(page.getByLabel(/generated reply/i)).toBeVisible();

    await page.getByRole("button", { name: /create task/i }).click();
    await expect(page.getByRole("status")).toContainText(/task draft/i);

    await page.goto("/settings");
    await page.getByRole("button", { name: /verify telegram/i }).click();
    await expect(page.getByRole("status")).toContainText(/telegram verification/i);

    await page.getByRole("button", { name: /run real api checks/i }).click();
    await expect(page.getByRole("status")).toContainText(/real api checks/i);
  });

  test("filters and task status controls change visible UI state", async ({ page }) => {
    await page.goto("/inbox");
    await page.getByRole("button", { name: "Urgent" }).click();
    await expect(page.getByRole("button", { name: "Urgent" })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/customers");
    await page.getByRole("button", { name: "Negative" }).click();
    await expect(page.getByRole("button", { name: "Negative" })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/tasks");
    const statusButton = page.locator("tbody button.text-button").first();
    const before = (await statusButton.textContent())?.trim();
    await statusButton.click();
    await expect(statusButton).not.toHaveText(before ?? "");
  });
});
