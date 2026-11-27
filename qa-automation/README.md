# ACSO staging ↔ local QA automation

Playwright suite: mirror staging `/ui/`, serve local `prototype/`, screenshot + DOM + anchor compare.

**Versioned:** scripts + lockfile. **Not versioned:** `node_modules/`, `artifacts/` (mirrors, screenshots, diffs).

## Setup (once)

```bash
cd qa-automation
npm install
# Uses system Google Chrome (channel: chrome) — no Playwright Chromium download needed on older macOS.
```

## Commands

| Script | What it does |
|--------|----------------|
| `npm run mirror` | Crawl staging `/ui/` → `artifacts/staging-mirror/` (GET only) |
| `npm run compare` | Local `prototype/` vs mirror: full-page screenshots + DOM → `artifacts/report.md` |
| `npm run anchors` | About subnav scroll/active checks on local + mirror |
| `npm run all` | mirror → compare → anchors |

Does **not** write to staging or production.
