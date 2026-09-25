# Pixel Redesign — Design Spec

- **Date:** 2026-09-24
- **Branch:** `redesign/pixel` (`main` keeps the CRT terminal site and stays live on kudayyurter.dev until this is merged)
- **Status:** Approved in conversation; awaiting written-spec review

## Goal

Replace the CRT terminal portfolio with a clean, single-page site on a pure black background, with smooth animations, pixelated effects, and logos.

**Audience:** recruiters and developers equally. Recruiters must be able to scan roles and results with no interaction. Pixel effects are a reward for people who explore, never a barrier to content.

**Success criteria**

1. Every piece of content is readable immediately without JavaScript, with reduced motion, and on a 360px-wide phone.
2. The page is monochrome (black, white, grays). The only color on the page is the pixel portrait.
3. Pixel effects run only on load, scroll, or hover. Nothing animates while the visitor is idle.
4. Lint, type check, production build, and Playwright tests pass.

## Decisions

| Topic | Decision |
| --- | --- |
| Visual concept | Idea 1, "Pixel dissolve": editorial layout; content resolves from pixel blocks on scroll |
| Palette | Monochrome: `#000` background, white text, grays for secondary text and hairlines. No accent color |
| Brand mark | `~/Downloads/KudayPixelProfessional.png` replaces the "K" logo |
| Logos | Tech-stack logos **and** company/school logos, all rendered as white pixel icons |
| Rendering approach | Canvas 2D + IntersectionObserver + CSS transitions. No animation library, no WebGL |
| Content | Carried over unchanged from the current `src/app/page.tsx` |

## Page Structure

One scrolling page, content max width ~1100px, centered.

1. **Header:** sticky and minimal. Portrait head crop on the left. Anchor links on the right: About · Experience · Projects · Contact, with smooth scrolling. A 1px gray hairline appears once the page scrolls.
2. **Hero:** most of the first screen.
   - Left: pixel-font "KUDAY YURTER" in white, assembling dot by dot. Tagline "Software · Data · AI — Houston, TX". Two buttons: *View projects* (`#projects`) and *Get in touch* (`#contact`).
   - Right: the full-color portrait. It assembles from pixel blocks on load and dissolves back into blocks as the hero scrolls away.
3. **Results strip:** three figures that count up once: **35 → 55 units/day**, **~98% correction-angle match**, **50% faster patent review**.
4. **About (`#about`):** bio paragraphs, a tech-logo grid (hover or focus shows the tool name), and an education block with the Texas A&M–Victoria mark.
5. **Experience (`#experience`):** vertical timeline of Cummins, Engrave Me Now, and IFixandRepair. Each entry has a pixel company mark, role, dates, location, summary, and highlights. It ends with a LinkedIn link.
6. **Projects (`#projects`):** the five existing projects as borderless rows. Each row shows the number, type, title, description, result in bold white, stack, and context. The row brightens on hover. It ends with a GitHub link.
7. **Contact (`#contact`):** email in large type, GitHub and LinkedIn links, "Based in Houston, Texas."
8. **Footer:** © line with the small portrait head.

**Removed:** boot sequence, command prompt, command parsing, transcript, CRT effects (scanlines, glow, RGB fringing, scan sweep), green/amber themes, localStorage display preferences, and the terminal hash routing. Plain anchors (`/#about`, `/#projects`, …) replace the hash routing.

## Motion and Pixel Effects

### `<PixelReveal>` (canvas)

It draws its source (image, or text rendered to an offscreen canvas) at low resolution, then scales it up with `imageSmoothingEnabled = false` so it looks blocky. Block size steps 16 → 8 → 4 → 2 px over ~600ms with an ease-out curve. On completion it hides the canvas and shows the real element, so text stays selectable and images stay crisp.

Props:
- `trigger`: `"load" | "inView"`
- `scrollLinked`: boolean. When true, block size is driven by how far the element has scrolled out of view. It is reversible and applies to the hero portrait only.
- `finalBlockSize`: number, default `1` (sharp). Logos use a coarse final grid so they stay pixelated.
- `delay`: ms, for staggering.

Used for:
- **Hero portrait:** `trigger="load"`, `scrollLinked`.
- **Section headings:** `trigger="inView"`, runs once.
- **Logo grids:** `trigger="inView"`, staggered 40ms left to right. Logos settle on a ~24×24 grid.

### `<PixelName>`

Keeps the existing glyph table. On mount, the dots appear in random order over ~800ms.

### CSS-only motion

- Content blocks fade up ~12px on entering the viewport (`<RevealOnScroll>`, one-shot).
- Buttons, links, and project rows change brightness on hover and focus (~150ms).
- `scroll-behavior: smooth` is set for anchor navigation.

### `<CountUp>`

The results strip numbers animate once when they come into view.

### Reduced motion and no JavaScript

- `prefers-reduced-motion: reduce`: all content shows in its final state. No canvas animation, fades, count-ups, or smooth scrolling.
- Without JavaScript, the server-rendered HTML contains every image and text in its final state. Canvases are enhancements layered on top and are `aria-hidden`.

## Code Layout

| File | Role |
| --- | --- |
| `src/app/page.tsx` | Server component: content data + section markup |
| `src/app/layout.tsx` | Fonts, metadata, Open Graph, icons |
| `src/app/globals.css` | Rewritten small monochrome stylesheet; replaces the 1,588-line CRT stylesheet |
| `src/components/pixel-reveal.tsx` | Client: canvas pixelation effect |
| `src/components/reveal-on-scroll.tsx` | Client: IntersectionObserver fade-up wrapper |
| `src/components/pixel-name.tsx` | Kept; adds dot-by-dot draw-in (client) |
| `src/components/count-up.tsx` | Client: one-shot number animation |
| `src/components/logos.tsx` | Tech icon data (Simple Icons paths) + company monograms |
| `src/components/terminal.tsx` | **Deleted** |

Only the components above run client-side. Everything else is server-rendered and statically prerendered. Before writing code, check the Next.js 16 docs in `node_modules/next/dist/docs/` (per `AGENTS.md`) for current conventions on metadata, icons, `next/image`, and client components.

## Assets

- **Portrait:** optimized WebP (~640px, target < 100 KB) in `public/`. The original file is left untouched.
- **Portrait head crop:** a small square used for `src/app/icon.*`, the header, and the footer. It replaces `src/app/icon.svg`.
- **Open Graph image:** 1200×630, portrait and pixel name on black.
- **Tech logos:** SVG paths from Simple Icons (CC0). Initial set: Python, TypeScript, JavaScript, C++, C#, Rust, React, Node.js, FastAPI, .NET, Databricks, Apache Spark, scikit-learn, Power BI, AWS, Azure, Linux, Neovim, Git, Docker. Any icon missing from Simple Icons is dropped from the grid; its name stays in the skills text.
- **Company and school marks:** pixel monograms (Cummins "C", Engrave Me Now "EMN", IFixandRepair "iF", Texas A&M–Victoria "TAMU-V") drawn on the same pixel grid. Real logo files can replace them later without code changes beyond the data entry. They are used only to identify employers and school, with no implied endorsement.

## Testing

`tests/terminal.spec.ts` is replaced by `tests/site.spec.ts` (Playwright, Chromium):

1. All sections and key content render: name, each company, each project title, email.
2. With JavaScript disabled, the same content is present and the portrait `<img>` is visible.
3. Header anchor links move the viewport to each section.
4. With `reducedMotion: "reduce"`, no canvas is visible and content is at final opacity.
5. At 360px width: no horizontal overflow; no console errors or page errors.
6. After the load animation, the portrait image is visible and the hero canvas is hidden.

Gate: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e` all pass.

## Shipping

- Work happens on `redesign/pixel`, committed and pushed. Preview deployments are disabled, so nothing deploys.
- The user reviews locally at `localhost:3000`.
- The redesign goes live only when the user asks to merge into `main`.

## Out of Scope

- An interactive tech-logo particle field in the hero (Idea 2). Candidate for a later addition.
- Pixel-art icons per project (Idea 3).
- Motion or WebGL libraries.
- Blog, CMS, analytics, or contact form.
