// Draws the /casa/ floor plan (src/data/casa-pianta-base.ts + the revisions in src/data/casa-pianta.ts).
// - pianta(o): SVG for the page. 'land' = as drawn; 'port' = turned 90° clockwise for phones (room labels and levels stand upright, the rest turns
//   with the sheet, as on a rotated print). Every annotation of the original shows at any zoom, however small
//   (levels, dimensions, opening sizes are in .cp-fine only to keep them together).
// - piantaPdf(): the same drawing on an A3 sheet at 1:100, laid out like the original (title block top left, rose bottom right).
// - Render viewpoints (src/data/casa-render.ts): a camera dot and its cone of view, drawn on the sheet so the upright plan turns them too.
//   They keep their size on screen while zooming (src/scripts/casa-pianta.ts scales .cp-mk); hover and click: src/scripts/casa-render.ts.
import { FRAME, NORTH, linee as L0, testi as T0, quote, rosa, type Cls, type Kind, type Linea, type Testo } from '../data/casa-pianta-base';
import { ambienti, revisioni, BUSSOLA } from '../data/casa-pianta';

export type O = 'land' | 'port';
/** A render's viewpoint: index in the page's list, and [x, y, direction°] on the sheet. */
export type Scatto = { i: number; at: [number, number, number] };

/** The drawing after the revisions up to `fino` (default: all). */
export function stato(fino: string | undefined = revisioni.at(-1)?.id) {
  const linee: Record<string, Linea> = { ...L0 };
  const testi: Record<string, Testo> = { ...T0 };
  for (const r of revisioni) {
    for (const id of r.togli) {
      if (!(id in linee) && !(id in testi)) throw new Error(`casa-pianta: revision ${r.id} removes unknown id ${id}`);
      delete linee[id];
      delete testi[id];
    }
    Object.assign(linee, r.linee, {});
    Object.assign(testi, r.testi, {});
    if (r.id === fino) break;
  }
  return { linee: Object.values(linee), testi: Object.values(testi) };
}

/** Text height (font size) per kind, in cm — the sizes of the original sheet (pt × 3.5278). */
export const SIZE: Record<Kind, number> = { room: 34.6, mq: 23.3, lvl: 17.3, dim: 21.9, frac: 17.5, ext: 34.9, via: 40.6, sez: 33.9, forno: 19.8 };
const FINE = new Set<Kind>(['lvl', 'dim', 'frac', 'forno']);

// level marker (as drawn on the original): circle r 9.2 cm, cross ±14.5, leader to +90.4, value above the leader
const Q = { r: 9.2, c: 14.5, lead: 90.4, tx: 65.6, ty: -3.9 };

const n = (v: number) => Math.round(v * 10) / 10;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const closed = (d: string) => {
  if (/Z\s*$/.test(d)) return true;
  const a = d.match(/^M([-\d.]+) ([-\d.]+)/), b = d.match(/([-\d.]+) ([-\d.]+)\s*$/);
  return !!a && !!b && Math.hypot(+a[1] - +b[1], +a[2] - +b[2]) < 0.6;
};

type Item = { k: Kind; s: string; x: number; y: number; a: number };
type Mark = { x: number; y: number; v: string };

/** <text> with x/y = centre of the baseline, turned by a° about it. */
const text = (k: Kind | 'nord', s: string, x: number, y: number, a: number, z: number) =>
  `<text class="k-${k}" x="${n(x)}" y="${n(y)}" font-size="${n(z)}"${a ? ` transform="rotate(${n(a)} ${n(x)} ${n(y)})"` : ''}>${esc(s)}</text>`;
/** Level marker drawn at x/y on the sheet: [line work, fills]. */
const markPaths = (x: number, y: number) => {
  const r = Q.r;
  return [
    `M${n(x + r)} ${n(y)}A${r} ${r} 0 1 1 ${n(x - r)} ${n(y)}A${r} ${r} 0 1 1 ${n(x + r)} ${n(y)}M${n(x)} ${n(y - Q.c)}V${n(y + Q.c)}M${n(x - Q.c)} ${n(y)}H${n(x + Q.lead)}`,
    `M${n(x)} ${n(y)}H${n(x - r)}A${r} ${r} 0 0 1 ${n(x)} ${n(y - r)}ZM${n(x)} ${n(y)}H${n(x + r)}A${r} ${r} 0 0 1 ${n(x)} ${n(y + r)}Z`,
  ];
};
/** Text's "up" on the sheet (y down) for a text at angle a. */
const upOf = (a: number) => [Math.sin((a * Math.PI) / 180), -Math.cos((a * Math.PI) / 180)];
const G = 0.35;   // glyph centre above the baseline, × size

/** Labels as on the sheet. */
function labelsLand(items: Item[], marks: Mark[]) {
  const ql: string[] = [], qf: string[] = [], base: string[] = [], fine: string[] = [];
  for (const m of marks) {
    const [l, f] = markPaths(m.x, m.y);
    ql.push(l); qf.push(f);
    fine.push(text('lvl', m.v, m.x + Q.tx, m.y + Q.ty, 0, SIZE.lvl));
  }
  for (const i of items) (FINE.has(i.k) ? fine : base).push(text(i.k, i.s, i.x, i.y, i.a, SIZE[i.k]));
  return `<g class="cp-q"><path class="l-s" d="${ql.join('')}"/><path class="l-f" d="${qf.join('')}"/></g>` +
    `<g class="cp-t">${base.join('')}<g class="cp-fine">${fine.join('')}</g></g>`;
}

// Upright phone plan. The sheet is turned 90° clockwise (screen x = H - y, screen y = x), so a step on screen (sx, sy) is (sy, -sx)
// on the sheet. Room name, area and level marker of each room become one upright block, laid out as on the sheet around the block's
// centre; markers outside named rooms, opening labels and section letters stand up on their own. Everything else turns with the sheet,
// flipped where it would read upside down.
const SIZE_PORT: Partial<Record<Kind, number>> = { room: 46, mq: 30, lvl: 22 };
const SPREAD = 1.3;   // the upright labels are bigger: spread the block a little
// rooms where the bigger upright labels would clash: k = their scale, down = shift on screen (cm). The Hall is about 1.2 m wide on the
// phone, and the label of the Camera door ends right next to its name; in the soggiorno's WC the area would sit on the roof window.
const FIT: Record<string, { k: number; down: number }> = { hall: { k: 0.8, down: 30 }, 'wc-soggiorno': { k: 0.85, down: 36 } };

function labelsPort(items: Item[], marks: Mark[]) {
  const inPoly = (x: number, y: number, p: number[]) => {
    let c = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2)
      if (p[i + 1] > y !== p[j + 1] > y && x < ((p[j] - p[i]) * (y - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
    return c;
  };
  // block members: centre point on the sheet (glyph centre of a text, middle of a marker's leader)
  type M = { t?: Item; m?: Mark; cx: number; cy: number };
  const memberT = (t: Item): M => ({ t, cx: t.x, cy: t.y - G * SIZE[t.k] });
  const memberM = (m: Mark): M => ({ m, cx: m.x + Q.lead / 2 - 7, cy: m.y - 2 });
  const blocks: { m: M[]; id?: string }[] = [];
  const used = new Set<Item | Mark>();
  for (const a of ambienti) {
    if (!a.nome) continue;
    const b = [
      ...items.filter(t => (t.k === 'room' || t.k === 'mq') && inPoly(t.x, t.y, a.poly)).map(memberT),
      ...marks.filter(m => inPoly(m.x, m.y, a.poly)).map(memberM),
    ];
    b.forEach(x => used.add((x.t ?? x.m)!));
    if (b.length) blocks.push({ m: b, id: a.id });
  }
  for (const m of marks) if (!used.has(m)) blocks.push({ m: [memberM(m)] });
  for (const t of items) if (!used.has(t) && (t.k === 'sez' || t.k === 'forno' || t.k === 'room' || t.k === 'mq')) { blocks.push({ m: [memberT(t)] }); used.add(t); }

  const ql: string[] = [], base: string[] = [], fine: string[] = [];
  for (const { m: b, id } of blocks) {
    const xs = b.map(x => x.cx), ys = b.map(x => x.cy);
    const { k, down } = FIT[id ?? ''] ?? { k: 1, down: 0 };
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    for (const x of b) {
      const rx = x.cx - cx, ry = x.cy - cy;
      // where this member's centre goes on the sheet so that on screen it sits at (rx, ry) from the block centre, moved `down`
      // (screen-down is sheet +x)
      const px = cx + down + SPREAD * k * ry, py = cy - SPREAD * k * rx;
      if (x.t) {
        const z = (SIZE_PORT[x.t.k] ?? SIZE[x.t.k]) * k;
        // upright: screen-down is sheet +x, so the baseline is G × size "below" the glyph centre along +x
        (x.t.k === 'mq' ? fine : base).push(text(x.t.k, x.t.s, px + G * z, py, -90, z));
      } else if (x.m) {
        // marker centre: the leader middle sits (lead/2 - 7, -2) from it on screen → on the sheet (-2, -(lead/2 - 7)) back
        const mx = px + 2, my = py + (Q.lead / 2 - 7);
        const [l, f] = markPaths(mx, my);
        ql.push(`<g transform="rotate(-90 ${n(mx)} ${n(my)})"><path class="l-s" d="${l}"/><path class="l-f" d="${f}"/>` +
          `<g class="cp-fine">${text('lvl', x.m.v, mx + Q.tx, my + Q.ty, 0, SIZE_PORT.lvl!)}</g></g>`);
      }
    }
  }

  // the rest turns with the sheet; anything that would read upside down (screen angle a + 90 > 90) flips about its glyph centre
  const via = items.filter(t => t.k === 'via');
  for (const t of items) {
    if (used.has(t) || t.k === 'via') continue;
    let { x, y, a } = t;
    if (a + 90 > 91) {
      const [ux, uy] = upOf(a), d = 2 * G * SIZE[t.k];
      x += ux * d; y += uy * d; a += 180;
    }
    (FINE.has(t.k) ? fine : base).push(text(t.k, t.s, x, y, a, SIZE[t.k]));
  }
  // the street name is two lines: flip them as a pair (about the pair's centre) so the first line stays on top; once flat it runs
  // past the left edge, so it moves 40 cm to the right on screen (= -y on the sheet)
  if (via.length) {
    const gc = via.map(t => { const [ux, uy] = upOf(t.a), d = G * SIZE[t.k]; return [t.x + ux * d, t.y + uy * d - 40]; });
    const px = gc.reduce((s, p) => s + p[0], 0) / gc.length, py = gc.reduce((s, p) => s + p[1], 0) / gc.length;
    via.forEach((t, i) => {
      const flip = t.a + 90 > 91, a = flip ? t.a + 180 : t.a;
      const [gx, gy] = flip ? [2 * px - gc[i][0], 2 * py - gc[i][1]] : gc[i];
      const [ux, uy] = upOf(a), d = G * SIZE[t.k];
      base.push(text(t.k, t.s, gx - ux * d, gy - uy * d, a, SIZE[t.k]));
    });
  }
  return `<g class="cp-q">${ql.join('')}</g><g class="cp-t">${base.join('')}<g class="cp-fine">${fine.join('')}</g></g>`;
}

export const PAD = 30;
export const viewBox = (o: O) => (o === 'land' ? [-PAD, -PAD, FRAME.w + 2 * PAD, FRAME.h + 2 * PAD] : [-PAD, -PAD, FRAME.h + 2 * PAD, FRAME.w + 2 * PAD]);

/** Cone of view at the origin, pointing at a° (sheet: 0 = right, 90 = down). */
export function cono(a: number, r: number, half = 28) {
  const p = (d: number) => `${n(r * Math.cos((d * Math.PI) / 180))} ${n(r * Math.sin((d * Math.PI) / 180))}`;
  return `M0 0L${p(a - half)}A${r} ${r} 0 0 1 ${p(a + half)}Z`;
}
// marker size in cm at the full view (about 6 px dot, 21 px hit area, 70 px cone on a desktop screen); the viewer keeps it in px when zooming
export const MK = { cam: 17, hit: 60, cone: 200 };

export function pianta(o: O, scatti: Scatto[] = []) {
  const { linee, testi } = stato();
  const out: string[] = [];

  // floors
  out.push('<g class="cp-a">');
  for (const a of ambienti) {
    const p = a.poly;
    let d = `M${p[0]} ${p[1]}`;
    for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`;
    out.push(`<path class="${a.est ? 'a-e' : 'a-i'}" data-amb="${a.id}" d="${d}Z"/>`);
  }
  out.push('</g>');

  // line work, one path per pen (closed heavy outlines get the paper fill: thin walls standing in the yards)
  const by: Record<string, string[]> = {};
  for (const [c, d] of linee) (by[c === 'm' && closed(d) ? 'mc' : c] ??= []).push(d);
  out.push('<g class="cp-l">');
  for (const c of ['mc', 'm', 'd', 's', 't', 'f'] as const) if (by[c]) out.push(`<path class="l-${c}" d="${by[c].join('')}"/>`);
  out.push('</g>');

  // compass (north from the rose of the original)
  const { x: bx, y: by_, r: br } = BUSSOLA;
  const t = (NORTH * Math.PI) / 180, ux = Math.cos(t), uy = Math.sin(t);
  const P = (f: number, s: number) => `${n(bx + ux * f - uy * s)} ${n(by_ + uy * f + ux * s)}`;
  out.push(`<g class="cp-b"><circle class="l-s" cx="${bx}" cy="${by_}" r="${br}"/><path class="l-f" d="M${P(br * 0.86, 0)}L${P(-br * 0.3, br * 0.32)}L${P(-br * 0.08, 0)}L${P(-br * 0.3, -br * 0.32)}Z"/></g>`);

  const items = testi.map(([k, s, x, y, a]) => ({ k, s, x, y, a }));
  const marks = quote.map(([x, y, v]) => ({ x, y, v }));
  out.push(o === 'land' ? labelsLand(items, marks) : labelsPort(items, marks));
  // "N" beside the arrow: x/y below = centre of the letter
  const [nx, ny] = [bx + ux * (br + 26), by_ + uy * (br + 26)];
  out.push(`<g class="cp-t">${o === 'land' ? text('nord', 'N', nx, ny + 10.5, 0, 30) : text('nord', 'N', nx + 10.5, ny, -90, 30)}</g>`);

  // render viewpoints, on top of everything. Only the dot reacts to the pointer (.cp-hit widens it); the cone shows the view.
  if (scatti.length) {
    out.push('<g class="cp-shots">');
    for (const { i, at: [x, y, a] } of scatti)
      out.push(`<g class="cp-shot" data-i="${i}" data-track="open_render" data-category="casa" data-location="pianta" transform="translate(${n(x)} ${n(y)})"><g class="cp-mk"><path class="cp-cone" d="${cono(a, MK.cone)}"/><circle class="cp-hit" r="${MK.hit}"/><circle class="cp-cam" r="${MK.cam}"/></g></g>`);
    out.push('</g>');
  }

  const vb = viewBox(o);
  const body = o === 'land' ? out.join('') : `<g transform="matrix(0 1 -1 0 ${FRAME.h} 0)">${out.join('')}</g>`;
  return `<svg viewBox="${vb.join(' ')}" data-full="${vb.join(' ')}" class="cp-svg" role="img" aria-label="Pianta progetto, piano terra, scala 1:100">${body}</svg>`;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// PDF: one A3 page, vector, standard fonts (Helvetica), no dependencies.

// Helvetica advance widths (AFM), chars 32–126, in 1/1000 em
const HELV = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278,
  584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
  667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500,
  278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const width = (s: string) => [...s].reduce((w, ch) => w + (HELV[ch.charCodeAt(0) - 32] ?? 556), 0) / 1000;
const f = (v: number) => (Math.round(v * 1000) / 1000).toString();
const pstr = (s: string) => `(${s.replace(/[\\()]/g, m => '\\' + m)})`;

/** SVG path data (M/L/C/Z, absolute, as used in the data files) → PDF path operators. */
function pdfPath(d: string) {
  const ops: string[] = [];
  for (const [, c, args] of d.matchAll(/([MLCZ])([^MLCZ]*)/g)) {
    const v = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (c === 'M') ops.push(`${f(v[0])} ${f(v[1])} m`);
    else if (c === 'L') for (let i = 0; i < v.length; i += 2) ops.push(`${f(v[i])} ${f(v[i + 1])} l`);
    else if (c === 'C') for (let i = 0; i < v.length; i += 6) ops.push(`${v.slice(i, i + 6).map(f).join(' ')} c`);
    else ops.push('h');
  }
  return ops.join('\n');
}
/** Circle / quarter discs as Bézier curves (k = 0.5523). */
const circle = (x: number, y: number, r: number) => {
  const k = 0.5523 * r;
  return `${f(x + r)} ${f(y)} m ${f(x + r)} ${f(y + k)} ${f(x + k)} ${f(y + r)} ${f(x)} ${f(y + r)} c ${f(x - k)} ${f(y + r)} ${f(x - r)} ${f(y + k)} ${f(x - r)} ${f(y)} c ${f(x - r)} ${f(y - k)} ${f(x - k)} ${f(y - r)} ${f(x)} ${f(y - r)} c ${f(x + k)} ${f(y - r)} ${f(x + r)} ${f(y - k)} ${f(x + r)} ${f(y)} c`;
};
const quarter = (x: number, y: number, r: number, sx: number, sy: number) => {
  const k = 0.5523 * r;
  return `${f(x)} ${f(y)} m ${f(x + sx * r)} ${f(y)} l ${f(x + sx * r)} ${f(y + sy * k)} ${f(x + sx * k)} ${f(y + sy * r)} ${f(x)} ${f(y + sy * r)} c h`;
};

export function piantaPdf() {
  const { linee, testi } = stato();
  const PT = 72 / 254; // pt per cm at 1:100 (1 cm of building = 0.1 mm of paper)
  const W = (pt: number) => f(pt / PT); // pen weight in pt → frame units
  const pen: Record<Cls, string> = { m: `${W(0.72)} w`, d: `${W(0.36)} w`, s: `${W(0.27)} w`, t: `${W(0.27)} w`, f: '' };
  const c: string[] = [];
  // page space with y down (A3 landscape, as the original sheet), round caps and joins
  c.push(`q 1 0 0 -1 0 ${FRAME.pdf.h} cm 1 J 1 j 0 g 0 G`);
  // title block, where the original has it
  c.push(`BT /F2 1 Tf 20 0 0 -20 115 88.1 Tm ${pstr('PIANTA PROGETTO')} Tj ET`);
  c.push(`BT /F1 1 Tf 20 0 0 -20 116 120.2 Tm ${pstr('Piano Terra')} Tj ET`);
  c.push(`BT /F1 1 Tf 20 0 0 -20 114.6 149.4 Tm ${pstr('Scala 1:100')} Tj ET`);
  // the drawing, in its frame (cm)
  c.push(`q ${f(PT)} 0 0 ${f(PT)} ${FRAME.pdf.ox} ${FRAME.pdf.oy} cm`);
  const draw = (cls: Cls, d: string) => {
    if (cls === 'f') return `${pdfPath(d)}\nf`;
    return `${pen[cls]}${cls === 't' ? ` [${W(1.7)} ${W(0.85)}] 0 d` : ' [] 0 d'}\n${pdfPath(d)}\nS`;
  };
  for (const [cls, d] of [...linee, ...rosa]) c.push(draw(cls, d));
  // level markers
  for (const [x, y] of quote) {
    c.push(`${pen.s} [] 0 d ${circle(x, y, Q.r)} S`);
    c.push(`${f(x)} ${f(y - Q.c)} m ${f(x)} ${f(y + Q.c)} l ${f(x - Q.c)} ${f(y)} m ${f(x + Q.lead)} ${f(y)} l S`);
    c.push(`${quarter(x, y, Q.r, -1, -1)} ${quarter(x, y, Q.r, 1, 1)} f`);
  }
  // texts: x/y = centre of the baseline; the flipped page needs the text matrix flipped too (d < 0)
  const text = (k: Kind, s: string, x: number, y: number, a: number) => {
    const z = SIZE[k], r = (a * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r), w = width(s) * z;
    const x0 = x - (co * w) / 2, y0 = y - (si * w) / 2;
    return `BT /F1 1 Tf ${f(z * co)} ${f(z * si)} ${f(z * si)} ${f(-z * co)} ${f(x0)} ${f(y0)} Tm ${pstr(s)} Tj ET`;
  };
  for (const [k, s, x, y, a] of testi) c.push(text(k, s, x, y, a));
  for (const [x, y, v] of quote) c.push(text('lvl', v, x + Q.tx, y + Q.ty, 0));
  c.push('Q Q');

  const stream = c.join('\n');
  if (/[^\x00-\x7f]/.test(stream)) throw new Error('casa-pianta: non-ASCII text in the PDF stream');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${FRAME.pdf.w} ${FRAME.pdf.h}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>',
    `<< /Title ${pstr('Pianta progetto - Piano terra - Scala 1:100')} /Producer ${pstr('wagnerrosa.com/casa')} >>`,
  ];
  let pdf = '%PDF-1.4\n';
  const off: number[] = [];
  objs.forEach((o, i) => { off.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
