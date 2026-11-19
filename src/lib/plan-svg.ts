// Draws the /apto/ floor plan (src/data/apto-plan.ts) as SVG markup.
// - 'land': the plan as drawn (desktop, viewer mini map, download). 'port': turned 90° clockwise for phones; labels stay upright.
// - On the page the room names are HTML laid over the SVG (planLabels), so they keep a readable px size at any width.
//   The downloadable file (planFile) carries them as SVG text instead, with its own colors.
import { PLAN, NORTH, rooms, outline, doors, windows, openings, hall, type Seg } from '../data/apto-plan';

export type O = 'land' | 'port';
export type PlanShot = { i: number; g: string; x: number; y: number; a: number };
type Rect = { x: number; y: number; w: number; h: number };

const PAD = 24;
const CUT = 18;   // depth of the gap cut in a wall for a door/window (wider than the exterior wall)
const n = (v: number) => Math.round(v * 10) / 10;

export const viewBox = (o: O, extraBottom = 0) => {
  const w = o === 'land' ? PLAN.w : PLAN.h, h = o === 'land' ? PLAN.h : PLAN.w;
  return [-PAD, -PAD, w + 2 * PAD, h + 2 * PAD + extraBottom];
};
const pt = (o: O, x: number, y: number): [number, number] => (o === 'land' ? [x, y] : [PLAN.h - y, x]);
const rot = (o: O, r: Rect): Rect => (o === 'land' ? r : { x: PLAN.h - (r.y + r.h), y: r.x, w: r.h, h: r.w });
const ang = (o: O, a: number) => (o === 'land' ? a : a + 90);
const segRect = (s: Seg, t: number): Rect =>
  s.dir === 'h' ? { x: s.from, y: s.at - t / 2, w: s.to - s.from, h: t } : { x: s.at - t / 2, y: s.from, w: t, h: s.to - s.from };
const rect = (r: Rect, attrs: string) => `<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}" ${attrs}/>`;
const line = (o: O, a: [number, number], b: [number, number], cls: string) => {
  const [x1, y1] = pt(o, ...a), [x2, y2] = pt(o, ...b);
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" class="${cls}"/>`;
};
const segEnds = (s: Seg): [[number, number], [number, number]] =>
  s.dir === 'h' ? [[s.from, s.at], [s.to, s.at]] : [[s.at, s.from], [s.at, s.to]];

/** View cone of a photo, in plan ('land') coordinates. */
export function cone(x: number, y: number, a: number, r = 140, half = 30) {
  const p = (d: number) => [n(x + r * Math.cos((d * Math.PI) / 180)), n(y + r * Math.sin((d * Math.PI) / 180))];
  const [x1, y1] = p(a - half), [x2, y2] = p(a + half);
  return `M${n(x)} ${n(y)}L${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}Z`;
}

type Opts = { o: O; id: string; mini?: boolean; text?: boolean; counts?: Record<string, number>; shots?: PlanShot[]; extra?: string; extraBottom?: number };

export function planSvg({ o, id, mini = false, text = false, counts = {}, shots = [], extra = '', extraBottom = 0 }: Opts) {
  const vb = viewBox(o, extraBottom);
  const out: string[] = [];
  const cuts = [...windows, ...doors, ...openings].map(s => rect(rot(o, segRect(s, CUT)), 'fill="#000"')).join('');
  out.push(
    `<defs><pattern id="${id}-tile" width="32" height="32" patternUnits="userSpaceOnUse"><path class="tl" d="M32 0H0V32"/></pattern>` +
      `<mask id="${id}-cut" maskUnits="userSpaceOnUse" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}">${rect({ x: vb[0], y: vb[1], w: vb[2], h: vb[3] }, 'fill="#fff"')}${cuts}</mask></defs>`,
  );

  // floors
  out.push('<g class="floors">');
  for (const r of rooms) {
    const rr = rot(o, r);
    out.push(rect(rr, `class="f-${r.floor}"`));
    if (r.floor === 'tile') out.push(rect(rr, `fill="url(#${id}-tile)"`));
  }
  out.push('</g>');

  // walls, with the openings masked out
  const poly = outline.map(([x, y]) => pt(o, x, y).map(n).join(' ')).join('L');
  out.push(`<g class="walls" mask="url(#${id}-cut)">`);
  for (const r of rooms) out.push(rect(rot(o, r), 'class="w-int"'));
  out.push(`<path class="w-ext" d="M${poly}Z"/></g>`);

  // kitchen ↔ living room: change of floor
  for (const s of openings) out.push(line(o, ...segEnds(s), 'thr'));

  // windows: frame in the wall gap + glass line
  out.push('<g class="wins">');
  for (const w of windows) {
    out.push(rect(rot(o, segRect(w, w.small ? 10 : 14)), 'class="win"'));
    out.push(line(o, ...segEnds(w), 'win-l'));
  }
  out.push('</g>');

  // doors: leaf + swing arc
  if (!mini) {
    out.push('<g class="doors">');
    for (const d of doors) {
      const len = d.to - d.from;
      const [a, b] = segEnds(d);
      const [hp, op] = d.hinge === 'from' ? [a, b] : [b, a];
      const leaf: [number, number] = d.dir === 'h' ? [hp[0], hp[1] + d.swing * len] : [hp[0] + d.swing * len, hp[1]];
      const cross = (leaf[0] - hp[0]) * (op[1] - hp[1]) - (leaf[1] - hp[1]) * (op[0] - hp[0]);
      const [lx, ly] = pt(o, ...leaf), [ox, oy] = pt(o, ...op);
      out.push(line(o, hp, leaf, 'leaf'));
      out.push(`<path class="swing" d="M${n(lx)} ${n(ly)}A${len} ${len} 0 0 ${cross > 0 ? 1 : 0} ${n(ox)} ${n(oy)}"/>`);
    }
    out.push('</g>');

    // entrance arrow (from the hall into the flat) and compass
    const [ex, ey] = hall.entrance;
    out.push(`<g class="ent">${line(o, [ex + 78, ey], [ex + 14, ey], 'ent-l')}${line(o, [ex + 14, ey], [ex + 34, ey - 16], 'ent-l')}${line(o, [ex + 14, ey], [ex + 34, ey + 16], 'ent-l')}</g>`);
    const [cx, cy] = pt(o, ...hall.compass);
    const t = (ang(o, NORTH) * Math.PI) / 180, ux = Math.cos(t), uy = Math.sin(t);
    const P = (f: number, s: number) => `${n(cx + ux * f - uy * s)} ${n(cy + uy * f + ux * s)}`;
    out.push(`<g class="cmp"><circle cx="${n(cx)}" cy="${n(cy)}" r="30"/><path d="M${P(26, 0)}L${P(-8, 9)}L${P(-2, 0)}L${P(-8, -9)}Z"/></g>`);
  }

  // rooms: links to their photos
  out.push('<g class="rooms">');
  for (const r of rooms) {
    if (!r.g) continue;
    const c = r.count === false ? 0 : counts[r.g] ?? 0;
    const name = r.label.join(' ');
    const al = mini ? '' : ` aria-label="${name}${c ? `: ${c} fotos` : ''}"`;
    out.push(`<a class="room" href="#${r.g}" data-g="${r.g}"${al}${mini ? ' tabindex="-1"' : ''}>${rect(rot(o, r), 'class="rf"')}</a>`);
  }
  out.push('</g>');

  if (text) {
    out.push('<g class="txt">');
    for (const l of planLabels(o, counts, false)) {
      const [x, y] = l.at;
      const lines = l.lines.length;
      l.lines.forEach((s, k) => out.push(`<text x="${n(x)}" y="${n(y + (k - (lines - 1) / 2) * 22 + 6)}" class="t ${l.kind ?? ''}">${s.toUpperCase()}</text>`));
    }
    out.push('</g>');
  }

  // photo markers (desktop plan): hidden until their room is hovered
  if (shots.length) {
    out.push('<g class="shots" aria-hidden="true">');
    for (const s of shots) {
      const [x, y] = pt(o, s.x, s.y);
      // only the dot is clickable (the cone would swallow clicks meant for the room); .hit widens it to a 24px+ target
      out.push(`<g class="shot" data-i="${s.i}" data-g="${s.g}"><path class="cone" d="${cone(x, y, ang(o, s.a), 90)}"/><circle class="hit" cx="${n(x)}" cy="${n(y)}" r="20"/><circle class="cam" cx="${n(x)}" cy="${n(y)}" r="10"/></g>`);
    }
    out.push('</g>');
  }

  out.push(extra);
  return `<svg viewBox="${vb.join(' ')}" class="plan-svg"${mini ? ' aria-hidden="true"' : ' role="group" aria-label="Planta do apartamento"'}>${out.join('')}</svg>`;
}

export type Label = { at: [number, number]; left: number; top: number; lines: string[]; sub?: string; kind?: 'dim' | 'n' | 'v' };

/** Room names (+ photo counts), the entrance and the compass "N", positioned in % of the SVG box. */
export function planLabels(o: O, counts: Record<string, number> = {}, withCounts = true): Label[] {
  const vb = viewBox(o);
  const pc = (x: number, y: number): Label['at'] => pt(o, x, y);
  const put = (at: [number, number], l: Omit<Label, 'at' | 'left' | 'top'>): Label => ({
    at, left: n(((at[0] - vb[0]) / vb[2]) * 100), top: n(((at[1] - vb[1]) / vb[3]) * 100), ...l,
  });
  const out = rooms.map(r => {
    const c = withCounts && r.g && r.count !== false ? counts[r.g] : 0;
    return put(pc(r.x + r.w / 2 + (r.lx ?? 0), r.y + r.h / 2 + (r.ly ?? 0)), { lines: r.label, sub: c ? `${c} fotos` : undefined, kind: r.vert && 'v' });
  });
  out.push(put(pc(...hall.label), { lines: ['Entrada'], kind: 'dim' }));
  const [cx, cy] = pt(o, ...hall.compass), t = (ang(o, NORTH) * Math.PI) / 180;
  out.push(put([cx + Math.cos(t) * 48, cy + Math.sin(t) * 48], { lines: ['N'], kind: 'n' }));
  return out;
}

/** Standalone SVG file (/apto/planta.svg): light colors, SVG text, a caption under the plan. */
export function planFile() {
  const o: O = 'land', vb = viewBox(o, 56);
  const body = planSvg({ o, id: 'pf', text: true, extraBottom: 56 })
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '');
  const css = `
    .f-wood{fill:#f7f1e8}.f-tile{fill:#efefef}.tl{fill:none;stroke:rgb(0 0 0/.09);stroke-width:1}
    .w-int{fill:none;stroke:#111;stroke-width:7}.w-ext{fill:none;stroke:#111;stroke-width:14;stroke-linejoin:miter}
    .thr{stroke:rgb(0 0 0/.35);stroke-width:1.5;stroke-dasharray:6 6}
    .win{fill:#fff;stroke:#2563eb;stroke-width:2}.win-l{stroke:#2563eb;stroke-width:2}
    .leaf{stroke:#111;stroke-width:3;stroke-linecap:round}.swing{fill:none;stroke:rgb(0 0 0/.3);stroke-width:1.5}
    .ent-l{stroke:#111;stroke-width:3;stroke-linecap:round}.cmp circle{fill:none;stroke:rgb(0 0 0/.3);stroke-width:1.5}.cmp path{fill:#111}
    .rf{fill:none}
    text{font-family:'Figtree','Helvetica Neue',Arial,sans-serif;fill:#111;text-anchor:middle}
    .t{font-size:17px;font-weight:600;letter-spacing:1px}.t.dim{fill:#666;font-weight:500;font-size:14px}.t.n{font-size:16px;font-weight:700}
    .cap{font-size:14px;fill:#666;text-anchor:start}`;
  const capY = PLAN.h + 24 + 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}">` +
    `<title>Planta ilustrativa do apartamento</title><style>${css}</style><rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="#fff"/>${body}` +
    `<text x="0" y="${capY}" class="cap">Planta ilustrativa, sem escala · 76,33 m² privativos · 2 dormitórios + dependência · Mont'Serrat, Porto Alegre</text></svg>`;
}
