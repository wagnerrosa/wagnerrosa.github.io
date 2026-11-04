// WCAG 1.4.3 on the wheel labels: every clickable label (pointer-events on) must reach 4.5:1 against the page at rest.
// Rows fading at the edge are decoration and have pointer-events:none, so they are not measured.
import { launch, newPage, open, reporter } from './lib.mjs';

const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (fg, bg, op) => {
  const eff = fg.map((v, i) => v * op + bg[i] * (1 - op));
  const [a, b] = [lum(eff), lum(bg)];
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
};

const browser = await launch();
const { ok, done } = reporter('Wheel label contrast (>= 4.5:1 on clickable labels)');
for (const url of ['/', '/#nelogica', '/case-studies/', '/about.html']) for (const scheme of ['light', 'dark']) {
  const p = await newPage(browser, { scheme });
  await open(p, url, 2200);
  const rows = await p.evaluate(() => [...document.querySelectorAll('#list li')].map(li => {
    const cs = getComputedStyle(li), a = li.querySelector('a'), num = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
    return { t: li.textContent.trim().slice(0, 16), op: parseFloat(cs.opacity), pe: getComputedStyle(a).pointerEvents, vis: cs.visibility, fg: num(getComputedStyle(a).color), bg: num(getComputedStyle(document.body).backgroundColor), top: li.getBoundingClientRect().top };
  }).filter(r => r.op > 0.04 && r.vis !== 'hidden' && r.pe !== 'none' && r.top > -20 && r.top < innerHeight));
  const worst = rows.map(r => ({ t: r.t, cr: ratio(r.fg, r.bg, r.op) })).sort((a, b) => a.cr - b.cr)[0];
  ok(`${url} · ${scheme}`, rows.length > 0 && worst.cr >= 4.5, `${rows.length} clickable, worst ${worst ? worst.cr.toFixed(2) + ':1 ' + worst.t : 'n/a'}`);
  await p.close();
}
done();
await browser.close();
