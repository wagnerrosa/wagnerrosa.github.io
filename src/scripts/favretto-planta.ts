// Site plan on /favretto/ (src/components/favretto/Planta.astro; drawing: src/lib/favretto-planta.ts). Same handling as the /casa/ plan:
// - Zoom and pan by changing the SVG's viewBox: − / + / whole view buttons, ctrl/⌘ + wheel (trackpad pinch), drag once zoomed in, double
//   click; on touch two fingers pinch and pan, one finger keeps scrolling the page. The drawing is 900 × 600 m; a phone shows an upright
//   strip of it (the box spans the screen and is as tall as the stylesheet makes it; the view takes the box's shape: the frame's whole
//   height, the farmyard in the middle; the scale and the zoom buttons sit on its bottom edge), starts zoomed in on the farmyard, and pans
//   sideways to the rest.
// - Photo points (.fp-shot), the names and the arrows to the towns keep a readable size on screen at any zoom; sizes and areas scale with
//   the drawing.
// - Graphic scale beside the title; legend chips switch names, measures and photo points off (data-off on .fp).
// - With a mouse, hovering a photo point shows the photo above it; a click on the point or the preview opens the page's lightbox (wired by the
//   page's own script through data-i). Keyboard: the points take focus, Enter opens. Hovering a photo in the gallery lights its point.
// - Planta / Satélite: Google's satellite view in the same box, loaded the first time it is asked for.
const MAX = 10;   // closest zoom, × the whole view
const PHONE = matchMedia('(max-width: 640px)');   // same as the stylesheet's phone layout of the plan: upright view, starting on the farmyard
const MIN = { 'fp-ln': [6.5, 12], 'fp-ll': [9, 13], 'fp-lv': [6, 11], 'fp-lr': [6.5, 12] } as Record<string, [number, number]>;   // label class → [size in m, least px]
const STEPS = [200, 100, 50, 20, 10, 5, 2];

const root = document.querySelector<HTMLElement>('.fp');
const view = root?.querySelector<HTMLElement>('.fp-view');
const svg = view?.querySelector<SVGSVGElement>('svg');

if (root && view && svg) {
  const all = svg.getAttribute('viewBox')!.split(' ').map(Number);   // the whole drawing
  const mid = Number(svg.dataset.phone), start = svg.dataset.start!.split(' ').map(Number);   // phone: strip's centre; first view's centre x, top, width
  let full = all;   // the widest view (zoom 1)
  let vb = [...all];
  let narrow = false, ar = 0;   // the layout the view was last shaped for: phone or not, and the box's width / height
  const pins = [...svg.querySelectorAll<SVGGElement>('.fp-pin')];
  // labels kept readable; one with an arrow is scaled as a whole (its group, .fp-ls)
  const texts = [...svg.querySelectorAll<SVGTextElement>('.fp-ln, .fp-ll, .fp-lv, .fp-lr')].map(t => ({ el: t.closest('.fp-ls') ?? t, min: MIN[t.getAttribute('class')!] }));
  const bar = root.querySelector<HTMLElement>('.fp-zoom')!;
  const btn = (z: string) => bar.querySelector<HTMLButtonElement>(`[data-z="${z}"]`)!;
  const scale = root.querySelector<HTMLElement>('.fp-scale')!;
  const zoom = () => full[2] / vb[2];

  /** Phones: the widest view is the frame's whole height at the box's shape, centred on the strip's centre; on entering the phone layout
   *  the view starts on the farmyard, and a new shape (a phone turned) keeps the view's centre and width. Wider: the whole drawing. */
  function shape() {
    const r = view!.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const n = PHONE.matches, a = r.width / r.height;
    if (n === narrow && (!n || Math.abs(a - ar) < 0.001)) return;
    if (!n) { full = all; vb = [...all]; }
    else {
      const w = Math.min(all[2], all[3] * a);
      full = [Math.max(0, Math.min(all[2] - w, mid - w / 2)), 0, w, all[3]];
      const [x, y, vw] = n === narrow ? [vb[0] + vb[2] / 2, vb[1] + vb[3] / 2, vb[2]] : [start[0], start[1] + start[2] / a / 2, start[2]];
      vb = [x - vw / 2, y - vw / a / 2, vw, vw / a];
      clamp();
    }
    narrow = n;
    ar = a;
  }
  function apply() {
    shape();
    svg!.setAttribute('viewBox', vb.map(x => Math.round(x * 100) / 100).join(' '));
    const w = svg!.getBoundingClientRect().width;
    if (!w) return;
    const z = zoom(), pxm = w / vb[2];   // px per metre
    view!.classList.toggle('zoomed', z > 1.001);
    pins.forEach(g => g.setAttribute('transform', `scale(${(1 / pxm).toFixed(4)})`));
    for (const { el, min } of texts) {
      const [m, px] = min ?? [1, 0];
      const k = Math.max(1, px / (m * pxm));
      if (k > 1.001) el.setAttribute('transform', `scale(${k.toFixed(3)})`); else el.removeAttribute('transform');
    }
    btn('out').disabled = btn('fit').disabled = z <= 1.001;
    btn('in').disabled = z >= MAX - 0.001;
    const m = STEPS.find(s => s * pxm <= (narrow ? 100 : 150)) ?? STEPS.at(-1)!;   // phone: the bar shares the box's bottom edge with the zoom
    scale.querySelector('i')!.style.width = `${(m * pxm).toFixed(1)}px`;
    scale.querySelector('b')!.textContent = `${m} m`;
    scale.setAttribute('aria-label', `Escala gráfica: a barra mede ${m} m`);
    scale.hidden = false;
  }
  /** Keep the view inside the drawing, at the shape of the widest view. */
  function clamp() {
    vb[2] = Math.min(full[2], Math.max(full[2] / MAX, vb[2]));
    vb[3] = (vb[2] * full[3]) / full[2];
    vb[0] = Math.min(all[0] + all[2] - vb[2], Math.max(all[0], vb[0]));
    vb[1] = Math.min(all[1] + all[3] - vb[3], Math.max(all[1], vb[1]));
  }
  const toPlan = (cx: number, cy: number) => {
    const r = svg!.getBoundingClientRect();
    return [vb[0] + ((cx - r.left) / r.width) * vb[2], vb[1] + ((cy - r.top) / r.height) * vb[3]];
  };
  function zoomAt(k: number, cx: number, cy: number) {
    const [px, py] = toPlan(cx, cy);
    const w = Math.min(full[2], Math.max(full[2] / MAX, vb[2] / k)), s = w / vb[2];
    vb = [px - (px - vb[0]) * s, py - (py - vb[1]) * s, w, (w * full[3]) / full[2]];
    clamp();
    apply();
  }
  const centre = () => { const r = svg!.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] as const; };
  const onShot = (e: Event) => !!(e.target as Element).closest?.('.fp-shot');

  apply();
  bar.hidden = false;
  bar.addEventListener('click', e => {
    const z = (e.target as Element).closest<HTMLButtonElement>('[data-z]')?.dataset.z;
    if (z === 'fit') { vb = [...full]; apply(); }
    else if (z) zoomAt(z === 'in' ? 1.6 : 1 / 1.6, ...centre());
  });
  // a new size (a phone turned, a window resized): apply() reshapes the view first (shape)
  new ResizeObserver(apply).observe(view);

  // pointer: drag (mouse, zoomed in), pinch (two fingers); one finger scrolls the page (touch-action: pan-y)
  const pts = new Map<number, { x: number; y: number }>();
  let drag: { x: number; y: number } | null = null;
  let pinch: { d: number; p: number[] } | null = null;
  const two = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  let pinchVb = vb;
  view.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const t = two();
      pinch = { d: t.d, p: toPlan(t.x, t.y) };
      pinchVb = [...vb];
      drag = null;
    } else if (e.pointerType === 'mouse' && zoom() > 1.001 && !onShot(e)) {
      drag = { x: e.clientX, y: e.clientY };
      view.setPointerCapture(e.pointerId);
      view.classList.add('dragging');
    }
  });
  view.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = svg.getBoundingClientRect();
    if (pinch && pts.size === 2) {
      const t = two();
      const w = Math.min(full[2], Math.max(full[2] / MAX, (pinchVb[2] * pinch.d) / Math.max(t.d, 1))), h = (w * full[3]) / full[2];
      vb = [pinch.p[0] - ((t.x - r.left) / r.width) * w, pinch.p[1] - ((t.y - r.top) / r.height) * h, w, h];
      clamp();
      apply();
    } else if (drag) {
      vb[0] -= ((e.clientX - drag.x) / r.width) * vb[2];
      vb[1] -= ((e.clientY - drag.y) / r.height) * vb[3];
      drag = { x: e.clientX, y: e.clientY };
      clamp();
      apply();
    }
  });
  const up = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (drag && !pts.size) { drag = null; view.classList.remove('dragging'); }
  };
  view.addEventListener('pointerup', up);
  view.addEventListener('pointercancel', up);
  view.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;   // a plain wheel scrolls the page
    e.preventDefault();
    zoomAt(Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.01), e.clientX, e.clientY);
  }, { passive: false });
  view.addEventListener('dblclick', e => {
    if (onShot(e)) return;
    if (zoom() >= MAX - 0.001) { vb = [...full]; apply(); }
    else zoomAt(2, e.clientX, e.clientY);
  });

  // legend
  const legend = root.querySelector<HTMLElement>('.fp-legend')!;
  legend.hidden = false;
  const off = new Set<string>();
  legend.addEventListener('change', e => {
    const i = e.target as HTMLInputElement;
    if (!i.dataset.l) return;
    if (i.checked) off.delete(i.dataset.l); else off.add(i.dataset.l);
    root.dataset.off = [...off].join(' ');
    if (off.has('fot')) hide();
  });

  // Planta / Satélite
  const seg = root.querySelector<HTMLElement>('.fp-seg')!, map = root.querySelector<HTMLElement>('.fp-map')!, title = root.querySelector<HTMLElement>('.fp-h')!;
  seg.hidden = false;
  seg.addEventListener('click', e => {
    const to = (e.target as Element).closest<HTMLButtonElement>('[data-v]')?.dataset.v;
    if (!to || root.dataset.view === to) return;
    root.dataset.view = to;
    seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === to)));
    title.textContent = title.dataset[to] ?? title.textContent;
    hide();
    map.hidden = to !== 'map';
    if (to === 'map') {
      const box = map.querySelector('.fp-map-frame')!;
      if (!box.firstChild) {
        const f = document.createElement('iframe');
        f.src = map.dataset.src!;
        f.title = 'O sítio na vista de satélite';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.allowFullscreen = true;
        box.append(f);
      }
    } else apply();
  });

  // photo points: preview on hover (mouse), focus; Enter / Space opens
  type Tip = { i: number; thumb: string; caption: string; ar: number };
  const tips: Tip[] = JSON.parse(document.getElementById('fp-tips')?.textContent || '[]');
  const tip = root.querySelector<HTMLElement>('.fp-tip')!;
  const shots = [...svg.querySelectorAll<SVGGElement>('.fp-shot')];
  let timer = 0, cur: SVGGElement | null = null;
  function show(g: SVGGElement) {
    clearTimeout(timer);
    const t = tips.find(x => x.i === +g.dataset.i!);
    if (!t) return;
    cur?.classList.remove('on');
    cur = g;
    g.classList.add('on');
    const img = tip.querySelector('img')!;
    if (img.getAttribute('src') !== t.thumb) img.src = t.thumb;
    tip.style.setProperty('--ar', String(t.ar));
    tip.querySelector('i')!.textContent = String(t.i + 1).padStart(2, '0');
    tip.querySelector('em')!.textContent = t.caption;
    tip.dataset.i = String(t.i);
    const c = g.querySelector('.fp-cam')!.getBoundingClientRect(), r = root!.getBoundingClientRect();
    const x = c.left + c.width / 2 - r.left, y = c.top + c.height / 2 - r.top;
    const w = Math.min(320, 300 * t.ar);
    tip.style.setProperty('--x', `${Math.max(w / 2 + 4, Math.min(r.width - w / 2 - 4, x)).toFixed(0)}px`);
    tip.style.setProperty('--y', `${(y + (c.top - w / t.ar - 60 < 0 ? c.height / 2 : -c.height / 2)).toFixed(0)}px`);
    tip.classList.toggle('below', c.top - w / t.ar - 60 < 0);
    tip.hidden = false;
  }
  function hide() {
    clearTimeout(timer);
    tip.hidden = true;
    cur?.classList.remove('on');
    cur = null;
  }
  const later = () => { clearTimeout(timer); timer = window.setTimeout(hide, 160); };
  const mouse = matchMedia('(hover: hover)');
  for (const g of shots) {
    g.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !drag) show(g); });
    g.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') later(); });
    g.addEventListener('focus', () => show(g));
    g.addEventListener('blur', later);
    g.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    g.addEventListener('click', hide);
  }
  tip.addEventListener('pointerenter', () => clearTimeout(timer));
  tip.addEventListener('pointerleave', later);
  tip.addEventListener('click', hide);
  view.addEventListener('pointerdown', e => { if (!onShot(e)) hide(); });

  // gallery → plan: hovering a photo lights its point
  if (mouse.matches) document.querySelectorAll<HTMLElement>('.hero [data-i], .gallery [data-i]').forEach(b => {
    const g = () => svg.querySelector(`.fp-shot[data-i="${b.dataset.i}"]`);
    b.addEventListener('pointerenter', () => g()?.classList.add('on'));
    b.addEventListener('pointerleave', () => g()?.classList.remove('on'));
  });
}
