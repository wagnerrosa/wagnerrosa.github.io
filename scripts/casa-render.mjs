// Compresses the project renders in casa-src/fotos/ into public/casa/render/ (viewer) and public/casa/render/thumb/ (plan preview, gallery).
// Both show the whole image in its own shape (never cropped), so render.json carries the sizes of both.
// Usage: node scripts/casa-render.mjs
//
// - The file name (without extension) is the render's key: src/data/casa-render.ts gives it a title and its viewpoint on the plan.
//   A render with no entry there is compressed but not shown (the script warns).
// - <key>-i.jpg is the same render with notes on it (sizes, materials…): the viewer switches to it with a toggle. It gets no thumb.
// - sharp drops all metadata by default and .rotate() applies the EXIF orientation first. Images are never enlarged.
// - The first render of src/data/casa-render.ts also becomes public/casa/og.jpg (1200x630), the WhatsApp/iMessage link preview.
import { readdir, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'casa-src/fotos';
const OUT = 'public/casa/render';
const THUMB = `${OUT}/thumb`;
const FULL_PX = 2000;   // long edge in the viewer
const THUMB_PX = 720;   // long edge of the preview
const EXT = /\.(jpe?g|png|webp|tiff?)$/i;

// keys in src/data/casa-render.ts, in page order (read as text: this script runs without a TypeScript loader)
const data = await readFile('src/data/casa-render.ts', 'utf8');
const keys = [...data.matchAll(/file: '([^']+)'/g)].map(m => m[1]);

const files = (await readdir(SRC)).filter(f => EXT.test(f)).sort();
await rm(OUT, { recursive: true, force: true });
await mkdir(THUMB, { recursive: true });

const manifest = [];
for (const f of files) {
  const name = path.parse(f).name;
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`casa-render: rename ${f} (lower case, digits and hyphens only)`);
  const img = sharp(path.join(SRC, f)).rotate();
  const full = await img.clone().resize(FULL_PX, FULL_PX, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${OUT}/${name}.webp`);
  const note = name.endsWith('-i');
  const thumb = note ? null : await img.clone().resize(THUMB_PX, THUMB_PX, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(`${THUMB}/${name}.webp`);
  manifest.push({ file: name, w: full.width, h: full.height, ...(thumb && { tw: thumb.width }) });
  const known = keys.includes(note ? name.slice(0, -2) : name);
  console.log(`${name}  ${full.width}x${full.height}  ${(full.size / 1024) | 0}KB${thumb ? ` + ${(thumb.size / 1024) | 0}KB` : ''}${known ? '' : '  (not in src/data/casa-render.ts: not shown)'}`);
}
for (const k of keys) if (!manifest.some(m => m.file === k)) console.warn(`casa-render: ${k} is in src/data/casa-render.ts but not in ${SRC}`);
await writeFile(`${OUT}/render.json`, JSON.stringify(manifest));

const first = keys.find(k => manifest.some(m => m.file === k));
if (first) {
  const src = files.find(f => path.parse(f).name === first);
  await sharp(path.join(SRC, src)).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toFile('public/casa/og.jpg');
  console.log(`og.jpg ← ${src}`);
}
