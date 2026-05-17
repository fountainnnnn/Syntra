import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const appRoutes = [
  {
    path: "/dashboard",
    slug: "dashboard",
    nav: /dashboard|command center/i,
    heading: /command center/i,
  },
  {
    path: "/inbox",
    slug: "inbox",
    nav: /inbox|inbox intelligence/i,
    heading: /inbox intelligence|inbox/i,
  },
  {
    path: "/customers",
    slug: "customers",
    nav: /customers/i,
    heading: /customers/i,
  },
  {
    path: "/pipeline",
    slug: "pipeline",
    nav: /pipeline/i,
    heading: /pipeline/i,
  },
  {
    path: "/tasks",
    slug: "tasks",
    nav: /tasks/i,
    heading: /tasks/i,
  },
  {
    path: "/insights",
    slug: "insights",
    nav: /insights/i,
    heading: /insights/i,
  },
  {
    path: "/graph",
    slug: "graph",
    nav: /ops graph|operations graph|graph/i,
    heading: /operations graph|ops graph|graph/i,
  },
  {
    path: "/settings",
    slug: "settings",
    nav: /settings|verification/i,
    heading: /settings|verification/i,
  },
] as const;

const screenshotDir = path.join(process.cwd(), "artifacts", "screenshots");

export function ensureScreenshotDir() {
  mkdirSync(screenshotDir, { recursive: true });
}

export function watchConsole(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

export function expectNoSevereConsoleErrors(errors: string[]) {
  const severeErrors = errors.filter(
    (error) => !/favicon|resizeobserver loop/i.test(error),
  );

  expect.soft(severeErrors, "browser console should not contain severe errors").toEqual([]);
}

export async function gotoRoute(page: Page, routePath: string) {
  await page.goto(routePath);
  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(routePath)}(?:$|[?#])`));
}

export async function navigateViaAppNav(
  page: Page,
  route: (typeof appRoutes)[number],
) {
  let link = page.getByRole("link", { name: route.nav }).first();

  if (!(await isVisible(link, 1_000))) {
    await openResponsiveNavigation(page);
    link = page.getByRole("link", { name: route.nav }).first();
  }

  await expect(link, `sidebar/top navigation should include ${route.path}`).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(route.path)}(?:$|[?#])`));
  await page.waitForLoadState("domcontentloaded");
}

export async function expectVisibleText(
  page: Page,
  patterns: readonly RegExp[],
  description: string,
) {
  for (const pattern of patterns) {
    const matches = page.getByText(pattern);
    const count = await matches.count();

    for (let index = 0; index < count; index += 1) {
      const locator = matches.nth(index);
      if (await isVisible(locator, 1_000)) {
        await expect(locator, description).toBeVisible();
        return locator;
      }
    }
  }

  await expect(page.getByText(patterns[0]).first(), description).toBeVisible();
  return page.getByText(patterns[0]).first();
}

export async function firstVisibleLocator(
  locators: readonly Locator[],
  description: string,
  timeout = 1_500,
) {
  for (const locator of locators) {
    if (await isVisible(locator, timeout)) {
      return locator;
    }
  }

  await expect(locators[0], description).toBeVisible();
  return locators[0];
}

export async function expectLightMode(page: Page, surfaceName: string) {
  const sample = await page.evaluate(() => {
    const candidates = [
      ["app shell", document.querySelector("[data-testid='app-shell']")],
      ["main", document.querySelector("main")],
      ["body", document.body],
      ["html", document.documentElement],
    ] as const;

    for (const [name, element] of candidates) {
      if (!element) continue;

      const backgroundColor = getComputedStyle(element).backgroundColor;
      if (backgroundColor && backgroundColor !== "transparent" && backgroundColor !== "rgba(0, 0, 0, 0)") {
        return { name, backgroundColor };
      }
    }

    return {
      name: "document",
      backgroundColor: getComputedStyle(document.documentElement).backgroundColor,
    };
  });

  expect(
    relativeLuminance(sample.backgroundColor),
    `${surfaceName} should keep a light shell background, sampled ${sample.name}: ${sample.backgroundColor}`,
  ).toBeGreaterThan(0.62);
}

export async function captureRouteScreenshot(
  page: Page,
  testInfo: TestInfo,
  slug: string,
) {
  ensureScreenshotDir();

  const filePath = path.join(
    screenshotDir,
    `${testInfo.project.name}-${slug}.png`,
  );

  await page.screenshot({
    path: filePath,
    fullPage: true,
    animations: "disabled",
  });

  await testInfo.attach(`${testInfo.project.name}-${slug}`, {
    path: filePath,
    contentType: "image/png",
  });
}

export function apiURL(apiPath: string) {
  const apiBaseURL =
    process.env.API_BASE_URL ??
    process.env.VITE_API_BASE_URL ??
    "http://127.0.0.1:8787";

  return new URL(apiPath, apiBaseURL).toString();
}

export async function parseJsonResponse(response: { json: () => Promise<unknown> }) {
  const body = await response.json();
  expect(body, "API response should be a JSON object").toEqual(expect.any(Object));
  return body as Record<string, unknown>;
}

export function normalizePayload(body: Record<string, unknown>) {
  if (body.data && typeof body.data === "object") {
    return body.data as Record<string, unknown>;
  }

  return body;
}

async function openResponsiveNavigation(page: Page) {
  const menuButton = await firstVisibleOptional([
    page.getByRole("button", { name: /menu|navigation|open nav|open sidebar/i }).first(),
    page.locator("[data-testid='mobile-menu-button']").first(),
    page.locator("[aria-label*='navigation' i]").first(),
  ]);

  if (menuButton) {
    await menuButton.click();
  }
}

async function firstVisibleOptional(locators: readonly Locator[]) {
  for (const locator of locators) {
    if (await isVisible(locator, 750)) {
      return locator;
    }
  }

  return null;
}

async function isVisible(locator: Locator, timeout: number) {
  try {
    await locator.waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

function relativeLuminance(cssColor: string) {
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) {
    return 1;
  }

  const [r, g, b] = match.slice(1, 4).map((value) => {
    const channel = Number(value) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
