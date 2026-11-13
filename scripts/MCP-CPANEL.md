# cPanel MCP (Cursor + Antigravity) — **OFF on Hostpro shared**

Host account **samoorg** has feature **`apitokens` disabled** (`uapi Tokens list` → no API tokens).  
**MCP is disabled** in `.cursor/mcp.json` and `.agents/mcp_config.json`. Use **SSH + `uapi`** and cPanel UI instead.

---

Legacy notes (if tokens enabled on another host):

Uses **[mcp-cpanel-api](https://www.npmjs.com/package/mcp-cpanel-api)** (UAPI over HTTPS). Credentials come **only** from `secrets/acso.env` via `scripts/mcp-cpanel-wrapper.sh` — nothing secret in `mcp.json`.

## One-time: API token

cPanel password (`CPANEL_PASSWORD`) is **not** used. Create a token:

1. cPanel → **Security** → **Manage API Tokens** → **Create**.
2. Name e.g. `acso-mcp`, copy token once.
3. Add to `secrets/acso.env`:

```env
CPANEL_API_TOKEN=your_token_here
```

Already required: `CPANEL_URL`, `CPANEL_USER` (see `secrets/acso.env.example`).

Optional overrides: `CPANEL_HOST`, `CPANEL_PORT` (default parsed from `CPANEL_URL`).

## Where it is wired

| IDE | Config |
|-----|--------|
| **Cursor** | `.cursor/mcp.json` → `cpanel-acso` |
| **Antigravity** | `.agents/mcp_config.json` → same server |

Restart the IDE or reload MCP after changing env or config.

## Safety (ACSO) — mandatory

Rules: `.cursor/rules/acso-cpanel-mcp-readonly-prod.mdc` and `.agents/rules/acso-cpanel-mcp-readonly-prod.md`.

| Scope | cPanel MCP |
|-------|------------|
| **Production** (`samoorg.com.ua`, prod `public_html`, prod DB/DNS) | **Read-only only** — list/get/read/status. **No** save, delete, create, set, install, DNS edit, DB mutate, file writes. Refuse if user asks to “fix prod via MCP”. |
| **Staging** (`staging.samoorg.com.ua`, `STAGING_DOCROOT`, new staging DB) | Writes OK when task is explicitly staging. Verify path/domain before calling mutating tools. |

The MCP server itself does not enforce this — the **agent** must.

## Shared hosting notes (Hostpro)

- **One PHP version per cPanel user** (all sites on the account). Not per subdomain.
- **MySQL on skm352** — suitable for modern WordPress; use a **separate database** for staging.

## Manual test

```bash
./scripts/mcp-cpanel-wrapper.sh
# Should stay running (stdio MCP); Ctrl+C to exit. Errors print to stderr if token missing.
```
