import { test, expect, type Page } from "@playwright/test";

test.use({ baseURL: process.env.TEST_BASE_URL || "http://localhost:3000" });

const SECTIONS = [
  ["About", "about"],
  ["Experience", "experience"],
  ["Projects", "projects"],
  ["Contact", "contact"],
] as const;
const COMPANIES = ["Cummins", "Engrave Me Now", "IFixandRepair"];
const PROJECTS = [
  "Turbo Balancer Intelligence",
  "Engineering AI Agents",
  "Skills & Capabilities Hub",
  "E-commerce Data Pipeline",
  "Space Debris Explorer",
];
const PORTRAIT = "Pixel-art portrait of Kuday Yurter";

async function expectAllContent(page: Page) {
  await expect(
    page.getByRole("heading", { level: 1, name: "Kuday Yurter" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: PORTRAIT })).toBeVisible();
  for (const [, id] of SECTIONS) {
    await expect(page.locator(`#${id} h2`)).toBeAttached();
  }
  for (const name of [...COMPANIES, ...PROJECTS]) {
    await expect(page.getByRole("heading", { level: 3, name })).toBeAttached();
  }
  await expect(
    page.getByRole("link", { name: /kudayyurter@gmail\.com/ }),
  ).toBeAttached();
}

test("renders every section and the key content", async ({ page }) => {
  await page.goto("/");
  await expectAllContent(page);
  await expect(page.getByRole("img", { name: "Python" })).toBeAttached();
  await expect(page.getByRole("img", { name: "Cummins" })).toBeAttached();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("everything is present and visible", async ({ page }) => {
    await page.goto("/");
    await expectAllContent(page);
    for (const [, id] of SECTIONS) {
      await page.locator(`#${id} h2`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id} h2`)).toBeVisible();
    }
  });
});

test("header links jump to each section", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const [name, id] of SECTIONS) {
    await nav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
});

test("fits a 360px screen with no runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  expect(errors).toEqual([]);
});

const MOTION = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";

async function opacities(page: Page, selector: string) {
  return page.$$eval(selector, (elements) =>
    elements.map((element) => getComputedStyle(element).opacity),
  );
}

test("sections fade in as they scroll into view", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate((query) => matchMedia(query).matches, MOTION)).toBe(true);
  const contact = page.locator("#contact .reveal").first();
  await expect(contact).not.toHaveClass(/is-visible/);
  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toHaveClass(/is-visible/);
  await expect(contact).toHaveCSS("opacity", "1");
});

test("a deep link reveals the targeted section", async ({ page }) => {
  await page.goto("/#projects");
  await expect(page.locator("#projects .reveal").first()).toHaveClass(/is-visible/);
});

test("keyboard focus reveals the focused link", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /Find more on GitHub/ });
  await link.focus();
  await expect(page.locator(".reveal", { has: link })).toHaveClass(/is-visible/);
});

test("printing shows sections that were never scrolled to", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  expect(new Set(await opacities(page, ".reveal"))).toEqual(new Set(["1"]));
});

test("header gets a hairline once the page scrolls", async ({ page }) => {
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "false");
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveAttribute("data-scrolled", "true");
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("everything is shown immediately", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate((query) => matchMedia(query).matches, MOTION)).toBe(false);
    expect(new Set(await opacities(page, ".reveal"))).toEqual(new Set(["1"]));
    expect(await page.locator(".reveal.is-visible").count()).toBe(0);
  });
});
