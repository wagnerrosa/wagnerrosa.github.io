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
├── PROJECT_ARCHITECTURE.md
├── assets/
│   ├── wagnerrosa-picture.jpg
│   ├── wagmoto.webp
│   ├── wagmarathon.webp
│   ├── wagnerrosa.ico
│   └── micro-interactions.css
└── insights/
    └── architecture-of-intelligence.html

### Responsibilities

- `index.html` → Homepage (primary reference layout)
- `about.html` → Personal background and site colophon
- `404.html` → Custom error page (same layout system)
- `insights/` → All article / SEO pages
- `input.css` → Tailwind entry
- `output.css` → Compiled CSS (committed)
- `tailwind.config.js` → Dark mode + content scan
- `assets/` → Static optimized assets
- `assets/micro-interactions.css` → Minimal animations and transitions

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
- Name (linked to appropriate page)
- Theme toggle button (◐)
- Same spacing and alignment

Header markup should mirror index.html.

**Example:**

```html
<header class="flex items-center mb-8">
  <img class="w-10 h-10 rounded-full mr-4" src="./assets/wagnerrosa-picture.jpg" alt="Wagner Rosa">
  <h2 class="text-base font-medium text-neutral-600 dark:text-neutral-300">
    <a href="about.html">Wagner Rösa</a>
  </h2>
  <button id="theme-toggle" aria-label="Toggle dark mode" class="ml-auto text-sm text-neutral-500 dark:text-neutral-400 hover:underline px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">◐</button>
</header>
```

---

# 6. Typography Rules

Main content area:

```html
<main class="space-y-8 text-[22px] leading-8">
```

### Guidelines:

- Body scale ≈ 22px
- Line height ≈ 32px
- Neutral palette
- No bold-heavy paragraphs
- Headings restrained (no oversized hero typography)

Use hierarchy sparingly.

---

# 7. Micro-Interactions System

The site includes **minimal, performant micro-interactions** via `/assets/micro-interactions.css`.

## Philosophy

- **CSS for animations**. Tailwind for everything else.
- Interactions are "felt, not seen" — subtle feedback, not decoration.
- Total weight: ~1.2KB (gzipped: ~0.5KB)
- Zero impact on performance (<20ms load time)

## What's Included

### 1. Hover & Focus States
- Links: subtle opacity fade (0.7) on hover
- Focus: custom blue outline (accessibility + aesthetics)
- Buttons: slight translateY on click (tactile feedback)
- Theme toggle: 180° rotation on hover

### 2. Link Underline Animation
- Underline transitions from transparent → visible on hover
- Smooth 0.3s cubic-bezier easing
- **Important:** Do NOT use Tailwind's `hover:underline` class
  - CSS handles underlines automatically
  - Remove `hover:underline` from all `<a>` tags

### 3. Scroll Progress Bar (Articles only)
- Thin blue bar at top of page
- Scales from 0% → 100% as user reads
- Uses `requestAnimationFrame` (60fps smooth)
- Requires additional HTML + JS (see Article Pattern)

### 4. Back to Top Button (Articles only)
- Circular blue button (bottom-right)
- Appears after 300px scroll
- Smooth scroll to top on click
- Requires additional HTML + JS (see Article Pattern)

## Implementation

### All Pages (Required)

Add in `<head>` after `output.css`:

```html
<link href="./output.css" rel="stylesheet">
<!-- Micro-interactions -->
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

**2. Back to Top Button (inside `<footer>`):**

```html
<footer class="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
  <!-- Back to top button -->
  <button 
    id="back-to-top" 
    aria-label="Back to top"
    class="fixed bottom-8 right-8 w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xl font-medium rounded-full shadow-lg z-[9998]">
    ↑
  </button>
  
  <a href="/">← Back to homepage</a>
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

# 8. Dark Mode Strategy

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

# 9. 404 Page Pattern

404 is:

- Same layout
- Same header
- Same container
- One visual element (image)
- Minimal copy
- Text link CTA (no button UI)

404 should feel intentional, not playful.

---

# 10. Creating New Article Pages (insights/)

All articles must:

1. Be placed inside `/insights/`

Example: `/insights/ai-in-frontend.html`

2. Reuse:

- Same `<head>` structure
- Same layout container
- Same header
- Same dark mode logic
- Link to `../assets/micro-interactions.css`

3. Follow this content pattern:

```html
<main class="space-y-8 text-[22px] leading-8">
  <h1>Article Title</h1>
  <p>Intro paragraph.</p>
  <h2>Section</h2>
  <p>Content.</p>
</main>
```

4. Include article-specific elements:
- Scroll progress bar
- Back to top button
- Required scripts

### Article Guidelines

- Long-form allowed
- No card layouts
- No grids
- No hero sections
- No sidebar
- No unrelated visual elements
- Use text as primary medium

### Research & References (Mandatory for Insights)

All long-form articles inside /insights/ must include a final section containing:

1. Research Methodology

A short paragraph clarifying:
	•	The article is synthesized from AI-assisted research
	•	Sources were reviewed and curated
	•	Insights were organized by Wagner Rösa
	•	The text reflects structured interpretation, not automated output

Standard Pattern:
```html
<hr class="border-neutral-200 dark:border-neutral-800">

<p class="text-base text-neutral-600 dark:text-neutral-400">
<strong class="font-medium text-neutral-700 dark:text-neutral-300">Research methodology:</strong> This article synthesizes findings from AI-assisted research. Sources were reviewed, curated, and interpreted by <a href="/about.html" class="text-blue-600 dark:text-blue-400">Wagner Rosa</a>.
</p>
```

⸻

2. References Section

All insights articles must end with a references section.

Rules:
	•	Include only primary or authoritative sources
	•	Avoid listing every consulted link
	•	Prefer:
	•	Industry reports
	•	Institutional publications
	•	Research-backed analysis
	•	Reputable platforms
	•	Group similar sources instead of listing dozens

Standard Structure:
```html
<h2 class="text-xl font-medium mt-12">References</h2>

<ul class="space-y-3 text-base text-neutral-700 dark:text-neutral-400">
  <li>Industry reports on AI-driven UX systems.</li>
  <li>Public case studies from enterprise platforms.</li>
  <li>Selected trend analyses from recognized design publications.</li>
</ul>
```

⸻

3. Editorial Principles
	•	Do not fabricate citations.
	•	Do not imply academic validation.
	•	Do not list AI as a source.
	•	Avoid link spam.
	•	Prioritize synthesis over aggregation.

⸻

4. Why This Exists

This section reinforces:
	•	Intellectual ownership
	•	Research transparency
	•	Credibility
	•	Long-term authority positioning

Insights pages are not blog posts.
They are structured thought pieces.

### Images (if any):

- Max width: container width
- Rounded-md only
- Lazy loading enabled

---

# 11. SEO Structure for Insights

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

# 12. Performance Rules

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

# 13. Analytics & Tracking

The site includes Google Analytics and Microsoft Clarity with developer mode protection.

### Dev Mode (prevents self-tracking):

Three methods to disable tracking:

1. **Permanent:** `localStorage.setItem('dev_mode', 'true')`
2. **Session:** Visit with `?preview=dev` query parameter
3. **Automatic:** Localhost and 127.0.0.1 always excluded

Console will show: `🚫 Analytics disabled (dev mode active)`

---

# 14. When Generating Pages with AI

If generating new pages, the AI must:

- Follow this README strictly
- Use index.html and 404.html as layout references
- Place new content inside /insights/
- Preserve spacing, typography, and header pattern
- Keep design minimal and architectural
- Include micro-interactions.css link
- Add article elements (scroll progress, back to top) for long content
- **Never use `hover:underline` on links** (CSS handles it)

No deviation from layout system.

---

# 15. Evolution Strategy

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