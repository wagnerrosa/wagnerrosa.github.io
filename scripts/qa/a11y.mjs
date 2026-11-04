// axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) on every page and every home panel, two viewports, light and dark.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { launch, newPage, open, sleep, reporter } from './lib.mjs';

const AXE = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const PAGES = { home: '/', hub: '/case-studies/', about: '/about.html', cv: '/cv.html', ui: '/case-studies/planton-ui-design-system.html', academy: '/case-studies/planton-academy.html', iel: '/case-studies/iel-rs-ux-redesign.html', web: '/case-studies/planton-website-vision-to-production.html', sub500: '/case-studies/building-a-sub-500ms-site-2026.html', carb: '/case-studies/carburante.html', genius: '/case-studies/planton-genius.html', p404: '/nope-xyz.html' };
const DARK = ['home', 'hub', 'about', 'ui', 'cv'];   // dark is the tight theme only where the wheel shows
const VIEWPORTS = { desktop: {}, mobile: { w: 390, h: 844, mobile: true } };
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const axeRun = async (page, ctx) => {
  await page.evaluate(AXE);
  return page.evaluate(async (ctx, tags) => {
    const r = await axe.run(ctx ? document.querySelector(ctx) || document : document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
    return r.violations.map(x => `${x.id} (${x.impact}) x${x.nodes.length}: ${x.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`);
  }, ctx, TAGS);
};

const browser = await launch();
const { ok, done } = reporter('axe-core');
for (const [vp, opts] of Object.entries(VIEWPORTS)) for (const scheme of ['light', 'dark']) {
  const page = await newPage(browser, { ...opts, scheme });
  for (const [name, path] of Object.entries(PAGES)) {
    if (scheme === 'dark' && !DARK.includes(name)) continue;
    await open(page, path, 1200);
    const v = await axeRun(page);
    // uncaught page errors fail too
    ok(`${name} · ${vp} · ${scheme}`, v.length === 0 && page.errs.length === 0, [...v, ...page.errs].join(' ; '));
    page.errs.length = 0;
  }
  await page.close();
}
// every wheel panel on the home page (desktop, light): rotate with ArrowDown
{
  const page = await newPage(browser);
  await open(page, '/');
  const seen = new Set();
  for (let i = 0; i < 16; i++) {
    const id = await page.evaluate(() => document.querySelector('#list a.on')?.dataset.id);
    if (seen.has(id)) break;
    seen.add(id);
    const v = await axeRun(page, '.layer[aria-hidden="false"]');
    ok(`panel ${id}`, v.length === 0, v.join(' ; '));
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press('ArrowDown'); await sleep(1300);
  }
  await page.close();
}
done();
await browser.close();
