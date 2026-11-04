// npm run qa: serves dist/ with astro preview (unless QA_BASE points somewhere) and runs the checks.
//   npm run qa            behaviour, a11y, contrast, reflow, keyboard
//   npm run qa -- lh      also Lighthouse (slow)
//   npm run qa -- a11y    only the named checks
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../..');
const ALL = ['behavior', 'a11y', 'contrast', 'reflow', 'keyboard'];
const want = process.argv.slice(2);
const checks = want.length ? want : ALL;
const unknown = checks.filter(c => ![...ALL, 'lh'].includes(c));
if (unknown.length) { console.error(`Unknown check: ${unknown.join(', ')}. Available: ${[...ALL, 'lh'].join(', ')}`); process.exit(2); }
if (!fs.existsSync(path.join(here, 'node_modules'))) { console.error('Run `npm run qa:install` first.'); process.exit(2); }

let server;
if (!process.env.QA_BASE) {
  if (!fs.existsSync(path.join(root, 'dist'))) { console.error('No dist/. Run `npm run build` first.'); process.exit(2); }
  const { preview } = await import(pathToFileURL(path.join(root, 'node_modules/astro/dist/index.js')));
  server = await preview({ root, logLevel: 'silent', server: { port: 4399 } });   // in-process, so stop() really frees the port
}
let failed = 0;
for (const c of checks) {
  // async spawn: the in-process preview server has to keep answering while the check runs
  const code = await new Promise(res => spawn('node', [path.join(here, `${c}.mjs`)], { stdio: 'inherit', env: process.env }).on('close', res));
  if (code) failed++;
}
await server?.stop();
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
