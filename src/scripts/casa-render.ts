// Renders on /casa/ (src/components/casa/Render.astro; viewpoints drawn on the plan by src/lib/casa-pianta.ts).
// - Plan, with a mouse: hovering a viewpoint shows its render, whole, as a preview above it; a click on the viewpoint or on the preview
//   ("Ingrandisci") opens the viewer. The preview stays while the pointer moves onto it. Touch: a tap opens the viewer.
// - Gallery: a card opens the viewer (without JS, the image); hovering a card lights its viewpoint on the plan.
// - Viewer: the render, its title and, on a small copy of the plan as the page shows it (as drawn, or upright on phones), the camera
//   and its cone of view. ‹ › and the arrow keys when there are several renders; Esc, × or a click outside the image close it.
type F = { full: string; thumb: string; titolo: string; ar: string; at: number[] | null };

const cards = [...document.querySelectorAll<HTMLAnchorElement>('.cr-card')];
const list: F[] = cards.map(c => ({
  full: c.dataset.full!,
  thumb: c.dataset.thumb!,
  titolo: c.dataset.titolo!,
  ar: c.dataset.ar!,
  at: c.dataset.at ? c.dataset.at.split(' ').map(Number) : null,
}));
const dlg = document.getElementById('cr-lb') as HTMLDialogElement | null;
const sec = document.querySelector<HTMLElement>('.cp');
const views = [...document.querySelectorAll<HTMLElement>('.cp-view')];
const visible = () => views.find(v => v.offsetParent !== null) ?? views[0];
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
  let cur = 0;

  // ---- mini map: a copy of the plan on screen, without texts and markers, cropped around the camera ----
  let map: { svg: SVGSVGElement; port: boolean; full: number[]; cam: SVGGElement; cone: SVGPathElement } | null = null;
  function buildMap() {
    const view = visible(), port = view.classList.contains('cp-port');
    if (map && map.port === port) return map;
    const svg = view.querySelector('svg')!.cloneNode(true) as SVGSVGElement;
    svg.querySelectorAll('.cp-t, .cp-q, .cp-b').forEach(e => e.remove());
    svg.removeAttribute('role');
    svg.removeAttribute('aria-label');
    svg.removeAttribute('style');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.classList.add('cr-svg');
    // the camera goes where the markers were: inside the drawing, so on the upright plan it turns with it
    const shots = svg.querySelector('.cp-shots')!;
    shots.innerHTML = '<g class="cr-cam"><path class="cr-cone"/><circle class="cr-dot" r="34"/></g>';
    const full = svg.dataset.full!.split(' ').map(Number);   // the whole drawing (the page's copy may be zoomed in)
    mapBox.replaceChildren(svg);
    map = { svg, port, full, cam: shots.querySelector('.cr-cam')!, cone: shots.querySelector('.cr-cone')! };
    return map;
  }
  function aim(f: F) {
    mapBox.hidden = !f.at;
    if (!f.at) return;
    const m = buildMap();
    const [x, y, a] = f.at, t = (a * Math.PI) / 180;
    m.cam.setAttribute('transform', `translate(${x} ${y})`);
    m.cone.setAttribute('d', cono(a, 420));
    // frame: centred ahead of the camera, so the cone and what it looks at both show, and never so far that the camera falls out
    const w = Math.min(1800, m.full[2]), h = Math.min(w / 1.5, m.full[3]), d = Math.min(450, Math.min(w, h) / 2 - 120);
    let cx = x + Math.cos(t) * d, cy = y + Math.sin(t) * d;
    const H = m.full[3] + 2 * m.full[1];   // sheet height (the full view box has a margin on each side)
    if (m.port) [cx, cy] = [H - cy, cx];
    const vx = Math.min(m.full[0] + m.full[2] - w, Math.max(m.full[0], cx - w / 2));
    const vy = Math.min(m.full[1] + m.full[3] - h, Math.max(m.full[1], cy - h / 2));
    m.svg.setAttribute('viewBox', `${vx.toFixed(1)} ${vy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
  }

  // ---- viewer ----
  function show(i: number) {
    cur = (i + list.length) % list.length;
    const f = list[cur];
    img.src = f.full;
    img.alt = `Render: ${f.titolo}`;
    title.textContent = f.titolo;
    if (count) count.textContent = `${cur + 1} / ${list.length}`;
    aim(f);
    if (list.length > 1) [cur + 1, cur - 1].forEach(n => { new Image().src = list[(n + list.length) % list.length].full; });
  }
  function open(i: number) {
    hideTip();
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
  dlg.addEventListener('keydown', e => {
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
  const tipImg = tip?.querySelector('img'), tipCap = tip?.querySelector('figcaption span');
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
    if (!tip || !sec || !tipImg || !tipCap) return;
    clearTimeout(leaving);
    document.querySelectorAll('.cp-shot.on').forEach(o => o !== s && o.classList.remove('on'));
    s.classList.add('on');
    tipI = i;
    tipImg.src = list[i].thumb;
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
