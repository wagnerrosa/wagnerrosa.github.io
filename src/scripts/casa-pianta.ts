// Zoom and pan for the /casa/ floor plan (src/components/casa/Pianta.astro), by changing the SVG's viewBox so the lines stay sharp.
// - Buttons − / + / full view; ctrl/⌘ + wheel (a trackpad pinch arrives as ctrl + wheel); mouse drag pans once zoomed in;
//   double click / double tap zooms in on that point (at the closest zoom it goes back to the full view).
// - Touch: two fingers pinch and pan; one finger keeps scrolling the page (touch-action: pan-y), so the plan never traps the page.
// - Render viewpoints (.cp-mk) keep about their size on screen at any zoom; pressing one never starts a drag (it opens the render).
const MAX = 8;          // closest zoom, × the full view

type V = { el: HTMLElement; svg: SVGSVGElement; full: number[]; vb: number[]; mks: SVGGElement[] };
const views: V[] = [...document.querySelectorAll<HTMLElement>('.cp-view')].map(el => {
  const svg = el.querySelector('svg')!;
  const full = svg.getAttribute('viewBox')!.split(' ').map(Number);
  return { el, svg, full, vb: [...full], mks: [...svg.querySelectorAll<SVGGElement>('.cp-mk')] };
});
const onShot = (e: Event) => !!(e.target as Element).closest?.('.cp-shot');
const root = document.querySelector<HTMLElement>('.cp');
const bar = root?.querySelector<HTMLElement>('.cp-zoom');
const btn = (z: string) => bar?.querySelector<HTMLButtonElement>(`[data-z="${z}"]`);

const visible = () => views.find(v => v.el.offsetParent !== null);
const zoomOf = (v: V) => v.full[2] / v.vb[2];

function apply(v: V) {
  v.svg.setAttribute('viewBox', v.vb.map(x => Math.round(x * 10) / 10).join(' '));
  const z = zoomOf(v);
  v.el.classList.toggle('zoomed', z > 1.001);
  // markers: shrink in drawing units as the plan grows, a little less than the zoom so they still feel part of the drawing
  const k = Math.pow(1 / z, 0.85).toFixed(3);
  v.mks.forEach(g => g.setAttribute('transform', `scale(${k})`));
  if (v === visible()) {
    btn('out')!.disabled = z <= 1.001;
    btn('fit')!.disabled = z <= 1.001;
    btn('in')!.disabled = z >= MAX - 0.001;
  }
}

/** Keep the view inside the drawing. */
function clamp(v: V) {
  const [fx, fy, fw, fh] = v.full;
  v.vb[2] = Math.min(fw, Math.max(fw / MAX, v.vb[2]));
  v.vb[3] = (v.vb[2] * fh) / fw;
  v.vb[0] = Math.min(fx + fw - v.vb[2], Math.max(fx, v.vb[0]));
  v.vb[1] = Math.min(fy + fh - v.vb[3], Math.max(fy, v.vb[1]));
}

/** Point of the drawing under a client (screen) position. */
function toPlan(v: V, cx: number, cy: number, vb = v.vb) {
  const r = v.svg.getBoundingClientRect();
  return [vb[0] + ((cx - r.left) / r.width) * vb[2], vb[1] + ((cy - r.top) / r.height) * vb[3]];
}

/** Zoom by `k` keeping the point under (cx, cy) still. */
function zoomAt(v: V, k: number, cx: number, cy: number) {
  const [px, py] = toPlan(v, cx, cy);
  const w = Math.min(v.full[2], Math.max(v.full[2] / MAX, v.vb[2] / k));
  const s = w / v.vb[2];
  v.vb = [px - (px - v.vb[0]) * s, py - (py - v.vb[1]) * s, w, w * (v.full[3] / v.full[2])];
  clamp(v);
  apply(v);
}
const centre = (v: V) => { const r = v.svg.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] as const; };

for (const v of views) {
  apply(v);
  const pts = new Map<number, { x: number; y: number }>();
  let drag: { x: number; y: number } | null = null;
  let pinch: { d: number; p: number[]; vb: number[] } | null = null;
  const two = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };

  v.el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const t = two();
      pinch = { d: t.d, p: toPlan(v, t.x, t.y), vb: [...v.vb] };
      drag = null;
    } else if (e.pointerType === 'mouse' && zoomOf(v) > 1.001 && !onShot(e)) {
      drag = { x: e.clientX, y: e.clientY };
      v.el.setPointerCapture(e.pointerId);
      v.el.classList.add('dragging');
    }
  });
  v.el.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const t = two(), r = v.svg.getBoundingClientRect();
      const w = Math.min(v.full[2], Math.max(v.full[2] / MAX, (pinch.vb[2] * pinch.d) / Math.max(t.d, 1)));
      const h = w * (v.full[3] / v.full[2]);
      // the drawing point that was under the fingers stays under them
      v.vb = [pinch.p[0] - ((t.x - r.left) / r.width) * w, pinch.p[1] - ((t.y - r.top) / r.height) * h, w, h];
      clamp(v);
      apply(v);
    } else if (drag) {
      const r = v.svg.getBoundingClientRect();
      v.vb[0] -= ((e.clientX - drag.x) / r.width) * v.vb[2];
      v.vb[1] -= ((e.clientY - drag.y) / r.height) * v.vb[3];
      drag = { x: e.clientX, y: e.clientY };
      clamp(v);
      apply(v);
    }
  });
  const up = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (drag && !pts.size) { drag = null; v.el.classList.remove('dragging'); }
  };
  v.el.addEventListener('pointerup', up);
  v.el.addEventListener('pointercancel', up);
  v.el.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;   // plain wheel scrolls the page
    e.preventDefault();
    zoomAt(v, Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.01), e.clientX, e.clientY);
  }, { passive: false });
  v.el.addEventListener('dblclick', e => {
    if (onShot(e)) return;
    if (zoomOf(v) >= MAX - 0.001) { v.vb = [...v.full]; apply(v); }
    else zoomAt(v, 2, e.clientX, e.clientY);
  });
}

if (bar && views.length) {
  bar.hidden = false;
  root!.querySelector<HTMLElement>('.cp-hint')!.hidden = false;
  bar.addEventListener('click', e => {
    const z = (e.target as Element).closest<HTMLButtonElement>('[data-z]')?.dataset.z, v = visible();
    if (!z || !v) return;
    if (z === 'fit') { v.vb = [...v.full]; apply(v); }
    else zoomAt(v, z === 'in' ? 1.6 : 1 / 1.6, ...centre(v));
  });
  // width changes (rotation, resize, the other orientation showing up) change what is readable and which buttons apply
  new ResizeObserver(() => views.forEach(apply)).observe(root!);
}
