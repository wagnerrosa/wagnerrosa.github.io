# QA

Regression checks for the wheel: puppeteer-core with the system Chrome, axe-core and Lighthouse. They have their own `package.json`, so the deploy's `npm ci` never installs them.

```bash
npm run qa:install       # once: installs scripts/qa/node_modules
npm run build
npm run qa               # behaviour, a11y, contrast, reflow, keyboard (serves dist/ with astro preview on 4399)
npm run qa -- a11y       # only some of them
npm run qa -- lh         # Lighthouse, 3 runs per page and form factor (slow)
QA_BASE=https://wagnerrosa.com npm run qa -- lh   # against another server, e.g. the live site
```

Env: `QA_BASE` (default `http://localhost:4399`), `CHROME_PATH` (auto-detected on macOS and Linux), `QA_RUNS` and `QA_PERF` for `lh`.

| Check | What it verifies |
|---|---|
| `behavior` | one history entry per burst of stops, URL follows the wheel in < 1.3 s, About reads by key before turning the wheel, `←` in a scrolled code block, live region, no `will-change` at rest, hub does not move after first paint |
| `a11y` | axe (WCAG 2.0/2.1/2.2 A and AA + best practice) on 12 pages x desktop/mobile x light/dark, and on every home panel |
| `contrast` | every clickable wheel label reaches 4.5:1 at rest (light and dark) |
| `reflow` | no horizontal overflow at 320 px, 200% and 400% zoom |
| `keyboard` | Tab stops have a visible focus ring and are on screen; reduced motion runs no animations |
| `lh` | Lighthouse medians: Accessibility, Best Practices, SEO = 100; Performance >= 95 |

The exit code is non-zero when anything fails. The protected case page is the password gate, so `a11y` checks the gate, not the article.

Older one-off scripts (audit 2026-10-24: UX probes, screencasts, WebKit) stay in `positioning/notes/awwwards-audit-2026-10-24/tools/`.
