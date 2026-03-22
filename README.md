# Wagner Rosa – Personal Website

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

Here's the quickest way to start your local server and live CSS rebuild.

1. Install dependencies (one-time):
  - From the project root: npm install
2. Start Tailwind watch (rebuilds output.css on save):
  - In one terminal: npm run dev
3. Start the static server:
  - In a second terminal: npm run serve
  - Opens at http://127.0.0.1:8080/


# 1. Core Philosophy

The site is intentionally:

- Static (no framework)
- HTML-first
- Utility-driven (Tailwind CLI)
- Minimal JavaScript (theme + micro-interactions only)
- Content-focused

Typography and spacing are treated as a system.
No decorative components.
No visual noise.

Every new page must preserve this discipline.

---

# 2. Tech Stack

- HTML5 (semantic)
- Tailwind CSS (CLI build)
- Vanilla JS (dark mode + minimal interactions)
- GitHub Pages (static hosting)

No framework.
No bundler.
No runtime hydration.

---

# 3. Project Structure

```text
/
├── index.html
├── about.html
├── 404.html
├── input.css
├── output.css
├── tailwind.config.js
├── package.json
├── package-lock.json
├── README.md
├── assets/
│   ├── wagnerrosa-picture.jpg
│   ├── wagmoto.webp
│   ├── wagmarathon.webp
│   ├── wagnerrosa.ico
│   └── micro-interactions.css
└── insights/
    ├── index.html
    ├── architecture-of-intelligence.html
    ├── the-invisible-frontier.html
    ├── building-a-sub-500ms-site-2026.html
    └── iel-rs-ux-redesign.html
```

### Responsibilities

- `index.html` → Homepage (primary reference layout)
- `about.html` → Personal background and colophon
- `404.html` → Custom error page (same layout system)
- `insights/` → Article hub and all long-form content
- `insights/index.html` → **Article listing page** (centralized navigation)
- `input.css` → Tailwind entry
- `output.css` → Compiled CSS (committed)
- `tailwind.config.js` → Dark mode + content scan
- `assets/` → Static optimized assets
- `assets/micro-interactions.css` → Minimal animations and transitions (1.2KB)

---

# 4. Layout System (Authoritative Reference)

All pages must follow this layout structure:

```html
<body class="bg-neutral-100 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 font-sans antialiased">
  <div class="max-w-xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
```

### Container Rules

- Single centered column
- max-w-xl
- Responsive horizontal padding
- Generous top spacing
- Vertical rhythm via space-y-*

### Never introduce:

- Sidebars
- Multi-column layout
- Cards
- Decorative sections
- Grids for content pages

---

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

---

# 5. Header Pattern (Must Be Reused)

Every page must include:

- Profile image (rounded)
- Name (linked to home or about)
- Theme toggle button (◐)
- Same spacing and alignment

Header markup should mirror index.html.

**Example:**

```html
<header class="flex items-center mb-8">
  <img class="w-10 h-10 rounded-full mr-4" src="../assets/wagnerrosa-picture.jpg" alt="Wagner Rosa">
  <h2 class="text-base font-medium text-neutral-600 dark:text-neutral-300">
    <a href="/">Wagner Rosa</a>
  </h2>
  <button id="theme-toggle" aria-label="Toggle dark mode" class="ml-auto text-sm text-neutral-500 dark:text-neutral-400 px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">◐</button>
</header>
```

---

# 6. Typography Rules

### Homepage main content area:

```html
<main class="space-y-8 text-[22px] leading-8">
```

### Article/About main content area:

```html
<main class="space-y-6">
```

### Heading Hierarchy (base layer in input.css):

```css
h1, h2 { font-family: Source Serif 4; font-weight: 600; }
h3     { font-family: Source Serif 4; font-weight: 500; }
```

- **h1** (article title): `text-lg` (18px), serif, semibold — page landmark
- **h2** (sections): `text-base` (16px), serif, semibold, `mt-12` — section breaks
- **h3** (subsections): `text-base` (16px), serif, medium, `mt-8` — lighter tier
- **Body**: `text-base` (16px), sans (Inter), regular

### Guidelines:

- Body scale ≈ 22px (homepage only)
- Body scale = 16px (about, case studies listing, and articles)
- Line height: 32px (homepage), 1.75 ratio / 28px (articles and about)
- Paragraph spacing: `space-y-6` (24px) in articles and about
- Section spacing: `mt-12` (48px) before h2, `mt-8` (32px) before h3
- Neutral palette
- No bold-heavy paragraphs
- Headings restrained (no oversized hero typography)

Hierarchy is structural, not decorative. Three tiers (h1 > h2 > h3) differentiated by size, weight, and spacing.

---

# 7. Insights System

## The Insights Hub (`/insights/index.html`)

Central listing page for all articles and case studies.

### Purpose:
- Single source of truth for all published content
- Chronological or curated order
- Clear categorization (Essay, Case Study, Technical)

### Structure:

```html
<main class="space-y-8">
  <h1 class="text-base leading-relaxed text-neutral-900 dark:text-neutral-100">
    Insights
  </h1>

  <p class="text-base leading-relaxed text-neutral-700 dark:text-neutral-400">
    This collection gathers insights on scalable UX systems, intelligent 
    interfaces, and product architecture. Each piece combines AI-assisted 
    research with human curation and structured editorial review.
  </p>

  <section class="space-y-10 mt-10">
    <!-- Article entries -->
    <article class="space-y-2">
      <h2 class="text-base font-medium text-neutral-900 dark:text-neutral-100">
        <a href="/insights/article-slug.html">Article Title</a>
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Brief description of the article content.
      </p>
      <div class="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
        <span>2026 · Category</span>
        <a href="/insights/article-slug.html" class="text-blue-600 dark:text-blue-400">
          Read →
        </a>
      </div>
    </article>
  </section>
</main>
```

### Article Categories:
- **Technical Essay** - Code, architecture, performance
- **UX Strategy Essay** - Systems thinking, design philosophy
- **Systems Essay** - Scalability, product architecture
- **Case Study** - Real projects with context and outcomes

### When Adding New Articles:

1. Create article file in `/insights/`
2. **Update `/insights/index.html`** with new entry
3. Follow the article template pattern
4. Maintain chronological order (newest first)

---

# 8. Micro-Interactions System

The site includes **minimal, performant micro-interactions** via `/assets/micro-interactions.css`.

## Philosophy

- **CSS for animations**. Tailwind for everything else.
- Interactions are "felt, not seen" — subtle feedback, not decoration.
- Total weight: ~1.2KB (gzipped: ~0.5KB)
- Zero impact on performance (<20ms load time)

## What's Included

### 1. Hover & Focus States
- Links: underline animation on hover
- Focus: custom blue outline (accessibility + aesthetics)
- Buttons: slight translateY on click (tactile feedback)
- Theme toggle: 180° rotation on hover

### 2. Scroll Progress Bar (Articles only)
- Thin blue bar at top of page
- Scales from 0% → 100% as user reads
- Uses `requestAnimationFrame` (60fps smooth)
- Requires additional HTML + JS (see Article Pattern)

### 3. Back to Top Button (Articles only)
- Circular blue button (bottom-right)
- Appears after 300px scroll
- Smooth scroll to top on click
- Requires additional HTML + JS (see Article Pattern)

## Implementation

### All Pages (Required)

Add in `<head>` after `output.css`:

```html
<link href="./output.css" rel="stylesheet">
<!-- Micro-interactions (animations only) -->
<link href="./assets/micro-interactions.css" rel="stylesheet">
```

**For pages in `/insights/` subdirectory:**

```html
<link href="../assets/micro-interactions.css" rel="stylesheet">
```

### Article Pages (Additional Elements)

For long-form content in `/insights/`, add:

**1. Scroll Progress (first line of `<body>`):**

```html
<body class="bg-neutral-100...">
  <!-- Scroll progress indicator -->
  <div 
    class="scroll-progress fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 z-[9999]" 
    role="progressbar" 
    aria-label="Reading progress">
  </div>
  
  <div class="max-w-xl mx-auto...">
```

**2. Back to Top Button (inside `<footer>` BEFORE navigation link):**

```html
<footer class="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
  <!-- Back to top button -->
  <button 
    id="back-to-top" 
    aria-label="Back to top"
    class="fixed bottom-8 right-8 w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xl font-medium rounded-full shadow-lg z-[9998]">
    ↑
  </button>
  
  <!-- Navigation -->
  <div>
    <a href="/">← Back to homepage</a>
  </div>
</footer>
```

**3. Scripts (before `</body>`):**

```html
<!-- Micro-interactions scripts -->
<script>
  // Scroll progress bar
  (function(){
    const progress = document.querySelector('.scroll-progress');
    if (!progress) return;
    
    function update() {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      progress.style.transform = 'scaleX(' + scrolled + ')';
    }
    
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          update();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    update();
  })();
</script>

<script>
  // Back to top button
  (function(){
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    
    function checkScroll() {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll();
    
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
</script>
```

## Accessibility

All micro-interactions respect `prefers-reduced-motion`:
- Animations disabled for users who prefer reduced motion
- Scroll behavior becomes instant instead of smooth
- Maintains full functionality without animations

---

# 9. Dark Mode Strategy

Dark mode is:

- Class-based (darkMode: 'class')
- Initialized before CSS loads
- Persisted via localStorage
- System-preference aware

All new pages MUST:

- Include the dark-mode initialization script in `<head>`
- Include toggle script before `</body>`
- Apply dark: variants consistently

Never rely on media strategy.

**Initialization script (in `<head>`):**

```html
<script>
  (function(){
    var d=document.documentElement;
    var t=localStorage.getItem('theme');
    if(t?t==='dark':(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){
      d.classList.add('dark');
    }
  })();
</script>
```

**Toggle script (before `</body>`):**

```html
<script>
  (function(){
    var r=document.documentElement;
    var b=document.getElementById('theme-toggle');
    if(b){
      b.addEventListener('click',function(){
        var d=r.classList.toggle('dark');
        localStorage.setItem('theme', d?'dark':'light');
      });
    }
  })();
</script>
```

---

# 10. Article Footer Pattern

**All articles must follow this exact footer structure:**

```html
<footer class="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
  <!-- Optional: Research/Case Study Disclosure (if applicable) -->
  <div class="mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
    <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      <span class="font-medium text-neutral-700 dark:text-neutral-300">Note:</span> 
      Context about the article (methodology, case study details, etc.)
    </p>
  </div>
  
  <!-- Back to top button (required for articles) -->
  <button 
    id="back-to-top" 
    aria-label="Back to top"
    class="fixed bottom-8 right-8 w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xl font-medium rounded-full shadow-lg z-[9998]">
    ↑
  </button>
  
  <!-- Navigation (required) -->
      <div class="flex justify-between pt-8">
        <a href="/insights/" class="text-blue-600 dark:text-blue-400 text-base" data-track="internal_insights_from_article" data-category="navigation" data-location="article">
          ← Back to insights
        </a>
        <a href="/" class="text-blue-600 dark:text-blue-400 text-base" data-track="internal_home_from_article" data-category="navigation" data-location="article">
          Go to homepage →
        </a>
      </div>
</footer>
```

### Footer Rules:
1. **Border top** separates from main content
2. **Disclosure section** (optional) - for research notes, case study context
3. **Back to top button** (required) - fixed position, appears after scroll
4. **Navigation links** (required) - Back to insights or Go to homepage

---

# 11. 404 Page Pattern

404 is:

- Same layout
- Same header
- Same container
- One visual element (image)
- Minimal copy
- Text link CTA (no button UI)

404 should feel intentional, not playful.

---

# 12. Creating New Article Pages (insights/)

All articles must:

1. Be placed inside `/insights/`

Example: `/insights/new-article.html`

2. Reuse:

- Same `<head>` structure
- Same layout container
- Same header
- Same dark mode logic
- Link to `../assets/micro-interactions.css`

3. Follow this content pattern:

```html
<main class="space-y-6">
  <h1 class="text-lg font-semibold leading-relaxed text-neutral-900 dark:text-neutral-100">
    Article Title
  </h1>

  <p class="text-base leading-[1.75]">
    Intro paragraph.
  </p>

  <h2 class="text-base font-semibold leading-relaxed text-neutral-900 dark:text-neutral-100 mt-12">
    Section
  </h2>

  <p class="text-base leading-[1.75]">
    Content.
  </p>

  <h3 class="text-base font-medium leading-relaxed text-neutral-700 dark:text-neutral-200 mt-8">
    Subsection
  </h3>

  <p class="text-base leading-[1.75]">
    Content.
  </p>
</main>
```

4. Include article-specific elements:
- Scroll progress bar
- Back to top button
- Required scripts

5. **Update `/insights/index.html`** with new entry

### Article Guidelines

- Long-form allowed
- No card layouts
- No grids
- No hero sections
- No sidebar
- No unrelated visual elements
- Use text as primary medium

### Images (if any):

- Max width: container width
- Rounded-md only
- Lazy loading enabled

---

# 13. SEO Structure for Insights

Each article must include:

- Unique `<title>`
- Unique `<meta name="description">`
- Open Graph tags
- Canonical URL
- Clean semantic headings
- Schema.org Article markup (if applicable)

Avoid keyword stuffing.
Authority through clarity.

---

# 14. Performance Rules

### Never add:

- Frontend frameworks
- External UI libraries
- Icon packs
- CSS frameworks beyond Tailwind
- Heavy animations
- Scroll effects beyond what's in micro-interactions.css

### Keep:

- Single compiled CSS file (output.css)
- One additional CSS file (micro-interactions.css)
- Minimal JS
- Optimized images (.webp preferred)
- Static output

### Performance Targets:

- First Paint: < 300ms
- Largest Contentful Paint: < 500ms
- Total Load: < 550ms
- Lighthouse Score: 100/100
- Layout Shifts: 0

---

# 15. Analytics & Tracking

The site includes Google Analytics and Microsoft Clarity with developer mode protection.

## Dev Mode (prevents self-tracking):

Three methods to disable tracking:

1. **Permanent:** `localStorage.setItem('dev_mode', 'true')`
2. **Session:** Visit with `?preview=dev` query parameter
3. **Automatic:** Localhost and 127.0.0.1 always excluded

Console will show: `🚫 Analytics disabled (dev mode active)`

---

## UTM Tracking Standard

Purpose

UTM parameters are used to track external traffic sources and measure:
	•	Where visitors come from
	•	Why they arrived (intent)
	•	Which content drives engagement
	•	Which outreach efforts generate meaningful visits

UTMs must only be used for external links pointing to the site.
Never use UTMs on internal links.

⸻

### Structure

All tracked links must follow:

?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN

Optional:

&utm_content=DETAIL

All values must be lowercase and use underscores.

⸻

### Allowed Values

**utm_source**

Where the link is placed.
	•	linkedin
	•	instagram
	•	github
	•	behance
	•	medium
	•	cv
	•	email
	•	recruiter
	•	community
	•	event

**utm_medium**

Type of channel.
	•	social
	•	document
	•	email
	•	referral
	•	direct_outreach
	•	messaging
	•	community

**utm_campaign**

Strategic intent of the link.

**Portfolio Presentation**
	•	portfolio
	•	portfolio_profile
	•	portfolio_networking

**Insights Distribution**
	•	insights
	•	insight_post
	•	thought_leadership

Job Outreach
Format:

job_[company]_[year]

Example:

job_nubank_2026

Case Study Promotion
	•	case_study
	•	case_promotion

⸻

Examples

LinkedIn profile:

https://wagnerrosa.com/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio

Article shared on LinkedIn:

https://wagnerrosa.com/insights/the-architecture-of-intelligence.html?utm_source=linkedin&utm_medium=social&utm_campaign=insight_post

CV sent to company:

https://wagnerrosa.com/?utm_source=cv&utm_medium=document&utm_campaign=job_stripe_2026


⸻

Naming Rules
	•	Lowercase only
	•	Use underscores
	•	No accents
	•	No random campaign names
	•	Keep naming consistent

⸻

This structure ensures consistent analytics data and supports long-term tracking clarity.




# 16. When Generating Pages with AI

If generating new pages, the AI must:

- Follow this README strictly
- Use index.html, about.html, and insights/index.html as layout references
- Place new content inside /insights/
- **Update /insights/index.html** with new article entry
- Preserve spacing, typography, and header pattern
- Keep design minimal and architectural
- Include micro-interactions.css link
- Add article elements (scroll progress, back to top) for long content
- Follow exact footer pattern (disclosure optional, back-to-top required, navigation required)

No deviation from layout system.

---

# 17. Navigation Structure

```
Homepage (/)
  ├── About (/about.html)
  │   └── Link to Insights
  ├── Insights (/insights/)
  │   ├── Article 1 (/insights/article-1.html)
  │   │   └── Back to Homepage
  │   ├── Article 2 (/insights/article-2.html)
  │   │   └── Back to Homepage
  │   └── Case Study (/insights/case-study.html)
  │       └── Back to Homepage
  └── 404 (/404.html)
```

### Navigation Principles:
- Homepage is the hub
- Insights page lists all articles
- Articles link back to homepage (not to insights listing)
- About page links to insights
- Keep navigation flat and predictable

---

# 18. Evolution Strategy

Possible future additions:

- Sitemap.xml
- RSS feed
- GitHub Actions build
- Content automation for insights

But always:

**Static-first.**
**Framework-free.**
**Minimal.**

---

# Summary

This project is not a UI showcase.

It is an exercise in:

- Constraint
- Discipline
- Clarity
- Structural thinking

Every addition must respect the system.

The micro-interactions are invisible until needed.
They improve UX without competing for attention.

"Felt, not seen."
