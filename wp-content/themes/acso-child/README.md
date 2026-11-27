# acso-child

Child theme for **Hello Elementor**. Front assets are mirrored from `prototype/` so design work stays WP-ready.

## Sync from prototype (after UI feedback)

```bash
# from repo root
cp prototype/style.css wp-content/themes/acso-child/assets/css/main.css
# fix font paths for theme layout
sed -i '' "s|url('fonts/|url('../fonts/|g" wp-content/themes/acso-child/assets/css/main.css
cp prototype/js/*.js wp-content/themes/acso-child/assets/js/
cp prototype/data/*.json wp-content/themes/acso-child/assets/data/
# optional: fonts / logo marks
cp prototype/fonts/*.woff2 wp-content/themes/acso-child/assets/fonts/
cp prototype/logo_mark*.png wp-content/themes/acso-child/assets/img/
```

**Do not** enqueue `i18n-demo.js` on production — Polylang owns UA/EN.

## Script order

Same as `prototype` footers / `functions.php`:  
`util` → `news-mosaic-data` → `news-mosaic` → `home-hero` → `dir-slider` → `archive-filters` → `network-map` → `ui-chrome` → `main`.

## Content vs chrome

- Chrome / CSS / JS → this theme.
- Posts, pages, CPT, menus, translations → WordPress admin.
- Landing layouts → Elementor free (classes from `main.css`).
