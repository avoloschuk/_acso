#!/usr/bin/env bash
# Pull production backup to ./_backups/ (read-only from server). Never restore to prod from here.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
set -a
# shellcheck source=/dev/null
source "$ROOT/secrets/acso.env"
set +a

pick_rsync() {
  for c in \
    "${RSYNC_BIN:-}" \
    /opt/homebrew/opt/rsync/bin/rsync \
    /usr/local/opt/rsync/bin/rsync \
    "$(command -v rsync 2>/dev/null || true)"; do
    [[ -n "$c" && -x "$c" ]] || continue
    if "$c" --version 2>/dev/null | grep -q 'version 3\.'; then
      echo "$c"
      return 0
    fi
  done
  return 1
}

RSYNC_BIN="$(pick_rsync)" || {
  echo "Need rsync 3.x with --iconv (legacy Cyrillic upload names). Install:" >&2
  echo "  brew install rsync" >&2
  exit 1
}

STAMP="$(date +%Y%m%d-%H%M)"
DEST="$ROOT/_backups/acso-prod-$STAMP"
mkdir -p "$DEST/files"

SSH_ARR=(ssh -i "${SSH_KEY_PATH}" -p "${SSH_PORT}" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
REMOTE="${SSH_USER}@${SSH_HOST}"
RSYNC_SSH="ssh -i ${SSH_KEY_PATH} -p ${SSH_PORT} -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

# Remote UTF-8 / legacy CP1251 filenames → macOS APFS (UTF-8-MAC)
RSYNC_ICONV="${RSYNC_ICONV:-UTF-8-MAC,UTF-8}"

echo "Backup → $DEST"
echo "Using rsync: $RSYNC_BIN"
echo "1/2 Database dump…"
"${SSH_ARR[@]}" "$REMOTE" 'bash -s' <<'REMOTE' | gzip > "$DEST/samoorg_new2020.sql.gz"
set -euo pipefail
eval "$(php -r '
  $c = file_get_contents(getenv("HOME")."/public_html/wp-config.php");
  preg_match("/define\s*\(\s*'\''DB_NAME'\''\s*,\s*[\"'\'']([^\"'\'']+)/", $c, $n);
  preg_match("/define\s*\(\s*'\''DB_USER'\''\s*,\s*[\"'\'']([^\"'\'']+)/", $c, $u);
  preg_match("/define\s*\(\s*'\''DB_PASSWORD'\''\s*,\s*[\"'\'']([^\"'\'']+)/", $c, $p);
  echo "DB_NAME={$n[1]}\nDB_USER={$u[1]}\nDB_PASS={$p[1]}\n";
')"
mysqldump -u "$DB_USER" -p"$DB_PASS" --single-transaction --quick "$DB_NAME"
REMOTE

echo "2/2 Files rsync public_html/…"
"$RSYNC_BIN" -avz --partial --progress \
  --iconv="$RSYNC_ICONV" \
  -e "$RSYNC_SSH" \
  --exclude 'wp-content/cache/' \
  --exclude 'wp-content/backup*/' \
  --exclude 'error_log' \
  "$REMOTE:public_html/" "$DEST/files/"

echo "Done."
du -sh "$DEST" "$DEST/files" "$DEST/samoorg_new2020.sql.gz" 2>/dev/null || true
