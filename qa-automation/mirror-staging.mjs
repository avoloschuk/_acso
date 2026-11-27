#!/usr/bin/env node
/**
 * Crawl staging /ui/ and download HTML + referenced assets into artifacts/staging-mirror/.
 * Read-only against staging (GET only).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ART, MIRROR, STAGING_BASE, ensureDir, PAGES } from './lib.mjs';

ensureDir(MIRROR);

const seen = new Set();
const queue = [];

function enqueue(url) {
  if (!url || seen.has(url)) return;
  try {
    const u = new URL(url, STAGING_BASE + '/');
    if (!u.href.startsWith(STAGING_BASE)) return;
    // skip query-only noise
    u.hash = '';
    const clean = u.href;
    if (seen.has(clean)) return;
    seen.add(clean);
    queue.push(clean);
  } catch {
    /* ignore bad urls */
  }
}

function localPathFor(url) {
  const u = new URL(url);
  let rel = u.pathname.replace(/^\/ui\/?/, '');
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  return path.join(MIRROR, rel);
}

async function fetchOne(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    console.warn(`  ! ${res.status} ${url}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = localPathFor(url);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, buf);
  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  return { buf, ctype, dest };
}

function extractRefs(text, baseUrl) {
  const refs = [];
  const re = /(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[1];
    if (raw.startsWith('data:') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) continue;
    if (raw.startsWith('http') && !raw.startsWith(STAGING_BASE)) continue;
    refs.push(new URL(raw, baseUrl).href);
  }
  // css url(...)
  const cssRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((m = cssRe.exec(text))) {
    const raw = m[1];
    if (raw.startsWith('data:')) continue;
    try {
      const abs = new URL(raw, baseUrl).href;
      if (abs.startsWith(STAGING_BASE)) refs.push(abs);
    } catch {
      /* ignore */
    }
  }
  // JS/JSON string paths — always rooted at /ui/ (not relative to the .js file)
  const assetRe = /["']((?:img|fonts|js|data)\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|woff2?|json|js))["']/gi;
  while ((m = assetRe.exec(text))) {
    try {
      const abs = new URL(m[1], STAGING_BASE + '/').href;
      if (abs.startsWith(STAGING_BASE)) refs.push(abs);
    } catch {
      /* ignore */
    }
  }
  return refs;
}

PAGES.forEach((p) => enqueue(`${STAGING_BASE}/${p}`));
enqueue(`${STAGING_BASE}/`);

console.log(`Mirroring ${STAGING_BASE} → ${MIRROR}`);

while (queue.length) {
  const url = queue.shift();
  process.stdout.write(`  get ${url.replace(STAGING_BASE, '')}\n`);
  const got = await fetchOne(url);
  if (!got) continue;
  const parseable =
    got.ctype.includes('text/html') ||
    got.ctype.includes('text/css') ||
    got.ctype.includes('javascript') ||
    got.ctype.includes('json') ||
    /\.(html|css|js|json)$/i.test(url);
  if (parseable) {
    const text = got.buf.toString('utf8');
    for (const ref of extractRefs(text, url)) enqueue(ref);
  }
}

const manifest = {
  fetchedAt: new Date().toISOString(),
  base: STAGING_BASE,
  fileCount: seen.size,
  files: [...seen].map((u) => u.replace(STAGING_BASE + '/', '')).sort(),
};
fs.writeFileSync(path.join(ART, 'mirror-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Done: ${manifest.fileCount} URLs → ${MIRROR}`);
