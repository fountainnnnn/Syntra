import { expect, test } from "@playwright/test";
import { apiURL } from "./helpers.js";

test.describe("Syntra workflow clarity", () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post(apiURL("/api/system/seed"));
    expect(response.ok(), "seed endpoint should reset deterministic demo state").toBeTruthy();
  });

  test("pipeline explains what the board does and how a lead moves", async ({ page }) => {
    await page.goto("/pipeline");

    await expect(page.getByRole("heading", { name: /lead pipeline/i })).toBeVisible();
    await expect(page.getByText(/telegram conversations with buying intent/i)).toBeVisible();
    await expect(page.getByText(/how this board works/i)).toBeVisible();
    await expect(page.getByText(/capture from telegram/i)).toBeVisible();
    await expect(page.getByText(/operator moves the stage/i)).toBeVisible();
    await expect(page.getByText(/bottleneck/i)).toBeVisible();

    const lead = page.getByTestId(/^lead-card-/).first();
    await expect(lead.getByText(/why it is here/i)).toBeVisible();
    await expect(lead.getByText(/next owner action/i)).toBeVisible();
    await expect(lead.getByText(/source conversation/i)).toBeVisible();

    await lead.getByRole("button", { name: /open lead detail/i }).click();
    await expect(page.getByRole("heading", { name: /lead detail/i })).toBeVisible();
    await expect(page.getByText(/why this lead is here/i)).toBeVisible();
    await expect(page.getByText(/what happens next/i)).toBeVisible();
  });

  test("operations graph reads as a message-to-workflow map", async ({ page }) => {
    await page.goto("/graph");

    await expect(page.getByRole("heading", { name: /operations map/i })).toBeVisible();
    await expect(page.getByText(/follow one telegram message as syntra turns it into work/i)).toBeVisible();
    await expect(page.getByText(/read left to right/i)).toBeVisible();

    for (const step of [/telegram message/i, /ai extraction/i, /customer record/i, /task created/i, /pipeline impact/i, /owner action/i]) {
      await expect(page.getByRole("button", { name: step })).toBeVisible();
    }

    await page.getByRole("button", { name: /pipeline impact/i }).click();
    await expect(page.getByRole("heading", { name: /selected workflow step/i })).toBeVisible();
    await expect(page.getByText(/why it matters/i)).toBeVisible();
    await expect(page.getByText(/source evidence/i)).toBeVisible();
    await expect(page.getByText(/next action/i)).toBeVisible();
  });
});
