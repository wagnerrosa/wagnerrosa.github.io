/* The wheel: a rotating section menu (left column, right-edge arc on small screens) that drives a stack of page layers.

   Every stop is a real URL. The HTML of the current URL already holds its own content (and works without this script);
   the other panels sit in <template>s and articles are fetched on demand, so turning the wheel is instant and a link is always a link.
   Rules: turning the wheel navigates; scrolling a page never does (only a deliberate overscroll at its end). */

type Gate = { msg: string; salt: string };
interface Stop { id: string; kind: string; level: number; url: string; title: string; read?: string; ext?: string; li: HTMLLIElement; a: HTMLAnchorElement }
interface Doc { url: string; slug: string; lock: string; title: string; el: HTMLElement | null; gate: Gate | null }
interface Layer { el: HTMLElement; arcEls: HTMLElement[]; figs: { f: Element; imgs: HTMLElement[] }[] }
interface Reading extends Partial<Doc> { url: string; el: HTMLElement | null; readK: number; prog?: HTMLElement; gate: Gate | null; pushed: boolean; id: string }

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const nav = $('wheel'), list = $('list'), stage = $('stage'), rim = $('rim') as unknown as SVGElement, hub = $('hub'), pointer = $('pointer'), edge = $('edge'), side = $('side');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mq = matchMedia('(max-width: 820px)');
const onMq = (fn: () => void) => (mq.addEventListener ? mq.addEventListener('change', fn) : (mq as any).addListener(fn));   // B24: old Safari

/* ---------- stops ---------- */
const items: Stop[] = [...list.children].map(li => {
  const a = li.querySelector('a') as HTMLAnchorElement, d = a.dataset;
  return { id: d.id!, kind: d.kind!, level: li.classList.contains('child') ? 1 : 0, url: d.url!, title: d.title!, read: d.read, ext: d.ext, li: li as HTMLLIElement, a };
});
const N = items.length;
const els = items.map(i => i.li);
const idxOf = (id: string) => items.findIndex(i => i.id === id);
const stopByUrl = new Map(items.map(i => [i.url, i]));

/* ---------- the panels each URL carries (real ones are lifted out of the page, templates unpacked) ---------- */
const store = new Map<string, HTMLElement>();
stage.querySelectorAll<HTMLElement>(':scope > section.panel[data-id]').forEach(p => { store.set(p.dataset.id!, p); p.remove(); });
stage.querySelectorAll<HTMLTemplateElement>(':scope > template[data-panel]').forEach(t => { store.set(t.dataset.panel!, t.content.firstElementChild as HTMLElement); t.remove(); });
const panelEl = (id: string) => document.importNode(store.get(id)!, true) as HTMLElement;

/* ---------- route <-> state ---------- */
const normPath = (p: string) => p.replace(/index\.html$/, '');
function where(u: URL): { read?: string; stop?: Stop } {
  const p = normPath(u.pathname);
  if (/^\/case-studies\/[^/]+\.html$/.test(p) || p === '/cv.html') return { read: p };
  return { stop: stopByUrl.get(p + u.hash) ?? stopByUrl.get(p) };
}
const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
function setMeta(title: string, url: string) {
  document.title = title;
  const u = new URL(url, location.origin);
  if (canonicalLink) canonicalLink.href = u.origin + normPath(u.pathname);
}

/* ---------- layout state ---------- */
const slots: number[] = [];
items.forEach((it, k) => { slots[k] = k === 0 ? 0 : slots[k - 1] + (it.level === 0 ? 1.6 : 1); });
const maxSlot = slots[N - 1];
const nearest = (v: number) => { let b = 0; slots.forEach((s, k) => { if (Math.abs(s - v) < Math.abs(slots[b] - v)) b = k; }); return b; };
const clamp = (v: number) => Math.min(Math.max(v, 0), maxSlot);
/* detents, like a picker wheel: next to an option the wheel lingers, and past the halfway point it moves quickly to the next one */
const MAGNET = 1.8;
const magnet = (raw: number) => {
  const v = clamp(raw), k = nearest(v), s = slots[k], d = v - s;
  const nb = slots[k + (d >= 0 ? 1 : -1)];
  const half = nb == null ? 0.5 : Math.abs(nb - s) / 2, t = Math.min(1, Math.abs(d) / half);
  return s + Math.sign(d) * half * Math.pow(t, MAGNET);
};
const slotToIdx = (v: number) => {   // slot -> fractional item index (one full panel per item)
  let k = 0; while (k < N - 2 && v > slots[k + 1]) k++;
  return k + Math.min(Math.max((v - slots[k]) / (slots[k + 1] - slots[k]), 0), 1);
};

const here = where(new URL(location.href));
const startStop = here.stop ?? items[Math.max(0, idxOf(nav.dataset.start || 'index'))];
let pos = slots[idxOf(startStop.id)];      // animated slot position
let target = pos;                          // where we are heading
let shown: number | null = null, W = 0, H = 0, R = 0, step = 0, gap = 0, cx = 0, cy = 0, stageH = 0;
let lastPos: number | null = null, ticksG: SVGGElement | null = null, mirror = false, sheet = false;   // mirror: small screens, the gear sits on the right and the labels hang to its left
let sc: { el: HTMLElement; t: number } | null = null;   // smooth in-page scroll
let urlIdx = idxOf(startStop.id);          // the stop the address bar currently describes
let landOn: number | null = null;          // closing an article by history.back() should still land on the row of the case just read
let replaceNext = false;

/* ---------- animation loop: runs only while something moves ---------- */
let raf = 0, arcDirty = true, arcMax = 56, lastRot = Infinity, lockF = 0, lastReadK = -1, interacted = false;
let soft = pos, lastT = 0, readRot = 0, readRotS = 0;
const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
const dirty = () => { arcDirty = true; kick(); };

/* ---------- page layers ---------- */
const ARC_SEL = '.title, .lede, .facts > div, .bullets li, .sub, .rows li, .links, .prose > *';
const layers = new Map<number, Layer>();
let reading: Reading | null = null;

function bindLayer(el: HTMLElement, arcSel: string, figSel: string): Pick<Layer, 'arcEls' | 'figs'> {
  const arcEls = [...el.querySelectorAll<HTMLElement>(arcSel)];
  arcEls.forEach(a => a.setAttribute('data-arc', ''));
  const figs = [...el.querySelectorAll(figSel)].map(f => ({ f, imgs: [...f.querySelectorAll<HTMLElement>('img')] }));
  return { arcEls, figs };
}
function makeLayer(k: number): Layer {
  const el = document.createElement('div');
  el.className = 'layer';
  el.appendChild(panelEl(items[k].id));
  stage.appendChild(el);
  const L: Layer = { el, ...bindLayer(el, ARC_SEL, '.fig') };
  el.addEventListener('scroll', dirty, { passive: true });
  layers.set(k, L);
  return L;
}
/* panel k sits (k - ip) stage-heights from the centre: the next one rises from below */
function syncLayers(ip: number) {
  const lo = Math.max(0, Math.floor(ip)), hi = Math.min(N - 1, Math.ceil(ip));
  for (const [k, L] of layers) if (k < lo || k > hi) { L.el.remove(); layers.delete(k); }
  for (let k = lo; k <= hi; k++) {
    const L = layers.get(k) || makeLayer(k);
    const off = (k - ip) * stageH, active = Math.abs(k - ip) < 0.5;
    L.el.style.transform = off === 0 ? '' : `translateY(${off.toFixed(1)}px)`;
    L.el.style.pointerEvents = active ? '' : 'none';
    L.el.setAttribute('aria-hidden', active ? 'false' : 'true');
    if (active) L.el.setAttribute('tabindex', '-1'); else L.el.removeAttribute('tabindex');
  }
}

/* photos: rise + fade + settle as they enter, drift up faster and fade as they leave */
function figFx({ f, imgs }: Layer['figs'][number], sr: DOMRect) {
  const r = f.getBoundingClientRect(), h = r.height || 1;
  if (r.bottom < sr.top - 80 || r.top > sr.bottom + 80) return;   // B22: nothing to do for what is far off screen
  const enter = Math.min(1, Math.max(0, (sr.bottom - r.top) / (h * 0.7)));
  const leave = Math.min(1, Math.max(0, (r.bottom - sr.top) / (h * 0.7)));
  const v = Math.min(enter, leave), dir = enter < leave ? 1 : -1;
  imgs.forEach((im, i) => {
    const vv = Math.min(1, v * (1 + i * 0.25)), e = (1 - vv) * (1 - vv);
    im.style.transform = e < 0.001 ? '' : `translateY(${(dir * e * (90 + i * 40)).toFixed(1)}px) scale(${(1 - e * 0.06).toFixed(3)})`;
    im.style.opacity = (1 - e * 0.9).toFixed(2);
  });
}
/* lines drift: the centre of the stage sits furthest from the gear, top/bottom pull back */
function arcUpdate() {
  if (reduce) return;
  const sr = stage.getBoundingClientRect(), mid = sr.top + sr.height / 2, half = sr.height / 2;
  const apply = (L: Pick<Layer, 'arcEls' | 'figs'>) => {
    const rects = L.arcEls.map(el => el.getBoundingClientRect());   // read everything first, then write
    L.arcEls.forEach((el, i) => {
      const r = rects[i];
      if (r.bottom < sr.top - 120 || r.top > sr.bottom + 120) { if (el.style.transform) el.style.transform = ''; return; }   // B22
      const t = Math.min(1, Math.abs((r.top + r.height / 2 - mid) / half));
      el.style.transform = `translateX(${((mirror ? -arcMax : arcMax) * (1 - t * t)).toFixed(1)}px)`;
    });
    L.figs.forEach(g => figFx(g, sr));
  };
  layers.forEach(apply);
  if (reading?.el) apply(reading as unknown as Layer);
}

/* ---------- articles ---------- */
const docs = new Map<string, Doc>();
const pageArticle = stage.querySelector<HTMLElement>(':scope > article[data-article]');
if (pageArticle) {
  pageArticle.remove();
  docs.set(pageArticle.dataset.url!, { url: pageArticle.dataset.url!, slug: pageArticle.dataset.slug!, lock: pageArticle.dataset.lock!, title: pageArticle.dataset.title!, el: pageArticle, gate: null });
}
const readOrder = items.filter(i => i.read).map(i => i.read!);   // the wheel's readable cases, in order
const readable = (url: string) => readOrder.includes(url);

/* A protected case is encrypted with staticrypt. Its page is fetched, the salt + ciphertext are read as text (nothing executes),
   and the unlocked article renders like any other. The derived key (not the password) is kept for the tab session. */
const keyOf = (slug: string) => { try { return sessionStorage.getItem('read-key:' + slug); } catch { return null; } };
const te = new TextEncoder();
const hexParse = (h: string) => Uint8Array.from(h.match(/../g) || [], b => parseInt(b, 16));
const hexStr = (b: ArrayBuffer) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function pbkdf2(pw: string, salt: string, iterations: number, hash: string) {
  const k = await crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hexStr(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash, iterations, salt: te.encode(salt) }, k, 256));
}
async function deriveKey(pw: string, salt: string) {   // staticrypt's three rounds: 1k SHA-1, 14k SHA-256, 585k SHA-256
  return pbkdf2(await pbkdf2(await pbkdf2(pw, salt, 1000, 'SHA-1'), salt, 14000, 'SHA-256'), salt, 585000, 'SHA-256');
}
async function decryptWith(gate: Gate, key: string): Promise<string | null> {   // the decrypted HTML, or null on a wrong key
  const sig = gate.msg.slice(0, 64), enc = gate.msg.slice(64);
  const hk = await crypto.subtle.importKey('raw', hexParse(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  if (hexStr(await crypto.subtle.sign('HMAC', hk, te.encode(enc))) !== sig) return null;
  const ak = await crypto.subtle.importKey('raw', hexParse(key), 'AES-CBC', false, ['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: hexParse(enc.slice(0, 32)) }, ak, hexParse(enc.slice(32))));
}
const parseGate = (text: string): Gate | null => {
  const msg = (text.match(/"staticryptEncryptedMsgUniqueVariableName":"([0-9a-f]+)"/) || [])[1];
  const salt = (text.match(/"staticryptSaltUniqueVariableName":"([0-9a-f]+)"/) || [])[1];
  return msg && salt ? { msg, salt } : null;
};
const articleOf = (html: string) => {
  const el = new DOMParser().parseFromString(html, 'text/html').querySelector<HTMLElement>('article[data-article]');
  if (!el) return null;
  el.querySelectorAll('script, style').forEach(n => n.remove());
  return document.importNode(el, true) as HTMLElement;
};
const docFrom = (el: HTMLElement, gate: Gate | null = null): Doc => ({ url: el.dataset.url!, slug: el.dataset.slug!, lock: el.dataset.lock!, title: el.dataset.title!, el, gate });

let loading = 0;   // B11: only the latest open request may land
async function loadDoc(url: string, token: number): Promise<Doc | null> {
  const cached = docs.get(url);
  if (cached) return cached;
  let res: Response;
  try { res = await fetch(url, { credentials: 'same-origin' }); } catch { return null; }
  if (token !== loading || !res.ok) return null;
  const text = await res.text();
  if (token !== loading) return null;
  const gate = parseGate(text);
  if (gate) {   // protected: decrypt with the stored key when there is one, otherwise show the gate
    const slug = url.replace(/^.*\//, '').replace(/\.html$/, ''), key = keyOf(slug);
    const html = key && await decryptWith(gate, key).catch(() => null);
    const el = html ? articleOf(html) : null;
    const doc: Doc = el ? docFrom(el) : { url, slug, lock: 'case-' + slug, title: `${slug} | Wagner Rosa`, el: null, gate };
    if (el) docs.set(url, doc);
    return doc;
  }
  const el = articleOf(text);
  if (!el) return null;
  const doc = docFrom(el);
  docs.set(url, doc);
  return doc;
}

/* ---------- reading mode ---------- */
const READ_TURN = 1.1;   // radians the dial turns over a whole article
let exitLi: HTMLLIElement | null = null;
const unlockedUrls = () => readOrder.filter(u => !items.find(i => i.read === u)!.a.hasAttribute('data-locked') || !!keyOf(u.replace(/^.*\//, '').replace(/\.html$/, '')));
const gateHTML = (title: string) => `<article class="read-body gated"><h1>${title}</h1><div class="gate-copy"><p>This case study is private. Enter the password to read it.</p></div><form class="gate" autocomplete="on"><input type="text" name="username" value="" autocomplete="username" hidden aria-hidden="true" tabindex="-1"><input type="password" name="password" placeholder="Password" aria-label="Password" autocomplete="current-password"><button type="submit">Unlock</button></form><p class="gate-msg" role="status" aria-live="polite"></p><p class="gate-note">No password? <a href="mailto:contato@wagnerrosa.com">Ask me for access</a>.</p></article>`;

function prepareArticle(el: HTMLElement) {
  const end = el.querySelector('.read-end');
  if (end && unlockedUrls().length > 1 && !end.querySelector('[data-next]')) {
    const next = document.createElement('a');
    next.href = '#next'; next.setAttribute('data-next', ''); next.textContent = 'Next case study →';
    end.querySelector('p.mono')?.after(next);
  }
  const exit = end?.querySelector('[data-exit]');
  if (exit) exit.textContent = 'All case studies ↑';
  const home = end?.querySelector('[data-home]');
  if (home) home.textContent = 'Home ↑';
}
function bindBody(r: Reading) {   // (re)collect what the arc / photo effects move
  const article = r.el!.firstElementChild as HTMLElement;
  const b = bindLayer(article, ':scope > *', 'figure');
  (r as any).arcEls = b.arcEls; (r as any).figs = b.figs;
}

async function openReading(url: string, opts: { push?: boolean; swap?: boolean; initial?: boolean } = {}) {
  const { push = true, swap = false, initial = false } = opts;
  if (reading?.url === url) return;
  const token = ++loading;
  const prevReading = reading;
  if (!swap) reading = { url, el: null, readK: -1, gate: null, pushed: false, id: url };   // claim the slot while fetching
  const doc = await loadDoc(url, token);
  if (token !== loading) return;
  if (!doc) { reading = prevReading && swap ? prevReading : null; location.href = url; return; }

  const readK = idxOf(doc.lock);
  const el = document.createElement('div');
  el.className = 'layer read';
  el.setAttribute('role', 'region'); el.setAttribute('aria-label', doc.title); el.tabIndex = -1;
  if (doc.el) { prepareArticle(doc.el); el.appendChild(document.importNode(doc.el, true)); }
  else el.innerHTML = gateHTML(items[readK] ? items[readK].a.textContent!.trim() : doc.slug);
  if (!initial) el.style.transform = 'translateY(100%)';
  stage.appendChild(el);

  const prog = document.createElement('sup'); prog.className = 'prog'; prog.textContent = doc.gate ? 'Private' : '0%';
  if (els[readK]) els[readK].querySelector('a')!.appendChild(prog);
  nav.classList.add('locked');
  setSheet(false);
  pointer.removeAttribute('aria-hidden'); pointer.setAttribute('role', 'button'); pointer.setAttribute('aria-label', 'Close'); pointer.tabIndex = 0;
  if (!exitLi) {
    exitLi = document.createElement('li');
    exitLi.className = 'child exit';
    exitLi.innerHTML = '<a href="/case-studies/" data-exit tabindex="-1" draggable="false"><span>All case studies ↑</span></a>';
    list.appendChild(exitLi);
  }
  if (!initial) go(readK);   // bring the wheel to this case, wherever the link was clicked from

  const wasPushed = prevReading?.pushed ?? false;
  reading = { ...doc, url, el, readK, prog, gate: doc.gate, pushed: swap ? wasPushed : push && !initial, id: url } as Reading;
  bindBody(reading);
  const st = { read: true, pushed: reading.pushed };
  if (initial) history.replaceState(st, '', location.href);
  else if (swap || !push) history.replaceState(st, '', url);
  else history.pushState(st, '', url);
  setMeta(doc.title, url);
  urlIdx = readK;

  if (doc.gate) {
    el.addEventListener('submit', e => { e.preventDefault(); unlockReading((el.querySelector('input[type="password"]') as HTMLInputElement).value); });
  }
  el.addEventListener('scroll', () => {
    const max = el.scrollHeight - el.clientHeight, p = max > 0 ? el.scrollTop / max : 0;
    readRot = p * READ_TURN;
    if (reading?.prog) reading.prog.textContent = Math.round(p * 100) + '%';
    dirty();
  }, { passive: true });
  el.getBoundingClientRect();   // commit the start position so the slide-in animates
  el.style.transform = 'translateY(0)';
  dirty();
  if (doc.gate) setTimeout(() => { if (reading?.el === el) { (el.querySelector('input[type="password"]') as HTMLInputElement | null)?.focus({ preventScroll: true }); stage.scrollTop = stage.scrollLeft = 0; } }, initial ? 50 : 850);   // after the slide-in: focusing a field while the layer is below would scroll the stage to it
  else el.focus({ preventScroll: true });
}

async function unlockReading(pw: string) {
  const r = reading;
  if (!r || !r.gate || !r.el) return;
  const msg = r.el.querySelector('.gate-msg') as HTMLElement, form = r.el.querySelector('.gate') as HTMLElement;
  if (!pw || form.classList.contains('busy')) return;
  const slug = r.url.replace(/^.*\//, '').replace(/\.html$/, '');
  form.classList.add('busy'); msg.className = 'gate-msg'; msg.textContent = 'Checking…';
  let key: string | null = null, html: string | null = null;
  try { key = await deriveKey(pw, r.gate.salt); html = await decryptWith(r.gate, key); }
  catch { msg.textContent = "This browser can't unlock it. Try Safari, Chrome or Firefox over HTTPS."; msg.className = 'gate-msg err'; form.classList.remove('busy'); return; }
  if (reading !== r) return;
  if (!html) {
    msg.textContent = 'Wrong password. Try again.'; msg.className = 'gate-msg err';
    form.classList.remove('busy', 'shake'); void form.offsetWidth; form.classList.add('shake');
    const inp = form.querySelector('input[type="password"]') as HTMLInputElement; inp.focus(); inp.select();
    return;
  }
  try { sessionStorage.setItem('read-key:' + slug, key!); } catch {}
  const article = articleOf(html);
  if (!article) { location.href = r.url; return; }
  const doc = docFrom(article);
  docs.set(r.url, doc);
  prepareArticle(article);
  r.el.replaceChildren(article);
  article.classList.add('reveal');
  r.gate = null; (r as any).gated = false;
  if (r.prog) r.prog.textContent = '0%';
  r.el.scrollTop = 0; readRot = 0;
  bindBody(r); dirty();
  r.el.focus({ preventScroll: true });
}

function closeReading(opts: { keep?: boolean } = {}) {
  if (!reading || !reading.el) { reading = null; return; }
  const { keep = false } = opts;
  const r = reading; reading = null; readRot = 0; ++loading;
  r.prog?.remove();
  if (!keep) { nav.classList.remove('locked'); pointer.setAttribute('aria-hidden', 'true'); pointer.removeAttribute('role'); pointer.removeAttribute('aria-label'); pointer.removeAttribute('tabindex'); }
  const xl = exitLi; if (!keep) { exitLi = null; setTimeout(() => xl?.remove(), 700); }
  if (!keep) { r.el!.style.transform = 'translateY(100%)'; r.el!.style.pointerEvents = 'none'; }   // when swapping, the old article stays put under the new one sliding in
  setTimeout(() => r.el!.remove(), keep ? 1000 : 850);
  kick();
}

/* Space / Shift+Space (or the link at the end): jump to the next / previous readable case study */
function switchReading(dir: number) {
  if (!reading?.el) return;
  const list = unlockedUrls(), n = list.length, cur = list.indexOf(reading.url);
  if (n < 2 || cur < 0) return;
  const next = list[(((cur + dir) % n) + n) % n];
  const old = reading;
  closeReading({ keep: true });
  reading = old;   // keep the history flags while the next one loads
  openReading(next, { swap: true });
}

function exitReading() {
  if (!reading?.el) return;
  const r = reading;
  if (r.pushed && history.state?.read) { landOn = r.readK; history.back(); return; }   // popstate closes it, so the browser Back button does the same thing
  closeReading();
  const row = items[r.readK];
  history.replaceState({}, '', row.url);
  setMeta(row.title, row.url);
  urlIdx = r.readK;
}

/* ---------- mobile sheet + dock ---------- */
function setSheet(on: boolean) {
  on = !!on && mq.matches && !reading?.el;
  if (on === sheet) return;
  sheet = on;
  document.body.classList.toggle('m-open', on);
  if (!on && nav.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
}
edge.addEventListener('click', e => { e.stopPropagation(); if (!(drag && drag.moved)) setSheet(true); });   // tap the arc: open
onMq(() => { setSheet(false); layout(); kick(); });

/* ---------- wheel geometry ---------- */
function layout() {
  const r = nav.getBoundingClientRect();
  W = r.width; H = r.height;
  stageH = stage.clientHeight;
  mirror = mq.matches;
  cy = H / 2;
  let baseX = 0;
  if (!mirror) {
    R = Math.min(H * 0.62, 420);                     // big circle, centre off-screen: only half the arc shows
    baseX = Math.min(W * 0.6, 244);                  // x of the active row
    gap = Math.min(66, Math.max(46, H * 0.07));
    hub.style.top = cy + 'px';
    cx = baseX - R - 18;
  } else {
    R = Math.min(H * 0.7, 520);
    gap = Math.min(52, Math.max(42, H * 0.058));
    hub.style.top = '';
    cx = (W - 22) + R;                               // the pointer sits 22px from the right edge, the circle's centre far off to the right
  }
  const dir = mirror ? -1 : 1;
  edge.style.top = (cy - 130) + 'px'; edge.style.height = '260px';
  step = gap / R;
  rim.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let ticks = '';
  const dt2 = step / 2;                                  // graduation like a dial: two ticks per row, every 4th a bit longer
  for (let j = Math.ceil(-1.6 / dt2); j <= Math.floor((1.6 + maxSlot * step) / dt2); j++) {
    const a = j * dt2, c = Math.cos(a), sn = Math.sin(a), len = j % 4 === 0 ? 11 : 5;
    ticks += `<line class="${j % 4 === 0 ? 'major' : ''}" x1="${(cx + dir * (R - 4) * c).toFixed(1)}" y1="${(cy + (R - 4) * sn).toFixed(1)}" x2="${(cx + dir * (R - 4 - len) * c).toFixed(1)}" y2="${(cy + (R - 4 - len) * sn).toFixed(1)}"/>`;
  }
  rim.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${R}"/><g id="ticks">${ticks}</g>`;
  ticksG = rim.querySelector('#ticks') as SVGGElement;
  pointer.style.left = (cx + dir * R) + 'px'; pointer.style.top = cy + 'px';
  arcMax = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--arc')) || 56;
  lastPos = null; lastRot = Infinity;
}

function setActive(idx: number) {
  items.forEach((it, k) => {
    const on = k === idx;
    it.a.classList.toggle('on', on);
    if (on) it.a.setAttribute('aria-current', 'page'); else it.a.removeAttribute('aria-current');
    it.a.tabIndex = on ? 0 : -1;   // B12: roving tabindex, one tab stop for the whole wheel
  });
}

/* ---------- frame ---------- */
const side$ = side.classList;
function frame(now: number) {
  raf = 0;
  const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
  let busy = false;
  if (reduce) { soft = pos = target; }
  else {
    soft += (target - soft) * (1 - Math.exp(-dt * 14));
    pos += (soft - pos) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - pos) < 0.0005 && Math.abs(target - soft) < 0.0005) pos = soft = target; else busy = true;
  }
  if (pull?.on && !pull.settled && performance.now() - pull.at > 260) { pull.settled = true; settlePull(); }   // safety net: iOS can drop touchend when the touched page is swapped out
  if (pull?.on && !pull.settled) busy = true;
  if (sc) {                                           // smooth scroll inside the current page
    const d = sc.t - sc.el.scrollTop;
    if (Math.abs(d) < 0.5) { sc.el.scrollTop = sc.t; sc = null; }
    else { sc.el.scrollTop += d * (1 - Math.exp(-dt * 11)); busy = true; }
    arcDirty = true;
  }

  const lockT = reading?.el ? 1 : 0;
  lockF = reduce ? lockT : lockF + (lockT - lockF) * (1 - Math.exp(-dt * 8));
  if (Math.abs(lockT - lockF) > 0.002) busy = true; else lockF = lockT;
  const readK = reading?.el ? reading.readK : lastReadK;   // keep the right row bright while the lock eases out
  if (reading?.el) lastReadK = reading.readK;
  const place = (el: HTMLElement, slot: number, mult: number) => {
    const th = (slot - pos) * step;
    const x = cx + (mirror ? -1 : 1) * (R * Math.cos(th) + 18);   // desktop: label starts right of the rim; mirrored: label ends left of it
    const edgeX = mirror ? W - x : x;
    if (Math.abs(th) > 1.15 || edgeX < 4) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; return; }
    const y = cy + R * Math.sin(th);
    const s = 1 - Math.abs(th) * 0.16;
    const op = Math.max(0, 1 - Math.abs(th) * 0.8) * Math.min(1, Math.max(0, mirror ? (edgeX - 6) / 30 : (edgeX - 24) / 70)) * mult;   // also fade as a row nears the left edge, so nothing is cut mid-word
    el.style.opacity = op.toFixed(3);
    el.style.pointerEvents = op < 0.05 ? 'none' : '';
    const bl = Math.max(0, Math.abs(th) - 0.3) * 2.6;   // depth: rows leaving the centre soften
    el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : '';
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${mirror ? '-100%' : '0'}, -50%) scale(${s.toFixed(3)})`;
    el.style.transformOrigin = mirror ? '100% 50%' : '0 50%';
  };
  els.forEach((el, k) => place(el, slots[k], k === readK ? 1 : k === readK - 1 ? 1 - lockF : 1 - lockF * 0.72));   // the row above the open case makes room for the exit row
  if (exitLi) place(exitLi, slots[lastReadK] - 1, lockF);

  const rd = !!reading?.el;
  if (shown != null) interacted = true;                // leaving Home counts as interacting
  const here$ = items[nearest(clamp(pos))];
  side$.toggle('k-nav', interacted && !rd && shown != null && shown !== 0);   // Home stays clean: the hint shows from the first work stop down
  side$.toggle('k-enter', !reading && shown != null && !!here$.read);
  side$.toggle('k-close', rd);
  side$.toggle('k-next', rd && !reading!.gate && unlockedUrls().length > 1);
  side$.toggle('k-scroll', rd && !reading!.gate);
  readRotS = reduce ? readRot : readRotS + (readRot - readRotS) * (1 - Math.exp(-dt * 9));
  if (Math.abs(readRotS - readRot) < 0.0002) readRotS = readRot; else busy = true;
  if (readRotS !== lastRot || pos !== lastPos) {       // the dial turns with the wheel, and with reading progress on top
    lastRot = readRotS;
    ticksG?.setAttribute('transform', `rotate(${((mirror ? 1 : -1) * (pos * step + readRotS) * 180 / Math.PI).toFixed(3)} ${cx} ${cy})`);
  }
  if (pos !== lastPos) {
    lastPos = pos;
    syncLayers(slotToIdx(clamp(pos)));
    arcDirty = true;
    const idx = nearest(clamp(pos));
    if (idx !== shown) { shown = idx; setActive(reading?.el ? reading.readK : idx); }
  }
  if (arcDirty) { arcDirty = false; arcUpdate(); }

  // the address bar follows the wheel once it has come to rest (no history spam while it spins)
  if (!busy && !reading && !pull?.on && shown != null && shown !== urlIdx) { commitStop(shown, replaceNext); replaceNext = false; }
  if (busy) kick();
}

/* the wheel came to rest on a stop the address bar doesn't describe yet */
function commitStop(k: number, replace = false) {
  const it = items[k];
  if (replace) history.replaceState({}, '', it.url); else history.pushState({}, '', it.url);
  setMeta(it.title, it.url);
  urlIdx = k;
}

const go = (k: number) => { target = slots[Math.min(Math.max(k, 0), N - 1)]; kick(); };

/* ---------- input: wheel / trackpad over the gear ---------- */
let snapT: number, lastSmall = 0, lastNotch = 0;
const isNotch = (e: WheelEvent) => {
  const now = performance.now();
  if (e.deltaMode === 1) return true;
  if (Math.abs(e.deltaY) < 40) { lastSmall = now; return false; }
  return now - lastSmall > 200 && Number.isInteger(e.deltaY);   // B5: a mouse wheel notch moves one stop; trackpads accumulate
};
nav.addEventListener('wheel', e => {
  e.preventDefault();
  if (reading) return;                                 // gear is locked while reading
  if (isNotch(e)) {
    const now = performance.now();
    if (now - lastNotch > 110) { lastNotch = now; go(nearest(target) + Math.sign(e.deltaY)); }
    return;
  }
  target = clamp(target + e.deltaY / 220); kick();
  clearTimeout(snapT); snapT = window.setTimeout(() => go(nearest(target)), 110);
}, { passive: false });

/* ---------- input: wheel over the page ----------
   Scrolling moves the page. Reaching its end does nothing by itself: the wheel only turns on a deliberate overscroll (a pull that
   keeps going after the page has stopped), shown with a rubber band. */
let edgeAcc = 0, edgeT: number, lastMove = 0, coolUntil = 0;
const OVER = 150;
stage.addEventListener('wheel', e => {
  if (reading) return;                                 // the article scrolls natively; no page turning
  const idx = nearest(clamp(pos)), L = layers.get(idx);
  const moving = Math.abs(target - slots[idx]) > 0.04 || Math.abs(pos - slots[idx]) > 0.04;
  const now = performance.now();
  if (!moving && L) {
    const el = L.el, dy = e.deltaY, maxS = el.scrollHeight - el.clientHeight;
    const cur = sc && sc.el === el ? sc.t : el.scrollTop;
    const atBottom = cur >= maxS - 1, atTop = cur <= 0;
    if ((dy > 0 && !atBottom) || (dy < 0 && !atTop)) {   // scroll inside the page, eased
      e.preventDefault(); edgeAcc = 0; lastMove = now; rubber(L.el, 0, 0);
      sc = { el, t: Math.min(Math.max(cur + dy, 0), maxS) }; kick();
      return;
    }
  }
  e.preventDefault();
  if (moving || now < coolUntil || now - lastMove < 450 || !L) return;   // the momentum of the scroll that just reached the end is not an overscroll
  if (Math.sign(edgeAcc) !== Math.sign(e.deltaY)) edgeAcc = 0;
  edgeAcc += e.deltaY;
  rubber(L.el, Math.sign(edgeAcc), 40 * (1 - Math.exp(-Math.abs(edgeAcc) / 110)));
  clearTimeout(edgeT); edgeT = window.setTimeout(() => { edgeAcc = 0; rubber(L.el, 0, 0); }, 220);
  if (Math.abs(edgeAcc) >= OVER) {
    const dir = Math.sign(edgeAcc); edgeAcc = 0; coolUntil = now + 700; rubber(L.el, 0, 0);
    go(nearest(target) + dir);
  }
}, { passive: false });
stage.addEventListener('pointerdown', () => { sc = null; });
addEventListener('keydown', () => { sc = null; }, true);

/* rubber band: the page follows the finger / wheel with growing resistance, then springs back */
function rubber(layer: HTMLElement, dir: number, d: number) {
  const n = layer.firstElementChild as HTMLElement | null;
  if (!n) return;
  n.style.transition = d ? 'none' : 'transform .55s cubic-bezier(.2, .9, .25, 1.15)';
  n.style.transform = d ? `translateY(${(-dir * d).toFixed(1)}px)` : '';
}

/* ---------- input: drag (mouse + touch) on the gear ---------- */
let drag: { y: number; t: number; moved: boolean; s: { t: number; y: number }[] } | null = null;
let autoT: number;   // a sheet opened by pulling past the page edge dismisses itself once the visitor stops touching the wheel
nav.addEventListener('pointerdown', e => { clearTimeout(autoT); drag = { y: e.clientY, t: target, moved: false, s: [] }; kick(); });
nav.addEventListener('pointermove', e => {
  if (!drag || reading) return;
  const dy = drag.y - e.clientY;
  if (!drag.moved && Math.abs(dy) > 4) { drag.moved = true; nav.setPointerCapture(e.pointerId); }   // capture only once it is a real drag, so plain clicks still reach the links
  if (drag.moved) {
    if (mirror && !sheet) setSheet(true);   // dragging the collapsed arc opens it
    const before = nearest(target);
    target = magnet(drag.t + dy / gap); kick();
    if (nearest(target) !== before && navigator.vibrate) navigator.vibrate(6);   // a tick as each option passes, where the browser allows it (not iOS)
    const now = performance.now(); drag.s.push({ t: now, y: e.clientY }); while (drag.s.length > 2 && now - drag.s[0].t > 120) drag.s.shift();
  }
});
const end = () => {
  if (drag?.moved) {                                   // let a flick carry on a little, then settle on the nearest option
    const now = performance.now(), r = drag.s.filter(q => now - q.t < 100), a = r[0], b = r[r.length - 1], dt = a && b ? b.t - a.t : 0;   // only a finger still moving at release counts
    const v = dt > 16 ? (a.y - b.y) / dt * 1000 / gap : 0;   // options per second, finger up = forward
    go(nearest(clamp(target + Math.max(-2, Math.min(2, v * 0.07)))));
  }
  setTimeout(() => { drag = null; }, 0);
};
nav.addEventListener('pointerup', end); nav.addEventListener('pointercancel', end);
nav.addEventListener('click', e => { if (sheet && !(e.target as Element).closest('a') && !(drag && drag.moved)) setSheet(false); });   // tap outside the rows closes the sheet

/* ---------- input: touch pull past the end of a page ----------
   The arc opens and moves one page on, like an overscroll with the wheel on desktop. It takes a deliberate pull;
   a second, shorter try right after the first bounced off the edge also counts. */
const PULL = 120, PULL_AGAIN = 56;   // px of finger travel past the edge: first try / a second try right after a bounce
let pull: { el: HTMLElement; node: EventTarget; last: number; ey: number | null; dir: number; on: boolean; at: number; settled?: boolean; dist?: number } | null = null;
let lastTry = { t: 0, dir: 0 };
const touchY = (e: TouchEvent) => e.touches[0].clientY;
function pullMove(e: TouchEvent) {
  if (!pull) return;
  const y = touchY(e);
  if (pull.on) { rubber(pull.el, 0, 0); e.preventDefault(); pull.at = performance.now(); return; }   // one step per pull: the rest of this gesture is spent, the arc takes over
  const dir = y < pull.last ? 1 : y > pull.last ? -1 : pull.dir;   // finger up = reading further down
  pull.last = y;
  const el = pull.el, max = el.scrollHeight - el.clientHeight;
  const atEdge = dir > 0 ? el.scrollTop >= max - 1 : dir < 0 && el.scrollTop <= 0;
  if (!atEdge) { rubber(el, 0, 0); pull.ey = null; pull.dir = dir; return; }
  if (pull.ey == null || pull.dir !== dir) { pull.ey = y; pull.dir = dir; }
  const dist = (pull.ey - y) * dir, again = lastTry.dir === dir && e.timeStamp - lastTry.t < 2000;
  pull.dist = dist;
  rubber(el, dir, dist > 0 ? 64 * (1 - Math.exp(-dist / 90)) : 0);
  if (dist > (again ? PULL_AGAIN : PULL)) {   // the pull has to be deliberate; from here the page steps once, then follows the finger
    pull.on = true; pull.at = performance.now(); setSheet(true); clearTimeout(autoT); e.preventDefault(); go(nearest(clamp(target + dir)));
  }
}
function settlePull() {
  go(nearest(target));                                  // never leave the wheel between two pages (on iOS touchend can go missing)
  clearTimeout(autoT); autoT = window.setTimeout(() => setSheet(false), 2600);   // long enough to grab the arc and keep going
}
function pullEnd(e: TouchEvent) {
  if (!pull) return;
  rubber(pull.el, 0, 0);
  pull.node.removeEventListener('touchmove', pullMove as EventListener); pull.node.removeEventListener('touchend', pullEnd as EventListener); pull.node.removeEventListener('touchcancel', pullEnd as EventListener);
  if (pull.on) settlePull();
  else if ((pull.dist ?? 0) > 24) lastTry = { t: e.timeStamp, dir: pull.dir };   // bounced off the edge: the next try needs less
  pull = null;
}
stage.addEventListener('touchstart', e => {
  const el = (e.target as Element).closest<HTMLElement>('.layer');
  pull = mirror && !reading && !sheet && el && !el.classList.contains('read') && e.touches.length === 1 ? { el, node: e.target!, last: touchY(e), ey: null, dir: 0, on: false, at: 0 } : null;
  if (!pull) return;
  // the touch keeps targeting the element it started on, even after the wheel has swapped that page out, so the listeners live on it
  pull.node.addEventListener('touchmove', pullMove as EventListener, { passive: false });
  pull.node.addEventListener('touchend', pullEnd as EventListener); pull.node.addEventListener('touchcancel', pullEnd as EventListener);
  kick();
}, { passive: true });

/* ---------- navigation ---------- */
function navigateTo(u: URL, push = true) {
  const w = where(u);
  if (w.read) { if (reading?.url === w.read) return; openReading(w.read, { push, swap: !!reading?.el }); return; }
  if (reading) closeReading();
  if (w.stop) {
    const popped = items.indexOf(w.stop);
    let k = popped;
    if (!push) {
      urlIdx = popped;
      if (landOn != null && landOn !== popped) { k = landOn; replaceNext = true; }   // back from an article: stay on the case that was open, and let the settled wheel rewrite the entry
      else setMeta(w.stop.title, w.stop.url);
    }
    landOn = null;
    go(k);
  }
  else location.href = u.href;
}

list.addEventListener('click', e => {
  const a = (e.target as Element).closest('a') as HTMLAnchorElement | null; if (!a) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // open in a new tab as usual
  e.preventDefault();
  if (drag?.moved) return;
  if (a.hasAttribute('data-exit')) { exitFromRow(); return; }
  if (sheet) setTimeout(() => setSheet(false), 220);   // picking a row dismisses the sheet (a beat later, so the choice registers)
  const k = idxOf(a.dataset.id!), it = items[k];
  const resting = k === nearest(clamp(pos)) && Math.abs(pos - target) < 0.04;
  if (reading) { closeReadingTo(k); return; }   // the lit row of the open case closes it; any other row leaves it and goes there
  if (resting && it.read) { openReading(it.read); return; }   // clicking the row the wheel already rests on opens the article (Enter does too)
  go(k);
});
/* leave the open article, landing on stop k; one history step back when the article was opened by a push */
function closeReadingTo(k: number) {
  const r = reading;
  closeReading();
  if (r?.pushed && history.state?.read && k === r.readK) { landOn = k; history.back(); return; }
  urlIdx = -1; go(k);
}
function exitFromRow() {
  if (reading) { closeReadingTo(idxOf('cases')); return; }
  go(idxOf('cases'));
}

/* any other in-site link opens in place: same shell, no reload (C4) */
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
  if (!a || a.target === '_blank' || a.hasAttribute('download') || a.closest('#list')) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
  if (a.hasAttribute('data-next')) { e.preventDefault(); switchReading(1); return; }
  if (a.hasAttribute('data-exit')) { e.preventDefault(); exitFromRow(); return; }
  if (a.hasAttribute('data-home')) { e.preventDefault(); if (reading) closeReading(); go(0); return; }
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || /\.(pdf|md|txt|xml|png|jpe?g|webp|mp4)$/i.test(u.pathname)) return;
  if (!where(u).read && !where(u).stop) return;
  e.preventDefault();
  if (sheet) setSheet(false);
  navigateTo(u);
});
addEventListener('popstate', () => navigateTo(new URL(location.href), false));

/* ---------- keyboard ---------- */
stage.addEventListener('scroll', () => { if (stage.scrollTop || stage.scrollLeft) stage.scrollTop = stage.scrollLeft = 0; });   // only the layers scroll; a focused field must never drag the stage itself
const activeLayer = () => reading?.el ?? layers.get(nearest(clamp(pos)))?.el ?? null;
addEventListener('keydown', e => {
  const T = e.target instanceof Element ? e.target : null;   // key caps dispatch on the window itself
  if (T?.closest('input, textarea')) {   // typing a password
    const inp = T as HTMLInputElement;
    if (reading && (e.key === 'Escape' || (e.key === 'ArrowLeft' && !inp.value))) { e.preventDefault(); exitReading(); }   // ← leaves too while the field is empty
    else if (reading && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); inp.blur(); reading.el!.focus({ preventScroll: true }); }   // ↑ ↓ hand the keyboard back to the layer
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const onControl = !!T?.closest('button, summary') || (!!T?.closest('a') && !T.closest('#list'));   // those keep their own Space / Enter
  const onStage = !!T?.closest('.stage');
  if (sheet && e.key === 'Escape') { e.preventDefault(); setSheet(false); return; }
  if (reading) {
    if (e.key === 'Escape' || e.key === 'ArrowLeft') { e.preventDefault(); exitReading(); }
    else if (e.key === ' ' && !onControl) { e.preventDefault(); switchReading(e.shiftKey ? -1 : 1); }
    else if (reading.el && document.activeElement !== reading.el && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) reading.el.focus({ preventScroll: true });   // keep the keyboard on the article, even after a click on the wheel
    return;
  }
  if (e.key === 'ArrowRight') {   // → opens the case study the wheel is resting on
    const it = items[nearest(clamp(pos))];
    if (it.read && Math.abs(pos - target) < 0.04) { e.preventDefault(); openReading(it.read); return; }
  }
  // B15: with the focus on the wheel, PageUp / PageDown / Home / End still scroll the page that is showing
  if (['PageUp', 'PageDown', 'Home', 'End'].includes(e.key) && !onControl && !onStage) {
    const L = activeLayer();
    if (L) {
      e.preventDefault();
      const h = L.clientHeight * 0.85;
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? L.scrollHeight : L.scrollTop + (e.key === 'PageUp' ? -h : h);
      L.scrollTo({ top: to, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
  }
  if (onStage) return;
  const inList = !!T?.closest('#list');
  if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); go(nearest(target) + 1); if (inList) focusActiveSoon(); }
  if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); go(nearest(target) - 1); if (inList) focusActiveSoon(); }
});
/* the focus follows the wheel once it has come to rest, so the next Tab / Enter acts on the stop in the middle */
function focusActiveSoon() { setTimeout(() => { const k = nearest(clamp(target)); if (document.activeElement?.closest('#list') && !reading) items[k].a.focus({ preventScroll: true }); }, 380); }

/* key caps act as buttons: reuse the keyboard handler, so guards and behaviour stay in one place */
const keysEl = document.querySelector('.keys') as HTMLElement;
const press = (key: string) => dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
keysEl.addEventListener('mousedown', e => e.preventDefault());   // keep focus where it was, so Space doesn't re-press the button
keysEl.addEventListener('click', e => {
  const t = (e.target as Element).closest<HTMLElement>('[data-k]'); if (!t) return;
  const k = t.dataset.k;
  if (k === 'enter') press('ArrowRight');
  else if (k === 'close') press('Escape');
  else if (k === 'next') press(' ');
  else if (k === 'up') press('ArrowUp');
  else if (k === 'down') press('ArrowDown');
  else if (reading?.el) reading.el.scrollBy({ top: (k === 'scroll-up' ? -1 : 1) * reading.el.clientHeight * .6, behavior: 'smooth' });
});
pointer.addEventListener('click', e => { if (reading) { e.stopPropagation(); exitReading(); } else if (sheet) { e.stopPropagation(); setSheet(false); } });
pointer.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && reading) { e.preventDefault(); e.stopPropagation(); exitReading(); } });
hub.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault(); if (reading) closeReading(); go(0);
});
['wheel', 'keydown', 'pointerdown'].forEach(t => addEventListener(t, () => { interacted = true; kick(); }, { capture: true, passive: true }));
addEventListener('resize', () => { layout(); kick(); });
if (window.visualViewport) visualViewport.addEventListener('resize', () => { layout(); kick(); });   // iOS toolbars sliding in and out change the visible height
addEventListener('scroll', () => { if (scrollX || scrollY) scrollTo(0, 0); }, { passive: true });   // the document itself must never move
$('theme').addEventListener('click', () => {
  const root = document.documentElement, dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const cur = root.dataset.theme || (dark ? 'dark' : 'light'), next = cur === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  $('theme').blur();
});

/* ---------- go ---------- */
layout();
setActive(idxOf(startStop.id));
if (here.read) {
  // an article's own URL: open its layer straight away, no slide-in
  openReading(here.read, { push: false, initial: true });
} else {
  if (startStop.id !== (nav.dataset.start || 'index')) setMeta(startStop.title, startStop.url);   // arrived on a #hash stop
}
kick();
