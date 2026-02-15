# Wagner Rosa — Personal Website

This repository contains a static, minimal, performance-oriented personal website.

The project prioritizes:

- Architectural clarity
- Zero unnecessary runtime
- Mobile-first layout
- Visual restraint
- Predictable structure
- Long-term maintainability

This document serves as:

1. Technical reference
2. Layout specification
3. Content generation guide (for future pages and AI usage)

---

# 1. Core Philosophy

The site is intentionally:

- Static (no framework)
- HTML-first
- Utility-driven (Tailwind CLI)
- Minimal JavaScript (theme only)
- Content-focused

Typography and spacing are treated as a system.
No decorative components.
No visual noise.

Every new page must preserve this discipline.

---

# 2. Tech Stack

- HTML5 (semantic)
- Tailwind CSS (CLI build)
- Vanilla JS (dark mode toggle)
- GitHub Pages (static hosting)

No framework.
No bundler.
No runtime hydration.

---

# 3. Project Structure

/
├── index.html
├── 404.html
├── input.css
├── output.css
├── tailwind.config.js
├── package.json
├── package-lock.json
├── README.md
├── PROJECT_ARCHITECTURE.md
├── assets/
│   ├── wagnerrosa-picture.jpg
│   ├── wagmoto.webp
│   └── wagnerrosa.ico
└── insights/

### Responsibilities

- `index.html` → Homepage (primary reference layout)
- `404.html` → Custom error page (same layout system)
- `insights/` → All article / SEO pages
- `input.css` → Tailwind entry
- `output.css` → Compiled CSS (committed)
- `tailwind.config.js` → Dark mode + content scan
- `assets/` → Static optimized assets

---

# 4. Layout System (Authoritative Reference)

All pages must follow this layout structure:

```html
<body class="bg-neutral-100 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 font-sans antialiased">
  <div class="max-w-xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
```
Container Rules
	•	Single centered column
	•	max-w-xl
	•	Responsive horizontal padding
	•	Generous top spacing
	•	Vertical rhythm via space-y-*

Never introduce:
	•	Sidebars
	•	Multi-column layout
	•	Cards
	•	Decorative sections
	•	Grids for content pages

⸻

## Responsive Strategy

The website is mobile-first by design.

All new pages must:

- Be fully usable and readable on small screens.
- Preserve vertical rhythm and spacing on mobile.
- Avoid layout shifts between breakpoints.
- Maintain centered container structure on desktop.
- Avoid horizontal scrolling.

Desktop is not a separate layout.

The same single-column structure must scale naturally across:

- Mobile
- Tablet
- Desktop

No alternative layouts per breakpoint.
No additional grid structures for larger screens.

#5. Header Pattern (Must Be Reused)

Every page must include:
	•	Profile image (rounded)
	•	Name
	•	Theme toggle button (◐)
	•	Same spacing and alignment

Header markup should mirror index.html.

⸻

#6. Typography Rules

Main content area:

```html
<main class="space-y-8 text-[22px] leading-8">
```

Guidelines:
	•	Body scale ≈ 22px
	•	Line height ≈ 32px
	•	Neutral palette
	•	No bold-heavy paragraphs
	•	Headings restrained (no oversized hero typography)

Use hierarchy sparingly.

⸻

#7. Dark Mode Strategy

Dark mode is:
	•	Class-based (darkMode: 'class')
	•	Initialized before CSS loads
	•	Persisted via localStorage
	•	System-preference aware

All new pages MUST:
	•	Include the dark-mode initialization script in <head>
	•	Include toggle script before </body>
	•	Apply dark: variants consistently

Never rely on media strategy.

⸻

#8. 404 Page Pattern

404 is:
	•	Same layout
	•	Same header
	•	Same container
	•	One visual element (image)
	•	Minimal copy
	•	Text link CTA (no button UI)

404 should feel intentional, not playful.

⸻

#9. Creating New Article Pages (insights/)

All articles must:
	1.	Be placed inside:

/insights/

Example:

/insights/ai-in-frontend.html

	2.	Reuse:

	•	Same <head> structure
	•	Same layout container
	•	Same header
	•	Same dark mode logic

	3.	Follow this content pattern:

```html
<main class="space-y-8 text-[22px] leading-8">
  <h1>Article Title</h1>
  <p>Intro paragraph.</p>
  <h2>Section</h2>
  <p>Content.</p>
</main>
```

Article Guidelines
	•	Long-form allowed
	•	No card layouts
	•	No grids
	•	No hero sections
	•	No sidebar
	•	No unrelated visual elements
	•	Use text as primary medium

Images (if any):
	•	Max width: container width
	•	Rounded-md only
	•	Lazy loading enabled

⸻

#10. SEO Structure for Insights

Each article must include:
	•	Unique <title>
	•	Unique <meta name="description">
	•	Open Graph tags
	•	Canonical URL
	•	Clean semantic headings

Avoid keyword stuffing.
Authority through clarity.

⸻

#11. Performance Rules

Never add:
	•	Frontend frameworks
	•	External UI libraries
	•	Icon packs
	•	CSS frameworks beyond Tailwind
	•	Heavy animations
	•	Scroll effects

Keep:
	•	Single CSS file
	•	Minimal JS
	•	Optimized images
	•	Static output

⸻

#12. When Generating Pages with AI

If generating new pages, the AI must:
	•	Follow this README strictly
	•	Use index.html and 404.html as layout references
	•	Place new content inside /insights/
	•	Preserve spacing, typography, and header pattern
	•	Keep design minimal and architectural

No deviation from layout system.

⸻

#13. Evolution Strategy

Possible future additions:
	•	Sitemap.xml
	•	RSS feed
	•	GitHub Actions build
	•	Content automation for insights

But always:

Static-first.
Framework-free.
Minimal.

⸻

Summary

This project is not a UI showcase.

It is an exercise in:
	•	Constraint
	•	Discipline
	•	Clarity
	•	Structural thinking

Every addition must respect the system.