// Draws the /favretto/ site plan (data: src/data/favretto-planta.ts) as one SVG, in metres: x = east from the frame's west edge, y = south
// from its north edge, so 1 unit = 1 m and north is up.
// - Natural edges (ground, woods, ponds) are smoothed; buildings stay square.
// - Woods get tree crowns and the wetland marsh marks, scattered on a jittered grid (same every build).
// - Labels: names, places, the highway's and the ways to the towns are drawn at the origin of a group, so src/scripts/favretto-planta.ts
//   can keep them readable on a small screen (CSS scale on .fp-ln / .fp-ll / .fp-lv / .fp-lr, or on .fp-ls, a label with its arrow);
//   sizes and areas are drawn to scale.
// - Photo viewpoints (.fp-shot, data-i = index in the page's photo list): pin + cone of view in screen px (the script scales .fp-pin), so
//   they keep their size at any zoom. A photo taken from outside the frame sits on its edge, on its line of sight.
import { FRAME, PHONE, highway, land, vila, woods, acude, ilha, tanques, diques, lagoa, roads, tracks, porteira, buildings, labels, fotos, type Rect } from '../data/favretto-planta';

type P = [number, number];
export type Shot = { i: number; key: string; caption: string };

const W = FRAME.e1 - FRAME.e0, H = FRAME.n1 - FRAME.n0;
const xy = ([e, n]: P): P => [e - FRAME.e0, FRAME.n1 - n];
const r1 = (v: number) => Math.round(v * 10) / 10;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Catmull-Rom through the points, as cubic Béziers (closed: back to the start). */
function smooth(pts: P[], closed = true) {
  const p = pts.map(xy), n = p.length;
  const at = (i: number) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])} ${r1(c[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
const poly = (pts: P[]) => 'M' + pts.map(xy).map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z';
const line = (pts: P[]) => 'M' + pts.map(xy).map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L');

export function corners(r: Rect): P[] {
  const t = (r.a * Math.PI) / 180, u = [Math.cos(t), Math.sin(t)], v = [-u[1], u[0]];
  return ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as const).map(([s, q]) => [r.c[0] + (s * u[0] * r.L) / 2 + (q * v[0] * r.W) / 2, r.c[1] + (s * u[1] * r.L) / 2 + (q * v[1] * r.W) / 2] as P);
}
const area = (pts: P[]) => Math.abs(pts.reduce((s, [x, y], i) => { const [X, Y] = pts[(i + 1) % pts.length]; return s + x * Y - X * y; }, 0)) / 2;
function inside([x, y]: P, p: P[]) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++)
    if (p[i][1] > y !== p[j][1] > y && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
  return c;
}
/** Small deterministic random numbers, so every build scatters the same crowns and marks. */
function rand(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const fmt = (v: number) => Math.round(v).toLocaleString('pt-BR');

// ---- highway: the barrier line offset sideways (perpendicular, in metres; + = north) ----
function offset(pts: P[], d: number): P[] {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return [p[0] - (dy / l) * d, p[1] + (dx / l) * d];
  });
}
const band = (a: number, b: number) => [...offset(highway.barrier, a), ...offset(highway.barrier, b).reverse()];

/** Woods north of the highway: from its north edge (+3 m) up to the top of the frame. */
function woodsTop(): P[] {
  const edge = offset(highway.barrier, highway.north + 3).filter(([e]) => e >= FRAME.e0 - 100 && e <= FRAME.e1 + 100);
  return [...edge, [FRAME.e1 + 100, FRAME.n1 + 50], [FRAME.e0 - 100, FRAME.n1 + 50]];
}

/** Measures shown in labels: "{dim:id}" (length × width of a building) and "{area:acude|tanques}". */
function measure(t: string) {
  return t.replace(/\{(dim|area):([\w-]+)\}/g, (_, k: string, id: string) => {
    if (k === 'dim') {
      const b = buildings.find(x => x.id === id)!;
      return `≈ ${Math.round(b.L)} × ${Math.round(b.W)} m`;
    }
    const m = id === 'acude' ? area(acude) - Math.PI * ilha.r ** 2 : area(tanques) - diques.reduce((s, [a, b]) => s + 2.5 * Math.hypot(a[0] - b[0], a[1] - b[1]), 0);
    return `≈ ${fmt(Math.round(m / 50) * 50)} m²`;
  });
}

// ---- pins (screen px; the script scales .fp-pin by drawing units per px) ----
export const PIN = { cam: 10.5, hit: 17, num: 11, cone: 40, half: 30 };
const G = 0.35;   // glyph centre above the baseline, × font size
const cone = (az: number) => {
  const a = az - 90;   // SVG angle: 0 = east, clockwise (y down)
  const p = (d: number) => `${r1(PIN.cone * Math.cos((d * Math.PI) / 180))} ${r1(PIN.cone * Math.sin((d * Math.PI) / 180))}`;
  return `M0 0L${p(a - PIN.half)}A${PIN.cone} ${PIN.cone} 0 0 1 ${p(a + PIN.half)}Z`;
};
/** Where a pin goes: its spot, or for a photo taken outside the frame, where its line of sight enters it (8 m in). */
function spot(at: P, az: number): P {
  const [x, y] = xy(at), m = 8;
  if (x >= m && x <= W - m && y >= m && y <= H - m) return [x, y];
  const dx = Math.sin((az * Math.PI) / 180), dy = -Math.cos((az * Math.PI) / 180);
  let t = 0;
  for (const [v, d, lo, hi] of [[x, dx, m, W - m], [y, dy, m, H - m]] as const) {
    if (v < lo && d > 0) t = Math.max(t, (lo - v) / d);
    if (v > hi && d < 0) t = Math.max(t, (hi - v) / d);
  }
  return [x + dx * t, y + dy * t];
}

export function planta(shots: Shot[]) {
  const o: string[] = [];
  const R = rand(29);

  // wetland (the whole frame) and its marks, on a jittered 15 m grid wherever there is no ground, wood or road
  const covered = (p: P) => inside(p, land) || inside(p, vila) || woods.some(w => inside(p, w)) || inside(p, woodsTop()) || inside(p, band(highway.south - 4, highway.north + 4));
  const marsh: string[] = [];
  for (let n = FRAME.n0 + 6; n < FRAME.n1; n += 15) for (let e = FRAME.e0 + 6; e < FRAME.e1; e += 15) {
    const p: P = [e + (R() - 0.5) * 9, n + (R() - 0.5) * 9];
    if (covered(p)) continue;
    const [x, y] = xy(p);
    marsh.push(`M${r1(x - 3)} ${r1(y)}h6M${r1(x - 1.6)} ${r1(y - 1.6)}v1.6M${r1(x)} ${r1(y - 2.4)}v2.4M${r1(x + 1.6)} ${r1(y - 1.6)}v1.6`);
  }
  o.push(`<rect class="fp-wet" width="${W}" height="${H}"/><path class="fp-marsh" d="${marsh.join('')}"/>`);

  // ground, woods (with crowns on a jittered 7 m grid), water
  o.push(`<path class="fp-land" d="${smooth(land)}${smooth(vila)}"/>`);
  const all = [...woods, woodsTop()];
  const crowns: string[] = [];
  for (const w of all) {
    const xs = w.map(p => p[0]), ys = w.map(p => p[1]);
    const e0 = Math.max(FRAME.e0, Math.min(...xs)), e1 = Math.min(FRAME.e1, Math.max(...xs));
    const n0 = Math.max(FRAME.n0, Math.min(...ys)), n1 = Math.min(FRAME.n1, Math.max(...ys));
    for (let n = n0 + 3; n < n1; n += 7) for (let e = e0 + 3; e < e1; e += 7) {
      const p: P = [e + (R() - 0.5) * 5, n + (R() - 0.5) * 5];
      if (!inside(p, w)) continue;
      const [x, y] = xy(p), r = 2.4 + R() * 1.5;
      crowns.push(`M${r1(x - r)} ${r1(y)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0`);
    }
  }
  o.push(`<g class="fp-woods">${all.map(w => `<path d="${smooth(w)}"/>`).join('')}</g><path class="fp-crown" d="${crowns.join('')}"/>`);
  const [ix, iy] = xy(ilha.c);
  o.push(`<g class="fp-water"><path d="${smooth(acude)}"/><path d="${smooth(lagoa)}"/><path d="${poly(tanques)}"/></g>`);
  o.push(`<circle class="fp-isle" cx="${r1(ix)}" cy="${r1(iy)}" r="${ilha.r}"/><path class="fp-dyke" d="${diques.map(line).join('')}"/>`);

  // highway: two carriageways, lane lines, edge lines, the central barrier
  const lanes = [-7, -12, -17, 6, 10, 14].map(d => line(offset(highway.barrier, d))).join('');
  o.push(`<g class="fp-hw"><path class="fp-hw-road" d="${poly(band(highway.south, -1))}${poly(band(1, highway.north))}"/>` +
    `<path class="fp-hw-lane" d="${lanes}"/><path class="fp-hw-edge" d="${[highway.south + 1.5, -2, 2, highway.north - 1.5].map(d => line(offset(highway.barrier, d))).join('')}"/>` +
    `<path class="fp-hw-mid" d="${line(highway.barrier)}"/></g>`);

  // tracks and roads (a 4.6 m casing with a 3.4 m road inside, both to scale)
  o.push(`<path class="fp-track" d="${tracks.map(t => smooth(t, false)).join('')}"/>`);
  const rd = roads.map(r => smooth(r, false)).join('');
  o.push(`<path class="fp-road-c" d="${rd}"/><path class="fp-road" d="${rd}"/>`);
  // the entrance gate: a bar across the road, a little wider than it
  const g = ((porteira.a + 90) * Math.PI) / 180, gd: P = [Math.cos(g) * 4.5, Math.sin(g) * 4.5];
  o.push(`<path class="fp-gate" d="${line([[porteira.at[0] - gd[0], porteira.at[1] - gd[1]], [porteira.at[0] + gd[0], porteira.at[1] + gd[1]]])}"/>`);

  // buildings, with ridge (solid) and valley (dashed) lines along their length
  const ridges: string[] = [], valleys: string[] = [];
  for (const b of buildings) {
    const [a] = corners(b), t = (b.a * Math.PI) / 180, u: P = [Math.cos(t) * b.L, Math.sin(t) * b.L], v: P = [-Math.sin(t) * b.W, Math.cos(t) * b.W];
    const at = (f: number) => { const s: P = [a[0] + v[0] * (f + 0.5), a[1] + v[1] * (f + 0.5)]; return line([s, [s[0] + u[0], s[1] + u[1]]]); };
    b.cumeeira?.forEach(f => ridges.push(at(f)));
    b.vale?.forEach(f => valleys.push(at(f)));
  }
  o.push(`<g class="fp-bld">${buildings.map(b => `<path data-b="${b.id}" d="${poly(corners(b))}"/>`).join('')}</g>` +
    `<path class="fp-ridge" d="${ridges.join('')}"/><path class="fp-valley" d="${valleys.join('')}"/>`);

  // labels
  const SIZE = { nome: 6.5, medida: 4.6, lugar: 9, via: 6, rumo: 6.5 } as const;
  const CLS = { nome: 'fp-ln', medida: 'fp-lm', lugar: 'fp-ll', via: 'fp-lv', rumo: 'fp-lr' } as const;
  o.push('<g class="fp-labels">');
  for (const l of labels) {
    const [x, y] = xy(l.at), z = SIZE[l.k];
    const pos = `transform="translate(${r1(x)} ${r1(y)})${l.a ? ` rotate(${r1(-l.a)})` : ''}"`;
    if (l.seta === undefined) {
      const anchor = l.anchor ? ` style="text-anchor:${l.anchor}"` : '';   // inline: the stylesheet centres all labels
      o.push(`<g class="fp-l-${l.k}" ${pos}><text class="${CLS[l.k]}" y="${r1(G * z)}" font-size="${z}"${anchor}>${esc(measure(l.t))}</text></g>`);
      continue;
    }
    // an arrow (1.3 × the text size, centred on `at`, turned to `seta`) and the text beside it, on the side it does not point to
    const t = (l.seta * Math.PI) / 180, c = Math.cos(t), sn = Math.sin(t), back = c < 0;
    const arrow = ([[-0.65, -0.07], [0.2, -0.07], [0.2, -0.32], [0.65, 0], [0.2, 0.32], [0.2, 0.07], [-0.65, 0.07]] as P[])
      .map(([u, v]) => `${r1((u * c + v * sn) * z * 10) / 10} ${r1((-u * sn + v * c) * z * 10) / 10}`);
    const gap = (0.65 * Math.abs(c) + 0.32 * Math.abs(sn) + 0.3) * z;
    o.push(`<g class="fp-l-${l.k}" ${pos}><g class="fp-ls"><path class="fp-arrow" d="M${arrow.join('L')}Z"/>` +
      `<text class="${CLS[l.k]}" x="${r1(back ? gap : -gap)}" y="${r1(G * z)}" font-size="${z}" style="text-anchor:${back ? 'start' : 'end'}">${esc(measure(l.t))}</text></g></g>`);
  }
  o.push('</g>');

  // photo viewpoints, the ones looking straight down first, so the others' pins sit on top of their rings
  o.push('<g class="fp-shots">');
  for (const s of [...shots].sort((a, b) => Number(!fotos[a.key]?.down) - Number(!fotos[b.key]?.down))) {
    const f = fotos[s.key];
    if (!f) continue;
    const [x, y] = spot(f.at, f.az), nr = String(s.i + 1).padStart(2, '0');
    const mark = f.down ? `<circle class="fp-down" r="${PIN.cam + 6}"/>` : `<path class="fp-cone" d="${cone(f.az)}"/>`;
    o.push(`<g class="fp-shot" data-i="${s.i}" data-key="${s.key}" tabindex="0" role="button" aria-label="Foto ${nr}: ${esc(s.caption)}" transform="translate(${r1(x)} ${r1(y)})" data-track="open_photo" data-category="favretto" data-location="planta">` +
      `<g class="fp-pin">${mark}<circle class="fp-hit" r="${PIN.hit}"/><circle class="fp-cam" r="${PIN.cam}"/>` +
      `<text class="fp-num" y="${r1(G * PIN.num)}" font-size="${PIN.num}">${nr}</text></g></g>`);
  }
  o.push('</g>');

  // phones (PHONE): the centre of the upright strip; the first view's centre, top and width. The script gives them the box's shape.
  const ph = `${PHONE.e - FRAME.e0}`, st = `${PHONE.start.e - FRAME.e0} ${FRAME.n1 - PHONE.start.top} ${PHONE.start.w}`;
  return `<svg viewBox="0 0 ${W} ${H}" data-phone="${ph}" data-start="${st}" class="fp-svg" role="group" aria-label="Planta do sítio, vista de cima, norte para cima. Os pontos numerados mostram de onde cada foto foi tirada.">${o.join('')}</svg>`;
}

// ---- lightbox mini map: the same ground, woods, water, roads and buildings, without marks, labels or pins ----
// The page's lightbox shows it beside the photo, framed on a part of the plan per photo ("sector": the camera and the farmyard, see
// miniShot), with the camera (dot + cone, drawn here at the origin, pointing north, in screen px) placed and scaled by the page's script.
/** The farmyard (buildings, açude, tanks), in drawing units. */
function sede() {
  const pts = [...buildings.flatMap(corners), ...acude, ...tanques].map(xy);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
const MINI = { pad: 30, minW: 300 };   // m around the frame's content; narrowest frame (m)
export type MiniShot = { x: number; y: number; a: number; down: boolean; vb: number[] };
/** Where a photo was taken on the mini map, which way it looks (degrees clockwise from north), and the part of the plan to show around
 *  it: the camera and the farmyard, padded, at the drawing's shape (3:2), at least 300 m wide, kept inside the drawing. */
export function miniShot(key: string): MiniShot | null {
  const f = fotos[key];
  if (!f) return null;
  const [x, y] = spot(f.at, f.az), s = sede(), p = MINI.pad;
  const x0 = Math.min(s.x0, x) - p, x1 = Math.max(s.x1, x) + p, y0 = Math.min(s.y0, y) - p, y1 = Math.max(s.y1, y) + p;
  const w = Math.min(W, Math.max(MINI.minW, x1 - x0, ((y1 - y0) * W) / H)), h = (w * H) / W;
  const fx = Math.max(0, Math.min(W - w, (x0 + x1 - w) / 2)), fy = Math.max(0, Math.min(H - h, (y0 + y1 - h) / 2));
  return { x: r1(x), y: r1(y), a: r1(f.az), down: !!f.down, vb: [fx, fy, w, h].map(r1) };
}
/** The mini map's SVG. Every photo point is a dot (a zero-length line with round caps and a non-scaling stroke, so it keeps its size at
 *  any frame) and a wider invisible one on top to click (data-j = index in the page's photo list). */
export function miniPlanta(dots: { i: number; key: string }[]) {
  const o: string[] = [];
  o.push(`<rect class="m-wet" width="${W}" height="${H}"/><path class="m-land" d="${smooth(land)}${smooth(vila)}"/>`);
  o.push(`<g class="m-wood">${[...woods, woodsTop()].map(w => `<path d="${smooth(w)}"/>`).join('')}</g>`);
  o.push(`<path class="m-water" d="${smooth(acude)}${smooth(lagoa)}${poly(tanques)}"/><path class="m-dyke" d="${diques.map(line).join('')}"/>`);
  o.push(`<path class="m-hw" d="${poly(band(highway.south, highway.north))}"/><path class="m-road" d="${roads.map(r => smooth(r, false)).join('')}"/>`);
  o.push(`<path class="m-bld" d="${buildings.map(b => poly(corners(b))).join('')}"/>`);
  const pts = dots.flatMap(d => { const f = fotos[d.key]; if (!f) return []; const [x, y] = spot(f.at, f.az); return [{ i: d.i, d: `M${r1(x)} ${r1(y)}h0` }]; });
  o.push(`<g class="m-dots">${pts.map(p => `<path data-j="${p.i}" d="${p.d}"/>`).join('')}</g>`);
  o.push('<g class="m-pos"><path class="m-cone" d="M0 0L-13 -22.5A26 26 0 0 1 13 -22.5Z"/><circle class="m-ring" r="15"/><circle class="m-cam" r="6.5"/></g>');
  o.push(`<g class="m-hits">${pts.map(p => `<path data-j="${p.i}" d="${p.d}"><title>Foto ${String(p.i + 1).padStart(2, '0')}</title></path>`).join('')}</g>`);
  return `<svg class="m-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${o.join('')}</svg>`;
}
