# Antigravity — конфіг проєкту ACSO

Ця папка — **еквівалент** `.cursor/rules/` для [Google Antigravity](https://antigravity.google/docs/ide/rules/) (IDE / CLI / App).

| Cursor | Antigravity |
|--------|-------------|
| `.cursor/rules/*.mdc` | `.agents/rules/*.md` (+ YAML `trigger`) |

Key rules: `00-prod-readonly…`, `acso-development-workflow` (Git, SSH deploy, cutover).
| (немає в репо) | `AGENTS.md` у корені workspace |
| MCP у налаштуваннях Cursor | `.cursor/mcp.json` + `.agents/mcp_config.json` |
| Skills у `~/.cursor/skills` | `.agents/skills/` (за потреби) |

## Синхронізація

При зміні політик оновлюй **обидва** набори правил або тримай `.agents/rules/` джерелом правди для Antigravity.

## Секрети

Як і для Cursor: лише `secrets/acso.env`, не в MCP env без крайньої потреби.

## cPanel MCP

Сервер **`cpanel-acso`**: `bash ./scripts/mcp-cpanel-wrapper.sh` → читає `CPANEL_URL`, `CPANEL_USER`, `CPANEL_API_TOKEN`. Інструкція: `scripts/MCP-CPANEL.md`.

## Документація Antigravity

- Rules: https://antigravity.google/docs/ide/rules/
- MCP: https://antigravity.google/docs/mcp/
