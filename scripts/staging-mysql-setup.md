# Staging MySQL для WordPress (cPanel, samoorg)

## Де створювати (не phpMyAdmin)

**phpMyAdmin** — лише перегляд/SQL **усередині** уже існуючих баз. На shared **нову базу + користувача** роблять у **cPanel**:

1. Увійти: `https://skm352.hostsila.org:2083`
2. **Databases → MySQL® Database Wizard** (або **MySQL® Databases**)
3. Кроки майстра:
   - **New Database:** напр. `stgwp` → повне ім’я буде **`samoorg_stgwp`**
   - **New User:** напр. `stgwp_u` → **`samoorg_stgwp_u`** + сильний пароль
   - **Privileges:** **ALL PRIVILEGES** на **`samoorg_stgwp`** (тільки ця база)

4. Записати в `secrets/acso.env`:

```env
STAGING_DB_NAME=samoorg_stgwp
STAGING_DB_USER=samoorg_stgwp_u
STAGING_DB_PASSWORD=...
STAGING_DB_HOST=localhost
```

## Це «просто пуста база»?

**Так.** WordPress сам створить таблиці (`wp_*`) під час установки в браузері або через Softaculous.  
**Не** імпортуй prod dump у staging на цьому етапі.

## Не чіпати prod

У phpMyAdmin вже є **`samoorg_db`**, `samoorg_new`, … — це **legacy production**.  
Для нового staging WP — **нова** база з новим іменем.

## Кодування

Старі бази на скріні — **`cp1251`**. Для нового WP на cPanel зазвичай створиться **utf8mb4** (норма для WP 6.x).  
Якщо в майстрі є вибір collation — **`utf8mb4_unicode_ci`**.

## Якщо немає «MySQL Databases» у cPanel

Шук у пошуку cPanel: **mysql**. Якщо дійсно немає — тикет Hostpro: «увімкніть MySQL Database Wizard для samoorg».

## Опційно: SQL у phpMyAdmin (лише CREATE DATABASE)

Якщо cPanel дозволяє створити базу вручну, інколи достатньо вкладки **SQL** (без користувача — user все одно в cPanel):

```sql
CREATE DATABASE IF NOT EXISTS samoorg_stgwp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Користувача та **ALL PRIVILEGES** на цю базу — **лише через cPanel → MySQL® Databases**, не phpMyAdmin.

## Далі

Після бази — установка WP у `~/staging.samoorg.com.ua/` (не в `ui/`), у `wp-config.php`:

- `DB_NAME` = `samoorg_stgwp`
- `DB_USER` / `DB_PASSWORD` / `DB_HOST` = `localhost`
