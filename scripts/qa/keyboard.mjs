// Keyboard and motion: Tab order shows a visible focus ring on screen; prefers-reduced-motion runs no animations.
import { launch, newPage, open, sleep, reporter } from './lib.mjs';

const browser = await launch();
const { ok, done } = reporter('Keyboard and reduced motion');
{
  const p = await newPage(browser);
  await open(p, '/');
  const seq = [];
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press('Tab'); await sleep(250);   // the skip link slides in with a transition
    if (await p.evaluate(() => document.activeElement === document.body)) break;   // tabbed past the last stop
    seq.push(await p.evaluate(() => {
      const e = document.activeElement, cs = getComputedStyle(e), r = e.getBoundingClientRect();
      return {
        name: `${e.tagName}${e.id ? '#' + e.id : ''}:${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 22)}`,
        ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none',
        inView: !!r.width && r.bottom > 0 && r.top < innerHeight,
      };
    }));
  }
  const noRing = seq.filter(s => !s.ring).map(s => s.name), off = seq.filter(s => !s.inView).map(s => s.name);
  ok('every Tab stop has a visible focus ring (Home)', noRing.length === 0, noRing.join(' | '));
  ok('every Tab stop is on screen (Home)', off.length === 0, off.join(' | '));
  await p.close();
}
for (const u of ['/', '/about.html']) {
  const p = await newPage(browser, { reduce: true, intro: true });
  await open(p, u + '?intro', 600);
  const o = await p.evaluate(() => ({
    anims: document.getAnimations().filter(a => a.playState === 'running').map(a => a.animationName || a.constructor.name).slice(0, 6),
    h1: parseFloat(getComputedStyle(document.querySelector('.layer[aria-hidden="false"] h1, .layer h1')).opacity),
  }));
  ok(`reduced motion: no running animations, heading visible (${u})`, o.anims.length === 0 && o.h1 >= 0.99, JSON.stringify(o));
  await p.close();
}
done();
await browser.close();
