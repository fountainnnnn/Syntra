import { expect, test } from "@playwright/test";
import {
  appRoutes,
  apiURL,
  captureRouteScreenshot,
  ensureScreenshotDir,
  expectLightMode,
  expectNoSevereConsoleErrors,
  expectVisibleText,
  firstVisibleLocator,
  gotoRoute,
  navigateViaAppNav,
  parseJsonResponse,
  watchConsole,
} from "./helpers.js";

test.describe("Syntra required demo flow", () => {
  test.beforeAll(() => {
    ensureScreenshotDir();
  });

  test("loads dashboard, stays light, navigates all 8 pages, and captures screenshots", async ({
    page,
  }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/dashboard");
    await expectVisibleText(page, [/command center/i], "dashboard heading should be visible");
    await expectLightMode(page, "dashboard");

    for (const route of appRoutes) {
      await navigateViaAppNav(page, route);
      await expectVisibleText(page, [route.heading], `${route.path} heading should be visible`);
      await expectLightMode(page, route.path);
      await captureRouteScreenshot(page, testInfo, route.slug);
    }

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("selects an inbox conversation and shows the AI intelligence panel", async ({
    page,
  }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/inbox");

    const conversation = await firstVisibleLocator(
      [
        page.getByTestId("conversation-row").first(),
        page.getByTestId("conversation-item").first(),
        page.locator("[data-testid*='conversation']").first(),
        page.getByRole("button", { name: /conversation|lead|complaint|refund|invoice|customer/i }).first(),
        page.getByRole("listitem").filter({ hasText: /lead|complaint|refund|invoice|booking|telegram|customer/i }).first(),
        page.getByRole("row").filter({ hasText: /lead|complaint|refund|invoice|booking|telegram|customer/i }).first(),
      ],
      "inbox should expose selectable conversations",
      3_000,
    );

    await conversation.click();

    await expectVisibleText(page, [/ai intelligence|customer summary/i], "AI panel should be visible");
    await expectVisibleText(page, [/extracted fields|suggested next action|linked tasks/i], "AI panel details should be visible");
    await expectVisibleText(page, [/source|confidence|telegram/i], "AI panel should expose source evidence");
    await captureRouteScreenshot(page, testInfo, "inbox-ai-panel");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("opens the customer detail drawer", async ({ page }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/customers");

    const customer = await firstVisibleLocator(
      [
        page.getByRole("button", { name: /view details|open customer|details/i }).first(),
        page.getByTestId("customer-row").first(),
        page.locator("[data-testid*='customer']").first(),
        page.getByRole("row").filter({ hasText: /telegram|lead|at risk|customer|corporate/i }).first(),
      ],
      "customers page should expose a customer row or detail action",
      3_000,
    );

    await customer.click();

    await expectVisibleText(page, [/overview/i], "customer drawer should show Overview");
    await expectVisibleText(page, [/conversations|timeline|tasks|insights/i], "customer drawer should show operational tabs");
    await captureRouteScreenshot(page, testInfo, "customers-drawer");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("shows pipeline columns and lead evidence", async ({ page }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/pipeline");

    for (const column of [
      /new inquiry/i,
      /qualified/i,
      /waiting reply/i,
      /proposal needed|proposal sent|proposal/i,
      /negotiation/i,
      /won/i,
      /lost/i,
    ]) {
      await expectVisibleText(page, [column], `pipeline column ${column} should be visible`);
    }

    await expectVisibleText(page, [/source|next action|sentiment|value/i], "pipeline lead cards should show business context");
    await captureRouteScreenshot(page, testInfo, "pipeline-columns");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("shows task source traceability", async ({ page }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/tasks");
    await expectVisibleText(page, [/source message|source conversation|telegram evidence/i], "tasks should expose source traceability");

    const sourceAction = await firstVisibleLocator(
      [
        page.getByRole("button", { name: /view source conversation|source conversation|view source/i }).first(),
        page.getByRole("link", { name: /view source conversation|source conversation|view source/i }).first(),
        page.locator("[data-testid*='source']").first(),
      ],
      "tasks should provide a source conversation action",
      3_000,
    );

    await sourceAction.click();
    await expectVisibleText(page, [/original telegram|source message|conversation|evidence/i], "task source drawer should show original evidence");
    await captureRouteScreenshot(page, testInfo, "tasks-source-traceability");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("shows insights charts and recommendation cards", async ({ page }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/insights");

    for (const section of [
      /recurring issue clusters|issue clusters/i,
      /sentiment trend|customer sentiment/i,
      /response delay/i,
      /revenue risk/i,
      /recommendations|ai recommendations/i,
    ]) {
      await expectVisibleText(page, [section], `insights section ${section} should be visible`);
    }

    await firstVisibleLocator(
      [
        page.locator("[data-testid*='chart']").first(),
        page.locator("[class*='recharts']").first(),
        page.locator(".insights-grid canvas").first(),
      ],
      "insights should render at least one chart surface",
      5_000,
    );
    await captureRouteScreenshot(page, testInfo, "insights-charts");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("shows graph nodes and inspector", async ({ page }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/graph");
    await expectVisibleText(page, [/operations graph|graph canvas/i], "graph page should be visible");

    const graphNode = await firstVisibleLocator(
      [
        page.locator("[data-node-id]").first(),
        page.locator("[data-testid*='graph-node']").first(),
        page.locator("svg circle, svg [role='button'], canvas").first(),
        page.getByRole("button", { name: /customer|conversation|task|risk|opportunity/i }).first(),
      ],
      "graph should expose at least one node",
      3_000,
    );

    await graphNode.click({ force: true });
    await expectVisibleText(page, [/node inspector|inspector|linked objects|next action|evidence/i], "graph inspector should be visible");
    await captureRouteScreenshot(page, testInfo, "graph-inspector");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("shows settings API panels and demo injection control", async ({ page }, testInfo) => {
    const consoleErrors = watchConsole(page);

    await gotoRoute(page, "/settings");

    for (const panel of [
      /openai api|openai/i,
      /telegram bot|telegram/i,
      /dashboard\/database|database|dashboard status/i,
      /design qa|design/i,
      /verification console|verification log|console/i,
    ]) {
      await expectVisibleText(page, [panel], `settings panel ${panel} should be visible`);
    }

    for (const action of [
      /verify openai/i,
      /verify telegram/i,
      /run real api checks/i,
      /seed demo data/i,
      /inject demo message/i,
    ]) {
      await expect(
        page.getByRole("button", { name: action }).or(page.getByRole("link", { name: action })).first(),
        `settings action ${action} should be available`,
      ).toBeVisible();
    }

    await captureRouteScreenshot(page, testInfo, "settings-api-panels");

    expectNoSevereConsoleErrors(consoleErrors);
  });

  test("injects a demo message and verifies it appears in dashboard and inbox", async ({
    page,
    request,
  }, testInfo) => {
    const consoleErrors = watchConsole(page);
    const injectedText = `Playwright demo injection ${Date.now()}: invoice confirmation needed today.`;

    const response = await request.post(apiURL("/api/demo/inject"), {
      data: {
        name: "Playwright QA Lead",
        text: injectedText,
      },
    });

    expect(response.ok(), "demo injection endpoint should return 2xx").toBeTruthy();
    await parseJsonResponse(response);

    await expect
      .poll(
        async () => {
          await page.goto("/dashboard");
          await page.waitForLoadState("domcontentloaded");
          return page.getByText(injectedText).first().isVisible();
        },
        {
          message: "injected message should appear on dashboard",
          timeout: 15_000,
        },
      )
      .toBeTruthy();
    await captureRouteScreenshot(page, testInfo, "injected-dashboard");

    await expect
      .poll(
        async () => {
          await page.goto("/inbox");
          await page.waitForLoadState("domcontentloaded");
          return page.getByText(injectedText).first().isVisible();
        },
        {
          message: "injected message should appear in inbox",
          timeout: 15_000,
        },
      )
      .toBeTruthy();
    await captureRouteScreenshot(page, testInfo, "injected-inbox");

    expectNoSevereConsoleErrors(consoleErrors);
  });
});
