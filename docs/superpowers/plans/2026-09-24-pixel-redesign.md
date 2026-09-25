# Pixel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CRT terminal portfolio with a clean, monochrome, single-page site on black whose portrait, headings, and logos resolve from pixel blocks.

**Architecture:** `page.tsx` is a server component that renders every piece of content as plain HTML, so the page is complete without JavaScript. A few small client components add motion on top: `PixelReveal` (canvas pixelation), `RevealOnScroll` (fade-up), `CountUp`, and a scroll-aware header. All motion CSS lives inside one media query, `(scripting: enabled) and (prefers-reduced-motion: no-preference)`, so no-JS and reduced-motion visitors get the final state with no script needed to decide. Pixel logos are precomputed 24×24 bitmaps rendered as single-path SVGs.

**Tech Stack:** Next.js 16.3 (App Router, Turbopack), React 19.2, TypeScript, Tailwind v4 (preflight + `sr-only` only), Playwright 1.63, ImageMagick (`magick`, one-off asset generation), `simple-icons` 16 (devDependency, only for the logo generator script).

**Spec:** `docs/superpowers/specs/2026-09-24-pixel-redesign-design.md`

## Global Constraints

- Work on branch `redesign/pixel`. Never commit to or merge into `main` in this plan.
- Palette: `#000` background, white text, grays only. The portrait is the only color on the page.
- No animation or WebGL libraries. Runtime dependencies stay `next`, `react`, `react-dom`.
- Nothing animates while the visitor is idle. Every animation is triggered by load, scroll, or hover and runs once or follows scroll.
- Every piece of content is in the server-rendered HTML in its final state. Without JavaScript, with `prefers-reduced-motion: reduce`, and in print, everything is visible.
- Must work at 360px wide with no horizontal scroll.
- Copy is carried over from the current `src/app/page.tsx`, with one correction: the patent result is stated as time **halved**, not "50% faster".
- `AGENTS.md`: this is Next.js 16. Check `node_modules/next/dist/docs/` before using an API you have not seen in this plan. `priority` on `next/image` is deprecated; use `preload`.
- Gate for every task: `npm run lint` and `npx tsc --noEmit` pass. The final task also runs `npm run build` and the full `npm run test:e2e`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Printing the page (Ctrl+P) before scrolling:** sections not yet revealed must still print. Tested in Task 4 (fade-ups) and Task 5 (pixel reveals).
2. **Opening a deep link such as `/#projects`:** the targeted section must be revealed, not stuck invisible. Tested in Task 4.
3. **Portrait fails to load (bad network, blocked request):** the hero must not stay blank. The reveal falls back to showing the element. Tested in Task 5.
4. **Scrolling down past the hero and back up:** the portrait dissolves and must come back fully sharp. Tested in Task 5.
5. **Keyboard users tabbing to a link inside an unrevealed section:** the focused link must become visible. Tested in Task 4.

## Deliberate Deviations from the Spec

Each change below keeps the spec's intent with less machinery. Flag any of them in review if the intent is not met.

- **Tool names are always shown** under each logo, not only on hover or focus. This is better for recruiters who skim, and for touch and screen-reader users.
- **Logo data** is a generated `src/lib/tech-logos.json` plus glyph monograms in `pixel-font.ts`, instead of a hand-written `src/components/logos.tsx`.
- **`PixelReveal` has no `finalBlockSize` prop.** Logos are already pixel bitmaps, so revealing them "to sharp" keeps them pixelated.
- **`PixelName` stays a server component.** The dot-by-dot draw-in is pure CSS using per-dot `--delay` values.
- **Motion is gated by the CSS media query `(scripting: enabled) and (prefers-reduced-motion: no-preference)`**, not by a class set from JavaScript. There is no head script, no flash, and no hydration mismatch.
- **Copy accuracy:** the patent result reads "Less time on patent reviews: 50%", because the source says the time was cut in half, not that reviews got 50% faster. The IFixandRepair monogram is "IF", since the pixel font is uppercase only.

---

## File Structure

| File | Responsibility | Task |
| --- | --- | --- |
| `src/lib/pixel-font.ts` | 5×7 glyph table, `textToBitmap`, `bitmapPath` | 1 |
| `src/components/pixel-bitmap.tsx` | Render any bitmap as one crisp SVG path | 1 |
| `src/components/pixel-name.tsx` | "KUDAY YURTER" dot lettering with per-dot delays | 1 |
| `scripts/build-tech-logos.mjs` | Regenerates `src/lib/tech-logos.json` from Simple Icons | 2 |
| `src/lib/tech-logos.json` | 16 generated 24×24 logo bitmaps | 2 |
| `src/assets/portrait*.{webp,png}`, `src/app/icon.png`, `src/app/apple-icon.png` | Portrait assets | 2 |
| `src/content/portfolio.ts` | All page copy and data | 3 |
| `src/components/section.tsx` | Section shell: eyebrow, `h2`, body | 3 |
| `src/components/site-header.tsx` | Sticky header and nav | 3, 4 |
| `src/app/page.tsx` | Page markup | 3, 4, 5, 6 |
| `src/app/layout.tsx` | Fonts and metadata | 2, 3 |
| `src/app/globals.css` | All styles | 3, 4, 5 |
| `src/lib/motion.ts` | `MOTION_QUERY`, `motionEnabled`, `onceInView` | 4 |
| `src/components/reveal-on-scroll.tsx` | Fade-up wrapper | 4 |
| `src/lib/pixelate.ts` | Canvas drawing, snapshots, text wrapping | 5 |
| `src/components/pixel-reveal.tsx` | Pixel reveal and scroll dissolve | 5 |
| `src/components/count-up.tsx` | Results strip numbers | 6 |
| `src/app/opengraph-image.tsx` | Link-preview image | 7 |
| `tests/pixel-font.spec.ts`, `tests/tech-logos.spec.ts`, `tests/pixelate.spec.ts` | Pure-function tests (Playwright runner, no browser page) | 1, 2, 5 |
| `tests/site.spec.ts` | Browser tests | 3–7 |
| **Deleted:** `src/components/terminal.tsx`, `tests/terminal.spec.ts`, `src/app/icon.svg`, `src/app/favicon.ico` | | 2, 3 |

**How tests run:** `playwright.config.ts` reuses a dev server already on port 3000 or starts one. Pure tests import from `@/…` directly; Playwright resolves the `tsconfig.json` `paths` alias. Run one file with `npx playwright test tests/<file>.spec.ts`.

---

### Task 1: Pixel font and bitmap primitives

**Files:**
- Create: `src/lib/pixel-font.ts`
- Create: `src/components/pixel-bitmap.tsx`
- Modify: `src/components/pixel-name.tsx` (full rewrite)
- Test: `tests/pixel-font.spec.ts`

**Interfaces:**
- Produces:
  - `type Bitmap = readonly string[]`
  - `glyphs: Record<string, Bitmap>`
  - `textToBitmap(text: string): string[]`
  - `bitmapPath(rows: Bitmap): string`
  - `<PixelBitmap rows={Bitmap} label?={string} className?={string} />`
  - `<PixelName />`: each `<rect>` carries a `--delay` CSS variable.

- [ ] **Step 1: Write the failing test**

Create `tests/pixel-font.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { bitmapPath, glyphs, textToBitmap } from "@/lib/pixel-font";

test("every glyph is 5 columns by 7 rows of 0/1", () => {
  for (const [char, rows] of Object.entries(glyphs)) {
    expect(rows, char).toHaveLength(7);
    for (const row of rows) expect(row, char).toMatch(/^[01]{5}$/);
  }
});

test("has glyphs for the name and every monogram", () => {
  for (const char of "KUDAYRTECMNIFV-") {
    expect(glyphs[char], char).toBeDefined();
  }
});

test("textToBitmap joins glyphs with a one-column gap", () => {
  const rows = textToBitmap("IF");
  expect(rows).toHaveLength(7);
  expect(rows[0]).toBe("11111" + "0" + "11111");
  expect(rows[6]).toBe("11111" + "0" + "10000");
});

test("textToBitmap rejects characters without a glyph", () => {
  expect(() => textToBitmap("Q")).toThrow('No pixel glyph for "Q"');
});

test("bitmapPath merges horizontal runs into one rectangle each", () => {
  expect(bitmapPath(["0110", "1001"])).toBe(
    "M1 0h2v1h-2zM0 1h1v1h-1zM3 1h1v1h-1z",
  );
  expect(bitmapPath(["000"])).toBe("");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/pixel-font.spec.ts`
Expected: FAIL. The module `@/lib/pixel-font` cannot be resolved.

- [ ] **Step 3: Implement `src/lib/pixel-font.ts`**

```ts
/** A 1-bit image: one string per row, "1" = filled pixel. */
export type Bitmap = readonly string[];

/** 5×7 glyphs for the pixel name and the company/school monograms. */
export const glyphs: Record<string, Bitmap> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
};

/** Lays glyphs out left to right with a one-column gap. */
export function textToBitmap(text: string): string[] {
  const rows: string[] = Array.from({ length: 7 }, () => "");
  [...text].forEach((char, index) => {
    const glyph = glyphs[char];
    if (!glyph) throw new Error(`No pixel glyph for "${char}"`);
    glyph.forEach((row, y) => {
      rows[y] += (index > 0 ? "0" : "") + row;
    });
  });
  return rows;
}

/** One SVG path for a bitmap, merging horizontal runs so large logos stay small in the DOM. */
export function bitmapPath(rows: Bitmap): string {
  let d = "";
  rows.forEach((row, y) => {
    for (const run of row.matchAll(/1+/g)) {
      const x = run.index ?? 0;
      const width = run[0].length;
      d += `M${x} ${y}h${width}v1h-${width}z`;
    }
  });
  return d;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/pixel-font.spec.ts`
Expected: 5 passed.

- [ ] **Step 5: Create `src/components/pixel-bitmap.tsx`**

```tsx
import { bitmapPath, type Bitmap } from "@/lib/pixel-font";

/** Renders a 1-bit bitmap as one crisp SVG path in the current text color. */
export function PixelBitmap({
  rows,
  label,
  className,
}: {
  rows: Bitmap;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${rows[0]?.length ?? 0} ${rows.length}`}
      fill="currentColor"
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={bitmapPath(rows)} />
    </svg>
  );
}
```

- [ ] **Step 6: Rewrite `src/components/pixel-name.tsx`**

The glyphs move to `pixel-font.ts`. Each dot gets a `--delay` so CSS can draw the name in dot by dot (Task 4). The delays are deterministic so server and client markup match.

```tsx
import type { CSSProperties } from "react";
import { textToBitmap } from "@/lib/pixel-font";

const WORDS = ["KUDAY", "YURTER"];
const DRAW_MS = 800;

// Scatters dot start times across DRAW_MS in a fixed order, so server and client markup match.
function dotDelay(index: number, total: number) {
  return Math.round((((index * 37) % total) / total) * DRAW_MS);
}

export function PixelName() {
  return (
    <span className="pixel-name" aria-hidden="true">
      {WORDS.map((word) => {
        const rows = textToBitmap(word);
        const dots = rows.flatMap((row, y) =>
          [...row].flatMap((pixel, x) => (pixel === "1" ? [{ x, y }] : [])),
        );
        return (
          <svg
            key={word}
            viewBox={`0 0 ${rows[0].length} ${rows.length}`}
            fill="currentColor"
          >
            {dots.map(({ x, y }, index) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width=".91"
                height=".91"
                style={
                  {
                    "--delay": `${dotDelay(index, dots.length)}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </svg>
        );
      })}
    </span>
  );
}
```

- [ ] **Step 7: Verify nothing else broke**

Run: `npm run lint && npx tsc --noEmit && npx playwright test tests/pixel-font.spec.ts tests/terminal.spec.ts`
Expected: lint and tsc clean; 5 + 9 passed. The terminal site still uses `PixelName` and must look the same.

- [ ] **Step 8: Commit**

```bash
git add src/lib/pixel-font.ts src/components/pixel-bitmap.tsx src/components/pixel-name.tsx tests/pixel-font.spec.ts
git commit -m "feat: add pixel font and bitmap primitives

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Portrait and logo assets

**Files:**
- Create: `scripts/build-tech-logos.mjs`, `src/lib/tech-logos.json` (generated)
- Create: `src/assets/portrait.webp`, `src/assets/portrait-head.webp`, `src/assets/portrait-og.png`, `src/app/icon.png`, `src/app/apple-icon.png`
- Delete: `src/app/icon.svg`, `src/app/favicon.ico`
- Modify: `src/app/layout.tsx` (remove the `icons` line), `package.json` (devDependency)
- Test: `tests/tech-logos.spec.ts`

**Interfaces:**
- Produces:
  - `src/lib/tech-logos.json`: `{ slug: string; title: string; rows: string[] }[]`. It has 16 entries, each 24 rows of 24 `0`/`1` characters, in the order of `EXPECTED` below.
  - Static imports `@/assets/portrait.webp` (640×640) and `@/assets/portrait-head.webp` (96×96).
  - `src/assets/portrait-og.png` (500×500) for Task 7.

- [ ] **Step 1: Write the failing test**

Create `tests/tech-logos.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import techLogos from "@/lib/tech-logos.json";

// Approved set from the spec. C#, Power BI, AWS, and Azure are absent from
// Simple Icons 16, so per the spec they are dropped from the grid (their
// names stay in the skills text).
const EXPECTED = [
  "python", "typescript", "javascript", "cplusplus", "rust", "react",
  "nodedotjs", "fastapi", "dotnet", "databricks", "apachespark",
  "scikitlearn", "linux", "neovim", "git", "docker",
];

test("tech logos are the approved set, in order", () => {
  expect(techLogos.map((logo) => logo.slug)).toEqual(EXPECTED);
});

test("each logo is a recognizable 24×24 bitmap", () => {
  for (const logo of techLogos) {
    expect(logo.title, logo.slug).not.toBe("");
    expect(logo.rows, logo.slug).toHaveLength(24);
    for (const row of logo.rows) expect(row, logo.slug).toMatch(/^[01]{24}$/);
    const filled = logo.rows.join("").replaceAll("0", "").length;
    expect(filled, `${logo.slug} filled pixels`).toBeGreaterThan(40);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/tech-logos.spec.ts`
Expected: FAIL. `@/lib/tech-logos.json` cannot be resolved.

- [ ] **Step 3: Add the generator**

Run: `npm install --save-dev simple-icons@^16`

Create `scripts/build-tech-logos.mjs`:

```js
// Regenerates src/lib/tech-logos.json: each Simple Icons (CC0) logo rasterized
// onto a 24×24 pixel grid. Run: node scripts/build-tech-logos.mjs
// Requires ImageMagick (`magick`) on PATH.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import * as icons from "simple-icons";

const SIZE = 24;
const KEYS = [
  "siPython", "siTypescript", "siJavascript", "siCplusplus", "siRust",
  "siReact", "siNodedotjs", "siFastapi", "siDotnet", "siDatabricks",
  "siApachespark", "siScikitlearn", "siLinux", "siNeovim", "siGit",
  "siDocker",
];

const logos = KEYS.map((key) => {
  const icon = icons[key];
  if (!icon) throw new Error(`simple-icons has no ${key}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="${icon.path}"/></svg>`;
  // Render large, downsample to the grid, then keep only the alpha channel as raw 8-bit gray.
  const alpha = execFileSync(
    "magick",
    ["-background", "none", "-density", "384", "svg:-", "-resize", `${SIZE}x${SIZE}!`,
     "-alpha", "extract", "-depth", "8", "gray:-"],
    { input: svg },
  );
  const rows = [];
  for (let y = 0; y < SIZE; y++) {
    let row = "";
    for (let x = 0; x < SIZE; x++) row += alpha[y * SIZE + x] >= 128 ? "1" : "0";
    rows.push(row);
  }
  return { slug: icon.slug, title: icon.title, rows };
});

writeFileSync(
  new URL("../src/lib/tech-logos.json", import.meta.url),
  `${JSON.stringify(logos, null, 2)}\n`,
);
console.log(`wrote ${logos.length} logos`);
```

- [ ] **Step 4: Generate and test**

Run: `node scripts/build-tech-logos.mjs && npx playwright test tests/tech-logos.spec.ts`
Expected: `wrote 16 logos`, then 2 passed.

If a logo fails the `> 40` check, it rasterized nearly empty. Print its rows (`node -e 'for (const l of require("./src/lib/tech-logos.json")) console.log(l.slug + "\n" + l.rows.join("\n").replaceAll("0"," ").replaceAll("1","█"))'`). If it is unreadable at 24×24, remove its key from both `KEYS` and `EXPECTED`, and note the removal in the commit message. Do not lower the threshold.

- [ ] **Step 5: Make the portrait assets**

The source file is outside the repo and must not be modified.

```bash
SRC="$HOME/Downloads/KudayPixelProfessional.png"
mkdir -p src/assets
magick "$SRC" -resize 640x640 -quality 88 src/assets/portrait.webp
magick "$SRC" -resize 500x500 src/assets/portrait-og.png
# Head-and-glasses crop for small sizes; transparent for the header/footer, flattened on black for icons.
magick "$SRC" -crop 820x820+217+20 +repage -resize 96x96 -quality 90 src/assets/portrait-head.webp
magick "$SRC" -crop 820x820+217+20 +repage -resize 256x256 -background black -flatten src/app/icon.png
magick "$SRC" -crop 820x820+217+20 +repage -resize 180x180 -background black -flatten src/app/apple-icon.png
git rm -q src/app/icon.svg src/app/favicon.ico
ls -l src/assets src/app/icon.png src/app/apple-icon.png
```

Expected: `portrait.webp` under 100 KB. If it is larger, rerun with `-quality 80`.

Open `src/app/icon.png` and `src/assets/portrait-head.webp` in an image viewer (or the Read tool). The crop must show the whole head (hair to beard) roughly centered, with glasses readable. If hair or beard is clipped, adjust the `+X+Y` offset or the square size and regenerate all three crops with the same geometry.

- [ ] **Step 6: Remove the old icon reference**

In `src/app/layout.tsx`, delete the line `  icons: { icon: "/icon.svg" },` from `metadata`. Next.js now picks up `src/app/icon.png` and `src/app/apple-icon.png` by file convention.

- [ ] **Step 7: Verify**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: all clean. The build's route list includes `/icon.png` and `/apple-icon.png`.

- [ ] **Step 8: Commit**

```bash
git add scripts/build-tech-logos.mjs src/lib/tech-logos.json tests/tech-logos.spec.ts src/assets src/app/icon.png src/app/apple-icon.png src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add pixel portrait assets and tech-logo bitmaps

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Static page (content, layout, styles; no motion yet)

This task replaces the terminal with the full page as static HTML and CSS. After it, the site is complete and usable; later tasks only add motion.

**Files:**
- Create: `src/content/portfolio.ts`, `src/components/section.tsx`, `src/components/site-header.tsx`, `tests/site.spec.ts`
- Modify: `src/app/page.tsx` (full rewrite), `src/app/layout.tsx` (full rewrite), `src/app/globals.css` (full rewrite)
- Delete: `src/components/terminal.tsx`, `tests/terminal.spec.ts`

**Interfaces:**
- Consumes: `PixelName`, `PixelBitmap`, `textToBitmap` (Task 1); `tech-logos.json`, `@/assets/portrait.webp`, `@/assets/portrait-head.webp` (Task 2).
- Produces (later tasks depend on these exact names):
  - `<Section id eyebrow title>`: renders `<section id>` with `<h2 id="{id}-title" className="section__title">`.
  - `results: { start?: number; value: number; prefix: string; suffix: string; label: string }[]` in `portfolio.ts`.
  - CSS class names: `.hero`, `.hero__portrait`, `.results`, `.result__value`, `.logo-grid`, `.site-header`, `.project`, `.job`.
  - Portrait alt text: `"Pixel-art portrait of Kuday Yurter"`. Primary nav: `<nav aria-label="Primary">`.

- [ ] **Step 1: Write the failing browser tests**

Create `tests/site.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/site.spec.ts`
Expected: FAIL. There is no "Primary" navigation, portrait image, or project `h3` headings; the terminal page is still served.

- [ ] **Step 3: Remove the terminal**

```bash
git rm -q src/components/terminal.tsx tests/terminal.spec.ts
```

- [ ] **Step 4: Create `src/content/portfolio.ts`**

```ts
export const links = {
  github: "https://github.com/namelessmonarch0",
  linkedin: "https://www.linkedin.com/in/kudayyurter/",
  email: "kudayyurter@gmail.com",
};

export const intro = {
  tagline: "Software · Data · AI — Houston, TX",
  headline: "Software engineer. Curious by default.",
  body: "I turn messy data into useful systems — pipelines, AI agents, and software that makes things work better.",
};

export const results: {
  start?: number;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
}[] = [
  { start: 35, value: 55, prefix: "35 → ", suffix: "", label: "Units per day, per machine" },
  { value: 98, prefix: "~", suffix: "%", label: "Correction-angle match" },
  { value: 50, prefix: "", suffix: "%", label: "Less time on patent reviews" },
];

export const about = [
  "I’m Kuday, a Computer Science student at Texas A&M University–Victoria, based in Houston. I build across software engineering, data, and AI — usually wherever there’s a slow process or a messy dataset worth improving.",
  "My path into software has been hands-on. I’ve repaired devices, supported computer labs, and run an e-commerce production floor. At Engrave Me Now, I taught myself Python to connect the business’s data. At Cummins, that curiosity grew into manufacturing pipelines, machine learning, and tools for engineers.",
  "Outside of work, I’m into Linux, fast terminal workflows, and game development with Raylib, Unreal Engine, and Unity. I enjoy tools that invite you to take them apart.",
];

export const skills = [
  ["Languages", "Python, SQL, TypeScript, JavaScript, C/C++, C#, Rust"],
  ["Data & AI", "Databricks, Delta Lake, PySpark, scikit-learn, Power BI, AWS Bedrock"],
  ["Applications", "React, Node.js, FastAPI, .NET, Power Platform, Dataverse"],
  ["Everyday tools", "Linux, Neovim, Git, Docker, Azure, CLI tooling"],
] as const;

export const education = {
  monogram: "TAMU-V",
  school: "Texas A&M University–Victoria",
  degree: "B.S. Computer Science · 3.8 / 4.0 GPA · President’s List",
  previously: "Previously: Associate of Science, Houston City College · 2022",
};

export const experience = [
  {
    monogram: "C",
    company: "Cummins",
    role: "Data Science Intern",
    date: "May 2026 — Present",
    location: "Columbus, IN",
    summary:
      "Built data pipelines, machine learning models, AI agents, and internal applications with the Components and Software AI department.",
    highlights: [
      "Automated Turbo Balancer data ingestion and analytics; insights helped raise throughput from 35 to 55 units per day per machine.",
      "Built a React and Dataverse skills hub, consolidating 5+ tools for an initial team of approximately 30 people.",
      "Created document-grounded agents for engineering quality, patent review, and project intake.",
    ],
  },
  {
    monogram: "EMN",
    company: "Engrave Me Now",
    role: "Operations Manager",
    date: "Jan 2025 — May 2026",
    location: "Katy, TX",
    summary:
      "Ran the production floor and built the software behind a business fulfilling more than 1,000 orders a week.",
    highlights: [
      "Connected three storefronts with a Python ETL pipeline using Amazon and Etsy APIs.",
      "Used custom analytics to help reduce inventory overhead by 20% and increase sales by 30%.",
      "Managed production, fulfillment, equipment maintenance, and collaboration with a remote team.",
    ],
  },
  {
    monogram: "IF",
    company: "IFixandRepair",
    role: "Store Manager & Repair Technician",
    date: "Dec 2020 — May 2022",
    location: "Houston, TX",
    summary:
      "Diagnosed and repaired over 100 mobile devices and computers, while managing store operations and customer support.",
    highlights: [
      "Hands-on hardware diagnostics, precision repairs, and operating system recovery.",
      "Maintained a 95% repair success rate across a range of devices and platforms.",
    ],
  },
];

export const projects = [
  {
    id: "01",
    name: "Turbo Balancer Intelligence",
    type: "Data engineering / ML",
    description:
      "From raw manufacturing data to useful decisions. An automated Databricks pipeline, live dashboards, and a model that reproduces a balancer’s correction angle approximately 98% of the time.",
    stack: "Python · Databricks · Delta Lake · scikit-learn",
    result: "35 → 55 units / day / machine",
    context: "Built at Cummins",
  },
  {
    id: "02",
    name: "Engineering AI Agents",
    type: "Applied AI",
    description:
      "Document-grounded agents for engineering quality, patent conflict review, and project intake. Built to turn unstructured information into actionable answers and structured proposals.",
    stack: "AWS Bedrock · Copilot Studio · Python",
    result: "Patent review time cut in half",
    context: "Built at Cummins",
  },
  {
    id: "03",
    name: "Skills & Capabilities Hub",
    type: "Full-stack development",
    description:
      "A React code app on Power Apps with a Dataverse backend. Brought five-plus disconnected tools into one place, initially deployed to a 30-person performance engineering team.",
    stack: "React · Dataverse · Power Apps · Power Automate",
    result: "~60% estimated reduction in effort",
    context: "Built at Cummins",
  },
  {
    id: "04",
    name: "E-commerce Data Pipeline",
    type: "Data engineering",
    description:
      "A self-built pipeline that unified sales and inventory from three storefronts. Connected Amazon and Etsy data to a custom analytics and forecasting dashboard while running day-to-day production.",
    stack: "Python · Amazon Seller API · Etsy API",
    result: "5+ hours of manual entry saved / week",
    context: "Built at Engrave Me Now",
  },
  {
    id: "05",
    name: "Space Debris Explorer",
    type: "Visualization / research",
    description:
      "An interactive exploration of 25 years of NASA orbital debris data. Country and time filters, trend analysis, and a 3D globe make a growing problem tangible.",
    stack: "MATLAB · NASA datasets · 3D graphics",
    result: "1st place · Grand Challenge Winter Summit",
    context: "Academic project · 2022",
  },
];
```

- [ ] **Step 5: Create `src/components/section.tsx`**

```tsx
import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section container" aria-labelledby={`${id}-title`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`} className="section__title">
        {title}
      </h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 6: Create `src/components/site-header.tsx`**

This is a server component for now; Task 4 makes it scroll-aware.

```tsx
import Image from "next/image";
import portraitHead from "@/assets/portrait-head.webp";

const NAV = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Contact", "#contact"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <a className="site-header__home" href="#top" aria-label="Back to top">
          <Image src={portraitHead} alt="" width={36} height={36} />
        </a>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Rewrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kudayyurter.dev"),
  title: "Kuday Yurter — Software, Data & AI",
  description:
    "I turn messy data into useful systems. Explore Kuday Yurter’s work in software engineering, data pipelines, and applied AI. Based in Houston, Texas.",
  openGraph: {
    title: "Kuday Yurter — Software, Data & AI",
    description:
      "Pipelines, AI agents, and software that makes things work better.",
    type: "website",
    url: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Rewrite `src/app/page.tsx`**

```tsx
import Image from "next/image";
import portrait from "@/assets/portrait.webp";
import portraitHead from "@/assets/portrait-head.webp";
import { PixelBitmap } from "@/components/pixel-bitmap";
import { PixelName } from "@/components/pixel-name";
import { Section } from "@/components/section";
import { SiteHeader } from "@/components/site-header";
import {
  about,
  education,
  experience,
  intro,
  links,
  projects,
  results,
  skills,
} from "@/content/portfolio";
import { textToBitmap } from "@/lib/pixel-font";
import techLogos from "@/lib/tech-logos.json";

function Monogram({ text, label }: { text: string; label: string }) {
  return (
    <span className="monogram">
      <PixelBitmap rows={textToBitmap(text)} label={label} />
    </span>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero__copy">
            <h1 id="hero-title">
              <span className="sr-only">Kuday Yurter</span>
              <PixelName />
            </h1>
            <p className="hero__tagline">{intro.tagline}</p>
            <p className="hero__headline">{intro.headline}</p>
            <p className="hero__intro">{intro.body}</p>
            <div className="hero__actions">
              <a className="button button--solid" href="#projects">
                View projects
              </a>
              <a className="button" href="#contact">
                Get in touch
              </a>
            </div>
          </div>
          <div className="hero__portrait">
            <Image
              src={portrait}
              alt="Pixel-art portrait of Kuday Yurter"
              preload
              sizes="(max-width: 800px) 70vw, 460px"
            />
          </div>
        </section>

        <ul className="results container" aria-label="Selected results">
          {results.map((result) => (
            <li className="result" key={result.label}>
              <span className="result__value">
                {`${result.prefix}${result.value}${result.suffix}`}
              </span>
              <span className="result__label">{result.label}</span>
            </li>
          ))}
        </ul>

        <Section id="about" eyebrow="About" title="A builder at heart.">
          <div className="prose">
            {about.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <ul className="logo-grid" aria-label="Tools I use">
            {techLogos.map((logo) => (
              <li key={logo.slug}>
                <PixelBitmap rows={logo.rows} label={logo.title} />
                <span aria-hidden="true">{logo.title}</span>
              </li>
            ))}
          </ul>
          <dl className="skills">
            {skills.map(([group, list]) => (
              <div key={group}>
                <dt>{group}</dt>
                <dd>{list}</dd>
              </div>
            ))}
          </dl>
          <div className="education">
            <Monogram text={education.monogram} label={education.school} />
            <div>
              <p className="eyebrow">Education</p>
              <h3>{education.school}</h3>
              <p>{education.degree}</p>
              <p className="muted">{education.previously}</p>
            </div>
          </div>
        </Section>

        <Section id="experience" eyebrow="Experience" title="Learning by building.">
          <ol className="timeline">
            {experience.map((job) => (
              <li className="job" key={job.company}>
                <Monogram text={job.monogram} label={job.company} />
                <div>
                  <p className="job__meta">
                    {job.date} · {job.location}
                  </p>
                  <h3>{job.company}</h3>
                  <p className="job__role">{job.role}</p>
                  <p>{job.summary}</p>
                  <ul>
                    {job.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
          <a className="text-link" href={links.linkedin} target="_blank" rel="noreferrer">
            View my LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </Section>

        <Section id="projects" eyebrow="Projects" title="Useful things, built.">
          <ol className="projects">
            {projects.map((project) => (
              <li className="project" id={`project-${project.id}`} key={project.id}>
                <span className="project__number">{project.id}</span>
                <div>
                  <p className="eyebrow">{project.type}</p>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p className="project__result">{project.result}</p>
                  <p className="project__stack">{project.stack}</p>
                  <p className="project__context">{project.context}</p>
                </div>
              </li>
            ))}
          </ol>
          <a className="text-link" href={links.github} target="_blank" rel="noreferrer">
            Find more on GitHub <span aria-hidden="true">↗</span>
          </a>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Let’s make something.">
          <p className="prose">
            Have a project in mind, an interesting problem, or a Linux setup to
            compare? I’d love to hear about it.
          </p>
          <a className="contact-email" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <div className="contact-links">
            <a className="button" href={links.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="button" href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="muted contact-note">
            Based in Houston, Texas. Interested in software, data engineering,
            and applied AI.
          </p>
        </Section>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner container">
          <Image src={portraitHead} alt="" width={24} height={24} />
          <span>© {new Date().getFullYear()} Kuday Yurter</span>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 9: Rewrite `src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  --bg: #000;
  --fg: #fff;
  --muted: #a3a3a3;
  --faint: #6b6b6b;
  --line: #262626;
  --max: 1100px;
  --gutter: 16px;
  --header: 64px;
  --mono: var(--font-geist-mono), ui-monospace, monospace;
  color-scheme: dark;
}

@media (min-width: 640px) {
  :root {
    --gutter: 32px;
  }
}

html {
  background: var(--bg);
  scroll-padding-top: var(--header);
}

body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
}

::selection {
  background: var(--fg);
  color: var(--bg);
}

:focus-visible {
  outline: 2px solid var(--fg);
  outline-offset: 3px;
}

.container {
  width: min(100% - 2 * var(--gutter), var(--max));
  margin-inline: auto;
}

.muted {
  color: var(--faint);
}

.eyebrow {
  margin: 0 0 12px;
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(0 0 0 / 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.site-header[data-scrolled="true"] {
  border-bottom-color: var(--line);
}
.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header);
}
.site-header__home img {
  display: block;
  image-rendering: pixelated;
}
.site-nav {
  display: flex;
  gap: clamp(12px, 3vw, 32px);
  font-size: 0.8125rem;
  color: var(--muted);
}
.site-nav a {
  text-decoration: none;
  transition: color 0.15s;
}
.site-nav a:hover {
  color: var(--fg);
}
@media (min-width: 640px) {
  .site-nav {
    font-size: 0.875rem;
  }
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: clamp(24px, 5vw, 64px);
  min-height: calc(100svh - var(--header));
  padding-block: 48px;
}
.hero h1 {
  margin: 0;
}
.pixel-name {
  display: grid;
  gap: 0.6rem;
  width: min(100%, 520px);
}
.pixel-name svg {
  display: block;
  height: auto;
}
.pixel-name svg:first-child {
  width: 82.86%; /* KUDAY is 29 columns vs YURTER's 35, so the pixels match */
}
.pixel-name svg:last-child {
  width: 100%;
}
.hero__tagline {
  margin: 28px 0 0;
  font-family: var(--mono);
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.hero__headline {
  margin: 20px 0 0;
  font-size: clamp(1.5rem, 3.4vw, 2.25rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 600;
}
.hero__intro {
  margin: 12px 0 0;
  max-width: 44ch;
  color: var(--muted);
  font-size: 1.0625rem;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.hero__portrait img {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}
@media (max-width: 800px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .hero__portrait {
    order: -1;
    width: min(70vw, 320px);
  }
}

/* Buttons and links */
.button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}
.button:hover {
  border-color: var(--fg);
}
.button--solid {
  background: var(--fg);
  border-color: var(--fg);
  color: var(--bg);
}
.button--solid:hover {
  background: #d4d4d4;
}
.text-link {
  display: inline-flex;
  gap: 8px;
  margin-top: 32px;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: var(--faint);
  transition: text-decoration-color 0.15s;
}
.text-link:hover {
  text-decoration-color: var(--fg);
}

/* Results strip */
.results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-block: 0;
  padding: 0;
  list-style: none;
  border-block: 1px solid var(--line);
}
.result {
  display: grid;
  gap: 4px;
  padding: 28px 0;
}
.result + .result {
  padding-left: 24px;
  border-left: 1px solid var(--line);
}
.result__value {
  font-family: var(--mono);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.result__label {
  font-size: 0.875rem;
  color: var(--muted);
}
@media (max-width: 640px) {
  .results {
    grid-template-columns: 1fr;
  }
  .result + .result {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid var(--line);
  }
}

/* Sections */
.section {
  padding-block: clamp(72px, 12vw, 140px);
}
.section__title {
  margin: 0 0 40px;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 600;
}
.prose {
  max-width: 62ch;
  color: var(--muted);
}
.prose p {
  margin: 0 0 1.1em;
}
.prose p:first-child {
  color: var(--fg);
  font-size: 1.125rem;
}

/* Logos */
.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 1px;
  margin: 48px 0 0;
  padding: 0;
  list-style: none;
  background: var(--line);
  border: 1px solid var(--line);
}
.logo-grid li {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 20px 8px;
  background: var(--bg);
  color: var(--muted);
  transition: color 0.15s;
}
.logo-grid li:hover {
  color: var(--fg);
}
.logo-grid svg {
  display: block;
  width: 40px;
  height: 40px;
}
.logo-grid span {
  font-family: var(--mono);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--faint);
  text-align: center;
}
.skills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin: 40px 0 0;
}
.skills dt {
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--faint);
}
.skills dd {
  margin: 6px 0 0;
  color: var(--muted);
}

/* Monograms */
.monogram {
  display: grid;
  place-items: center;
  flex: none;
  width: 56px;
  height: 56px;
  padding: 10px;
  border: 1px solid var(--line);
  color: var(--fg);
}
.monogram svg {
  display: block;
  width: 100%;
  height: auto;
}

/* Education */
.education {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--line);
}
.education h3 {
  margin: 0;
  font-size: 1.25rem;
}
.education p {
  margin: 4px 0 0;
  color: var(--muted);
}

/* Experience */
.timeline,
.projects {
  margin: 0;
  padding: 0;
  list-style: none;
}
.job {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 24px;
  padding: 32px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
}
.job__meta {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
}
.job h3 {
  margin: 6px 0 0;
  font-size: 1.375rem;
  color: var(--fg);
}
.job__role {
  margin: 2px 0 12px;
  color: var(--fg);
}
.job ul {
  margin: 12px 0 0;
  padding-left: 1.1em;
  list-style: square;
}
.job li + li {
  margin-top: 6px;
}

/* Projects */
.project {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 24px;
  padding: 36px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  transition: color 0.15s;
}
.project:hover {
  color: #d4d4d4;
}
.project__number {
  font-family: var(--mono);
  font-size: 0.875rem;
  color: var(--faint);
}
.project h3 {
  margin: 4px 0 12px;
  font-size: clamp(1.375rem, 3vw, 1.875rem);
  letter-spacing: -0.02em;
  color: var(--fg);
}
.project__result {
  margin: 16px 0 8px;
  font-weight: 600;
  color: var(--fg);
}
.project__stack,
.project__context {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--faint);
}
@media (max-width: 640px) {
  .job,
  .project {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* Contact */
.contact-email {
  display: inline-block;
  margin-top: 16px;
  font-size: clamp(1.5rem, 6vw, 3.5rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  text-decoration: none;
  overflow-wrap: anywhere;
  border-bottom: 2px solid var(--line);
  transition: border-color 0.15s;
}
.contact-email:hover {
  border-color: var(--fg);
}
.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.contact-note {
  margin-top: 32px;
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--line);
}
.site-footer__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-block: 32px;
  font-size: 0.8125rem;
  color: var(--faint);
}
.site-footer img {
  image-rendering: pixelated;
}

@media print {
  .site-header {
    position: static;
  }
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npx playwright test tests/site.spec.ts`
Expected: 4 passed.

- [ ] **Step 11: Look at it**

Open `http://localhost:3000` at desktop width and at 360px (browser devtools). Check the following. Fix any CSS problems before committing.
- The portrait is on the right; on phones it is above the name.
- The two name rows have equal pixel size.
- Logos read as pixel icons.
- Nothing overflows.

- [ ] **Step 12: Verify and commit**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean.

```bash
git add -A src tests
git commit -m "feat: replace terminal with static monochrome portfolio page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Scroll fade-ups, name draw-in, header hairline

**Files:**
- Create: `src/lib/motion.ts`, `src/components/reveal-on-scroll.tsx`
- Modify: `src/components/site-header.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: page structure and class names from Task 3.
- Produces:
  - `MOTION_QUERY: string`
  - `motionEnabled(): boolean`
  - `onceInView(element: Element, onEnter: () => void): () => void`: returns a cleanup function.
  - `<RevealOnScroll className?>`: renders `div.reveal`, which gains `.is-visible` once in view.

- [ ] **Step 1: Write the failing tests**

Append to `tests/site.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/site.spec.ts`
Expected: the 6 new tests FAIL (there are no `.reveal` elements and no `data-scrolled`); the 4 from Task 3 still pass.

- [ ] **Step 3: Create `src/lib/motion.ts`**

```ts
/**
 * Motion runs only when scripts run and the visitor has not asked for reduced
 * motion. globals.css gates every motion rule on this same query, so CSS and
 * JavaScript always agree. Browsers that do not know `scripting` get no motion.
 */
export const MOTION_QUERY =
  "(scripting: enabled) and (prefers-reduced-motion: no-preference)";

export function motionEnabled(): boolean {
  return window.matchMedia(MOTION_QUERY).matches;
}

/** Calls `onEnter` once, the first time `element` scrolls into view. Returns a cleanup function. */
export function onceInView(element: Element, onEnter: () => void): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        onEnter();
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  observer.observe(element);
  return () => observer.disconnect();
}
```

- [ ] **Step 4: Create `src/components/reveal-on-scroll.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionEnabled, onceInView } from "@/lib/motion";

/** Fades its children up the first time they scroll into view. */
export function RevealOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !motionEnabled()) return;
    return onceInView(element, () => element.classList.add("is-visible"));
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Wrap the content in `src/app/page.tsx`**

Import `RevealOnScroll` from `@/components/reveal-on-scroll`. Wrap each of the following in `<RevealOnScroll>…</RevealOnScroll>`:
- in About: the `.prose` div, the `.logo-grid` list, the `.skills` list, and the `.education` div;
- in Experience: each `<li className="job">`'s inner content (put the wrapper **inside** the `li`, around `Monogram` and the text `div`, and add `className="job__body"`), and the LinkedIn `.text-link`;
- in Projects: each project's inner content (same pattern, `className="project__body"`), and the GitHub `.text-link`;
- in Contact: everything after the `h2`, in a single wrapper;
- the `.results` list (wrap the whole `ul`).

Because the wrapper now sits inside `.job` and `.project`, move their grid layout onto the wrappers. Update `globals.css`: rename the selectors `.job {` → `.job__body {` and `.project {` → `.project__body {` in the grid rules only (and inside the 640px media query), and give `.job` and `.project` just `border-top: 1px solid var(--line);`. Keep `.project:hover` on `.project`.

- [ ] **Step 6: Make the header scroll-aware**

Rewrite `src/components/site-header.tsx`. Keep the markup identical except for the `ref` and the initial attribute:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import portraitHead from "@/assets/portrait-head.webp";

const NAV = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Contact", "#contact"],
] as const;

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => {
      header.dataset.scrolled = String(window.scrollY > 8);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header ref={ref} className="site-header" data-scrolled="false">
      <div className="site-header__inner container">
        <a className="site-header__home" href="#top" aria-label="Back to top">
          <Image src={portraitHead} alt="" width={36} height={36} />
        </a>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Add the motion CSS**

Append to `src/app/globals.css`. Keep the `@media print` block last so it wins.

```css
/* Motion: only when scripts run and motion is allowed (matches MOTION_QUERY in src/lib/motion.ts). */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }

  .reveal {
    transition:
      opacity 0.6s cubic-bezier(0.2, 0.7, 0.2, 1),
      transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .reveal:not(.is-visible) {
    opacity: 0;
    transform: translateY(12px);
  }

  .pixel-name rect {
    animation: dot-in 160ms ease-out var(--delay) both;
  }
}

@keyframes dot-in {
  from {
    opacity: 0;
  }
}
```

Then replace the existing `@media print` block at the end with:

```css
@media print {
  .site-header {
    position: static;
  }
  .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx playwright test tests/site.spec.ts`
Expected: 10 passed.

If the no-JavaScript test from Task 3 now fails because headings or content are hidden, then Chromium is reporting `scripting: enabled` with JavaScript off. In that case stop and report it; do not work around it silently. The whole gating strategy depends on that media feature.

- [ ] **Step 9: Verify and commit**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean. Reload `http://localhost:3000`: the name draws in dot by dot, and sections fade up as you scroll.

```bash
git add src tests
git commit -m "feat: add scroll fade-ups, name draw-in, and header hairline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Pixel reveal (portrait, headings, logos)

**Files:**
- Create: `src/lib/pixelate.ts`, `src/components/pixel-reveal.tsx`, `tests/pixelate.spec.ts`
- Modify: `src/app/page.tsx`, `src/components/section.tsx`, `src/app/globals.css`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: `motionEnabled`, `onceInView` (Task 4).
- Produces:
  - `wrapText(text: string, maxWidth: number, measure: (text: string) => number): string[]`
  - `drawPixelated(canvas: HTMLCanvasElement, source: CanvasImageSource, block: number): void`
  - `snapshot(element: Element, width: number, height: number): Promise<CanvasImageSource>`
  - `<PixelReveal trigger?="load"|"inView" scrollLinked?={boolean} delay?={number} className?>`: wraps exactly one child. Its root `div.pixel-reveal` has a `data-state` of unset, `"animating"`, `"done"`, or `"dissolving"`.

Deviation from the spec, on purpose: the spec lists a `finalBlockSize` prop so logos stay pixelated. The logos are already pixel bitmaps (Task 2), so revealing to sharp leaves them pixelated. The prop is not needed.

- [ ] **Step 1: Write the failing unit test**

Create `tests/pixelate.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { wrapText } from "@/lib/pixelate";

// Every character is 10px wide.
const measure = (text: string) => text.length * 10;

test("keeps text that fits on one line", () => {
  expect(wrapText("A builder at heart.", 500, measure)).toEqual(["A builder at heart."]);
});

test("wraps at word boundaries", () => {
  expect(wrapText("Useful things, built.", 150, measure)).toEqual([
    "Useful things,",
    "built.",
  ]);
});

test("puts an over-long word on its own line instead of splitting it", () => {
  expect(wrapText("a extraordinarily b", 50, measure)).toEqual([
    "a",
    "extraordinarily",
    "b",
  ]);
});

test("collapses whitespace and handles empty text", () => {
  expect(wrapText("  Let’s \n make   something. ", 1000, measure)).toEqual([
    "Let’s make something.",
  ]);
  expect(wrapText("   ", 100, measure)).toEqual([]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/pixelate.spec.ts`
Expected: FAIL. `@/lib/pixelate` cannot be resolved.

- [ ] **Step 3: Create `src/lib/pixelate.ts`**

```ts
let scratch: HTMLCanvasElement | undefined;

/** Greedy word wrap. A word wider than `maxWidth` gets its own line rather than being split. */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws `source` over the whole canvas as square blocks `block` device pixels wide. */
export function drawPixelated(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  block: number,
) {
  const ctx = canvas.getContext("2d");
  scratch ??= document.createElement("canvas");
  const small = scratch.getContext("2d");
  if (!ctx || !small) return;
  const { width, height } = canvas;
  const w = Math.max(1, Math.ceil(width / block));
  const h = Math.max(1, Math.ceil(height / block));
  scratch.width = w;
  scratch.height = h;
  small.drawImage(source, 0, 0, w, h);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scratch, 0, 0, w, h, 0, 0, w * block, h * block);
}

/** An image of `element` as it looks revealed: its <img>, its <svg> rasterized, or its text redrawn. */
export async function snapshot(
  element: Element,
  width: number,
  height: number,
): Promise<CanvasImageSource> {
  const img =
    element instanceof HTMLImageElement ? element : element.querySelector("img");
  if (img) {
    await img.decode();
    return img;
  }
  const svg =
    element instanceof SVGSVGElement ? element : element.querySelector("svg");
  if (svg) return rasterizeSvg(svg, width, height);
  return drawText(element, width, height);
}

async function rasterizeSvg(svg: SVGSVGElement, width: number, height: number) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  // currentColor has no parent to inherit from once serialized.
  clone.setAttribute("color", getComputedStyle(svg).color);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    new XMLSerializer().serializeToString(clone),
  )}`;
  await image.decode();
  return image;
}

async function drawText(element: Element, width: number, height: number) {
  await document.fonts.ready;
  const style = getComputedStyle(element);
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "top";
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
  const lines = wrapText(element.textContent ?? "", width, (text) => ctx.measureText(text).width);
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, index * lineHeight + (lineHeight - fontSize) / 2);
  });
  return canvas;
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `npx playwright test tests/pixelate.spec.ts`
Expected: 4 passed.

- [ ] **Step 5: Write the failing browser tests**

Append to `tests/site.spec.ts`:

```ts
test("the portrait resolves from pixels on load", async ({ page }) => {
  await page.goto("/");
  const reveal = page.locator(".hero .pixel-reveal");
  await expect(reveal).toHaveAttribute("data-state", "done");
  await expect(reveal.locator("canvas")).toBeHidden();
  await expect(page.getByRole("img", { name: PORTRAIT })).toHaveCSS("opacity", "1");
});

test("section headings resolve when scrolled to", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("#projects .pixel-reveal").first();
  expect(await title.getAttribute("data-state")).toBeNull();
  await title.scrollIntoViewIfNeeded();
  await expect(title).toHaveAttribute("data-state", "done");
  await expect(page.locator("#projects h2")).toBeVisible();
});

test("the portrait dissolves on scroll and comes back sharp", async ({ page }) => {
  await page.goto("/");
  const reveal = page.locator(".hero .pixel-reveal");
  await expect(reveal).toHaveAttribute("data-state", "done");
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(reveal).toHaveAttribute("data-state", "dissolving");
  await expect(reveal.locator("canvas")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(reveal).toHaveAttribute("data-state", "done");
  await expect(reveal.locator("canvas")).toBeHidden();
});

test("a portrait that fails to load does not leave the hero stuck", async ({ page }) => {
  await page.route(/portrait/, (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".hero .pixel-reveal")).toHaveAttribute("data-state", "done");
});

test("printing shows headings that never revealed", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  expect(new Set(await opacities(page, ".pixel-reveal > :first-child"))).toEqual(
    new Set(["1"]),
  );
  await expect(page.locator(".pixel-reveal__canvas:visible")).toHaveCount(0);
});

test.describe("with reduced motion, no pixel effects", () => {
  test.use({ reducedMotion: "reduce" });

  test("no canvas shows and nothing waits to reveal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".pixel-reveal__canvas:visible")).toHaveCount(0);
    expect(await page.locator(".pixel-reveal[data-state]").count()).toBe(0);
    expect(new Set(await opacities(page, ".pixel-reveal > :first-child"))).toEqual(
      new Set(["1"]),
    );
  });
});
```

- [ ] **Step 6: Run them to verify they fail**

Run: `npx playwright test tests/site.spec.ts`
Expected: the 6 new tests FAIL (there are no `.pixel-reveal` elements); the 10 earlier tests still pass.

- [ ] **Step 7: Create `src/components/pixel-reveal.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionEnabled, onceInView } from "@/lib/motion";
import { drawPixelated, snapshot } from "@/lib/pixelate";

/** Block size (CSS px) and how long it holds (ms): ~600ms total, slowing as it sharpens. */
const STEPS: [block: number, ms: number][] = [
  [16, 90],
  [8, 120],
  [4, 170],
  [2, 220],
];
const DISSOLVE_MAX_BLOCK = 32;

/**
 * Resolves its single child from coarse pixel blocks to sharp. The child is
 * real markup, so it stays readable without JavaScript, with reduced motion,
 * and to screen readers; the canvas is only a temporary overlay.
 *
 * data-state: unset (waiting) · "animating" · "done" · "dissolving" (scrollLinked only)
 */
export function PixelReveal({
  children,
  trigger = "inView",
  scrollLinked = false,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  trigger?: "load" | "inView";
  scrollLinked?: boolean;
  delay?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const target = root?.firstElementChild;
    if (!root || !canvas || !target || !motionEnabled()) return;

    let cancelled = false;
    let frame = 0;
    const timers: number[] = [];
    const setState = (state: string) => {
      root.dataset.state = state;
    };
    const fitCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = target.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      return { width, height, dpr };
    };

    const followScroll = (source: CanvasImageSource) => {
      const onScroll = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = root.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
          if (progress < 0.05) {
            setState("done");
            return;
          }
          const { dpr } = fitCanvas();
          const block = 2 + progress * (DISSOLVE_MAX_BLOCK - 2);
          drawPixelated(canvas, source, Math.round(block * dpr));
          setState("dissolving");
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    };
    let stopFollowing = () => {};

    const reveal = async () => {
      try {
        const { width, height, dpr } = fitCanvas();
        const source = await snapshot(target, width, height);
        if (cancelled) return;
        setState("animating");
        let at = delay;
        for (const [block, ms] of STEPS) {
          timers.push(
            window.setTimeout(() => drawPixelated(canvas, source, block * dpr), at),
          );
          at += ms;
        }
        timers.push(
          window.setTimeout(() => {
            setState("done");
            if (scrollLinked) stopFollowing = followScroll(source);
          }, at),
        );
      } catch {
        // A failed image or font load must never leave content hidden.
        if (!cancelled) setState("done");
      }
    };

    let stopObserving = () => {};
    if (trigger === "load") void reveal();
    else stopObserving = onceInView(root, () => void reveal());

    return () => {
      cancelled = true;
      stopObserving();
      stopFollowing();
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
    };
  }, [trigger, scrollLinked, delay]);

  return (
    <div ref={rootRef} className={`pixel-reveal ${className}`}>
      {children}
      <canvas ref={canvasRef} className="pixel-reveal__canvas" aria-hidden="true" />
    </div>
  );
}
```

- [ ] **Step 8: Use it**

`src/components/section.tsx`: import `PixelReveal` and wrap the heading so the wrapper carries the spacing:

```tsx
      <PixelReveal className="section__title-wrap">
        <h2 id={`${id}-title`} className="section__title">
          {title}
        </h2>
      </PixelReveal>
```

`src/app/page.tsx`:
- Replace the `<div className="hero__portrait">…</div>` element with `<PixelReveal trigger="load" scrollLinked className="hero__portrait">…</PixelReveal>`. Keep the same `Image` inside.
- In the logo grid, change the map to `techLogos.map((logo, index) => …)` and wrap the bitmap: `<PixelReveal delay={index * 40}><PixelBitmap rows={logo.rows} label={logo.title} /></PixelReveal>`.
- Import `PixelReveal` from `@/components/pixel-reveal`.

- [ ] **Step 9: Add the CSS**

In `src/app/globals.css`, change `.section__title { margin: 0 0 40px; … }` to `margin: 0;` and add `.section__title-wrap { margin-bottom: 40px; }` next to it. Then add, before the motion media query:

```css
/* Pixel reveal */
.pixel-reveal {
  position: relative;
}
.pixel-reveal__canvas {
  display: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  image-rendering: pixelated;
}
.pixel-reveal[data-state="animating"] > .pixel-reveal__canvas,
.pixel-reveal[data-state="dissolving"] > .pixel-reveal__canvas {
  display: block;
}
```

Inside the existing `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)` block, add. Use opacity, not visibility, so screen readers still reach the content:

```css
  .pixel-reveal:not([data-state="done"]) > :first-child {
    opacity: 0;
  }
```

Inside the `@media print` block, add:

```css
  .pixel-reveal > :first-child {
    opacity: 1 !important;
  }
  .pixel-reveal__canvas {
    display: none !important;
  }
```

- [ ] **Step 10: Run all tests to verify they pass**

Run: `npx playwright test`
Expected: all pass: 5 pixel-font, 2 tech-logos, 4 pixelate, 16 site.

- [ ] **Step 11: Look at it**

Reload `http://localhost:3000` and check:
- The portrait resolves 16→8→4→2→sharp.
- Scrolling down dissolves it and scrolling back restores it.
- Headings resolve when reached.
- Logos resolve left to right.
- Nothing jumps when a reveal finishes (the canvas and the real element must line up). If a heading visibly shifts at the swap, compare `drawText`'s line height with the CSS `line-height` of `.section__title`.

- [ ] **Step 12: Verify and commit**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean.

```bash
git add src tests
git commit -m "feat: pixel reveal for portrait, headings, and logos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Results count-up

**Files:**
- Create: `src/components/count-up.tsx`
- Modify: `src/app/page.tsx`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: `motionEnabled`, `onceInView` (Task 4); `results` (Task 3).
- Produces: `<CountUp start?={number} value={number} prefix?={string} suffix?={string} />`. Its visible number is `aria-hidden`, and the final value sits in an `sr-only` span.

- [ ] **Step 1: Write the failing tests**

Append to `tests/site.spec.ts`:

```ts
test("results count up once when they come into view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/");
  const first = page.locator(".result__value [aria-hidden]").first();
  await expect(first).toHaveText("35 → 35");
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveText("35 → 55");
  await expect(page.locator(".result__value .sr-only").first()).toHaveText("35 → 55");
});

test.describe("with reduced motion, results", () => {
  test.use({ reducedMotion: "reduce" });

  test("show final values immediately", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto("/");
    await expect(page.locator(".result__value [aria-hidden]")).toHaveText([
      "35 → 55",
      "~98%",
      "50%",
    ]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test tests/site.spec.ts -g "results"`
Expected: FAIL. There is no `[aria-hidden]` inside `.result__value`.

- [ ] **Step 3: Create `src/components/count-up.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motionEnabled, onceInView } from "@/lib/motion";

const DURATION_MS = 1200;

/** Shows the final value in the HTML, then counts up from `start` the first time it scrolls into view. */
export function CountUp({
  start = 0,
  value,
  prefix = "",
  suffix = "",
}: {
  start?: number;
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${value}${suffix}`;

  useEffect(() => {
    const element = ref.current;
    if (!element || !motionEnabled()) return;
    const format = (n: number) => `${prefix}${n}${suffix}`;
    let frame = 0;
    element.textContent = format(start);
    const stop = onceInView(element, () => {
      const began = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - began) / DURATION_MS);
        const eased = 1 - (1 - t) ** 3;
        element.textContent = format(Math.round(start + (value - start) * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(frame);
      element.textContent = format(value);
    };
  }, [start, value, prefix, suffix]);

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
    </>
  );
}
```

- [ ] **Step 4: Use it in `src/app/page.tsx`**

Import `CountUp` from `@/components/count-up`, and replace the contents of `<span className="result__value">`:

```tsx
<span className="result__value">
  <CountUp
    start={result.start}
    value={result.value}
    prefix={result.prefix}
    suffix={result.suffix}
  />
</span>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test tests/site.spec.ts`
Expected: 18 passed.

- [ ] **Step 6: Verify and commit**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean.

```bash
git add src tests
git commit -m "feat: count up the results strip

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Link-preview image, README, final verification, push

**Files:**
- Create: `src/app/opengraph-image.tsx`
- Modify: `README.md` (full rewrite), `tests/site.spec.ts`

**Interfaces:**
- Consumes: `textToBitmap`, `bitmapPath` (Task 1); `src/assets/portrait-og.png` (Task 2); `metadataBase` (Task 3).

- [ ] **Step 1: Write the failing test**

Append to `tests/site.spec.ts`:

```ts
test("serves a link-preview image", async ({ page, request }) => {
  await page.goto("/");
  const content = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(content).toBeTruthy();
  // metadataBase points at production; fetch the same path from the local server.
  const { pathname, search } = new URL(content!);
  const response = await request.get(pathname + search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/site.spec.ts -g "link-preview"`
Expected: FAIL, because there is no `og:image` meta tag.

- [ ] **Step 3: Create `src/app/opengraph-image.tsx`**

```tsx
/* eslint-disable @next/next/no-img-element -- ImageResponse renders plain <img>, not next/image */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { bitmapPath, textToBitmap } from "@/lib/pixel-font";

export const alt = "Kuday Yurter — Software, Data & AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SCALE = 14;

function pixelWord(word: string) {
  const rows = textToBitmap(word);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges"><path fill="#fff" d="${bitmapPath(rows)}"/></svg>`;
  return {
    src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    width: rows[0].length * SCALE,
    height: rows.length * SCALE,
  };
}

export default async function OpengraphImage() {
  const portrait = await readFile(join(process.cwd(), "src/assets/portrait-og.png"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          background: "#000",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {["KUDAY", "YURTER"].map((word) => {
            const image = pixelWord(word);
            return <img key={word} alt="" {...image} />;
          })}
          <div style={{ marginTop: 24, color: "#a3a3a3", fontSize: 28, letterSpacing: 4 }}>
            SOFTWARE · DATA · AI
          </div>
        </div>
        <img
          alt=""
          width={480}
          height={480}
          src={`data:image/png;base64,${portrait.toString("base64")}`}
        />
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Run it to verify it passes, and look at the image**

Run: `npx playwright test tests/site.spec.ts -g "link-preview"`
Expected: PASS.

Open the `og:image` URL on `localhost:3000` in a browser. You should see the name on the left, the portrait on the right, and nothing clipped at 1200×630.

- [ ] **Step 5: Rewrite `README.md`**

````markdown
# Kuday Yurter — portfolio

Source for [kudayyurter.dev](https://kudayyurter.dev): a single page on black, with a pixel-art portrait, pixel lettering, and pixel logos that resolve as you scroll. Built with Next.js 16 and React 19; no animation libraries.

## Development

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## How it fits together

- `src/content/portfolio.ts`: all copy (bio, experience, projects, results, links). Edit this to change what the page says.
- `src/app/page.tsx`: page markup, server-rendered, so the page is complete without JavaScript.
- `src/components/pixel-reveal.tsx`: canvas overlay that resolves its child from pixel blocks; the hero portrait also dissolves on scroll.
- `src/components/reveal-on-scroll.tsx`, `count-up.tsx`, `site-header.tsx`: the other small motion pieces.
- `src/lib/pixel-font.ts`: 5×7 glyphs for the name and company monograms.
- `src/lib/tech-logos.json`: 24×24 logo bitmaps generated from [Simple Icons](https://simpleicons.org) (CC0). Regenerate with `node scripts/build-tech-logos.mjs` (needs ImageMagick).

Motion only runs when `(scripting: enabled) and (prefers-reduced-motion: no-preference)` matches; otherwise, and in print, everything shows in its final state.

## Validation

```bash
npx playwright install chromium
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build
```

## Deploying

Pushes to `main` deploy to kudayyurter.dev on Vercel. Preview deployments are disabled.
````

- [ ] **Step 6: Full verification**

Run each and read the output:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

Expected: lint and tsc clean. The build prerenders `/`, `/_not-found`, `/icon.png`, `/apple-icon.png`, and `/opengraph-image`. All tests pass: 5 + 2 + 4 + 19.

- [ ] **Step 7: Commit and push the branch**

```bash
git add src README.md tests
git commit -m "feat: add link-preview image and update README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin redesign/pixel
```

Preview deployments are disabled, so this push does not deploy. Merging into `main` is the user's call and is not part of this plan.
