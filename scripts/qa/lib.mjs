// Shared helpers for the QA checks: puppeteer-core + the system Chrome, against a served build (default: astro preview on 4399).
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

export const BASE = process.env.QA_BASE || 'http://localhost:4399';
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const chromePath = () => {
  const found = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
  ].find(p => p && fs.existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH.');
  return found;
};

export const launch = () => puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-first-run'] });

export const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

// A page with analytics off (dev_mode) and, unless intro is true, the entrance already spent for this tab.
export async function newPage(browser, { w = 1440, h = 900, mobile = false, scheme, reduce = false, intro = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  if (mobile) await page.setUserAgent(IPHONE_UA);
  const feats = [];
  if (scheme) feats.push({ name: 'prefers-color-scheme', value: scheme });
  if (reduce) feats.push({ name: 'prefers-reduced-motion', value: 'reduce' });
  if (feats.length) await page.emulateMediaFeatures(feats);
  await page.evaluateOnNewDocument(skip => {
    try { localStorage.setItem('dev_mode', 'true'); if (skip) sessionStorage.setItem('intro', '1'); } catch (e) {}
  }, !intro);
  page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  return page;
}

export const open = async (page, path, settle = 800) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(settle);
};

// Tiny reporter: ok() prints PASS/FAIL, done() sets the exit code.
export function reporter(title) {
  const res = [];
  console.log(`\n## ${title}`);
  return {
    ok(name, pass, info = '') { res.push(pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + info : '')); },
    done() { const p = res.filter(Boolean).length; console.log(`${p}/${res.length} passed`); if (p !== res.length) process.exitCode = 1; },
  };
}
