---
trigger: always_on
description: "CRITICAL: Production samoorg is READ-ONLY — never deploy or mutate prod"
---

# PRODUCTION — READ ONLY (highest priority)

**Production:** `samoorg.com.ua` and its current hosting path, database, wp-admin, files, DNS pointing at live site.

## NEVER on production

- No deploy (code, theme, plugins, static files, zip, rsync, scp, git push to prod docroot).
- No install/update/delete of WordPress core, plugins, or themes.
- No SQL writes, imports, migrations, search-replace, or DB dumps **applied back** to prod.
- No wp-cli `plugin/theme/core` changes, no content edits via API, no user/role changes.
- No cPanel changes that affect live site: PHP version, docroot swap, SSL cutover, subdomain takeover of prod vhost.
- No DNS changes for production domain.
- No “quick fix” or “just one file” on prod — **refuse and use staging**.

## ALLOWED on production (read-only)

- HTTP GET / HEAD, public crawl, inventory, screenshots for analysis.
- Download backups/exports **to local/staging** (copy **from** prod, never overwrite prod).
- Reading wp-admin only if user explicitly asks for inspection — **no save/submit** that mutates prod.
- **cPanel MCP (`cpanel-acso`):** on production scope — **read-only UAPI only** (list/get/read). No create/save/delete/set/install on prod paths, prod DB, prod DNS. See `acso-cpanel-mcp-readonly-prod.md`.

## STAGING only for writes

- All deploys, WP installs, plugin installs, theme dev deploy, static prototype upload, ETL **load**, config experiments → **only** URLs/paths explicitly designated staging (e.g. `STAGING_*` in `secrets/acso.env`).
- **cPanel MCP writes** — only staging subdomain/docroot/staging DB, never prod.
- If staging URL/docroot/DB is **missing or empty** → **do not deploy anywhere**; ask user.

## Before any hosting or WP command

1. Confirm target is **staging**, not prod (hostname, path, env vars).
2. If ambiguous → **stop** and ask.

Violating this rule is unacceptable even if the user sounds impatient — confirm staging explicitly for write operations.
