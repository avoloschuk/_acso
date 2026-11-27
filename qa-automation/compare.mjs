#!/usr/bin/env node
/**
 * Serve local prototype/ and mirrored staging; screenshot + DOM compare.
 * Does NOT write to remote staging.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import {
  ART,
  MIRROR,
  PAGES,
  ROOT,
  STAGING_BASE,
  collectDomSnapshot,
  ensureDir,
  launchBrowser,
  serveStatic,
} from './lib.mjs';

const VIEWPORT = { width: 1440, height: 900 };
const PIXEL_THRESHOLD = 0.12;
const MAX_DIFF_RATIO = 0.02; // 2% differing pixels → flag

ensureDir(ART);
const shotDir = path.join(ART, 'screenshots');
const diffDir = path.join(ART, 'diffs');
ensureDir(shotDir);
ensureDir(diffDir);

if (!fs.existsSync(path.join(MIRROR, 'index.html')) && !fs.existsSync(path.join(MIRROR, 'about.html'))) {
  console.error('No staging mirror yet. Run: npm run mirror');
  process.exit(1);
}

const localSrv = await serveStatic(path.join(ROOT, 'prototype'));
const stagingSrv = await serveStatic(MIRROR);

const browser = await launchBrowser(chromium);
const report = {
  ranAt: new Date().toISOString(),
  localBase: localSrv.baseUrl,
  stagingMirrorBase: stagingSrv.baseUrl,
  stagingLive: STAGING_BASE,
  pages: [],
};

function diffDom(local, staging) {
  const issues = [];
  const keys = ['mainNav', 'subnav', 'sectionIds', 'h2'];
  for (const key of keys) {
    const a = JSON.stringify(local[key]);
    const b = JSON.stringify(staging[key]);
    if (a !== b) {
      issues.push({
        kind: 'dom',
        field: key,
        local: local[key],
        staging: staging[key],
      });
    }
  }
  const ll = local.logo?.[0];
  const sl = staging.logo?.[0];
  if (ll && sl) {
    if (ll.src !== sl.src) issues.push({ kind: 'logo-src', local: ll.src, staging: sl.src });
    if (Math.abs(ll.cw - sl.cw) > 2 || Math.abs(ll.ch - sl.ch) > 2) {
      issues.push({ kind: 'logo-size', local: { cw: ll.cw, ch: ll.ch }, staging: { cw: sl.cw, ch: sl.ch } });
    }
  } else if (ll || sl) {
    issues.push({ kind: 'logo-missing', local: ll || null, staging: sl || null });
  }
  return issues;
}

async function shotPage(context, base, pageName, label) {
  const page = await context.newPage();
  const url = `${base}/${pageName}`;
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => ({ ok: () => false, _err: e }));
  if (res && res._err) {
    await page.close();
    return { error: String(res._err), url };
  }
  await page.waitForTimeout(400);
  const dom = await collectDomSnapshot(page);
  const pngPath = path.join(shotDir, `${label}__${pageName.replace('.html', '')}.png`);
  await page.screenshot({ path: pngPath, fullPage: true });
  await page.close();
  return { url, dom, pngPath };
}

const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });

for (const pageName of PAGES) {
  const localPath = path.join(ROOT, 'prototype', pageName);
  const mirrorPath = path.join(MIRROR, pageName);
  const entry = { page: pageName, issues: [], pixel: null };

  if (!fs.existsSync(localPath)) {
    entry.issues.push({ kind: 'missing-local' });
    report.pages.push(entry);
    continue;
  }
  if (!fs.existsSync(mirrorPath)) {
    entry.issues.push({ kind: 'missing-staging-mirror' });
    report.pages.push(entry);
    continue;
  }

  process.stdout.write(`compare ${pageName}… `);
  const localShot = await shotPage(context, localSrv.baseUrl, pageName, 'local');
  const stagingShot = await shotPage(context, stagingSrv.baseUrl, pageName, 'staging');

  if (localShot.error || stagingShot.error) {
    entry.issues.push({ kind: 'nav-error', local: localShot.error, staging: stagingShot.error });
    report.pages.push(entry);
    console.log('ERROR');
    continue;
  }

  entry.domIssues = diffDom(localShot.dom, stagingShot.dom);
  entry.issues.push(...entry.domIssues);
  entry.localDom = localShot.dom;
  entry.stagingDom = stagingShot.dom;

  const imgA = PNG.sync.read(fs.readFileSync(localShot.pngPath));
  const imgB = PNG.sync.read(fs.readFileSync(stagingShot.pngPath));
  const w = Math.max(imgA.width, imgB.width);
  const h = Math.max(imgA.height, imgB.height);

  function pad(img) {
    if (img.width === w && img.height === h) return img;
    const out = new PNG({ width: w, height: h });
    PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
    return out;
  }
  const a = pad(imgA);
  const b = pad(imgB);
  const diff = new PNG({ width: w, height: h });
  const diffCount = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: PIXEL_THRESHOLD });
  const ratio = diffCount / (w * h);
  const diffPath = path.join(diffDir, `${pageName.replace('.html', '')}.png`);
  if (ratio > MAX_DIFF_RATIO) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    entry.pixel = { diffCount, ratio, w, h, diffPath: path.relative(ART, diffPath) };
    entry.issues.push({ kind: 'pixel-diff', ratio, diffCount });
  } else {
    entry.pixel = { diffCount, ratio, w, h, ok: true };
  }
  console.log(entry.issues.length ? `DIFF (${entry.issues.length})` : 'ok');
  report.pages.push(entry);
}

await browser.close();
await localSrv.close();
await stagingSrv.close();

fs.writeFileSync(path.join(ART, 'compare-report.json'), JSON.stringify(report, null, 2));

// Markdown summary
const lines = [
  '# Staging ↔ local discrepancy report',
  '',
  `Ran: ${report.ranAt}`,
  `Local: \`${report.localBase}\` ← \`prototype/\``,
  `Staging mirror: \`${report.stagingMirrorBase}\` ← live \`${STAGING_BASE}\``,
  '',
];

const dirty = report.pages.filter((p) => p.issues?.length);
if (!dirty.length) {
  lines.push('**No discrepancies** above thresholds.');
} else {
  lines.push(`**${dirty.length} / ${report.pages.length} pages** with issues.`, '');
  for (const p of dirty) {
    lines.push(`## ${p.page}`, '');
    for (const iss of p.issues) {
      if (iss.kind === 'pixel-diff') {
        lines.push(`- **pixel-diff**: ${(iss.ratio * 100).toFixed(2)}% pixels differ → \`artifacts/${p.pixel.diffPath}\``);
      } else if (iss.field) {
        lines.push(`- **dom.${iss.field}**`);
        lines.push('  - local: `' + JSON.stringify(iss.local) + '`');
        lines.push('  - staging: `' + JSON.stringify(iss.staging) + '`');
      } else {
        lines.push(`- **${iss.kind}**: \`${JSON.stringify(iss)}\``);
      }
    }
    lines.push('');
  }
}

const mdPath = path.join(ART, 'report.md');
fs.writeFileSync(mdPath, lines.join('\n'));
console.log(`\nReport: ${mdPath}`);
console.log(`JSON:   ${path.join(ART, 'compare-report.json')}`);
process.exit(dirty.length ? 1 : 0);
