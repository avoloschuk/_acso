#!/usr/bin/env bash
# Deploy prototype/ → staging .../ui/ ONLY (never public_html).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
set -a
# shellcheck source=/dev/null
source "$ROOT/secrets/acso.env"
set +a

REMOTE_DIR="${STAGING_DOCROOT:-${NEW_STAGING_DOCROOT:-}}"
STAGING_URL="${STAGING_WP_URL:-${NEW_STAGING_URL:-}}"
SSH_HOST="${SSH_HOST:-${OLD_SSH_HOST:-}}"
SSH_USER="${SSH_USER:-${OLD_SSH_USER:-}}"
SSH_KEY_PATH="${SSH_KEY_PATH:-${OLD_SSH_KEY_PATH:-}}"
SSH_PORT="${SSH_PORT:-${OLD_SSH_PORT:-22}}"

if [[ -z "$REMOTE_DIR" || -z "$STAGING_URL" ]]; then
  echo "Set STAGING_DOCROOT and STAGING_WP_URL in secrets/acso.env" >&2
  exit 1
fi
case "$REMOTE_DIR" in
  *public_html*) echo "Refusing prod path: $REMOTE_DIR" >&2; exit 1 ;;
esac

# cPanel: path relative to account home (not filesystem root)
TARGET="${REMOTE_DIR#/}"  # strip mistaken leading /
TARGET="${TARGET%/}/ui"

SSH_BASE=(ssh -i "${SSH_KEY_PATH}" -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new -o BatchMode=yes)
RSYNC_SSH="ssh -i ${SSH_KEY_PATH} -p ${SSH_PORT} -o StrictHostKeyChecking=accept-new -o BatchMode=yes"

echo "Deploy prototype → ${SSH_USER}@${SSH_HOST}:~/${TARGET}"

REMOTE_HAS_RSYNC="$("${SSH_BASE[@]}" "${SSH_USER}@${SSH_HOST}" "command -v rsync" 2>/dev/null || true)"
if [[ -n "$REMOTE_HAS_RSYNC" ]]; then
  rsync -avz --delete -e "$RSYNC_SSH" \
    --exclude '.DS_Store' \
    "$ROOT/prototype/" "${SSH_USER}@${SSH_HOST}:${TARGET}/"
else
  echo "Note: rsync not on server (normal on shared hosting); using tar stream over SSH." >&2
  # Stream gzip tar through SSH; files land unpacked — no .tar.gz saved on disk.
  COPYFILE_DISABLE=1 tar czf - --exclude '.DS_Store' --exclude '._*' -C "$ROOT/prototype" . | \
    "${SSH_BASE[@]}" "${SSH_USER}@${SSH_HOST}" "mkdir -p ${TARGET} && cd ${TARGET} && tar xzf -"
fi

echo "Open: ${STAGING_URL}ui/"
