#!/usr/bin/env bash
# Sync prototype → acso-child assets (run from repo root after UI changes).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEME="$ROOT/wp-content/themes/acso-child"
mkdir -p "$THEME/assets/"{css,js,data,fonts,img}
cp "$ROOT/prototype/style.css" "$THEME/assets/css/main.css"
# Theme CSS lives under assets/css/ — fonts one level up.
if [[ "$(uname)" == Darwin ]]; then
  sed -i '' "s|url('fonts/|url('../fonts/|g" "$THEME/assets/css/main.css"
else
  sed -i "s|url('fonts/|url('../fonts/|g" "$THEME/assets/css/main.css"
fi
cp "$ROOT/prototype/js/"*.js "$THEME/assets/js/"
cp "$ROOT/prototype/data/"*.json "$THEME/assets/data/" 2>/dev/null || true
cp "$ROOT/prototype/fonts/"*.woff2 "$THEME/assets/fonts/" 2>/dev/null || true
cp "$ROOT/prototype/logo_mark"*.png "$THEME/assets/img/" 2>/dev/null || true
echo "Synced prototype → $THEME/assets"
