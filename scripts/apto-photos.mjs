// Compresses the raw apartment photos in apto-src/fotos/ into public/apto/ (full) and public/apto/thumb/ (grid).
// Usage: node scripts/apto-photos.mjs
//
// - The file name starts with the room (cozinha-IMG_8569.HEIC, sala-cozinha-2024….jpg). ROOMS below sets the room order
//   and the label shown on the page; inside a room, photos follow the file name. Unknown rooms go last (with a warning).
// - sharp drops all metadata by default (EXIF GPS included) and .rotate() applies the EXIF orientation first.
// - Videos (.mov/.mp4) are re-encoded with ffmpeg to H.264 720p (long edge 1280), no audio, no GPS/metadata, faststart; a poster frame
//   (1s in) goes through the same pipeline as a photo. In their room they come first, captioned "Quarto (vídeo)".
// - HEIC/HEIF is converted to JPEG with macOS `sips` first (sharp's prebuilt binaries can't decode HEVC).
// - The first photo also becomes public/apto/og.jpg (1200x630), the WhatsApp/iMessage link preview.
import { readdir, mkdir, rm, stat, mkdtemp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'apto-src/fotos';
const OUT = 'public/apto';
const THUMB = `${OUT}/thumb`;
const FULL_PX = 1800;   // long edge of the lightbox image
const THUMB_PX = 720;   // long edge of the grid image
const EXT = /\.(jpe?g|png|heic|heif|webp|tiff?|mov|mp4|m4v)$/i;
const isVideo = f => /\.(mov|mp4|m4v)$/i.test(f);

// key (file-name prefix) → [caption, group]. Array order = order on the page. The caption gets a number when the same key
// has several photos (Quarto 1, Quarto 2…). Photos of the same group sit together under one heading + one jump link.
const ROOMS = [
  ['sala', 'Sala', 'sala'],
  ['sala-cozinha', 'Sala e cozinha', 'sala'],
  ['cozinha-sala', 'Cozinha e sala', 'sala'],
  ['sala-corredor-cozinha', 'Sala, corredor e cozinha', 'sala'],
  ['sala-corredor', 'Sala e corredor', 'sala'],
  ['sala-porta-entrada', 'Sala e porta de entrada', 'sala'],
  ['cozinha', 'Cozinha', 'cozinha'],
  ['corredor', 'Corredor', 'corredor'],
  ['quarto', 'Quarto', 'quarto'],
  ['escritorio', 'Escritório', 'escritorio'],
  ['banheiro', 'Banheiro', 'banheiro'],
  ['banheiro-corredor', 'Banheiro e corredor', 'banheiro'],
  ['empregada', 'Dependência', 'dependencia'],
  ['empregada-area-servico', 'Dependência e área de serviço', 'dependencia'],
  ['area-servico-empregada', 'Área de serviço e dependência', 'area-servico'],
  ['area-servico', 'Área de serviço', 'area-servico'],
  ['condominio', 'Condomínio', 'condominio'],
  ['garagem-condominio', 'Garagem', 'garagem'],
  ['salao-de-festas', 'Salão de festas', 'salao'],
];
const GROUPS = {
  sala: 'Sala', cozinha: 'Cozinha', corredor: 'Corredor', quarto: 'Quarto', escritorio: 'Escritório', banheiro: 'Banheiro',
  dependencia: 'Dependência', 'area-servico': 'Área de serviço', condominio: 'Condomínio', garagem: 'Garagem', salao: 'Salão de festas',
};
// Original files pinned to the top, in this order. The first opens the page and becomes the link preview (og.jpg).
const FIRST = ['sala-corredor-cozinha20230920_132325.jpg', 'sala-20230920_132340.jpg'];
const roomOf = f => path.basename(f).match(/^(.*?)-?(?:l?IMG_|\d)/)?.[1] ?? '';

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const files = (await readdir(SRC, { recursive: true }))
  .filter(f => EXT.test(f) && !path.basename(f).startsWith('.'))
  .map(f => ({ f, room: roomOf(f), video: isVideo(f) }))
  .sort((a, b) => {
    const pa = FIRST.indexOf(a.f), pb = FIRST.indexOf(b.f);
if (pa >= 0 || pb >= 0) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    const ra = ROOMS.findIndex(r => r[0] === a.room), rb = ROOMS.findIndex(r => r[0] === b.room);
    return ((ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb)) || (b.video - a.video) || a.f.localeCompare(b.f, 'pt', { numeric: true });
  });
for (const u of new Set(files.filter(x => !ROOMS.some(r => r[0] === x.room)).map(x => x.room))) console.warn(`! unknown room "${u}": add it to ROOMS`);
if (!files.length) { console.error(`No photos in ${SRC}/`); process.exit(1); }

await rm(OUT, { recursive: true, force: true });
await mkdir(THUMB, { recursive: true });
const tmp = await mkdtemp(path.join(tmpdir(), 'apto-'));

const perKey = {};
for (const { room, video } of files) perKey[room + (video ? '#v' : '')] = (perKey[room + (video ? '#v' : '')] ?? 0) + 1;
const seen = {};
let before = 0, after = 0;
const manifest = [], sources = [];
for (const [i, { f, room, video }] of files.entries()) {
  let input = path.join(SRC, f);
  before += (await stat(input)).size;
  const name = `${String(i + 1).padStart(2, '0')}-${slug(room) || 'foto'}${video ? '-video' : ''}`;
  let videoFile;
  if (video) {
    videoFile = `${name}.mp4`;
    const poster = path.join(tmp, `${i}.jpg`);
    // -vf scale runs after ffmpeg's automatic rotation, so phone (portrait) clips keep their orientation
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-map_metadata', '-1', '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)',fps=30",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', `${OUT}/${videoFile}`]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '1', '-i', input, '-frames:v', '1', '-q:v', '2', poster]);
    after += (await stat(`${OUT}/${videoFile}`)).size;
    input = poster;
  } else if (/\.hei[cf]$/i.test(f)) {
    const jpg = path.join(tmp, `${i}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', input, '--out', jpg], { stdio: 'ignore' });
    input = jpg;
  }
  const img = sharp(input).rotate();
  const full = await img.clone().resize(FULL_PX, FULL_PX, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OUT}/${name}.webp`);
  const thumb = await img.clone().resize(THUMB_PX, THUMB_PX, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${THUMB}/${name}.webp`);
  after += full.size + thumb.size;
  const [, base_cap = room, group = 'outros'] = ROOMS.find(r => r[0] === room) ?? [];
  const key = room + (video ? '#v' : '');
  seen[key] = (seen[key] ?? 0) + 1;
  const label = video ? `${base_cap} (vídeo)` : base_cap;
  const caption = perKey[key] > 1 ? `${label} ${seen[key]}` : label;
  manifest.push({ file: `${name}.webp`, ...(video && { video: videoFile }), caption, group, groupLabel: GROUPS[group] ?? group, w: full.width, h: full.height });
  sources.push(`${caption.padEnd(34)} ${name}  ←  ${f}`);
  console.log(`${name}  ${full.width}x${full.height}  ${(full.size / 1024) | 0}KB + ${(thumb.size / 1024) | 0}KB`);
  if (i === 0 && !video) await sharp(input).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/og.jpg`);
}
await writeFile(`${OUT}/photos.json`, JSON.stringify(manifest));
await writeFile('apto-src/mapa.txt', sources.join('\n') + '\n');   // which original became which published photo (git-ignored)
await rm(tmp, { recursive: true, force: true });
console.log(`\n${files.length} photos: ${(before / 1048576).toFixed(0)}MB → ${(after / 1048576).toFixed(1)}MB in ${OUT}/`);
