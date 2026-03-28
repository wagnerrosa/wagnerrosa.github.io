# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # one-time setup
npm run all          # dev: Tailwind watch + live-server (http://127.0.0.1:8080/)
npm run build        # production: minified output.css
npm run dev          # Tailwind watch only
npm run serve        # live-server only
npx tailwindcss -i ./input.css -o ./output.css --minify  # manual CSS build
```

`output.css` is committed. Always rebuild it after changing HTML classes or `input.css`.

## Architecture

Static site with no framework, no bundler, no runtime hydration. HTML5 + Tailwind CSS CLI + vanilla JS only.

**Key files:**
- `index.html` — homepage, primary layout reference
- `about.html` — personal background (uses `article-body` for serif reading)
- `case-studies/index.html` — article hub (must be updated when adding new articles)
- `input.css` — Tailwind entry point with article-body, pull-quote, code-block, badge components
- `output.css` — compiled output (committed)
- `tailwind.config.js` — dark mode (`class`), content scan paths, custom fonts (Inter, Source Serif 4)
- `assets/micro-interactions.css` — 1.2KB animation library (scroll progress, back-to-top, hover states)

## Layout Rules (strictly enforced)

Every page must use this container — `max-w-2xl` is consistent across all pages:
```html
<body class="bg-neutral-100 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 font-sans antialiased">
  <div class="max-w-2xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
```

Never introduce: sidebars, multi-column layouts, cards, grids, hero sections, or decorative sections. Single centered column only, mobile-first.

## Header Pattern (required on every page)

```html
<header class="flex items-center mb-8">
  <img class="w-10 h-10 rounded-full mr-4" src="../assets/wagnerrosa-picture.jpg" alt="Wagner Rosa">
  <h2 class="text-base font-medium text-neutral-600 dark:text-neutral-300">
    <a href="/">Wagner Rosa</a>
  </h2>
  <button id="theme-toggle" aria-label="Toggle dark mode" class="ml-auto text-sm text-neutral-500 dark:text-neutral-400 px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">◐</button>
</header>
```

Header h2 is always `font-medium` without `font-serif` (it's UI, not editorial).

## Typography

### Font Pairing
- **Source Serif 4** (400, 600) — article/about body text (the reading font)
- **Inter** (400, 500, 600) — UI, headings h2-h4, navigation, meta

Google Fonts: `Source+Serif+4:ital,wght@0,400;0,600;1,400` + `Inter:wght@400;500;600`

### Scales
- **All pages** `<main>`: `class="article-body space-y-7"` — serif 18px body everywhere; homepage label line uses explicit `font-sans text-base font-normal`
- **Article/about** `<main>`: same `article-body space-y-7`
- `h1` (title): `text-3xl` (30px) serif semibold `leading-snug`
- `h2` (sections): `text-2xl` (24px) sans semibold `leading-snug` + `mt-14`
- `h3` (subsections): `text-xl` (20px) sans medium `leading-snug` + `mt-9`
- Body (articles): 18px serif, `leading-[1.667]` — inherited from `article-body` class
- Dark mode article text: `neutral-400` (reduced contrast for reading comfort)

## Content Elements (defined in input.css)

- **Pull quotes**: `<blockquote class="pull-quote"><p>Quote text</p></blockquote>`
- **Figures**: `<figure class="my-10"><img ...><figcaption class="mt-3 text-sm text-neutral-500 dark:text-neutral-400 text-center font-sans">Caption</figcaption></figure>`
- **Code blocks**: `<div class="code-block"><div class="flex ..."><span>Language</span></div><pre><code>...</code></pre></div>`
- **Inline code**: `<code>term</code>` (auto-styled with background pill)
- **Badges**: `<span class="badge">Tech Name</span>`
- **Definition lists**: `<dl class="space-y-5 my-6"><div class="pl-4 border-l-2 ..."><dt>Term</dt><dd>Def</dd></div></dl>`
- **Section dividers**: `<hr class="border-neutral-200 dark:border-neutral-800 my-14">`
- **Tables**: auto-styled inside `.article-body` (no outer border, subtle row dividers)
- **Lists**: auto-styled inside `.article-body` (softer markers via CSS)

## Dark Mode

Class-based, localStorage-persisted. Every page needs both scripts:

**In `<head>`** (prevents flash):
```html
<script>(function(){var d=document.documentElement;var t=localStorage.getItem('theme');if(t?t==='dark':(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){d.classList.add('dark');}})()</script>
```

**Before `</body>`**:
```html
<script>(function(){var r=document.documentElement;var b=document.getElementById('theme-toggle');if(b){b.addEventListener('click',function(){var d=r.classList.toggle('dark');localStorage.setItem('theme',d?'dark':'light');});}})()</script>
```

## Adding New Articles

1. Create `case-studies/new-article.html` — mirror head/header/dark-mode from existing articles
2. Use `<main class="article-body space-y-5">` for serif reading experience
3. Add reading time: `<p class="text-sm text-neutral-500 dark:text-neutral-400 font-sans">2026 · Category · X min read</p>`
4. Link `../assets/micro-interactions.css` (relative path from subdirectory)
5. Add scroll progress bar (first child of `<body>`) and back-to-top button (in `<footer>`)
6. Add required micro-interaction scripts before `</body>`
7. **Update `case-studies/index.html`** with new entry (newest first)
8. Run `npm run build` to rebuild CSS

Article footer navigation links use `data-track`, `data-category`, `data-location` attributes for analytics.

## Performance Constraints

Never add: frontend frameworks, external UI libraries, icon packs, additional CSS frameworks, heavy animations, or scroll effects beyond `micro-interactions.css`. Images: `.webp` preferred, `rounded-md` only, lazy loading, wrapped in `<figure>` with `<figcaption>`.

Analytics (Google Analytics + Microsoft Clarity) auto-disable on localhost and when `localStorage.dev_mode === 'true'`.
