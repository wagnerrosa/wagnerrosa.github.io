#!/usr/bin/env node
// ONE-OFF (Astro migration, phase 2): legacy case-study HTML → MDX with frontmatter.
// usage: node scripts/migrate-articles.mjs <legacyDir> <outDir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const [legacy, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

/* per-article data that does not live in the article HTML (card copy, wheel label, order) */
const META = {
  'planton-academy': { llms: 'B2B ESG learning platform with three user roles, quiz-gated certification, an AI tutor and a React front-end.', short: 'Planton Academy', client: 'Planton', icon: 'planton-ico.webp', order: 3, blurb: 'From business model to shipped React code: three user roles, quiz-gated certification, an AI tutor with human handoff, and a design system keeping it coherent.', category: 'Case study' },
  'planton-academy-pt': { short: 'Planton Academy (PT)', client: 'Planton', icon: 'planton-ico.webp', order: 99, wheel: false, hub: false, blurb: 'Versão em português do estudo de caso do Planton Academy.', category: 'Estudo de caso', translationOf: 'planton-academy' },
  'planton-ui-design-system': { llms: 'Extracting an editorial brand language into a design system with tokens, primitives and product screens.', short: 'Planton UI', client: 'Planton', icon: 'planton-ico.webp', order: 4, blurb: 'How an implicit brand language became an enforceable design system: tokens, primitives, and real product screens for a B2B sustainability platform.', category: 'Case study' },
  'planton-website-vision-to-production': { llms: 'Multilingual B2B climate tech website delivered in 18 days with Next.js.', short: 'Planton website', client: 'Planton', icon: 'planton-ico.webp', order: 5, blurb: 'Designing and implementing a multilingual B2B climate tech website in 18 days, from AI-first exploration to Figma prototyping to production code.', category: 'Case study' },
  'building-a-sub-500ms-site-2026': { llms: 'Why a static HTML and Tailwind CLI stack, with minimal JS.', short: 'Sub-500ms site', client: 'wagnerrosa.com', icon: 'wagnerrosa-avatar.webp', order: 6, blurb: 'Why static HTML still wins for performance, constraints, and long-term maintainability.', category: 'Technical essay' },
  'iel-rs-ux-redesign': { llms: 'Navigation restructuring and UX redesign for a Sistema FIERGS organization.', short: 'IEL-RS', client: 'Sistema FIERGS', icon: 'fiergs-ico.svg', order: 7, blurb: 'Complete navigation restructuring and UX redesign for IEL-RS, within the FIERGS System.', category: 'Case study' },
  'architecture-of-intelligence': { llms: 'Scalable UX systems for complex products, agentic AI and generative UI.', short: 'Architecture of Intelligence', client: 'wagnerrosa.com', icon: 'wagnerrosa-avatar.webp', order: 90, wheel: false, hub: false, noindex: true, blurb: '', category: 'Essay' },
  'the-invisible-frontier': { llms: 'Microinteractions, predictive design and adaptive systems.', short: 'The Invisible Frontier', client: 'wagnerrosa.com', icon: 'wagnerrosa-avatar.webp', order: 91, wheel: false, hub: false, noindex: true, blurb: '', category: 'Essay' },
};

const warnings = [];
const warn = (slug, msg) => warnings.push(`[${slug}] ${msg}`);

const esc = s => s
  .replace(/\\/g, '\\\\').replace(/([*_`\[\]{}<>~])/g, '\\$1')
  .replace(/&(?=[a-zA-Z#])/g, '\\&');
const jsonProp = v => (/^[^"{}\\\n&<>]*$/.test(v) ? `"${v}"` : `{${JSON.stringify(v)}}`);
const squash = s => s.replace(/\s+/g, ' ');

function convert(slug, html) {
  const $ = cheerio.load(html);
  const main = $('main').first();
  const head = {
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    lang: $('html').attr('lang') || 'en',
    robots: $('meta[name="robots"]').attr('content') || '',
  };
  let ld = null;
  $('script[type="application/ld+json"]').each((_, e) => { try { ld = JSON.parse($(e).text()); } catch {} });

  /* ---- inline ---- */
  const inl = (node, ctx = {}) => {
    if (node.type === 'text') return esc(squash(node.data));
    if (node.type !== 'tag') return '';
    const el = $(node), kids = () => node.children.map(c => inl(c, ctx)).join('');
    switch (node.name) {
      case 'strong': case 'b': case 'em': case 'i': {
        const mark = node.name === 'strong' || node.name === 'b' ? '**' : '*';
        const inner = kids(), lead = inner.match(/^\s*/)[0], trail = inner.match(/\s*$/)[0], core = inner.trim();
        return core ? `${lead}${mark}${core}${mark}${trail}` : inner;
      }
      case 'code': { const t = el.text(); return t.includes('`') ? `<code>{${JSON.stringify(t)}}</code>` : '`' + t + '`'; }
      case 'a': {
        const href = el.attr('href') || '';
        return `[${kids().trim()}](${href.replace(/ /g, '%20').replace(/\)/g, '%29')})`;
      }
      case 'br': return '<br />';
      case 'span':
        if (el.hasClass('badge')) { warn(slug, `inline badge: ${el.text()}`); return kids(); }
        if (el.hasClass('font-medium')) { const inner = kids(); return inner.trim() ? `**${inner.trim()}**${inner.match(/\s*$/)[0]}` : inner; }
        return kids();
      case 'kbd': case 'sup': case 'sub': case 'mark': case 'abbr': case 'small': return `<${node.name}>${kids()}</${node.name}>`;
      case 'img': warn(slug, 'inline img'); return '';
      default: warn(slug, `inline <${node.name}>`); return kids();
    }
  };
  const inlAll = el => $(el).contents().toArray().map(c => inl(c)).join('').replace(/\s+/g, ' ').trim();
  const lineStart = s => s.replace(/^(\d+)([.)])(\s)/, '$1\\$2$3').replace(/^([-+])(\s)/, '\\$1$2').replace(/^#/, '\\#').replace(/^\\?>/, '\\>');

  /* ---- JSX helpers for blocks with no markdown equivalent ---- */
  const jsxInline = node => {
    if (node.type === 'text') return squash(node.data).replace(/[{}<>]/g, c => `{${JSON.stringify(c)}}`);
    if (node.type !== 'tag') return '';
    const kids = node.children.map(jsxInline).join('');
    if (node.name === 'a') { const el = $(node); return `<a href=${jsonProp(el.attr('href') || '')}>${kids}</a>`; }
    if (['strong', 'em', 'code', 'b', 'i'].includes(node.name)) return `<${node.name}>${kids}</${node.name}>`;
    if (node.name === 'br') return '<br />';
    return kids;
  };
  const jsxAll = el => $(el).contents().toArray().map(jsxInline).join('').replace(/\s+/g, ' ').trim();

  const list = (el, depth = 0) => {
    const ordered = el.name === 'ol', pad = ' '.repeat(depth * (ordered ? 3 : 2));
    return $(el).children('li').toArray().map((li, i) => {
      const marker = ordered ? `${i + 1}. ` : '- ';
      let acc = ''; const nested = [];
      $(li).contents().toArray().forEach(c => {
        if (c.type === 'tag' && (c.name === 'ul' || c.name === 'ol')) nested.push(list(c, depth + 1));
        else if (c.type === 'tag' && c.name === 'p') acc += ' ' + inlAll(c) + ' ';
        else acc += inl(c);
      });
      const text = lineStart(acc.replace(/\s+/g, ' ').trim());
      return `${pad}${marker}${text}${nested.length ? '\n' + nested.join('\n') : ''}`;
    }).join('\n');
  };

  const table = el => {
    const rows = $(el).find('tr').toArray().map(tr => $(tr).children('th,td').toArray().map(c => inlAll(c).replace(/\|/g, '\\|')));
    if (!rows.length) return '';
    const cols = Math.max(...rows.map(r => r.length));
    const fmt = r => '| ' + Array.from({ length: cols }, (_, i) => r[i] ?? '').join(' | ') + ' |';
    return [fmt(rows[0]), fmt(Array(cols).fill('---')), ...rows.slice(1).map(fmt)].join('\n');
  };

  const used = new Set();
  const src = s => s.replace(/^(\.\.\/|\/)assets\//, '');
  const figure = el => {
    const f = $(el), cap = f.find('figcaption').length ? inlAll(f.find('figcaption')) : '';
    const v = f.find('video'), img = f.find('img');
    if (v.length) {
      used.add('Video');
      const source = v.find('source').attr('src') || v.attr('src') || '';
      return `<Video src=${jsonProp('/assets/' + src(source))} label=${jsonProp(v.attr('aria-label') || '')}${v.attr('poster') ? ` poster=${jsonProp(v.attr('poster'))}` : ''}>${cap}</Video>`;
    }
    if (img.length === 1) {
      used.add('Figure');
      return `<Figure src=${jsonProp(src(img.attr('src')))} alt=${jsonProp(img.attr('alt') || '')}>${cap}</Figure>`;
    }
    warn(slug, `figure with ${img.length} imgs`); return '';
  };

  const codeBlock = el => {
    used.add('CodeBlock');
    const e = $(el), label = e.children('div, span').first().text().trim().replace(/\s+/g, ' ');
    const code = e.find('pre').text().replace(/\n$/, '');
    return `<CodeBlock label=${jsonProp(label)} code={${JSON.stringify(code)}} />`;
  };

  const facts = el => {
    used.add('Facts');
    const items = $(el).find('dl > div').toArray().map(d => {
      const dd = $(d).children('dd'), badges = dd.find('.badge').toArray().map(b => $(b).text().trim());
      const o = { label: $(d).children('dt').text().trim() };
      if (badges.length) o.badges = badges; else o.value = dd.text().replace(/\s+/g, ' ').trim();
      if (/col-span/.test($(d).attr('class') || '')) o.wide = true;
      return o;
    });
    return `<Facts label=${jsonProp($(el).attr('aria-label') || '')} items={${JSON.stringify(items)}} />`;
  };

  const block = node => {
    if (node.type !== 'tag') return null;
    const el = $(node), name = node.name, cls = el.attr('class') || '';
    switch (name) {
      case 'h1': return null;
      case 'h2': return `## ${inlAll(el)}`;
      case 'h3': return `### ${inlAll(el)}`;
      case 'h4': return `#### ${inlAll(el)}`;
      case 'p': {
        const t = el.text().replace(/\s+/g, ' ').trim();
        if (/^\d{4} · /.test(t) && /min read/.test(t)) return null;
        if (/text-lg/.test(cls)) { used.add('Lead'); return `<Lead>\n\n${lineStart(inlAll(el))}\n\n</Lead>`; }
        return lineStart(inlAll(el));
      }
      case 'ul': case 'ol': return list(node);
      case 'hr': return '---';
      case 'table': return table(node);
      case 'figure': return figure(node);
      case 'dl': {
        used.add('DefList');
        const rows = el.children('div').toArray().map(d => `  <div>\n    <dt>${jsxAll($(d).children('dt'))}</dt>\n    <dd>${jsxAll($(d).children('dd'))}</dd>\n  </div>`);
        if (!rows.length) warn(slug, 'dl without div rows');
        return `<DefList>\n${rows.join('\n')}\n</DefList>`;
      }
      case 'blockquote': {
        const paras = el.children('p').toArray().map(inlAll);
        const text = paras.length ? paras.join('\n\n') : inlAll(el);
        if (/pull-quote/.test(cls)) { used.add('PullQuote'); return `<PullQuote>\n\n${text}\n\n</PullQuote>`; }
        return text.split('\n').map(l => '> ' + l).join('\n');
      }
      case 'pre': return codeBlock(el.wrap('<div></div>').parent()[0]);
      case 'section': {
        if (el.find('dl').length && /fact|ficha/i.test(el.attr('aria-label') || '')) return facts(node);
        if (el.find('ul li').length && el.children('p').length === 1) {
          used.add('Checks');
          const items = el.find('li').toArray().map(li => $(li).clone().children('span[aria-hidden]').remove().end().text().replace(/\s+/g, ' ').trim());
          return `<Checks title=${jsonProp(el.children('p').text().trim())} items={${JSON.stringify(items)}} />`;
        }
        warn(slug, `unhandled <section aria-label="${el.attr('aria-label')}">`); return `<!-- TODO section -->`;
      }
      case 'div': {
        if (el.hasClass('code-block') || el.find('pre').length) return codeBlock(node);
        if (el.find('table').length === 1 && el.children().length === 1) return table(el.find('table')[0]);
        const kids = el.children().toArray();
        if (kids.length && kids.every(k => k.name === 'a')) {
          used.add('LinkList');
          return `<LinkList>\n\n${kids.map(a => '- ' + inl(a)).join('\n')}\n\n</LinkList>`;
        }
        if (kids.length && kids.every(k => k.name === 'span' && $(k).hasClass('badge'))) {
          used.add('Badges');
          return `<Badges items={${JSON.stringify(kids.map(k => $(k).text().trim()))}} />`;
        }
        if (el.children('ol').length && el.children('p').length === 1 && /text-xs/.test(el.children('p').attr('class') || '')) {
          used.add('Steps');
          const items = el.find('ol > li').toArray().map(li => $(li).text().replace(/\s+/g, ' ').trim());
          return `<Steps title=${jsonProp(el.children('p').text().trim())} label=${jsonProp(el.children('ol').attr('aria-label') || '')} items={${JSON.stringify(items)}} />`;
        }
        // plain wrapper (callout, references): flatten into its blocks
        const inner = kids.map(block).filter(b => b != null && b !== '');
        if (!inner.length) warn(slug, `empty <div class="${cls.slice(0, 60)}">`);
        return inner.join('\n\n');
      }
      default: warn(slug, `unhandled block <${name}>`); return `<!-- TODO ${name} -->`;
    }
  };

  const blocks = main.children().toArray().map(block).filter(b => b != null && b !== '');
  // disclosure paragraph in the page footer (outside <main>): "Note: this case study documents ..."
  $('footer').first().children('div').each((_, d) => {
    const p = $(d).children('p');
    if (p.length && /Note|Nota|details/i.test(p.text())) { used.add('Note'); blocks.push(`<Note>\n\n${inlAll(p)}\n\n</Note>`); }
  });
  const metaLine = main.children('p').toArray().map(p => $(p).text().replace(/\s+/g, ' ').trim()).find(t => /^\d{4} · .*min read/.test(t)) || '';
  const [year, , minutes] = [metaLine.split(' · ')[0], metaLine.split(' · ')[1], (metaLine.match(/(\d+) min read/) || [])[1]];
  const h1 = main.find('h1').first().text().replace(/\s+/g, ' ').trim();

  const m = META[slug];
  const fm = {
    title: h1,
    ...(ld?.headline && ld.headline !== h1 ? { headline: ld.headline } : {}),
    short: m.short,
    client: m.client,
    icon: m.icon,
    year: Number(year) || 2026,
    category: m.category,
    ...(head.title !== `${h1} | Wagner Rosa` ? { metaTitle: head.title } : {}),
    description: head.description,
    ...(head.ogDescription && head.ogDescription !== head.description ? { ogDescription: head.ogDescription } : {}),
    ...(m.llms ? { llms: m.llms } : {}),
    blurb: m.blurb,
    ...(minutes ? { readMinutes: Number(minutes) } : {}),
    datePublished: ld?.datePublished || '2026-01-01',
    dateModified: ld?.dateModified || ld?.datePublished || '2026-01-01',
    lang: head.lang,
    ...(m.translationOf ? { translationOf: m.translationOf } : {}),
    ...(m.protected ? { protected: true } : {}),
    ...(m.noindex || /noindex/.test(head.robots) ? { noindex: true } : {}),
    ...(m.wheel === false ? { wheel: false } : {}),
    ...(m.hub === false ? { hub: false } : {}),
    order: m.order,
  };
  const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`).join('\n');
  const imports = used.size ? `import { ${[...used].sort().join(', ')} } from '../../components/mdx';\n\n` : '';
  return `---\n${yaml}\n---\n\n${imports}${blocks.join('\n\n')}\n`;
}

for (const slug of Object.keys(META)) {
  const file = slug === 'planton-genius' ? join(legacy, 'case-studies-src', 'planton-genius.html') : join(legacy, 'case-studies', slug + '.html');
  const html = readFileSync(file, 'utf8');
  writeFileSync(join(outDir, slug + '.mdx'), convert(slug, html));
  console.log('wrote', slug);
}
console.log(warnings.length ? '\nWARNINGS:\n' + warnings.join('\n') : '\nno warnings');
