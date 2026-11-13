---
trigger: always_on
description: "ACSO migration ETL, staging, redirects, Playwright QA"
---

# Міграція, staging, QA

## Staging на тому ж хостингу
1. **Subdomain** (напр. `staging.`) → окремий document root, **окрема MySQL** (нова БД у cPanel).
2. **PHP (shared Hostpro/HostSila):** одна версія PHP **на весь cPanel-акаунт** — не окремо «тільки для staging». Підняти PHP до 8.x = для prod і staging разом; до cutover узгодити з замовником, backup prod. (Підтверджено суппортом Hostpro.)
3. **MySQL на skm352:** актуальна версія, підходить для WordPress 6.x — staging БД створюємо окремо.
4. Чистий WP + Hello Elementor + acso-child + мінімальні плагіни.
5. `disallow indexing` / basic auth на staging до запуску.
6. **Prod не змінювати** до cutover; спочатку **full backup** prod (cPanel + dump + uploads).

## Legacy prod
- Старий WP, PHP ~7.3, nginx, багато плагінів, Elementor-шорткоди, сміття в БД.
- **Не** копіювати всю БД «як є» на новий сайт.

## ETL (Extract → Transform → Load)
1. **Extract:** posts/pages/CPT, terms, users (за потреби), WXR/SQL; **rsync/tar over SSH** `wp-content/uploads/` (SSH бажано).
2. **Transform:** скрипт (Python/PHP/WP-CLI) — видалити `[elementor…]` та мертві shortcodes; зберегти `<img>`, `<a>`, таблиці; map legacy types → нові CPT; clean HTML для post content.
3. **Load:** імпорт на staging; **Better Search Replace** / WP-CLI для URL staging vs prod paths.

## Пріоритети якості контенту
| Пріоритет | Обсяг | Якість |
|-----------|--------|--------|
| Критичний | останні 6 міс. | ідеально |
| Важливий | останній рік | мінімальні відхилення OK |
| Бажаний | старше 1 року | as-is, візуальні баги допустимі |

Ціль міграції даних: **~10 років** публікацій + медіа (gif, pdf, images).

## SEO при переносі
- Зберегти зрозумілі URL де можливо; інакше **301** (Redirection plugin + таблиця old→new).
- Titles, meta базово; hreflang для UA/EN.

## Автотести (implementation_plan)
- **Playwright:** visual regression — top ~100 posts (6 міс.) old vs staging screenshots.
- **Link crawl:** всі URL staging, звіт 404.

## Cutover (грудень)
- Final content sync → backup prod → switch DNS/docroot або migrate files+DB → 301 → smoke test → вимкнути staging → 30 днів warranty fixes (без нового функціоналу).

## Доступи для агента
- `secrets/acso.env`: cPanel, SSH, WP app passwords, staging DB, `STAGING_*`.
- Shell-only sourcing; never log credentials.

## Залишок backlog (implementation_plan §8)
SVG логотип від дизайнера; ETL scripts; WP staging setup; theme from prototype; plugins install; migration run; Playwright; CI/CD theme deploy; prod launch + redirects.
