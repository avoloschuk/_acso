#!/usr/bin/env bash
# Upload prototype/ to staging document root (static design approval).
# Requires: secrets/acso.env with NEW_STAGING_URL and SSH or RSYNC target.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
set -a
# shellcheck source=/dev/null
source "$ROOT/secrets/acso.env"
set +a

SRC="$ROOT/prototype/"
if [[ -z "${NEW_STAGING_URL:-}" ]]; then
  echo "Set NEW_STAGING_URL in secrets/acso.env (e.g. https://new.samoorg.com.ua/)" >&2
  exit 1
fi

if [[ -n "${NEW_SSH_HOST:-}" && -n "${NEW_SSH_USER:-}" && -n "${NEW_STAGING_DOCROOT:-}" ]]; then
  RSYNC_SSH="ssh -i ${NEW_SSH_KEY_PATH:-~/.ssh/id_ed25519} -p ${NEW_SSH_PORT:-22}"
  echo "Deploying via rsync to ${NEW_SSH_USER}@${NEW_SSH_HOST}:${NEW_STAGING_DOCROOT}"
  rsync -avz --delete -e "$RSYNC_SSH" "$SRC" "${NEW_SSH_USER}@${NEW_SSH_HOST}:${NEW_STAGING_DOCROOT}/"
  echo "Done. Open: ${NEW_STAGING_URL}"
  exit 0
fi

echo "SSH not configured. Manual: cPanel File Manager → subdomain docroot → upload contents of prototype/" >&2
echo "  Local folder: $SRC" >&2
echo "  Target URL:   ${NEW_STAGING_URL}" >&2
exit 2
