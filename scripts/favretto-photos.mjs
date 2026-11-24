// Compresses the raw drone photos in favretto-src/ into public/favretto/ (full) and public/favretto/thumb/ (grid).
// Usage: node scripts/favretto-photos.mjs
//
// - PHOTOS below sets the order, caption and group of each original (matched by the number in Favretto-00NN.jpg).
//   Originals not listed go last with the file name as caption (with a warning).
// - sharp drops all metadata by default (the drone's EXIF GPS included) and .rotate() applies the EXIF orientation first.
// - The first photo also becomes public/favretto/og.jpg (1200x630), the WhatsApp/iMessage link preview.
// - Writes public/favretto/photos.json (the manifest the page reads) and favretto-src/mapa.txt (original → published, git-ignored).
import { readdir, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'favretto-src';
const OUT = 'public/favretto';
const THUMB = `${OUT}/thumb`;
const FULL_PX = 2200;   // long edge of the lightbox image (aerials need detail)
const THUMB_PX = 800;   // long edge of the grid image
const EXT = /\.(jpe?g|png|webp|tiff?)$/i;

// number in the file name → [caption, group]. Array order = order on the page.
const GROUPS = { geral: 'Vista geral', area: 'Área e entorno', galpoes: 'Galpões', sede: 'Sede e açudes', interno: 'Interior' };
const PHOTOS = {
  '0023': ['Vista da BR-290 para o sítio', 'geral'],
  '0059': ['Vista de cima, com a BR-290 e a área industrial vizinha', 'geral'],
  '0028': ['O sítio entre a BR-290 e o banhado', 'geral'],
  '0040': ['Galpões, casas e açudes, com a cidade ao fundo', 'area'],
  '0041': ['Galpões, casas e açudes, com a BR-290 ao fundo', 'area'],
  '0067': ['Vista geral da área', 'area'],
  '0049': ['Galpões, casas e açudes vistos de cima', 'galpoes'],
  '0071': ['Galpões e açudes', 'galpoes'],
  '0075': ['Galpões da olaria', 'galpoes'],
  '0078': ['Galpões da olaria, vista lateral', 'galpoes'],
  '0088': ['Acesso, açude e sede', 'sede'],
  '0099': ['Sede, galpão e açudes', 'sede'],
  '0083': ['Interior de um galpão', 'interno'],
};
const numOf = f => f.match(/(\d{4})\.[a-z]+$/i)?.[1] ?? '';

const files = (await readdir(SRC))
  .filter(f => EXT.test(f) && !f.startsWith('.'))
  .map(f => ({ f, n: numOf(f) }))
  .sort((a, b) => {
    const ia = Object.keys(PHOTOS).indexOf(a.n), ib = Object.keys(PHOTOS).indexOf(b.n);
    return ((ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)) || a.f.localeCompare(b.f, 'pt', { numeric: true });
  });
for (const x of files.filter(x => !PHOTOS[x.n])) console.warn(`! "${x.f}" is not in PHOTOS: add a caption and group`);
if (!files.length) { console.error(`No photos in ${SRC}/`); process.exit(1); }

await rm(OUT, { recursive: true, force: true });
await mkdir(THUMB, { recursive: true });

let before = 0, after = 0;
const manifest = [], sources = [];
for (const [i, { f, n }] of files.entries()) {
  const input = path.join(SRC, f);
  before += (await stat(input)).size;
  const name = `${String(i + 1).padStart(2, '0')}-${n || 'foto'}`;
  const img = sharp(input).rotate();
  const full = await img.clone().resize(FULL_PX, FULL_PX, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OUT}/${name}.webp`);
  const thumb = await img.clone().resize(THUMB_PX, THUMB_PX, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${THUMB}/${name}.webp`);
  after += full.size + thumb.size;
  const [caption = f, group = 'geral'] = PHOTOS[n] ?? [];
  manifest.push({ file: `${name}.webp`, caption, group, groupLabel: GROUPS[group] ?? group, w: full.width, h: full.height });
  sources.push(`${caption.padEnd(58)} ${name}  ←  ${f}`);
  console.log(`${name}  ${full.width}x${full.height}  ${(full.size / 1024) | 0}KB + ${(thumb.size / 1024) | 0}KB`);
  if (i === 0) await sharp(input).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/og.jpg`);
}
await writeFile(`${OUT}/photos.json`, JSON.stringify(manifest));
await writeFile(`${SRC}/mapa.txt`, sources.join('\n') + '\n');
console.log(`\n${files.length} photos: ${(before / 1048576).toFixed(0)}MB → ${(after / 1048576).toFixed(1)}MB in ${OUT}/`);
