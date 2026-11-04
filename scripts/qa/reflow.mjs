// WCAG 1.4.10 reflow: no horizontal overflow at 320 px wide, nor at 200% and 400% zoom of a 1440 px window.
import { launch, newPage, open, reporter } from './lib.mjs';

const PAGES = ['/', '/case-studies/', '/about.html', '/cv.html', '/case-studies/planton-ui-design-system.html', '/case-studies/planton-academy.html', '/case-studies/carburante.html', '/case-studies/iel-rs-ux-redesign.html', '/case-studies/planton-website-vision-to-production.html', '/404.html'];
const SIZES = [['320x640', { w: 320, h: 640, mobile: true }], ['zoom 200% (720x450)', { w: 720, h: 450 }], ['zoom 400% (360x225)', { w: 360, h: 225 }]];

const browser = await launch();
const { ok, done } = reporter('Reflow');
for (const [label, opts] of SIZES) {
  const bad = [];
  for (const u of PAGES) {
    const p = await newPage(browser, opts);
    await open(p, u, 900);
    const o = await p.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: innerWidth,
      wide: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[aria-hidden="true"], pre, template'); }).slice(0, 3).map(e => e.tagName + '.' + (e.className?.toString().slice(0, 20) || '')),
    }));
    if (o.sw > o.iw + 1 || o.wide.length) bad.push(`${u} sw=${o.sw}/${o.iw} ${o.wide.join(',')}`);
    await p.close();
  }
  ok(label, bad.length === 0, bad.join(' | '));
}
done();
await browser.close();
