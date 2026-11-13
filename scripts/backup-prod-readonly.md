# Backup production (read-only) — samoorg.com.ua

**Prod:** `~/public_html` (~8.7G), DB **`samoorg_new2020`**, uploads ~4.3G.  
**Rules:** copy **from** prod to local/off-server; never restore onto prod from staging experiments.

## Вариант A — cPanel Full Backup (проще всего «всё сразу»)

1. cPanel → **Backup** / **Backup Wizard** → **Full Backup**.
2. **Destination:** Home Directory (или FTP на твой NAS/Google Drive off-server).
3. Дождаться письма/файла `backup-*.tar.gz` в home.
4. Скачать через **File Manager** или `scp` на Mac (не коммитить в git).

Плюс: аккаунт целиком (файлы + все БД + настройки). Минус: долго, большой архив.

## Вариант B — два артефакта (файлы + БД) — удобно для миграции

### 1) База prod

**phpMyAdmin:** база `samoorg_new2020` → **Export** → Quick или Custom → SQL → gzip.

**Или SSH** (пароль DB из prod `wp-config.php`, не логировать):

```bash
# на Mac, в каталог бэкапа:
mkdir -p ~/Backups/acso-prod-$(date +%Y%m%d)
ssh -i ~/.ssh/hostsila_samoorg samoorg@skm352.hostsila.org \
  'mysqldump -u samoorg_new2020 -p"***" --single-transaction --quick samoorg_new2020' \
  | gzip > ~/Backups/acso-prod-$(date +%Y%m%d)/samoorg_new2020.sql.gz
```

Подставь пароль локально или `-p` интерактивно (без кавычек в истории).

### 2) Файлы WordPress (rsync 3.x на Mac)

macOS `/usr/bin/rsync` **2.6.9** падает на старых кириллических именах в `uploads/`. Нужен:

```bash
brew install rsync
```

Скрипт: `./scripts/backup-prod-pull.sh` (rsync 3 + `--iconv=UTF-8-MAC,UTF-8`).

Ручной resume:

```bash
RSYNC=/opt/homebrew/opt/rsync/bin/rsync
$RSYNC -avz --partial --progress --iconv=UTF-8-MAC,UTF-8 \
  -e "ssh -i ~/.ssh/hostsila_samoorg" \
  --exclude 'wp-content/cache/' \
  samoorg@skm352.hostsila.org:public_html/ "$DEST/"
```

**Минимум перед сменой PHP:** хотя бы `wp-config.php` + `wp-content/` + dump БД.

## Вариант C — только критичное (быстро)

- Export `samoorg_new2020` в phpMyAdmin.
- cPanel → **File Manager** → `public_html` → Compress → Download (может упереться в лимит размера; тогда rsync по частям: `wp-content/themes`, `plugins`, `uploads`).

## Куда класть

- Локально: `~/Backups/…` или `_backups/` в проекте (**в `.gitignore`**, не GitHub).
- Вторая копия: внешний диск / облако замовника.

## Перед сменой PHP 8.x

1. Full backup (A) **или** B (файлы + dump).
2. Запиши текущую версию PHP (phpinfo prod).
3. Потом MultiPHP → 8.2/8.3 и smoke-test prod.

## Не путать со staging

- Staging DB: `samoorg_wp2026` — отдельно, prod dump **не** заливать туда без ETL/transform.
