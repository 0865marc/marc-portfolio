#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-/home/agent/.hermes/marc-portfolio-github-webhook.env}"

fail() {
  printf 'start-github-webhook: %s\n' "$*" >&2
  exit 1
}

[[ -f "$ENV_FILE" && ! -L "$ENV_FILE" ]] || fail "missing regular env file: $ENV_FILE"
[[ "$(stat -c '%a' "$ENV_FILE")" == "600" ]] || fail "env file must have mode 0600: $ENV_FILE"
[[ "$(stat -c '%u' "$ENV_FILE")" == "$(id -u)" ]] || fail "env file must be owned by the current user: $ENV_FILE"

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

[[ -n "${GITHUB_WEBHOOK_SECRET:-}" ]] || fail "GITHUB_WEBHOOK_SECRET is required in $ENV_FILE"

PRODUCTION_DIR="${PRODUCTION_DIR:-/home/agent/deployments/marc-portfolio-production}"
SERVER_SCRIPT="${MARC_PORTFOLIO_WEBHOOK_SERVER_SCRIPT:-$PRODUCTION_DIR/ops/github_webhook_server.py}"
PORT="${MARC_PORTFOLIO_WEBHOOK_PORT:-9003}"
LOG_FILE="${MARC_PORTFOLIO_WEBHOOK_LOG:-/home/agent/.hermes/logs/marc-portfolio-github-webhook.log}"
PID_FILE="${MARC_PORTFOLIO_WEBHOOK_PID_FILE:-/home/agent/.hermes/run/marc-portfolio-github-webhook.pid}"
START_LOCK="${MARC_PORTFOLIO_WEBHOOK_START_LOCK:-/tmp/marc-portfolio-github-webhook-start.lock}"
HEALTH_URL="http://127.0.0.1:$PORT/health"
PID_PATTERN="python3 $SERVER_SCRIPT"

command -v curl >/dev/null 2>&1 || fail "curl is required"
command -v flock >/dev/null 2>&1 || fail "flock is required"
command -v python3 >/dev/null 2>&1 || fail "python3 is required"
[[ -d "$PRODUCTION_DIR/.git" ]] || fail "production checkout not found: $PRODUCTION_DIR"
[[ -f "$SERVER_SCRIPT" ]] || fail "webhook server script not found: $SERVER_SCRIPT"

mkdir -p "$(dirname "$LOG_FILE")" "$(dirname "$PID_FILE")"

if curl --fail --silent --max-time 2 "$HEALTH_URL" >/dev/null; then
  exit 0
fi

exec 9>"$START_LOCK"
flock -n 9 || exit 0

if curl --fail --silent --max-time 2 "$HEALTH_URL" >/dev/null; then
  exit 0
fi
if [[ -r "$PID_FILE" ]] && kill -0 "$(<"$PID_FILE")" 2>/dev/null; then
  fail "receiver process exists but health check failed; inspect $LOG_FILE"
fi
if pgrep -u "$(id -u)" -f "$PID_PATTERN" >/dev/null; then
  fail "receiver process exists without a healthy endpoint; inspect $LOG_FILE"
fi

cd "$PRODUCTION_DIR"
nohup python3 "$SERVER_SCRIPT" >>"$LOG_FILE" 2>&1 </dev/null &
pid=$!
printf '%s\n' "$pid" >"$PID_FILE"

for attempt in $(seq 1 10); do
  if curl --fail --silent --max-time 2 "$HEALTH_URL" >/dev/null; then
    exit 0
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    fail "receiver exited during startup; inspect $LOG_FILE"
  fi
  sleep 1
done

fail "receiver did not become healthy at $HEALTH_URL; inspect $LOG_FILE"
