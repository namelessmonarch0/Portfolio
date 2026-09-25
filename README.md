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
