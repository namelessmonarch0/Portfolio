# Kuday Yurter — personal terminal

A portfolio you explore through a CLI. Built with Next.js 16, React 19, and a phosphor CRT display inspired by [Omarchy CRT](https://crt.omarchy.org/).

## Development

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). If your environment restricts Turbopack’s CSS worker, use `npm run dev -- --webpack` or `npm run build -- --webpack`. Google Fonts need network access during a fresh build.

## Using the terminal

The site starts with a short boot sequence, a welcome banner, and a command prompt. Skip the boot with Escape or the skip button. Commands print into a scrolling transcript; clickable command hints support touch and visitors unfamiliar with terminals.

| Command | Output |
| --- | --- |
| `help`, `ls` | Commands and keyboard shortcuts |
| `about`, `cat about.txt` | Biography, skills, and education |
| `experience`, `cat experience.log` | Roles and results |
| `projects`, `projects 03` | Selected work, optionally scrolled to one project |
| `contact`, `cat contact.txt` | Email and social links |
| `home`, `whoami` | Welcome banner or short introduction |
| `cd projects/` | Alias for a portfolio section |
| `theme` | Switch green / amber phosphor |
| `crt` | Toggle scanlines, glow, RGB fringing, and scan sweep |
| `clear` | Clear output while retaining command history |
| `reboot` | Reset the visitor session and replay startup |

Use ↑/↓ for command history, Tab to complete a command, and Ctrl+L to clear. Shift+Tab always moves focus backward; Tab on an empty or completed command moves forward normally.

Display preferences are saved locally. Reduced motion disables animation and skips startup. On touch devices, visiting the page does not automatically open the software keyboard. Content remains available without JavaScript and in print.

Share a section with `/#about` or a specific project with `/#project-03`. Project links remain valid after reload. Company projects are summaries; GitHub links point to the public profile.

## Files

- `src/app/page.tsx`: biography, experience, projects, skills, and contact links curated from `~/Resume/knowledge_base.md`. The private source is not bundled or required at runtime.
- `src/components/terminal.tsx`: boot, transcript, command handling, keyboard controls, hash navigation, and display preferences.
- `src/components/pixel-name.tsx`: custom SVG pixel lettering.
- `src/app/globals.css`: content layout, terminal styling, CRT effects, responsive rules, and print styles.
- `tests/terminal.spec.ts`: browser coverage for CLI interactions, startup, deep links, preferences, responsive layout, print, and no-JavaScript access.

## Validation

```bash
npx playwright install chromium
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

The browser tests start a local server when needed. The application is statically prerendered and requires no database, API keys, or external content service.
