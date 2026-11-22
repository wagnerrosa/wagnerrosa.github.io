// The renders shown on /casa/: src/data/casa-render.ts (titles, viewpoints) joined with what scripts/casa-render.mjs published.
import { readFileSync, existsSync } from 'node:fs';
import { render } from '../data/casa-render';

/** w × h = the full image, tw = the thumb's width (same shape). */
export type Foto = { i: number; file: string; titolo: string; full: string; thumb: string; w: number; h: number; tw: number; at?: [number, number, number] };

const MANIFEST = 'public/casa/render/render.json';

/** Renders in page order; entries whose image has not been published yet are left out. */
export function foto(): Foto[] {
  const m: { file: string; w: number; h: number; tw: number }[] = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
  return render.flatMap(r => {
    const f = m.find(x => x.file === r.file);
    return f ? [{ file: r.file, titolo: r.titolo, full: `/casa/render/${r.file}.webp`, thumb: `/casa/render/thumb/${r.file}.webp`, w: f.w, h: f.h, tw: f.tw, at: r.at }] : [];
  }).map((f, i) => ({ i, ...f }));
}
