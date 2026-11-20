// /apto/planta.png: the same plan as /apto/planta.svg, rasterised at build time (2×, white background).
// This is the download on /apto/: a PNG opens in any phone's gallery and goes into WhatsApp/e-mail as a picture; the SVG stays for print/edit.
// Text falls back to the system sans-serif (librsvg cannot load the web font), so labels may differ slightly between machines.
import sharp from 'sharp';
import { planFile } from '../../lib/plan-svg';

export const GET = async () => {
  const png = await sharp(Buffer.from(planFile()), { density: 144 }).flatten({ background: '#fff' }).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
