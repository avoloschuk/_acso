# Инвентаризация prod (samoorg.com.ua)

**Статус:** частичная — сканирование оборвалось (curl timeout / exit 28). Полный список — после доступа к SSH, cPanel File Manager или рабочего WP REST.

**Дата снимка:** 2026-10-28

## Платформа (ранее + HTML)

| Параметр | Значение |
|----------|----------|
| WordPress | **5.3.26** (meta generator) |
| Тема | **Soledad** (`wp-content/themes/soledad/`) |
| Page builder (meta) | **WPBakery** (`js_composer`) |
| Сервер | nginx, PHP ~7.3 (headers, ранее) |

## Плагины — подтверждено

| Slug | Как обнаружен | Платность / заметки |
|------|---------------|---------------------|
| **elementor** | HTML + readme 200 | Free base; Pro — проверить в админке |
| **js_composer** | HTML | **WPBakery** — обычно **платный** |
| **wordpress-seo** | readme 200 | Yoast SEO |
| **wp-optimize** | readme 200 | Cache/optimize |
| **wpforms-lite** | HTML | Free tier |
| **wp-smushit** | HTML | Smush (free/pro) |
| **theme-junkie-shortcodes** | HTML | Shortcodes под тему |

## Не переносить на новый сайт (ориентир)

- `js_composer` (WPBakery) — заменяем Elementor + тема
- Дублирующие cache/optimize — один лёгкий подход на новом
- Legacy shortcode-плагины темы Soledad

## Новый сайт (минимум)

См. `_docs/realization_plan.md` §5 — Elementor free, SEO, Polylang, CF7, Redirection.

## Дальше

- [ ] Plugins → Installed Plugins в wp-admin (paid/expired)
- [ ] `wp-content/plugins/` по SSH
- [ ] Объём `uploads/`, размер БД
