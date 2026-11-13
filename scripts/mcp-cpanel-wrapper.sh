#!/usr/bin/env bash
# MCP stdio launcher: credentials from secrets/acso.env (never commit tokens).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ACSO_ENV:-$ROOT/secrets/acso.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "cpanel MCP: missing $ENV_FILE (copy from secrets/acso.env.example)" >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

cpanel_host="${CPANEL_HOST:-}"
cpanel_port="${CPANEL_PORT:-2083}"

if [[ -z "$cpanel_host" && -n "${CPANEL_URL:-}" ]]; then
  u="${CPANEL_URL#https://}"
  u="${u#http://}"
  u="${u%%/*}"
  if [[ "$u" == *:* ]]; then
    cpanel_port="${u##*:}"
    cpanel_host="${u%%:*}"
  else
    cpanel_host="$u"
  fi
fi

export CPANEL_HOST="$cpanel_host"
export CPANEL_PORT="$cpanel_port"
export CPANEL_USER="${CPANEL_USER:-}"
export CPANEL_TOKEN="${CPANEL_API_TOKEN:-${CPANEL_TOKEN:-}}"

if [[ -z "$CPANEL_HOST" || -z "$CPANEL_USER" || -z "$CPANEL_TOKEN" ]]; then
  echo "cpanel MCP: set CPANEL_URL (or CPANEL_HOST), CPANEL_USER, CPANEL_API_TOKEN in $ENV_FILE" >&2
  echo "Create token: cPanel → Security → Manage API Tokens" >&2
  exit 1
fi

exec npx -y "mcp-cpanel-api@${MCP_CPANEL_VERSION:-1.0.2}"
