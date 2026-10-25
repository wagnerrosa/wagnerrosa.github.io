# AGENTS.md

This file provides guidance to Codex (codex.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # one-time setup
npm run dev              # astro dev server (http://localhost:4321/)
npm run build            # production build into dist/
npm run preview          # serve dist/ locally
npm run build:protected  # re-encrypt the password-protected case study (local only, needs private/ and .env.local)
npm run seo:snapshot     # snapshot head/JSON-LD/links/text of dist/ → positioning/baseline/current.json
npm run seo:diff         # compare that snapshot with the legacy site (git tag legacy-final)
```

Deploy: pushing to `main` runs `.github/workflows/deploy.yml` (Pages source: **GitHub Actions**). Nothing generated is committed except the encrypted blob `public/case-studies/planton-genius.html`.

## Architecture

Astro, static output, no UI framework in the browser. The only script is the wheel engine (`src/scripts/wheel.ts`). Tailwind is gone; styling is plain CSS with tokens.

```
astro.config.mjs        site, build.format 'preserve' (keeps /about.html, /case-studies/<slug>.html), mdx, external-link rehype plugin
src/content.config.ts   zod schemas: cases (articles), privateCases, work (home panels), cv. A missing SEO field breaks the build.
src/content/cases/*.mdx one file per article: frontmatter + MDX body
src/content/work/*.md   Nelogica, Carburante, Planton, FIERGS (home panels)
src/data/site.ts        identity, contact, hero/about copy, Person JSON-LD node. Single source.
src/lib/model.ts        builds the wheel stops from the collections (order, URLs, titles)
src/lib/jsonld.ts       JSON-LD builders; src/lib/seo.ts the Seo props
src/layouts/Shell.astro the only layout: head, wheel, stage
src/components/         Seo, JsonLd, Analytics, ThemeScript, Article, panels/*, mdx/*
src/scripts/wheel.ts    the dial: rotation, layers, routes + history, reading mode, keyboard, touch
src/styles/             tokens.css, base.css, wheel.css, article.css
src/pages/              index, about, cv, 404, case-studies/index, case-studies/[slug], sitemap.xml.ts, llms.txt.ts
public/                 CNAME, robots.txt, favicons, og image, CV (.md + PDF), videos, encrypted case blob
private/                git-ignored: planton-genius.mdx (source of the protected case)
scripts/                seo-snapshot.mjs, build-protected.sh, gate-template.html, og-template.html
```

### URLs and the wheel

Every wheel stop is a real URL and every URL is a complete page that works without JS:

| Stop | URL | Real HTML on |
|---|---|---|
| Home, Nelogica, Carburante, Planton, FIERGS, Contact | `/`, `/#nelogica`, … `/#contact` | `/` |
| Case studies, each case summary | `/case-studies/`, `/case-studies/#<slug>` | the hub |
| About | `/about.html` | `/about.html` |
| An article | `/case-studies/<slug>.html` | the article page |
| CV | `/cv.html` | rendered from `public/assets/cv/Wagner-Rosa-CV-ATS-2026.md` at build time |

`Panels.astro` renders every panel on every page: the ones that belong to the URL as real HTML, the rest inside inert `<template>`s (no duplicated content for crawlers, instant rotation for visitors). Articles are fetched on demand and read in place; closing them returns the wheel to the case's row. Rules (audit decision B1): turning the wheel navigates; scrolling a page never does — only a deliberate overscroll at its end.

## Adding an article

1. Create `src/content/cases/<slug>.mdx` with the frontmatter from `src/content.config.ts` (title, short, client, icon, year, category, description, blurb, dates, order…). Content goes in MDX; components come from `src/components/mdx` (`Lead`, `PullQuote`, `Figure`, `Video`, `Facts`, `Checks`, `Steps`, `LinkList`, `DefList`, `CodeBlock`, `Badges`, `Note`).
2. Put images in `src/assets/<folder>/` and reference them as `<Figure src="folder/file.webp" alt="…">caption</Figure>` (optimised by `astro:assets`). Videos live in `public/assets/…`.
3. Media-led cases: set `presentation: editorial` (not `layout`, which MDX reads as a layout import). The article gets a wider stage; prose keeps the 700px measure and anything with class `.wide` spans it. Primitives in `src/components/mdx`: `SectionHead`, `Stage`, `Funnel`, `Shots`, `Annotated`, `Clips`, `Questions`, `Tradeoff`, `Medals`, `Timeline` (`Readout` is internal). Case-specific pieces go in `src/components/cases/<slug>/` (Carburante: each section is a `Beat`, with no box and no rules; only the evidence sits on a plate (`Stack`, `OcrPlate`, `GapPlate`, …); see `positioning/notes/carburante-direcao-2026-10-25.md`), case identity in a `[data-slug]` block of `src/styles/editorial.css`. Clips are `video[data-clip]`: poster until visible, played by `wheel.ts` while on screen, never under reduced motion. Model: `positioning/notes/case-model-2026-10-25.md`.
4. That's it: the wheel row, hub entry, sitemap, llms.txt, JSON-LD and reading time come from the frontmatter. `wheel: false` / `hub: false` keep an article off the wheel/hub; `noindex: true` adds the robots tag.
5. `npm run build`, then `npm run seo:snapshot && npm run seo:diff` (and `npm run build:protected` when styles or scripts changed).

## SEO and LLM parity

Head, Open Graph, canonical, hreflang (Planton Academy EN/PT), robots, JSON-LD (Person + WebSite + Carburante on `/`, ProfilePage on about/CV, Article on articles, CollectionPage + ItemList on the hub), `sitemap.xml` (real `lastmod`), `llms.txt` and `robots.txt` are all generated from the same data. Rules:

- No schema without a visible counterpart on the page.
- Full name ("Wagner da Rosa de Souza") only in the About meta description and the Person `alternateName`.
- No pages per keyword, no Instagram `sameAs`, no Lattes/ORCID/Wikidata (see `positioning/`).
- `site.cv.dateModified` in `src/data/site.ts` must be bumped with every edit of the CV `.md`.
- After a layout or head change run `npm run seo:snapshot && npm run seo:diff` and read the diff.

## Design rules

- Two columns on desktop (wheel left, page right); on ≤ 820px the wheel is an arc on the right edge that opens as a sheet. Keep a gutter on the page wider than the arc's touch handle.
- Tokens in `src/styles/tokens.css`. Fonts (self-hosted via Fontsource): Figtree (display), Inter (UI), Source Serif 4 (reading).
- Link arrows: `→` internal, `↗` external, `↓` download, and `↑`/`↓` for links that turn the wheel backward/forward.
- Panels are container-query driven (`cqi`), not viewport driven.
- Keep `prefers-reduced-motion` working; text never below 11px.
- Do not add frameworks, icon packs, or scroll effects beyond the wheel.

## Dark mode

`<html data-theme="dark|light">`, set before first paint by `ThemeScript.astro` from `localStorage.theme`, otherwise the system preference. The toggle is in the wheel column.

## Analytics

`Analytics.astro`: Google Analytics + Microsoft Clarity, off on localhost, with `localStorage.dev_mode = 'true'`, or after `?preview=dev`. Links carry `data-track`, `data-category`, `data-location`; one delegated listener sends them. GA4 must have *Enhanced measurement → Page changes based on browser history events* on, because the wheel navigates with `pushState`.

## Password-protected case study

`private/planton-genius.mdx` (git-ignored) → `npm run build:protected` builds it with `INCLUDE_PRIVATE=1`, encrypts the page with staticrypt using `scripts/gate-template.html`, and writes `public/case-studies/planton-genius.html` (committed). Password: `.env.local` → `STATICRYPT_PASSWORD`; salt in `.staticrypt.json` (both git-ignored — back them up). The public stub `src/content/cases/planton-genius.mdx` carries only the frontmatter for the wheel and hub. **The blob freezes the page shell:** re-run `build:protected` whenever the layout, styles or scripts change, and keep images of private articles in `public/`. Details: `scripts/README.md`.

Do not add the protected page to `robots.txt`: the gate sends `noindex, nofollow`, and a `Disallow:` would stop crawlers from seeing it.
