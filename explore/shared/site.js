/* Shared content + helpers for the redesign prototypes.
   Content mirrors assets/cv/Wagner-Rosa-CV-ATS-2026.md and the live site; trimmed for layout. */
window.SITE = (function () {
  const IC = '../../assets/';
  const CASE = '/case-studies/';

  const cases = [
    { id: 'carburante', short: 'Carburante', icon: 'carburante-ico.webp', client: 'Carburante', year: '2026', title: 'Carburante: a native iOS logbook for motorcycles', meta: 'Independent · open beta', desc: 'Personal project, designed and built end to end: SwiftUI and SwiftData, offline-first sync with Supabase, on-device receipt OCR, and real fuel economy measured tank to tank. Open beta on TestFlight, code on GitHub.', href: 'https://carburante.motorcycles/?lang=en', ext: true },
    { id: 'planton-genius', short: 'Planton Genius', icon: 'planton-ico.webp', client: 'Planton', year: '2026', title: 'Planton Genius: redesigning a B2B emissions SaaS', meta: 'Private · password', desc: 'Redesigning a B2B emissions inventory SaaS: I built the functional prototype in React that the engineering team shipped from. Private case study, shared by password.', href: CASE + 'planton-genius.html' },
    { id: 'planton-academy', short: 'Planton Academy', icon: 'planton-ico.webp', client: 'Planton', year: '2026', title: 'Planton Academy: a corporate learning platform, end to end', meta: '5 min read', desc: 'From business model to shipped React code: three user roles, quiz-gated certification, an AI tutor with human handoff, and a design system keeping it coherent.', href: CASE + 'planton-academy.html' },
    { id: 'planton-ui-design-system', short: 'Planton UI', icon: 'planton-ico.webp', client: 'Planton', year: '2026', title: 'From editorial brand to product system: Planton UI', meta: '12 min read', desc: 'How an implicit brand language became an enforceable design system: tokens, primitives, and real product screens for a B2B sustainability platform.', href: CASE + 'planton-ui-design-system.html' },
    { id: 'planton-website-vision-to-production', short: 'Planton website', icon: 'planton-ico.webp', client: 'Planton', year: '2026', title: 'Planton website: from vision to production in 18 days', meta: '10 min read', desc: 'Designing and implementing a multilingual B2B climate tech website in 18 days, from AI-first exploration to Figma prototyping to production code.', href: CASE + 'planton-website-vision-to-production.html' },
    { id: 'building-a-sub-500ms-site-2026', short: 'Sub-500ms site', icon: 'wagnerrosa-avatar.webp', client: 'wagnerrosa.com', year: '2026', title: 'Building a sub-500ms personal site in 2026', meta: 'Essay · 8 min read', desc: 'Why static HTML still wins for performance, constraints, and long-term maintainability.', href: CASE + 'building-a-sub-500ms-site-2026.html' },
    { id: 'iel-rs-ux-redesign', short: 'IEL-RS', icon: 'fiergs-ico.svg', client: 'Sistema FIERGS', year: '2025', title: 'IEL-RS: navigation and UX restructuring', meta: '6 min read', desc: 'Complete navigation restructuring and UX redesign for IEL-RS, within the FIERGS System.', href: CASE + 'iel-rs-ux-redesign.html' }
  ];
  const caseById = Object.fromEntries(cases.map(c => [c.id, c]));

  const items = [
    { id: 'index', n: '01', label: 'Home', tag: 'Hello', type: 'home' },
    {
      id: 'nelogica', n: '', label: 'Nelogica', tag: 'UX Lead', parent: 'index', type: 'work', icon: 'nelo-ico.svg',
      role: 'UX Lead', period: 'Aug 2026 – Present',
      desc: 'Designing complex trading and investing platforms for global markets.',
      facts: [['Scale', '4M+ users · 150+ countries'], ['Team', '5 UX Designers']],
      bullets: [
        'Lead a team of 5 UX Designers, setting UX direction for financial and trading platforms.',
        'Present design concepts and rationale directly to the CEO, turning product strategy into prioritized UX decisions.',
        'Partner with Product and Engineering on scalable UX practices, handoff standards and cross-platform consistency.'
      ],
      href: 'https://www.nelogica.com.br/'
    },
    {
      id: 'carburante', n: '', label: 'Carburante', tag: 'iOS', parent: 'index', type: 'work', icon: 'carburante-ico.webp',
      role: 'Independent project', period: '2026 – Present',
      desc: 'A native iOS logbook for motorcycle riders, designed and built end to end.',
      facts: [['Stack', 'SwiftUI · SwiftData · Supabase'], ['Status', 'Open beta on TestFlight']],
      bullets: [
        'Fuel logging in three steps, with on-device photo reading of odometer and receipts.',
        'Real fuel economy measured tank to tank, maintenance reminders, offline-first sync and a 25-badge achievement system.',
        'Brand, landing page, motion demos and an AI-assisted asset pipeline. Open source on GitHub.'
      ],
      rel: ['carburante'], href: 'https://carburante.motorcycles/?lang=en'
    },
    {
      id: 'planton', n: '', label: 'Planton', tag: 'Sr Product Designer', parent: 'index', type: 'work', icon: 'planton-ico.webp',
      role: 'Senior Product Designer', period: 'Jan – Aug 2026',
      desc: 'A B2B climate tech platform for emissions inventory and corporate learning.',
      facts: [['Domain', 'B2B SaaS · AI · Education'], ['Shipped', '4 projects in 8 months']],
      bullets: [
        'Planton Genius: complex data, business logic and AI workflows turned into clear interfaces, with a React prototype engineering shipped from.',
        'Planton Academy: three user roles, a 12-state onboarding flow, quiz-gated certification and an AI tutor with human handoff.',
        'Planton UI: tokens, components and WCAG guidelines shared across products.',
        'Multilingual website: 9 localized pages in 18 days, 221 commits.'
      ],
      rel: ['planton-genius', 'planton-academy', 'planton-ui-design-system', 'planton-website-vision-to-production'],
      href: 'https://site.planton.eco.br/en'
    },
    {
      id: 'fiergs', n: '', label: 'FIERGS', title: 'Sistema FIERGS', tag: 'Web Art Director', parent: 'index', type: 'work', icon: 'fiergs-ico.svg',
      role: 'Web Art Director', period: '2018 – 2026',
      desc: 'Seven years designing digital experiences across the industry federation system of Rio Grande do Sul.',
      facts: [['Path', 'Art Director → Digital → Web Art Director'], ['Brands', 'SESI · SENAI · IEL · CIERGS · FIERGS']],
      bullets: [
        'Primary designer for websites and landing pages across the system: interface structure, hierarchy, flows and consistency.',
        'Complete navigation restructuring and UX redesign for IEL-RS, published as a case study.',
        'Designed and coded email campaigns end to end, from concept to HTML and A/B tests.',
        'Presented concepts directly to regional and national directors.'
      ],
      rel: ['iel-rs-ux-redesign'], href: 'https://www.fiergs.org.br/'
    },
    { id: 'cases', n: '02', label: 'Case studies', tag: String(cases.length), type: 'cases' },
    { id: 'about', n: '03', label: 'About', tag: 'Background', type: 'about' },
    { id: 'contact', n: '04', label: 'Contact', tag: 'Say hi', type: 'contact' }
  ];
  /* case studies become children of the "Case studies" page */
  const caseItems = cases.map(c => ({ id: 'case-' + c.id, n: '', label: c.short, tag: c.meta, parent: 'cases', type: 'case', c }));
  items.splice(items.findIndex(i => i.id === 'cases') + 1, 0, ...caseItems);
  items.forEach(i => { i.level = i.parent ? 1 : 0; });
  const byId = Object.fromEntries(items.map(i => [i.id, i]));

  const li = (arr) => arr.map(t => `<li>${t}</li>`).join('');
  /* arrow = where the wheel will turn: ↓ item later in the list, ↑ earlier, ↗ external, → real page */
  const order = id => items.findIndex(i => i.id === id);
  const link = (href, text, ext, from) => {
    const hash = href.startsWith('#') && from;
    const arrow = ext ? '↗' : hash ? (order(href.slice(1)) > order(from) ? '↓' : '↑') : '→';
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text} ${arrow}</a>`;
  };

  function caseList(list) {
    return `<ul class="rows">${list.map(c => `
      <li><a href="${c.href}"${c.ext ? ' target="_blank" rel="noopener"' : ''}>
        <span class="mono">${c.year}</span>
        <span class="t">${c.title}</span>
        <span class="mono m">${c.meta} ${c.ext ? '↗' : '→'}</span>
      </a></li>`).join('')}</ul>`;
  }

  const panels = {
    home: () => `
      <p class="mono eyebrow">[ Home ]</p>
      <h1 class="title big">I design products.<br><em>I prototype in code.</em><br>I help teams ship.</h1>
      <div class="p-body">
        <dl class="facts">
          <div><dt class="mono">Now</dt><dd>UX Lead at Nelogica</dd></div>
          <div><dt class="mono">Based</dt><dd>Porto Alegre · GMT-3</dd></div>
          <div><dt class="mono">Open to</dt><dd>Remote Product Design roles</dd></div>
        </dl>
        <div>
          <p class="lede">UX Lead &amp; Product Designer with 10+ years turning complex products, business logic and AI-powered workflows into clear interfaces and shipped experiences.</p>
          <p class="links">${link('#nelogica', 'See the work', false, 'index')} ${link('#about', 'Background', false, 'index')}</p>
        </div>
      </div>`,
    work: (i) => `
      <p class="mono eyebrow">[ Home / Work ]</p>
      <h1 class="title"><span class="app-icon"><img src="${IC}${i.icon}" alt="" width="56" height="56"></span>${i.title || i.label}</h1>
      <p class="lede lead-in">${i.desc}</p>
      <div class="p-body">
        <dl class="facts">
          <div><dt class="mono">Role</dt><dd>${i.role}</dd></div>
          <div><dt class="mono">Period</dt><dd>${i.period}</dd></div>
          ${i.facts.map(f => `<div><dt class="mono">${f[0]}</dt><dd>${f[1]}</dd></div>`).join('')}
        </dl>
        <div>
          <ul class="bullets">${li(i.bullets)}</ul>
          ${i.rel ? `<p class="mono sub">Related</p>${caseList(i.rel.map(r => caseById[r]))}` : ''}
          <p class="links">${link(i.href, 'Visit ' + i.label, true)}</p>
        </div>
      </div>`,
    case: (i) => `
      <p class="mono eyebrow">[ Case studies / ${i.c.year} ]</p>
      <h1 class="title sm"><span class="app-icon"><img src="${IC}${i.c.icon}" alt="" width="56" height="56"></span>${i.c.title}</h1>
      <p class="lede lead-in">${i.c.desc}</p>
      <div class="p-body">
        <dl class="facts">
          <div><dt class="mono">Client</dt><dd>${i.c.client}</dd></div>
          <div><dt class="mono">Year</dt><dd>${i.c.year}</dd></div>
          <div><dt class="mono">Format</dt><dd>${i.c.meta}</dd></div>
        </dl>
        <p class="links">${link(i.c.href, i.c.ext ? 'Open project' : 'Read case study', i.c.ext)} ${link('#cases', 'All case studies', false, i.id)}</p>
      </div>`,
    cases: () => `
      <p class="mono eyebrow">[ Case studies ]</p>
      <h1 class="title">Case studies</h1>
      <p class="lede lead-in">Design systems and product architecture, built and tested in real production environments. Decisions, trade-offs, outcomes.</p>
      <div class="p-body single">${caseList(cases)}</div>`,
    about: () => `
      <p class="mono eyebrow">[ About ]</p>
      <h1 class="title sm">About Wagner Rosa</h1>
      <div class="p-body single prose">
        <h2 class="mono">Background</h2>
        <p>I was born in Porto Alegre, Brazil, and began my career in communication and marketing before moving to Lisbon, where I graduated in Advertising and Marketing at the <a href="https://www.iade.europeia.pt/en/" target="_blank" rel="noopener noreferrer">Institute of Arts and Design of Lisbon</a> in 2016.</p>
        <p>My professional path started in audiovisual production and graphic design, gradually evolving into web design and digital products. Over time, this transition shaped the way I approach product design: structured, system-oriented, and grounded in real implementation constraints.</p>
        <p>I taught myself front-end fundamentals to better understand the boundaries and possibilities of interfaces. This allows me to collaborate closely with engineering teams and design solutions that are both conceptually clear and technically feasible.</p>
        <p>Today, I focus on scalable digital systems, AI-powered products and operational workflows that require clarity, architecture and long-term thinking.</p>
        <h2 class="mono">Outside of work</h2>
        <p>Outside of work, I run long distances (including a completed marathon), climb, and ride motorcycles - practices that reinforce focus, patience and consistency. Riding also led to <a href="https://carburante.motorcycles/?lang=en" target="_blank" rel="noopener noreferrer">Carburante ↗</a>, a native iOS logbook for motorcycles that I design and build as a personal project.</p>
        <figure class="fig">
          <img src="${IC}wagmoto.webp" alt="Wagner Rosa riding a motorcycle" loading="lazy">
          <img src="${IC}wagmarathon.webp" alt="Wagner Rosa running a marathon" loading="lazy">
        </figure>
      </div>`,
    contact: () => `
      <p class="mono eyebrow">[ Contact ]</p>
      <h1 class="title big">Open to remote<br><em>Product Design</em><br>opportunities.</h1>
      <div class="p-body">
        <dl class="facts">
          <div><dt class="mono">Email</dt><dd><a href="mailto:contato@wagnerrosa.com">contato@wagnerrosa.com</a></dd></div>
          <div><dt class="mono">Time zone</dt><dd>GMT-3 · Brazil, Europe and US overlap</dd></div>
        </dl>
        <ul class="rows">
          <li><a href="https://www.linkedin.com/in/wagnerrosa/" target="_blank" rel="noopener"><span class="mono">01</span><span class="t">LinkedIn</span><span class="mono m">↗</span></a></li>
          <li><a href="https://www.behance.net/wagnerrosa" target="_blank" rel="noopener"><span class="mono">02</span><span class="t">Behance</span><span class="mono m">↗</span></a></li>
          <li><a href="https://github.com/wagnerrosa" target="_blank" rel="noopener"><span class="mono">03</span><span class="t">GitHub</span><span class="mono m">↗</span></a></li>
          <li><a href="/assets/cv/Wagner-Rosa-CV-oct2026.pdf"><span class="mono">04</span><span class="t">CV (PDF)</span><span class="mono m">↓</span></a></li>
        </ul>
      </div>`
  };

  function panel(id) {
    const i = byId[id] || byId.index;
    return `<article class="panel" data-id="${i.id}"><div class="in">${panels[i.type](i)}</div></article>`;
  }

  /* ul.nav-list items: <a href="#id"> with number, label, tag; group labels between */
  function navHTML() {
    return items.map(i => `<li class="${i.level ? 'child' : ''}"><a href="#${i.id}" data-id="${i.id}"><span class="mono n">${i.n}</span><span class="t">${i.label}</span><span class="mono k">${i.tag}</span></a></li>`).join('');
  }

  function currentId() {
    const h = location.hash.slice(1);
    return byId[h] ? h : 'index';
  }

  function setActive(root, id) {
    root.querySelectorAll('a[data-id]').forEach(a => {
      const on = a.dataset.id === id;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function clock(el) {
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
    };
    tick(); setInterval(tick, 15000);
  }

  const sideTop = `
    <a class="who" href="#index">
      <img src="../../assets/wagnerrosa-avatar.webp" alt="" width="40" height="40">
      <span><b>Wagner Rosa</b><span class="mono">UX Lead &amp; Product Designer</span></span>
    </a>`;
  const sideBottom = `
    <div class="status mono"><i></i> Open to remote · GMT-3<br>Porto Alegre <span data-clock></span></div>`;

  return { items, byId, panel, navHTML, currentId, setActive, clock, sideTop, sideBottom };
})();
