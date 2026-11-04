// Wheel behaviour: history entries, URL timing, About's key reading, code blocks, live region, will-change, hub stability.
import { launch, newPage, open, sleep, reporter } from './lib.mjs';

const browser = await launch();
const { ok, done } = reporter('Wheel behaviour');
const fresh = async (path, opts) => { const p = await newPage(browser, opts); await open(p, path, 600); return p; };
const hist = p => p.evaluate(() => history.length);
const url = p => p.evaluate(() => location.pathname + location.hash);

// 1. burst = one history entry; lingering starts a new one
{
  const p = await fresh('/'); const h0 = await hist(p);
  for (let i = 0; i < 5; i++) { await p.keyboard.press('ArrowDown'); await sleep(300); }
  await sleep(1800);
  const h1 = await hist(p), u1 = await url(p);
  ok('burst of 5 stops = 1 history entry', h1 - h0 === 1, `Δ=${h1 - h0} url=${u1}`);
  await sleep(2200);
  await p.keyboard.press('ArrowDown'); await sleep(1800);
  const h2 = await hist(p);
  ok('stop after lingering >2s pushes another entry', h2 - h1 === 1, `Δ=${h2 - h1} url=${await url(p)}`);
  await p.goBack(); await sleep(1200);
  ok('Back returns to the lingered stop', (await url(p)) === u1, `url=${await url(p)} want=${u1}`);
  await p.goBack(); await sleep(1200);
  ok('Back again returns to Home', (await url(p)) === '/', `url=${await url(p)}`);
  ok('no page errors', p.errs.length === 0, p.errs.join('|'));
  await p.close();
}
// 2. URL follows the wheel faster
{
  const p = await fresh('/');
  const t0 = Date.now(); await p.keyboard.press('ArrowDown');
  let t = null; for (let i = 0; i < 60; i++) { await sleep(50); if ((await url(p)) !== '/') { t = Date.now() - t0; break; } }
  ok('URL follows one ↓ in < 1.3 s', t != null && t < 1300, `${t} ms`);
  await p.keyboard.press('ArrowDown'); await sleep(120); await p.keyboard.press('ArrowDown'); await sleep(120); await p.keyboard.press('ArrowDown');
  const t1 = Date.now(); const before = await url(p); let t2 = null;
  for (let i = 0; i < 60; i++) { await sleep(50); if ((await url(p)) !== before) { t2 = Date.now() - t1; break; } }
  ok('three quick ↓ update the URL', t2 != null, `${t2} ms, url=${await url(p)}`);
  await p.close();
}
// 3. About: arrows read first
{
  const p = await fresh('/about.html');
  const st = () => p.evaluate(() => { const L = [...document.querySelectorAll('.layer')].find(l => l.getAttribute('aria-hidden') !== 'true') || document.querySelector('.layer'); return { top: Math.round(L.scrollTop), max: L.scrollHeight - L.clientHeight }; });
  const s0 = await st();
  await p.keyboard.press('ArrowDown'); await sleep(700);
  const s1 = await st();
  ok('About ↓ scrolls the page, URL stays', s1.top > s0.top && (await url(p)) === '/about.html', `top ${s0.top}→${s1.top}/${s1.max} url=${await url(p)}`);
  for (let i = 0; i < 6; i++) { const s = await st(); if (s.top >= s.max - 4) break; await p.keyboard.press('ArrowDown'); await sleep(700); }
  const s2 = await st();
  ok('About reaches the end by key without leaving', s2.top >= s2.max - 4 && (await url(p)) === '/about.html', `top=${s2.top}/${s2.max} url=${await url(p)}`);
  await p.keyboard.press('ArrowDown'); await sleep(150); await p.keyboard.press('ArrowDown'); await sleep(100); await p.keyboard.press('ArrowDown');
  await sleep(1800);
  ok('held key never overshoots into the next stop', ['/about.html', '/#contact'].includes(await url(p)), `url=${await url(p)}`);
  await sleep(600); await p.keyboard.press('ArrowDown'); await sleep(1800);
  ok('a deliberate ↓ at the end turns the wheel', (await url(p)) === '/#contact', `url=${await url(p)}`);
  await p.keyboard.press('ArrowUp'); await sleep(1800);
  ok('↑ at top of About after returning turns wheel up', (await url(p)) !== '/#contact', `url=${await url(p)}`);
  await p.close();
}
// 4. ← in a wide code block
{
  const p = await fresh('/case-studies/planton-ui-design-system.html');
  const info = await p.evaluate(() => { const pre = [...document.querySelectorAll('pre')].find(x => x.scrollWidth > x.clientWidth + 8); if (!pre) return null; pre.focus(); pre.scrollLeft = 80; return { sl: pre.scrollLeft }; });
  if (!info) console.log('SKIP no overflowing <pre> on Planton UI');
  else {
    await p.keyboard.press('ArrowLeft'); await sleep(500);
    const still = await p.evaluate(() => !!document.querySelector('.layer.read') || location.pathname.includes('planton-ui'));
    ok('← in scrolled code does not close the article', still && (await url(p)).includes('planton-ui'), `url=${await url(p)}`);
  }
  await p.close();
}
// 5. announce + will-change
{
  const p = await fresh('/');
  await p.keyboard.press('ArrowDown'); await sleep(1500);
  const a = await p.evaluate(() => document.getElementById('announce').textContent);
  ok('live region announces the stop', a.length > 3, JSON.stringify(a));
  await sleep(1800);
  const wc = await p.evaluate(() => getComputedStyle(document.querySelector('.layer [data-arc]')).willChange);
  ok('no will-change on the drifting lines at rest', wc === 'auto', wc);
  await p.keyboard.press('ArrowDown'); await sleep(120);
  const wc2 = await p.evaluate(() => getComputedStyle(document.querySelector('.layer [data-arc]')).willChange);
  ok('still none while moving', wc2 === 'auto', wc2);
  await p.close();
}
// 6. hub position stable (desktop + mobile)
for (const [label, opts] of [['1440px', {}], ['390px', { w: 390, h: 844, mobile: true }]]) {
  const page = await newPage(browser, opts);
  await page.evaluateOnNewDocument(() => {
    window.__tops = [];
    document.addEventListener('DOMContentLoaded', () => {
      const h = document.getElementById('hub');
      const r = () => window.__tops.push(Math.round(h.getBoundingClientRect().top));
      r(); setTimeout(r, 400); setTimeout(r, 1200);
    });
  });
  await open(page, '/', 1500);
  const tops = await page.evaluate(() => window.__tops);
  ok(`hub does not move after first paint (${label})`, new Set(tops).size === 1, tops.join(','));
  await page.close();
}
done();
await browser.close();
