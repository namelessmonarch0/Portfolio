# Repository security and design audit — 2026-09-25

Reviewed commit: `49be4ce`. Application source and dependency versions were not changed.

The design has a coherent identity: black background, white pixel lettering, restrained typography, thin separators, and recognizable logos. Preserve that identity. The priorities are dependency patching, readable secondary text, enlarged-text layouts, and bringing project evidence earlier in the page.

## Scope and evidence

- Reviewed application components, content, configuration, lockfile, public SVGs, and existing tests.
- Queried the live npm advisory registry and checked upstream advisories independently.
- Scanned 72 tracked files for common credential/private-key patterns; no matches. No full-history or entropy-based secret scan was performed.
- Read production homepage HTTP headers from `https://kudayyurter.dev`; did not run exploit payloads against production. Its deployed package versions were not independently verified.
- Inspected local Chromium screenshots at desktop and mobile sizes. Measured layouts at 320, 360, 768, and 1440 CSS pixels; checked 200% root text size at 320 and 360 pixels. This text-enlargement check is a stress test, not a complete browser zoom or assistive-technology certification.
- Used the Impeccable technical audit workflow. Its source detector returned `[]`; manual browser measurements found issues the detector does not cover. No formal dual-assessor design critique was run.
- No authenticated functionality, application API handlers, Server Actions, database, uploads, user-provided HTML, or remote image allowlist was found in the current source.

## Security findings

### S1 — P1: Patch vulnerable dependencies

`npm audit` reported **three affected packages: one critical and two high**, representing four advisories. These are package severity ratings, not proof that the current site exposes every vulnerable path. An additional recent Next.js advisory was found upstream but was absent from the npm response.

| Dependency | Evidence | Exposure in this repository | Recommended action |
| --- | --- | --- | --- |
| `next@16.3.1` | `package.json:13`, `package-lock.json:5290` | Two critical registry advisories; see conditions below | Upgrade to at least `16.3.6`; keep `eslint-config-next` aligned |
| `sharp@0.35.3` | `package-lock.json:6043`; installed through Next.js | High-severity libheif issue when decoding untrusted input; overlaps the Next.js AVIF finding | Resolve to `0.35.4` or newer compatible patched release |
| `js-yaml@4.3.1` | `package-lock.json:4726`; `npm explain js-yaml` identifies ESLint's dependency chain | High-severity CPU exhaustion on hostile YAML; development dependency, no application YAML ingestion found | Resolve to `4.3.2` or newer compatible patched release |

Upstream conditions:

1. **Windows-hosted Next.js RCE**, [GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36). Affected Next.js versions include `16.3.1`; patched in `16.3.3`. Requires a Windows filesystem on the server. The local workspace is Linux and the public response identifies Vercel, so this audit did not establish that condition here.
2. **Next.js AVIF image optimization RCE**, [GHSA-2xp9-vwfh-vxw4](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4). Patched in `16.3.3`. The app uses image optimization, but inspected assets are local PNG/WebP/SVG and there is no upload endpoint or configured external image source. No attacker-controlled AVIF input path was identified.
3. **Sharp/libheif**, [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c). Patched in `0.35.4`. The upstream issue affects processing of untrusted input under specified platform conditions; do not count this as a separately demonstrated application exploit.
4. **js-yaml merge-source CPU exhaustion**, [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh). Patched in `4.3.2`. Relevant to tools that parse malicious YAML; current application code does not do so.
5. **Newer `next/og` ImageResponse RCE**, [GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j), published September 22 and patched in `16.3.6`. The repository uses `ImageResponse` at `src/app/opengraph-image.tsx:26`, but inputs are fixed strings and a local portrait. The advisory explicitly excludes applications that do not pass attacker-controlled values into SVG content, attributes, or styles. The current implementation does not meet that exploit condition.

Recommended patch sequence: update Next.js and its ESLint config, refresh compatible Sharp/js-yaml resolutions in the lockfile, then rerun audit, lint, type checking, browser tests, and a production build. Review the dependency diff instead of applying `npm audit fix --force` indiscriminately. Add scheduled dependency update PRs and CI checks so advisories are caught without a manual review.

### S2 — P2: Add deliberate browser security headers

Location: `next.config.ts:3`.

The production homepage returns HSTS (`max-age=63072000`), which is good. Its response did not include Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy.

This is defense in depth, not a demonstrated XSS or account takeover. Current risk is lower because this is a public portfolio with no sensitive interactions.

Recommend `X-Content-Type-Options: nosniff`, a deliberate referrer policy, and framing protection using CSP `frame-ancestors 'none'` (and optionally `X-Frame-Options: DENY`). Restrict unused camera/microphone/geolocation capabilities. Plan script/style CSP separately and test it: Next.js inline bootstrapping, inline pixel animation styles, and data-URL image generation make a generic copied policy unsafe to assume. Nonce-based CSP requires dynamic rendering according to the installed Next.js guide; preserve static rendering unless that tradeoff is intentional.

The public homepage's wildcard CORS header was not classified as a vulnerability: it serves public, noncredentialed content.

## Interface audit

**Implementation integrity: pass.** Components, tokens, and content express a consistent portfolio-specific system. The detector produced zero findings; this does not imply accessibility compliance.

| Dimension | Score | Evidence |
| --- | --- | --- |
| Accessibility | 2/4 | Useful semantics and motion alternatives; confirmed small-text contrast failure |
| Performance | 3/4 | Static output, local images/fonts, no animation library; field Core Web Vitals not measured |
| Responsive design | 2/4 | Normal widths fit; 200% text introduces clipping/overflow and nav targets are small |
| Theming | 4/4 | Consistent intentional dark palette and reusable tokens; a light theme is not required |
| Implementation integrity | 4/4 | Coherent component structure and custom pixel identity; no detector findings |
| **Total** | **15/20 — Good** | Fix accessibility and responsive weaknesses first |

These are review scores, not a security grade or formal WCAG certification.

### D1 — P1: Secondary text fails minimum contrast

Location: `src/app/globals.css:7`, `:58`, `:270`, `:323`, `:358`.

`--faint: #6b6b6b` on `#000` measures **3.94:1**, below the **4.5:1** requirement for normal-sized text. It affects dates, employer eyebrows, project stacks, the contact note, and footer. The browser confirmed `rgb(107, 107, 107)` on job metadata. [WCAG contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum).

Raise the token to approximately `#808080` (5.32:1 on black). This keeps the subdued hierarchy while making it readable. `#757575` narrowly passes at 4.56:1, but offers less margin. Leave decorative hairlines subtle; their purpose differs from readable text.

### D2 — P1: Enlarged text breaks narrow layouts

Location: `src/app/globals.css:80`, `:89`, `:122`, `:137`, `:177`, `:236`.

Normal 320/360/768/1440px layouts had no horizontal overflow. At 200% root text size, the document expanded to **442px** in both 320px and 360px viewports. The navigation, side-by-side education block, Kessler URL, and email button overflow; stack labels also crowd adjacent cells. This makes navigation and reading harder for users enlarging text.

Allow navigation to wrap or adapt with an auto-height header; stack the education logo above its text when space is constrained. Use wrapping/min-width rules for long URLs, allow contact buttons to grow vertically, and size stack cells with text growth in mind. Add actual browser zoom and text-resize checks before treating the fix as WCAG 1.4.4/1.4.10 compliant.

### D3 — P2: Navigation targets are unnecessarily small

Location: `src/app/globals.css:95`.

Navigation links measured **20.8px high on mobile** and **22.4px on desktop**. Increase their clickable height to 44px using padding or inline-flex alignment while retaining the same small type. Contact buttons already use 44px height. This is an ergonomic recommendation; small targets with sufficient spacing can satisfy WCAG 2.5.8, so height alone is not proof of an AA failure.

### D4 — P2: The skills grid delays the strongest evidence

Location: `src/app/page.tsx:81`, `src/content/portfolio.ts:26`, `src/app/globals.css:177`.

At 360px wide, the Tech stack section occupies about **1,250px**; at 320px it occupies about **1,632px**. Work projects begin around **4,167px**, and personal projects around **6,262px**, on the 360px layout. All 25 tools receive similar prominence before visitors see the work.

Keep the real logos and labels. Show the strongest 8–12 tools first, with the rest in a compact secondary group or accessible disclosure; alternatively move the complete stack below projects. Give Kessler and one strong work outcome earlier visibility. Preserve the work/personal distinction and factual claims.

### D5 — P2: Repeated section spacing slows scanning

Location: `src/app/globals.css:151`, `:302`.

Every desktop section has up to 140px padding on both ends, creating **280px between adjacent section interiors**. The page measured about 7,362px tall at 1440px wide. The empty space reinforces the aesthetic, but repeating it everywhere gives supporting sections the same importance as the opening.

Keep the generous name-only hero. Reduce section padding to roughly 80–96px on desktop and 56–64px on mobile, then inspect the full page. Retain thin separators and the readable project text width. Use the most generous spacing around major transitions.

## Optional visual improvements

- **Show one or two real project visuals.** Kessler's globe and Dispatch's terminal would demonstrate the work more quickly than additional prose. Use restrained landscape images aligned to the existing content column, or pair one image with a project on desktop and stack it on mobile. Keep their natural interface colors against black. No confidential work screenshots are needed.
- **Make navigation reflect location.** A subtle underline and `aria-current="location"` can help orient visitors on this long page. Ensure Projects also represents the personal-project area, or add a small Work/Personal subsection index.
- **Keep the identity intact.** Preserve the black canvas, one-line pixel name, unboxed logos, white section headings, restrained motion, readable prose, and clean project rows. The current hero is intentionally name-only, as confirmed by existing tests; it does not need a new marketing block.

## Verification and limitations

| Check | Result |
| --- | --- |
| `npm audit --json` | 1 critical and 2 high package findings; upstream checks found one additional conditional Next.js advisory |
| `npm run lint` | Passed |
| `npx tsc --noEmit` | Passed |
| `npm run test:e2e -- --workers=2` | **35 passed** |
| `npm run build` | Failed with Turbopack worker port-binding `EPERM`; same error on escalated retry |
| `npm run build -- --webpack` | Passed; homepage and OG image prerendered statically |
| Browser screenshots and layout checks | Normal widths fit; enlarged text overflow reproduced; no page errors in initial captures |
| Impeccable source detector | Zero findings |
| Common credential-pattern scan | No matches in tracked working-tree files; not a complete secret audit |

The browser suite covers content, navigation, no-JavaScript rendering, reduced motion, print, failed-script fallback, and mobile overflow. It does not currently catch the contrast or enlarged-text problems. An extra keyboard-focus probe had timing-dependent observations and did not establish an additional defect; no keyboard failure is claimed here.

No Lighthouse score, field performance data, production deployment dependency attestation, full Git-history secret scan, exhaustive screen-reader testing, or penetration test was performed. The preexisting local dev server was reused and left running. Audit browser sessions were closed. Temporary measurements and screenshots are under `/tmp/portfolio-*`.

## Suggested order

1. Patch dependencies and verify both registry and upstream advisories.
2. Address D1–D3 with `$impeccable harden` / `$impeccable adapt`; add meaningful contrast and text-resize checks.
3. Add and verify production security headers.
4. Address D4–D5 with `$impeccable distill` / `$impeccable layout`, preserving the current visual identity.
5. Finish with `$impeccable polish` and rerun `$impeccable audit`.

Seven actionable findings: three P1 items (S1, D1, D2) and four P2 items (S2, D3, D4, D5). Optional visual ideas are not defects.
