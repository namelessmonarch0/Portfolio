# Kuday Yurter — portfolio

Source for [kudayyurter.dev](https://kudayyurter.dev): a single page on black with pixel lettering, section headings that resolve from pixels as you scroll, and the tools I use shown with their real logos. Built with Next.js 16 and React 19; no animation libraries.

## Development

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## How it fits together

- `src/content/portfolio.ts`: all copy (bio, tech stack order, experience, work and personal projects, links). Edit this to change what the page says.
- `src/app/page.tsx`: page markup, server-rendered, so the page is complete without JavaScript.
- `src/components/pixel-reveal.tsx`: canvas overlay that resolves a section heading from pixel blocks.
- `src/components/reveal-on-scroll.tsx`, `site-header.tsx`: the other small motion pieces.
- `src/lib/pixel-font.ts`: 5×7 glyphs for the name and company monograms.
- `public/logos/`: tech-stack logos as SVGs. Sources: [Devicon](https://devicon.dev) (MIT), [Simple Icons](https://simpleicons.org) (Databricks, CC0), Microsoft's official [Power Platform icons](https://learn.microsoft.com/power-platform/guidance/icons) (Power Platform, Copilot Studio), and Wikimedia Commons (Power BI; Tux by Larry Ewing, lewing@isc.tamu.edu, created with The GIMP). Dark single-color marks (Rust, Unreal, Unity, the AWS wordmark) are recolored white to show on black. Logos are trademarks of their owners.

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
