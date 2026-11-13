# ACSO (ВГО АСН) — workspace для Antigravity

Міграція **samoorg.com.ua** → новий WordPress (бренд ACSO, Elementor free, child theme). **Production лише read-only** до cutover.

## Швидкі посилання

| Що | Де |
|----|-----|
| Техархітектура | `_docs/implementation_plan.md` |
| Прототип головної | `prototype/index.html`, `prototype/style.css` |
| Секрети (локально) | `secrets/acso.env` — **не комітити, не логувати** |
| Staging (writes OK) | `STAGING_*` у `secrets/acso.env`, URL `https://staging.samoorg.com.ua/` |
| Деплой статичного UI | `scripts/deploy-staging-ui.sh` → `…/ui/` |

## Правила агента

Детальні обмеження — у **`.agents/rules/`** (паралель до `.cursor/rules/` для Cursor).

Найвищий пріоритет: `@.agents/rules/00-prod-readonly-never-deploy.md`

Workflow (Git, deploy, cutover): `.agents/rules/acso-development-workflow.md`

## MCP

- **cPanel:** `cpanel-acso` у `.agents/mcp_config.json` / `.cursor/mcp.json` — креди з `secrets/acso.env` (`CPANEL_API_TOKEN`). Див. `scripts/MCP-CPANEL.md`.
- Інші сервери — глобально `~/.gemini/config/mcp_config.json` або додай у `.agents/mcp_config.json`.

## Мова

Документація клієнта — українською; з розробником можна RU/EN. Публічний сайт — UA + EN.
