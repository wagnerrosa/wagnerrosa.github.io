#!/usr/bin/env node
// Snapshot of what search engines and LLM crawlers read from a static site:
// head (title, meta, canonical, hreflang, icons), JSON-LD, links and visible text, per HTML file.
//
//   node scripts/seo-snapshot.mjs <dir> <out.json>        snapshot a directory of built HTML
//   node scripts/seo-snapshot.mjs --diff <a.json> <b.json>   compare two snapshots
//
// Phase 0 of the Astro migration: snapshot the legacy site (git tag legacy-final), then diff the new build against it.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import * as cheerio from 'cheerio';

const SKIP_DIRS = new Set(['node_modules', '.git', 'positioning', 'prompts', 'explore', 'case-studies-src', 'scripts', '.claude', '.astro']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const squash = s => s.replace(/\s+/g, ' ').trim();

function snapshotPage(html) {
  const $ = cheerio.load(html);
  const head = {
    lang: $('html').attr('lang') || null,
    title: squash($('title').first().text()),
    meta: {},
    links: [],
  };
  $('head meta').each((_, el) => {
    const key = $(el).attr('name') || $(el).attr('property');
    const val = $(el).attr('content');
    if (key && val != null) head.meta[key] = squash(val);
  });
  $('head link[rel]').each((_, el) => {
    const rel = $(el).attr('rel');
    if (!/^(canonical|alternate|icon|apple-touch-icon)$/.test(rel)) return;
    head.links.push({ rel, href: $(el).attr('href'), hreflang: $(el).attr('hreflang') || undefined, sizes: $(el).attr('sizes') || undefined });
  });
  head.links.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const jsonld = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try { jsonld.push(JSON.parse($(el).text())); } catch { jsonld.push({ error: 'invalid JSON-LD' }); }
  });

  const links = new Set();
  const own = h => (h || '').replace(/^https:\/\/wagnerrosa\.com(?=\/)/, '').replace(/index\.html$/, '');
  $('body a[href], template a[href]').each((_, el) => links.add(own($(el).attr('href'))));

  const analytics = {   // the ids may sit in a literal tag URL (legacy) or in a script variable (Astro)
    gtag: /(G-[A-Z0-9]{8,})/.exec(html)?.[1] || null,
    clarity: /clarity\.ms\/tag\/([a-z0-9]+)|"clarity",\s*"([a-z0-9]{8,})"|clarity\s*=\s*"([a-z0-9]{8,})"|clarity:\s*"([a-z0-9]{8,})"/.exec(html)?.slice(1).find(Boolean) || null,
  };

  $('script, style, noscript, template').remove();
  const text = squash($('body').text());
  return { head, jsonld, links: [...links].sort(), analytics, textLength: text.length, text };
}

function snapshotDir(dir) {
  const files = walk(dir).filter(f => !f.includes(`${sep}assets${sep}og${sep}`));
  const pages = {};
  for (const f of files) pages[`/${relative(dir, f).split(sep).join('/')}`] = snapshotPage(readFileSync(f, 'utf8'));
  for (const extra of ['robots.txt', 'sitemap.xml', 'llms.txt', 'CNAME']) {
    const p = join(dir, extra);
    if (existsSync(p)) pages[`/${extra}`] = { raw: readFileSync(p, 'utf8') };
  }
  return pages;
}

function diffSnapshots(a, b) {
  const lines = [];
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of [...keys].sort()) {
    if (!a[k]) { lines.push(`+ ${k}  (new page)`); continue; }
    if (!b[k]) { lines.push(`- ${k}  (page gone)`); continue; }
    const pa = a[k], pb = b[k];
    if (pa.raw != null || pb.raw != null) { if (pa.raw !== pb.raw) lines.push(`~ ${k}  (file differs)`); continue; }
    const issues = [];
    if (pa.head.title !== pb.head.title) issues.push(`title: "${pa.head.title}" → "${pb.head.title}"`);
    if (pa.head.lang !== pb.head.lang) issues.push(`lang: ${pa.head.lang} → ${pb.head.lang}`);
    for (const m of new Set([...Object.keys(pa.head.meta), ...Object.keys(pb.head.meta)])) {
      if (pa.head.meta[m] !== pb.head.meta[m]) issues.push(`meta ${m}: ${JSON.stringify(pa.head.meta[m])} → ${JSON.stringify(pb.head.meta[m])}`);
    }
    const la = JSON.stringify(pa.head.links), lb = JSON.stringify(pb.head.links);
    if (la !== lb) issues.push(`link tags differ:\n      was ${la}\n      now ${lb}`);
    if (JSON.stringify(pa.jsonld) !== JSON.stringify(pb.jsonld)) issues.push(`JSON-LD differs (${pa.jsonld.length} → ${pb.jsonld.length} blocks)`);
    if (JSON.stringify(pa.analytics) !== JSON.stringify(pb.analytics)) issues.push(`analytics ids differ: ${JSON.stringify(pa.analytics)} → ${JSON.stringify(pb.analytics)}`);
    const lost = pa.links.filter(l => !pb.links.includes(l));
    if (lost.length) issues.push(`links no longer present: ${lost.join(', ')}`);
    const ratio = pa.textLength ? pb.textLength / pa.textLength : 1;
    if (ratio < 0.85) issues.push(`visible text shrank to ${(ratio * 100).toFixed(0)}% (${pa.textLength} → ${pb.textLength} chars)`);
    lines.push(issues.length ? `~ ${k}\n    ${issues.join('\n    ')}` : `= ${k}`);
  }
  return lines.join('\n');
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === '--diff') {
  const [a, b] = rest.map(f => JSON.parse(readFileSync(f, 'utf8')));
  console.log(diffSnapshots(a, b));
} else if (cmd && rest[0]) {
  const snap = snapshotDir(cmd);
  writeFileSync(rest[0], JSON.stringify(snap, null, 1));
  console.log(`${Object.keys(snap).length} entries → ${rest[0]}`);
} else {
  console.error('usage: seo-snapshot.mjs <dir> <out.json> | --diff <a.json> <b.json>');
  process.exit(1);
}
