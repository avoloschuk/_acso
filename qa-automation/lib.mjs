import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const QA = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(QA, '..');
export const ART = path.join(QA, 'artifacts');
export const MIRROR = path.join(ART, 'staging-mirror');
export const STAGING_BASE = 'https://staging.samoorg.com.ua/ui';

export const PAGES = [
  'index.html',
  'about.html',
  'directions.html',
  'democracy.html',
  'analytics.html',
  'library.html',
  'news.html',
  'network.html',
  'partners.html',
  'search.html',
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Static file server rooted at `rootDir`. Returns { baseUrl, close }. */
export function serveStatic(rootDir, preferredPort = 0) {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const filePath = path.normalize(path.join(rootDir, rel));
      if (!filePath.startsWith(path.normalize(rootDir + path.sep)) && filePath !== path.normalize(rootDir)) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });

  return new Promise((resolve) => {
    server.listen(preferredPort, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

/** Launch Chromium via system Google Chrome (Playwright bundled builds need newer macOS). */
export async function launchBrowser(playwrightChromium) {
  return playwrightChromium.launch({
    headless: true,
    channel: 'chrome',
  });
}

export async function collectDomSnapshot(page) {
  return page.evaluate(() => {
    const text = (el) => (el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '');
    const hrefs = (sel) => Array.from(document.querySelectorAll(sel)).map((a) => ({
      text: text(a),
      href: a.getAttribute('href') || '',
    }));
    const imgs = Array.from(document.querySelectorAll('header .logo img, header img.logo-full--header')).map((img) => ({
      src: img.getAttribute('src') || '',
      w: img.naturalWidth,
      h: img.naturalHeight,
      cw: Math.round(img.getBoundingClientRect().width),
      ch: Math.round(img.getBoundingClientRect().height),
    }));
    const sectionIds = Array.from(document.querySelectorAll('main section[id], main [id]'))
      .map((el) => el.id)
      .filter(Boolean);
    return {
      title: document.title,
      mainNav: hrefs('.main-nav a'),
      subnav: hrefs('[data-subnav-link], .subnav a'),
      logo: imgs,
      sectionIds,
      h1: text(document.querySelector('h1')),
      h2: Array.from(document.querySelectorAll('main h2')).map((h) => text(h)),
    };
  });
}
