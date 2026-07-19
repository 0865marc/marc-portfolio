#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist"
DEPLOY_ROOT="/var/www/portfolio.mybrawl.io"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_LINK="$DEPLOY_ROOT/current"

fail() {
    printf 'deploy-static: %s\n' "$*" >&2
    exit 1
}

command -v git >/dev/null 2>&1 || fail 'git is required'
command -v rsync >/dev/null 2>&1 || fail 'rsync is required'

[[ -r "$DIST_DIR/index.html" ]] || fail "missing or unreadable $DIST_DIR/index.html"
[[ -d "$DEPLOY_ROOT" && -w "$DEPLOY_ROOT" ]] || fail "deployment root is missing or not writable: $DEPLOY_ROOT"
[[ -d "$RELEASES_DIR" && -w "$RELEASES_DIR" ]] || fail "releases directory is missing or not writable: $RELEASES_DIR"

if [[ -e "$CURRENT_LINK" && ! -L "$CURRENT_LINK" ]]; then
    fail "refusing to replace non-symlink current path: $CURRENT_LINK"
fi

previous_target='<none>'
if [[ -L "$CURRENT_LINK" ]]; then
    previous_target="$(readlink -f -- "$CURRENT_LINK" 2>/dev/null || readlink -- "$CURRENT_LINK")"
fi

short_sha="$(git -C "$PROJECT_ROOT" rev-parse --short=12 HEAD)" || fail 'could not determine the current git SHA'
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
release="$RELEASES_DIR/${timestamp}-${short_sha}"
suffix=0
while [[ -e "$release" || -L "$release" ]]; do
    suffix=$((suffix + 1))
    release="$RELEASES_DIR/${timestamp}-${short_sha}-${suffix}"
done
mkdir -- "$release"

temporary_link="$DEPLOY_ROOT/.current.$$"
cleanup() {
    if [[ -L "$temporary_link" ]]; then
        rm -f -- "$temporary_link"
    fi
}
trap cleanup EXIT

rsync -a --delete --chmod=D755,F644 "$DIST_DIR/" "$release/"
[[ -s "$release/index.html" ]] || fail "copied index.html is empty: $release/index.html"

printf 'Previous release: %s\n' "$previous_target"
ln -s -- "$release" "$temporary_link"
mv -Tf -- "$temporary_link" "$CURRENT_LINK"

trap - EXIT
printf 'Activated release: %s\n' "$release"
