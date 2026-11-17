// Take token-radar's 3 screenshots: real renders of the dashboard's own code.
// Each is a 1280x800 JPEG. Serves out/ on a local port, then screenshots:
//   1-board.jpg    the board, top of the page
//   2-detail.jpg   the detail dialog for the top-ranked protocol
//   3-filtered.jpg the board filtered to one category
// Usage: node shots.mjs [outDir]  (default outDir is ./out)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const OUT_DIR = resolve(process.argv[2] ?? './out');
const SHOTS_DIR = resolve('./screenshots');
mkdirSync(SHOTS_DIR, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  const path = join(OUT_DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, ''));
  if (!existsSync(path) || !statSync(path).isFile()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));

const base = `http://127.0.0.1:${port}/dashboard/index.html`;

// 1. The board, top of the page.
await page.goto(base, { waitUntil: 'load' });
await page.waitForFunction(() => document.querySelector('tbody tr') !== null, null, { timeout: 15000 });
await page.waitForTimeout(300);
await page.screenshot({ path: join(SHOTS_DIR, '1-board.jpg'), type: 'jpeg', quality: 82 });

// 2. The detail dialog for the top-ranked protocol.
await page.click('tbody tr:first-child');
await page.waitForFunction(() => document.querySelector('dialog[open]') !== null, null, { timeout: 10000 });
await page.waitForTimeout(300);
await page.screenshot({ path: join(SHOTS_DIR, '2-detail.jpg'), type: 'jpeg', quality: 82 });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);

// 3. The board filtered to one category.
await page.selectOption('#category', { label: 'RWA' });
await page.waitForTimeout(300);
await page.screenshot({ path: join(SHOTS_DIR, '3-filtered.jpg'), type: 'jpeg', quality: 82 });

for (const name of ['1-board.jpg', '2-detail.jpg', '3-filtered.jpg']) {
  const size = statSync(join(SHOTS_DIR, name)).size;
  console.log(`${name}  ${size} bytes  ${size <= 524288 ? 'OK' : 'TOO BIG'}`);
}
console.log(errors.length === 0 ? 'NO PAGE ERRORS' : `ERRORS:\n${errors.join('\n')}`);
await browser.close();
server.close();
