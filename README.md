# wagnerrosa.com

Personal site of Wagner Rosa, UX Lead & Product Designer. Built with [Astro](https://astro.build) as a **static site**: the browser receives plain HTML, CSS and one small script (the navigation wheel). No framework runs in the page.

- **Content** lives in typed collections: `src/content/cases` (articles, MDX), `src/content/work` (home panels) and `public/assets/cv/Wagner-Rosa-CV-ATS-2026.md` (the CV, rendered at build time and still public as raw Markdown).
- **One source per fact.** Head tags, Open Graph, JSON-LD, hub, wheel, `sitemap.xml` and `llms.txt` are all generated from the same data (`src/data/site.ts` + the collections).
- **Every stop of the wheel is a real URL** with its own complete HTML, so the site works without JavaScript, is fully crawlable, and the legacy URLs (`/about.html`, `/case-studies/<slug>.html`, …) are unchanged.
- **Hosting:** GitHub Pages through GitHub Actions (`.github/workflows/deploy.yml`), custom domain via `public/CNAME`.

```bash
npm install
npm run dev       # http://localhost:4321/
npm run build     # dist/
npm run preview
```

Architecture, how to add an article, SEO rules and the password-protected case study are documented in [CLAUDE.md](CLAUDE.md) (also mirrored in `AGENTS.md`) and [scripts/README.md](scripts/README.md).

The previous Tailwind + hand-written HTML site is preserved at the git tag `legacy-final`.
