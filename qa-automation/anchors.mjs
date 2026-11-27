#!/usr/bin/env node
/**
 * Subnav anchor checks on local prototype + staging mirror (no remote writes).
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { ART, MIRROR, ROOT, ensureDir, launchBrowser, serveStatic } from './lib.mjs';

ensureDir(ART);
const localSrv = await serveStatic(path.join(ROOT, 'prototype'));
const stagingSrv = await serveStatic(MIRROR);
const browser = await launchBrowser(chromium);
const results = { ranAt: new Date().toISOString(), local: null, staging: null };

async function runAnchors(base, label) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/about.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const links = await page.$$eval('[data-subnav-link]', (as) =>
    as.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') }))
  );

  const checks = [];
  for (const link of links) {
    const id = (link.href || '').replace(/^#/, '');
    await page.click(`a[data-subnav-link][href="${link.href}"]`);
    await page.waitForTimeout(500);
    const measure = await page.evaluate((sectionId) => {
      const section = document.getElementById(sectionId);
      const header = document.querySelector('.site-header');
      const subnav = document.querySelector('.subnav');
      if (!section) return { ok: false, reason: 'missing-section' };
      const sr = section.getBoundingClientRect();
      const chrome = (header?.getBoundingClientRect().height || 0) + (subnav?.getBoundingClientRect().height || 0);
      const gap = sr.top - chrome;
      // After click, section top should sit just under sticky chrome (±24px)
      const ok = Math.abs(gap) <= 24;
      const h2 = section.querySelector('h2');
      return {
        ok,
        gap: Math.round(gap * 10) / 10,
        chrome: Math.round(chrome),
        sectionTop: Math.round(sr.top),
        h2: h2 ? h2.textContent.trim() : null,
        active: document.querySelector('.subnav a.is-active')?.textContent.trim() || null,
      };
    }, id);
    checks.push({ link: link.text, href: link.href, ...measure });
  }

  await page.close();
  return { label, base, links, checks };
}

results.local = await runAnchors(localSrv.baseUrl, 'local');
if (fs.existsSync(path.join(MIRROR, 'about.html'))) {
  results.staging = await runAnchors(stagingSrv.baseUrl, 'staging-mirror');
} else {
  results.staging = { error: 'no mirror' };
}

await browser.close();
await localSrv.close();
await stagingSrv.close();

fs.writeFileSync(path.join(ART, 'anchors-report.json'), JSON.stringify(results, null, 2));

const lines = ['# About subnav anchors', '', `Ran: ${results.ranAt}`, ''];
for (const side of ['local', 'staging']) {
  const block = results[side];
  lines.push(`## ${side}`, '');
  if (block.error) {
    lines.push(block.error, '');
    continue;
  }
  lines.push(`Links (${block.links.length}): ${block.links.map((l) => l.text).join(' · ')}`, '');
  for (const c of block.checks) {
    const mark = c.ok ? 'OK' : 'FAIL';
    lines.push(`- **${c.link}** (${c.href}): ${mark} — gap=${c.gap}px (chrome ${c.chrome}px), active=${c.active}`);
  }
  lines.push('');
}

// Highlight link-list mismatch
const lt = results.local?.links?.map((l) => l.text).join('|') || '';
const st = results.staging?.links?.map((l) => l.text).join('|') || '';
if (lt !== st) {
  lines.push('## Subnav mismatch', '', `- local: ${lt}`, `- staging: ${st}`, '');
}

fs.writeFileSync(path.join(ART, 'anchors-report.md'), lines.join('\n'));
console.log(lines.join('\n'));
const failed =
  (results.local?.checks || []).some((c) => !c.ok) ||
  (results.staging?.checks || []).some((c) => !c.ok) ||
  lt !== st;
process.exit(failed ? 1 : 0);
