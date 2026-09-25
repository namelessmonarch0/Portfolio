import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.TEST_BASE_URL || "http://localhost:3000" });

async function ready(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(
    page.getByRole("dialog", { name: "Terminal boot sequence" }),
  ).toBeHidden();
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).toBeVisible();
}

async function run(page: import("@playwright/test").Page, command: string) {
  await page.getByRole("textbox", { name: "Terminal command" }).fill(command);
  await page.getByRole("textbox", { name: "Terminal command" }).press("Enter");
}

test("commands append output; clear removes the transcript but retains command recall", async ({
  page,
}) => {
  await ready(page);
  await expect(
    page.getByRole("heading", { name: "Useful things, built." }),
  ).toBeHidden();
  await run(page, "about");
  await expect(
    page.getByRole("heading", { name: "A builder at heart." }),
  ).toBeVisible();
  await run(page, "projects");
  await expect(
    page.getByRole("heading", { name: "Useful things, built." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A builder at heart." }),
  ).toBeVisible();
  await run(page, "clear");
  await expect(
    page.getByRole("heading", { name: "A builder at heart." }),
  ).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Useful things, built." }),
  ).toBeHidden();
  const input = page.getByRole("textbox", { name: "Terminal command" });
  await input.press("ArrowUp");
  await expect(input).toHaveValue("clear");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("projects");
});

test("completion and history preserve the current draft", async ({ page }) => {
  await ready(page);
  const input = page.getByRole("textbox", { name: "Terminal command" });
  await input.fill("cd pro");
  await input.press("Tab");
  await expect(input).toHaveValue("cd projects/");
  await input.press("Enter");
  await input.fill("unfinished");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("cd projects/");
  await input.press("ArrowDown");
  await expect(input).toHaveValue("unfinished");
  await run(page, "does-not-exist");
  await expect(
    page
      .getByRole("region", { name: "does-not-exist output" })
      .getByText(/Command not found: does-not-exist/),
  ).toBeVisible();
});

test("startup boots and hands focus to the prompt", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("dialog", { name: "Terminal boot sequence" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Skip boot/ }).click();
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).toBeFocused();
});

test("typing after long output brings the active prompt back into view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await ready(page);
  await run(page, "projects");
  await expect(page.locator(".shell-entry").last()).toBeInViewport();
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).not.toBeInViewport();
  await page.keyboard.press("ArrowUp");
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).toBeInViewport();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.type("contact");
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "contact output" }),
  ).toBeVisible();
});

test("project deep links survive reload and repeated output has unique IDs", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#project-03");
  await expect(
    page.locator('.shell-output [data-project-id="project-03"]'),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator('.shell-output [data-project-id="project-03"]'),
  ).toBeVisible();
  await run(page, "projects");
  await run(page, "projects");
  const ids = await page
    .locator("[id]")
    .evaluateAll((nodes) => nodes.map((n) => n.id));
  expect(new Set(ids).size).toBe(ids.length);
});

test("clickable commands, browser history, and reboot work together", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.getByRole("button", { name: "about", exact: true }).click();
  await page.getByRole("button", { name: "contact", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "contact output" })
      .getByRole("link", { name: /kudayyurter@gmail/ }),
  ).toHaveAttribute("href", "mailto:kudayyurter@gmail.com");
  await page.goBack();
  await expect(page.locator(".shell-entry").last()).toHaveAttribute(
    "aria-label",
    "about output",
  );
  await run(page, "reboot");
  await expect(page.locator(".shell-entry")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Kuday Yurter" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Terminal command" })
    .press("ArrowUp");
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).toHaveValue("");
});

test("content remains readable without JavaScript and in print", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await context.newPage();
  await fallback.goto("http://localhost:3000");
  await expect(
    fallback.getByRole("heading", { name: "A builder at heart." }),
  ).toBeVisible();
  await expect(
    fallback.getByRole("heading", { name: "Useful things, built." }),
  ).toBeVisible();
  await expect(fallback.getByRole("dialog")).toBeHidden();
  await context.close();
  await ready(page);
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("heading", { name: "Useful things, built." }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Terminal command" }),
  ).toBeHidden();
});

test("terminal fits narrow screens and has no runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await run(page, "projects");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await run(page, "clear");
  }
  expect(errors).toEqual([]);
});

test("display preferences persist and reduced motion skips startup", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.getByRole("dialog")).toBeHidden();
  // Invalid colors silently discard an entire CSS background declaration.
  await expect(page.locator(".screen-effects")).toHaveCSS(
    "background-image",
    /90deg/,
  );
  await run(page, "theme");
  await run(page, "crt");
  await expect(page.locator(".terminal-page")).toHaveClass(/amber/);
  await expect(page.locator(".terminal-page")).toHaveClass(/crt-off/);
  await page.reload();
  await expect(page.locator(".terminal-page")).toHaveClass(/amber/);
  await expect(page.locator(".terminal-page")).toHaveClass(/crt-off/);
});
