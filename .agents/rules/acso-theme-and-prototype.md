---
trigger: glob
globs: "prototype/**/*, wp-content/themes/**/*, prototype/js/**/*"
description: "Prototype must map cleanly into acso-child + Elementor — content in WP, chrome in theme"
---

# Прототип → WordPress (обов’язково при дизайні)

Мета: усе, що зараз у `prototype/` (HTML / CSS / JS), пізніше лягає в **Hello Elementor + `acso-child`** без «витягування коду на сторінку» і без переписування під WP. У WordPress лишається **контент**; структура, стилі, поведінка — у темі (і мінімум Elementor на landing).

## Розподіл відповідальності (не змішувати)

| Шар | Де в прототипі | Куди в WP |
|-----|----------------|-----------|
| Chrome (header, footer, nav, lang, search icon) | повторюваний markup у HTML | `header.php` / `footer.php`, `wp_nav_menu()`, theme partials |
| Стилі / токени | `prototype/style.css`, CSS variables | enqueue child `style.css` (+ fonts) |
| Поведінка UI | `prototype/script.js`, `prototype/js/*.js` | `wp_enqueue_script` з теми; без inline у контенті |
| Landing-секції (головна, «Про нас» блоки) | semantic `<section>` | Elementor **free** sections **або** theme templates; класи з прототипу |
| Потоковий контент (новини, аналітика, бібліотека, партнери) | картки / mosaic / archives | CPT + theme templates (`archive-*.php`, `single-*.php`, parts) — **не** Elementor на кожен пост |
| Тексти, URL, списки матеріалів | зараз mock у HTML/JS | пости / CPT / options / ACF-подібні meta — **не** хардкод у темі на проді |
| Бінарний контент (фото команди, напрямів, новин) | `prototype/img/{team,board,directions,news}/` — **не в Git** | Media Library / featured / term meta; деплой прототипу тягне файли з диска |

**У WP лише контент:** заголовки, lead, PDF, зображення, пункти меню, координати РЦ. Тема не містить фінальних статей; прототипні рядки — лише placeholders з чіткими CSS-класами під заміну.

**Git vs deploy:** у репозиторій — структура, CSS/JS, тема. Контентні зображення лишаються локально (див. `.gitignore` + `prototype/img/CONTENT.md`) і заливаються на staging разом із `deploy-staging-ui.sh`, але не комітяться.

## Як писати прототип «під тему»

1. **Semantic sections** з стабільними класами BEM/`block__elem` (`.page-head`, `.home-hero`, `.news-mosaic`, `.subnav`, `.section-header`) — ті самі класи підуть у PHP/Elementor CSS.
2. **Не** інлайнити великі CSS у HTML; усе в `style.css` (або модульний CSS, який потім змерджиться в child).
3. **JS як бібліотеки**, не як одноразові скрипти внизу сторінки:
   - приклад: `prototype/js/news-mosaic.js` → `AcsoNewsMosaic.mount(...)` → у темі `assets/js/news-mosaic.js` + init у `main.js` / `functions.php`.
   - Init по `data-*` атрибутах (`[data-news-mosaic]`, `[data-home-hero]`) — щоб PHP вивів розмітку, а JS підхопив без знання контенту.
4. **Дані для віджетів** (пул новин mosaic) — окремий масив/JSON у прототипі; у WP замінити на `WP_Query` / REST. Не зашивати розмітку 20 постів руками в JS без шляху до query.
5. **Header/footer** — однакова структура на всіх сторінках прототипу (майже copy-paste OK зараз), щоб легко вирізати в `header.php` / `footer.php`.
6. **Якорі / subnav** — `id` на `<section>`, не на випадкових `div`; scroll-offset через CSS vars — переноситься як є.
7. **Зображення** — осмислені імена/шляхи; у WP стануть attachment URL / featured image. Не base64 у CSS.
8. **Мови** — прототипний EN switch не диктує prod; у WP — Polylang. Не будувати i18n так, щоб потім ламати тему.

## Elementor vs тема

- **Elementor free:** головна та статичні landing (секції з прототипу), Kit з бренд-кольорами.
- **Тема (обов’язково):** header/footer, CPT archive/single, картки, mosaic/hero news control, forms chrome, map RC.
- **Не** дублювати великий CSS віджетами Elementor — глобальні класи з `style.css` / child theme.
- Elementor Pro / Theme Builder на весь сайт — **не** закладати.

## Референс-файли

- `prototype/index.html` (+ інші `*.html`) — структура сторінок; `body.page.page--*`.
- `prototype/style.css` — canonical styles / tokens (source of truth).
- `prototype/js/` — модулі (`main.js` boot); `prototype/data/` — mock JSON для query-контракту.
- `prototype/script.js` — **deprecated** stub.
- `wp-content/themes/acso-child/` — Hello Elementor child; sync: `scripts/sync-theme-assets.sh`.
- `i18n-demo.js` — лише прототип; у WP **не** enqueue (Polylang).

## Чеклист перед «це готово до теми»

- [ ] Новий UI має іменовані класи, не лише utility-хаос.
- [ ] Інтерактив винесений у `prototype/js/<name>.js` з публічним API / `data-*` mount.
- [ ] Немає логіки «тільки для цієї однієї HTML-сторінки», яку не можна викликати з PHP-шаблону.
- [ ] Контент у розмітці позначений як такий, що замінюється (або йде з data/JSON), не змішаний із chrome.
- [ ] Стилі не залежать від порядку сторінок у прототипі (глобальні селектори теми).

## Деплой прототипу

- Після фідбеку — **лише локально** в `prototype/`.
- **`./scripts/deploy-staging-ui.sh`** — тільки на явне **deploy** (не після кожної правки).

## Бренд (коротко)

- Accent `#e95029`, dark `#12162a`, gray `#d3d4d8`, light `#e5e3e8`; шрифт **e-Ukraine** у `prototype/fonts/`.
- Не лишати Inter як prod-font у темі.

## Git

Комітити `prototype/` і `wp-content/themes/acso-child/`; не комітити секрети / uploads / ядро WP. Elementor JSON — лише якщо свідомо версіонуємо в `elementor-templates/`.
