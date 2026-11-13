# План реализации ACSO (samoorg → новый WP)

Отдельный рабочий план (не Cursor rule). Обновлять по мере прогресса.

**Связанные документы:** `_docs/ТЗ сайт.docx`, `_docs/implementation_plan.md`, `prototype/`, договор `_agreement/`.

---

## 1. Что говорит ТЗ про редактор

**§4.2 «Редагування сторінок»:**

- Усі основні сторінки та блоки — через **візуальний або блочний** редактор.
- **Пріоритетним рішенням є Elementor**, «хоча не принципово».
- Інший конструктор — лише після погодження з замовником.
- **Платні** конструктори/плагіни — повідомити вартість, ліцензію передати замовнику.

**Практическое решение команды:**

| Инструмент | Роль |
|------------|------|
| **Elementor (free)** | Основной для CM: главная, landing («Про нас», «Місцева демократія» и т.д.) |
| **Gutenberg** | Уже в ядре WP; для **потокового контента** (новости, аналитика) — обычный редактор поста, без Elementor на каждую статью |
| **Child theme** | Header, footer, CPT-шаблоны, глобальный CSS из `prototype/` |

Elementor **Pro в ТЗ не назван** — не закладываем, пока клиент явно не купит.

---

## 2. Фазы

### Фаза 0 — Доступы и бэкап (ты + я)

| # | Действие | Кто |
|---|----------|-----|
| 0.1 | Полный backup prod (cPanel Backup + БД + note про uploads) | Ты в cPanel или я по SSH |
| 0.2 | Subdomain для staging (напр. `new.samoorg.com.ua` или `staging.…`) | Ты в cPanel → Subdomains |
| 0.3 | SSL на subdomain (AutoSSL / Let's Encrypt) | cPanel |
| 0.4 | PHP **8.1+** на subdomain | cPanel → MultiPHP |
| 0.5 | Новая MySQL БД + пользователь | cPanel → MySQL |
| 0.6 | Дописать `secrets/acso.env`: `NEW_STAGING_URL`, `NEW_DB_*`, SSH если есть | Ты |
| 0.7 | Рабочий Application Password для prod (REST 401 — починить) | Ты в WP → Users |

### Фаза 1 — Design approval (статический HTML)

**Цель:** клиент утверждает визуал **до** тяжёлой WP-работы.

| # | Действие | Кто |
|---|----------|-----|
| 1.1 | Выложить содержимое `prototype/` на subdomain (index.html + css + js + png) | Я (SFTP/SSH/cPanel File Manager) |
| 1.2 | Basic auth или robots noindex (опционально) | Я |
| 1.3 | Ссылку на staging отправить заказчику → **1–2 раунда правок** (договор, этап 1) | Ты |
| 1.4 | Фиксация «дизайн главной согласован» (email/акт) | Ты |

### Фаза 2 — Каркас нового WordPress

| # | Действие | Кто |
|---|----------|-----|
| 2.1 | Чистый WP в **отдельной папке/vhost** (не подкаталог prod WP) | Я |
| 2.2 | Hello Elementor + `acso-child`, перенос CSS/ header/footer из prototype | Я |
| 2.3 | Минимальные плагины: Elementor, SEO, Polylang, CF7, Redirection | Я |
| 2.4 | CPT + таксономия «напрями» в `functions.php` | Я |
| 2.5 | Главная в Elementor по утверждённому HTML | Я |

### Фаза 3 — Инвентаризация prod и ETL

| # | Действие | Кто |
|---|----------|-----|
| 3.1 | Отчёт: плагины, темы, объём БД/uploads, платные/expired | Я → `_docs/inventory_old_wp.md` |
| 3.2 | Согласовать с тобой «что не переносим» | Вместе |
| 3.3 | rsync `uploads/`, ETL скрипт, импорт на staging | Я |
| 3.4 | Search-replace URL, 301-таблица | Я |

### Фаза 4 — QA и запуск (декабрь)

Playwright (выборочно), link crawl, PageSpeed, обучение CM, cutover prod, 30 дней warranty.

---

## 3. Что нужно от тебя (чеклист)

### В `secrets/acso.env` (не в чат)

- [ ] `CPANEL_*` — уже есть
- [ ] `NEW_STAGING_URL` — точный URL subdomain
- [ ] `NEW_STAGING_DOCROOT` — путь на сервере (если знаешь; иначе найду по SSH)
- [ ] `NEW_DB_NAME`, `NEW_DB_USER`, `NEW_DB_PASSWORD`, `NEW_DB_HOST`
- [ ] `OLD_SSH_*` или SFTP — для uploads и деплоя (желательно)
- [ ] `OLD_WP_APP_PASSWORD` — **новый**, если REST не логинится
- [ ] Контакт/email для «дизайн согласован» (кто подписывает этап 1)

### Действия в cPanel (если ещё не сделано)

- [ ] Subdomain создан
- [ ] Document root пустой или только наш static
- [ ] БД создана (можно пока только для static не нужна; для WP — нужна на фазе 2)

### От тебя организационно

- [ ] Подтвердить имя subdomain (`new` vs `staging`)
- [ ] Согласовать Polylang free vs WPML paid с клиентом
- [ ] После фазы 1 — собрать правки клиента одним списком

---

## 4. Что делаю я после доступов

1. Backup prod (если не сделан).
2. **Сразу:** static `prototype/` на subdomain → ссылка для approve.
3. Инвентаризация prod → `_docs/inventory_old_wp.md`.
4. Дальше по фазам 2–4.

---

## 5. Минимальный набор плагинов (новый сайт, черновик)

| Плагин | Назначение |
|--------|------------|
| Elementor | Landing / главная (ТЗ) |
| Yoast SEO *или* Rank Math | SEO |
| Polylang | UA/EN (free; WPML — только если клиент платит) |
| Contact Form 7 | Формы |
| Redirection | 301 после миграции |
| (опц.) Members | Роли редакторов РЦ |

Gutenberg — **не ставим**, он в ядре. ACF/CPT UI — только если без кода не обойтись; по умолчанию CPT в теме.

---

## 6. Статус

| Фаза | Статус | Дата |
|------|--------|------|
| 0 Доступы | 🟡 частично (cPanel, WP admin) | |
| 1 HTML approve | ⬜ | |
| 2 WP каркас | ⬜ | |
| 3 ETL | ⬜ | |
| 4 Launch | ⬜ | |

*Инвентаризация prod: см. `_docs/inventory_old_wp.md` (генерируется после сканирования).*
