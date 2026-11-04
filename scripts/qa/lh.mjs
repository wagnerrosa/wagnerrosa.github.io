// Lighthouse (simulated throttling), median of QA_RUNS (default 3) per page and form factor.
// usage: node lh.mjs [pages...]   e.g. node lh.mjs / /about.html      QA_BASE=https://wagnerrosa.com to measure the live site
// Fails if Accessibility, Best Practices or SEO < 100, or Performance < QA_PERF (default 95).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { BASE, chromePath, reporter } from './lib.mjs';

const CLI = createRequire(import.meta.url).resolve('lighthouse/cli/index.js');
const RUNS = Number(process.env.QA_RUNS || 3), MIN_PERF = Number(process.env.QA_PERF || 95);
const PAGES = process.argv.length > 2 ? process.argv.slice(2) : ['/', '/case-studies/', '/about.html', '/cv.html', '/case-studies/planton-ui-design-system.html', '/case-studies/planton-academy.html', '/case-studies/carburante.html'];
const median = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-lh-'));

const { ok, done } = reporter(`Lighthouse, median of ${RUNS} (${BASE})`);
for (const p of PAGES) for (const form of ['mobile', 'desktop']) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const out = path.join(tmp, `${i}.json`);
    execFileSync('node', [CLI, BASE + p, ...(form === 'desktop' ? ['--preset=desktop'] : []), '--output=json', `--output-path=${out}`, '--quiet', '--chrome-flags=--headless=new --no-first-run', '--only-categories=performance,accessibility,best-practices,seo'], { env: { ...process.env, CHROME_PATH: chromePath() }, stdio: 'ignore' });
    const r = JSON.parse(fs.readFileSync(out, 'utf8'));
    runs.push({ perf: r.categories.performance.score * 100, a11y: r.categories.accessibility.score * 100, bp: r.categories['best-practices'].score * 100, seo: r.categories.seo.score * 100, lcp: r.audits['largest-contentful-paint'].numericValue / 1000, cls: r.audits['cumulative-layout-shift'].numericValue });
  }
  const m = k => median(runs.map(r => r[k]));
  ok(`${p} · ${form}`, m('perf') >= MIN_PERF && m('a11y') === 100 && m('bp') === 100 && m('seo') === 100, `perf ${m('perf')} a11y ${m('a11y')} bp ${m('bp')} seo ${m('seo')} · LCP ${m('lcp').toFixed(2)}s CLS ${m('cls').toFixed(3)}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
done();
