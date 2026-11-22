// Renders on /casa/ (src/components/casa/Render.astro; viewpoints drawn on the plan by src/lib/casa-pianta.ts).
// - Plan, with a mouse: hovering a viewpoint shows its render, whole, as a preview above it; a click on the viewpoint or on the preview
//   ("Ingrandisci") opens the viewer. The preview stays while the pointer moves onto it. Touch: a tap opens the viewer.
// - Gallery: a card opens the viewer (without JS, the image); hovering a card lights its viewpoint on the plan.
// - Viewer: a render with notes on it (data-info) has an Immagine | Note switch (also the I key) that fades to the annotated twin; moving on starts again at the plain render.
// - Viewer: the render, its title and, on a small copy of the whole plan, the camera and its cone of view. On a wide screen with a mouse the other viewpoints show
//   on that plan as dots and a click on one goes to its render. ‹ › and the arrow keys when there are several renders; Esc, × or a click outside the image close it.
type F = { full: string; info: string | null; thumb: string; titolo: string; ar: string; at: number[] | null };

const cards = [...document.querySelectorAll<HTMLAnchorElement>('.cr-card')];
const list: F[] = cards.map(c => ({
  full: c.dataset.full!,
  info: c.dataset.info || null,
  thumb: c.dataset.thumb!,
  titolo: c.dataset.titolo!,
  ar: c.dataset.ar!,
  at: c.dataset.at ? c.dataset.at.split(' ').map(Number) : null,
}));
const dlg = document.getElementById('cr-lb') as HTMLDialogElement | null;
const sec = document.querySelector<HTMLElement>('.cp');
const views = [...document.querySelectorAll<HTMLElement>('.cp-view')];
// the plan the page shows: upright (cp-port) on a phone held upright, as drawn otherwise (same query as in src/styles/casa.css). Not by what is on
// screen: with the map showing, neither is.
const upright = matchMedia('(max-width: 820px) and (orientation: portrait)');
const visible = () => views.find(v => v.classList.contains('cp-port') === upright.matches) ?? views[0];
const shotsOf = (i: number) => document.querySelectorAll<SVGGElement>(`.cp-shot[data-i="${i}"]`);

/** Cone of view at the origin pointing at a° (same as cono() in src/lib/casa-pianta.ts). */
const cono = (a: number, r: number, half = 28) => {
  const p = (d: number) => `${(r * Math.cos((d * Math.PI) / 180)).toFixed(1)} ${(r * Math.sin((d * Math.PI) / 180)).toFixed(1)}`;
  return `M0 0L${p(a - half)}A${r} ${r} 0 0 1 ${p(a + half)}Z`;
};

if (dlg && list.length) {
  const img = document.getElementById('cr-img') as HTMLImageElement;
  const title = document.getElementById('cr-t')!;
  const count = document.getElementById('cr-c');
  const mapBox = document.getElementById('cr-map')!;
  const seg = document.getElementById('cr-seg')!;
  let cur = 0;

  // ---- mini map: the whole plan as drawn (a locator, never cropped, the same on every screen), without texts and markers; the camera slides
  // to each render's viewpoint and its cone of view turns to where it looks ----
  const CARD = 300;   // nominal width in px (the locator is a little narrower or wider by screen): sizes of the camera in px are turned into drawing units from it
  let map: { cam: SVGGElement; cone: SVGPathElement; a: number } | null = null;
  function buildMap() {
    if (map) return map;
    const svg = document.querySelector<SVGSVGElement>('.cp-land svg')!.cloneNode(true) as SVGSVGElement;
    svg.querySelectorAll('.cp-t, .cp-q, .cp-b').forEach(e => e.remove());
    for (const a of ['role', 'aria-label', 'style']) svg.removeAttribute(a);
    svg.setAttribute('viewBox', svg.dataset.full!);   // the whole drawing (the page's copy may be zoomed in)
    svg.classList.add('cr-svg');
    const u = Number(svg.dataset.full!.split(' ')[2]) / CARD;   // drawing units per px
    // the camera goes where the markers were; the cone is drawn pointing right and turned, so it can slide and turn between renders
    const shots = svg.querySelector('.cp-shots')!;
    // the other viewpoints: small dots (shown on a wide screen with a mouse), each with a larger invisible target; a click goes to its render
    const pts = list.map((f, i) => f.at ? `<g class="cr-pt" data-i="${i}" transform="translate(${f.at[0]} ${f.at[1]})"><title>${String(i + 1).padStart(2, '0')} · ${f.titolo.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title><circle class="cr-hit" r="${(11 * u).toFixed(0)}"/><circle class="cr-p" r="${(4.2 * u).toFixed(1)}"/></g>` : '').join('');
    shots.innerHTML = `<defs><radialGradient id="cr-g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${(56 * u).toFixed(0)}"><stop class="cr-g0" offset="0" stop-opacity=".62"/><stop class="cr-g0" offset="1" stop-opacity=".1"/></radialGradient></defs>`
      + pts + `<g class="cr-cam"><path class="cr-cone" d="${cono(0, 56 * u)}"/><circle class="cr-dot" r="${(5.5 * u).toFixed(0)}"/></g>`;
    shots.querySelectorAll<SVGGElement>('.cr-pt').forEach(g => g.addEventListener('click', () => show(+g.dataset.i!)));
    mapBox.replaceChildren(svg, ...mapBox.querySelectorAll('.cr-north'));
    map = { cam: shots.querySelector('.cr-cam')!, cone: shots.querySelector('.cr-cone')!, a: 0 };
    return map;
  }
  function aim(f: F) {
    mapBox.hidden = !f.at;
    if (!f.at) return;
    const first = !map, m = buildMap();
    const [x, y, a] = f.at;
    mapBox.querySelectorAll('.cr-pt').forEach(g => g.classList.toggle('cur', (g as SVGGElement).dataset.i === String(cur)));
    // turn the short way round
    let d = (((a - m.a) % 360) + 540) % 360 - 180;
    if (first) d = a - m.a;
    m.a += d;
    mapBox.classList.toggle('still', first);   // no slide on the first one
    m.cam.style.transform = `translate(${x}px, ${y}px)`;
    m.cone.style.transform = `rotate(${m.a}deg)`;
    if (first) requestAnimationFrame(() => mapBox.classList.remove('still'));
  }

  // ---- viewer ----
  /** Plain render or the one with notes. */
  let swap = 0;
  /** Fade to another image: it is decoded first, so the old one is never replaced by a half-loaded one. */
  function paint(src: string) {
    if (img.getAttribute('src') === src) return;
    const id = ++swap;
    if (img.getAttribute('src')) img.classList.add('lo');
    const n = new Image();
    n.src = src;
    n.decode().catch(() => {}).then(() => {
      if (id !== swap) return;
      img.src = src;
      img.classList.remove('lo');
    });
  }
  function mode(m: 'img' | 'info') {
    const f = list[cur], note = m === 'info' && !!f.info;
    paint(note ? f.info! : f.full);
    img.alt = `${note ? 'Render con note' : 'Render'}: ${f.titolo}`;
    seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.m === 'info') === note)));
  }
  function show(i: number) {
    cur = (i + list.length) % list.length;
    const f = list[cur];
    seg.hidden = !f.info;
    mode('img');
    if (f.info) new Image().src = f.info;
    title.textContent = f.titolo;
    if (count) count.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    aim(f);
    if (list.length > 1) [cur + 1, cur - 1].forEach(n => { new Image().src = list[(n + list.length) % list.length].full; });
  }
  function open(i: number) {
    hideTip();
    if (!dlg!.open) { img.removeAttribute('src'); img.classList.remove('lo'); }   // no flash of the render seen last
    show(i);
    if (!dlg!.open) {
      dlg!.showModal();
      dlg!.focus();   // not its first button (‹), which would show a focus ring on a mouse click; Tab still reaches the buttons
    }
  }
  document.getElementById('cr-x')!.addEventListener('click', () => dlg.close());
  document.getElementById('cr-prev')?.addEventListener('click', () => show(cur - 1));
  document.getElementById('cr-next')?.addEventListener('click', () => show(cur + 1));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // the dark area around the image
  seg.addEventListener('click', e => {
    const m = (e.target as Element).closest<HTMLButtonElement>('[data-m]')?.dataset.m;
    if (m) mode(m as 'img' | 'info');
  });
  dlg.addEventListener('keydown', e => {
    if ((e.key === 'i' || e.key === 'I') && !e.metaKey && !e.ctrlKey && !e.altKey && list[cur].info) {
      mode(seg.querySelector('[data-m="info"]')!.getAttribute('aria-pressed') === 'true' ? 'img' : 'info');
    }
    if (list.length < 2) return;
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  let tx: number | null = null;
  dlg.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', e => {
    if (tx == null || list.length < 2) return;
    const d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1));
  }, { passive: true });

  // ---- gallery ----
  cards.forEach((c, i) => {
    c.addEventListener('click', e => { e.preventDefault(); open(i); });
    c.addEventListener('pointerenter', () => shotsOf(i).forEach(s => s.classList.add('on')));
    c.addEventListener('pointerleave', () => shotsOf(i).forEach(s => s.classList.remove('on')));
  });

  // ---- plan: preview on hover, viewer on click / tap ----
  const tip = sec?.querySelector<HTMLElement>('.cp-tip');
  const tipImg = tip?.querySelector('img'), tipNum = tip?.querySelector('figcaption i'), tipCap = tip?.querySelector('figcaption em');
  let tipI = -1, leaving = 0;
  function hideTip() {
    clearTimeout(leaving);
    tipI = -1;
    if (tip) tip.hidden = true;
    document.querySelectorAll('.cp-shot.on').forEach(s => s.classList.remove('on'));
  }
  // leaving a viewpoint waits a beat, so the pointer can cross the gap to the preview and click it
  const hideSoon = () => { clearTimeout(leaving); leaving = setTimeout(hideTip, 160); };
  function peek(s: SVGGElement, i: number) {
    if (!tip || !sec || !tipImg || !tipCap || !tipNum) return;
    clearTimeout(leaving);
    document.querySelectorAll('.cp-shot.on').forEach(o => o !== s && o.classList.remove('on'));
    s.classList.add('on');
    tipI = i;
    tipImg.src = list[i].thumb;
    tipNum.textContent = String(i + 1).padStart(2, '0');   // the number on the pin and on the gallery card
    tipCap.textContent = list[i].titolo;
    tip.style.setProperty('--ar', list[i].ar);   // its own shape, so nothing is cut
    tip.hidden = false;
    const c = s.querySelector('.cp-cam')!.getBoundingClientRect(), b = sec.getBoundingClientRect();
    const half = tip.offsetWidth / 2, below = c.top < tip.offsetHeight + 24;   // too close to the top of the screen: under the dot
    tip.classList.toggle('below', below);
    tip.style.setProperty('--x', `${Math.min(b.width - half - 4, Math.max(half + 4, c.left + c.width / 2 - b.left))}px`);
    tip.style.setProperty('--y', `${(below ? c.bottom : c.top) - b.top}px`);
  }
  const mouse = matchMedia('(hover: hover)');
  document.querySelectorAll<SVGGElement>('.cp-shot').forEach(s => {
    const i = +s.dataset.i!;
    s.addEventListener('click', () => open(i));
    s.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse' || !mouse.matches || s.closest('.dragging')) return;
      peek(s, i);
      new Image().src = list[i].full;   // warm the viewer
    });
    s.addEventListener('pointerleave', hideSoon);
  });
  tip?.addEventListener('pointerenter', () => clearTimeout(leaving));
  tip?.addEventListener('pointerleave', hideSoon);
  tip?.addEventListener('click', () => { if (tipI >= 0) open(tipI); });
}
