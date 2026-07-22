#!/usr/bin/env bash
set -Eeuo pipefail

# Build and atomically publish marc-portfolio from its dedicated production checkout.
PRODUCTION_DIR="${PRODUCTION_DIR:-/home/agent/deployments/marc-portfolio-production}"
LOCK_FILE="${LOCK_FILE:-/tmp/marc-portfolio-production-deploy.lock}"
DOMAIN="portfolio.mybrawl.io"
DEPLOY_ROOT="/var/www/$DOMAIN"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_LINK="$DEPLOY_ROOT/current"
EXPECTED_MARKER='<title>Marc — Director de proyectos y desarrollador fullstack</title>'
BRANCH="main"
REQUIRED_FILES=(
  "package.json"
  "package-lock.json"
  "astro.config.mjs"
  "src/pages/index.astro"
  "scripts/verify-static-output.mjs"
  "ops/deploy-static.sh"
  "ops/auto-deploy-production.sh"
)

ts() {
  date -u +'%Y-%m-%dT%H:%M:%SZ'
}

log() {
  printf '[%s] %s\n' "$(ts)" "$*"
}

fail() {
  printf '[%s] ERROR: %s\n' "$(ts)" "$*" >&2
  exit 1
}

require_files() {
  local path
  for path in "${REQUIRED_FILES[@]}"; do
    [[ -f "$path" ]] || fail "missing required file in $PRODUCTION_DIR: $path"
  done
  [[ -x ops/deploy-static.sh ]] || fail "ops/deploy-static.sh must be executable"
}

command -v flock >/dev/null 2>&1 || fail "flock is required"
command -v git >/dev/null 2>&1 || fail "git is required"
command -v npm >/dev/null 2>&1 || fail "npm is required"
command -v curl >/dev/null 2>&1 || fail "curl is required"
command -v grep >/dev/null 2>&1 || fail "grep is required"
command -v readlink >/dev/null 2>&1 || fail "readlink is required"

exec 9>"$LOCK_FILE"
flock -n 9 || fail "another marc-portfolio production deploy is already running"

[[ -d "$PRODUCTION_DIR/.git" ]] || fail "PRODUCTION_DIR is not a git checkout: $PRODUCTION_DIR"
cd "$PRODUCTION_DIR"
require_files

current_branch="$(git branch --show-current)"
[[ "$current_branch" == "$BRANCH" ]] || fail "expected branch $BRANCH, got ${current_branch:-detached HEAD}"

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  git status --short --untracked-files=no >&2
  fail "tracked local changes found in $PRODUCTION_DIR; refusing to overwrite them"
fi

log "Fetching origin/$BRANCH"
git fetch --prune origin "$BRANCH"
git rev-parse --verify --quiet "refs/remotes/origin/$BRANCH" >/dev/null \
  || fail "origin/$BRANCH was not found after fetch"

log "Resetting the dedicated production checkout to origin/$BRANCH"
git reset --hard "origin/$BRANCH"
require_files

log "Installing locked frontend dependencies"
npm ci --no-audit --no-fund

log "Building the production static bundle"
npm run build
[[ -s dist/index.html ]] || fail "build did not create a non-empty dist/index.html"
node scripts/verify-static-output.mjs dist
grep -Fq -- "$EXPECTED_MARKER" dist/index.html \
  || fail "built index.html does not contain the expected site marker"

log "Publishing through the existing atomic static release script"
./ops/deploy-static.sh

[[ -L "$CURRENT_LINK" ]] || fail "published current path is not a symlink: $CURRENT_LINK"
published_target="$(readlink -f -- "$CURRENT_LINK")"
case "$published_target" in
  "$RELEASES_DIR"/*) ;;
  *) fail "published target is outside the releases directory: $published_target" ;;
esac
[[ -s "$published_target/index.html" ]] || fail "published index.html is missing or empty"
grep -Fq -- "$EXPECTED_MARKER" "$published_target/index.html" \
  || fail "published index.html does not contain the expected site marker"

response_file="$(mktemp)"
cleanup() {
  rm -f -- "$response_file"
}
trap cleanup EXIT

log "Verifying the public HTTPS status and expected content"
http_status="$(curl --silent --show-error --location --max-time 20 \
  --proto '=https' --proto-redir '=https' \
  --output "$response_file" --write-out '%{http_code}' "https://$DOMAIN/")" \
  || fail "public HTTPS request failed: https://$DOMAIN/"
[[ "$http_status" == "200" ]] || fail "public HTTPS returned HTTP $http_status"
grep -Fq -- "$EXPECTED_MARKER" "$response_file" \
  || fail "public HTTPS response does not contain the expected site marker"

for public_path in /blog/ /blog/arquitecturas-plataformas-iot/ /blog/rabbitmq-celery-procesos-pesados/ /blog/infraestructura-distribuida-latencia/; do
  http_status="$(curl --silent --show-error --location --max-time 20 --proto '=https' --proto-redir '=https' --output "$response_file" --write-out '%{http_code}' "https://$DOMAIN$public_path")" || fail "public request failed: $public_path"
  [[ "$http_status" == 200 ]] || fail "public route $public_path returned $http_status"
done

log "Published release: $published_target"
log "Public HTTPS verification OK: HTTP $http_status"
log "marc-portfolio production deploy completed at $(git rev-parse --short=12 HEAD)"
