#!/usr/bin/env bash
set -Eeuo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
tmp=$(mktemp -d); trap 'rm -rf -- "$tmp"' EXIT
mkdir -p "$tmp/bin" "$tmp/available" "$tmp/enabled" "$tmp/backups"
cp "$root/tests/fixtures/nginx-certbot-live.conf" "$tmp/available/portfolio.mybrawl.io"
ln -s "$tmp/available/portfolio.mybrawl.io" "$tmp/enabled/portfolio.mybrawl.io"
cat >"$tmp/bin/nginx" <<'EOF'
#!/usr/bin/env bash
set -eu
printf 'nginx %s\n' "$*" >>"$FAKE_LOG"
if [[ ${FAKE_NGINX_FAIL_ACTIVE_ONCE:-0} == 1 && " $* " != *' -c '* && ! -e "$FAKE_STATE/nginx-failed" ]]; then touch "$FAKE_STATE/nginx-failed"; exit 1; fi
exit 0
EOF
cat >"$tmp/bin/systemctl" <<'EOF'
#!/usr/bin/env bash
set -eu
printf 'systemctl %s\n' "$*" >>"$FAKE_LOG"
if [[ ${FAKE_RELOAD_FAIL_ONCE:-0} == 1 && ! -e "$FAKE_STATE/reload-failed" ]]; then touch "$FAKE_STATE/reload-failed"; exit 1; fi
exit 0
EOF
chmod +x "$tmp/bin/nginx" "$tmp/bin/systemctl"
export FAKE_LOG="$tmp/actions.log" FAKE_STATE="$tmp"
script="$root/ops/activate-nginx-static.sh"; current="$tmp/available/portfolio.mybrawl.io"; enabled="$tmp/enabled/portfolio.mybrawl.io"; candidate="$root/ops/nginx/portfolio.mybrawl.io.certbot.conf"
current_sha=$(sha256sum "$current"|awk '{print $1}'); candidate_sha=$(sha256sum "$candidate"|awk '{print $1}')
common=(--current "$current" --enabled "$enabled" --candidate "$candidate" --backup-dir "$tmp/backups" --nginx "$tmp/bin/nginx" --systemctl "$tmp/bin/systemctl" --test-mode)

"$script" check "${common[@]}" --expected-current-sha256 "$current_sha" --expected-candidate-sha256 "$candidate_sha"
if "$script" check "${common[@]}" --expected-current-sha256 "$(printf '0%.0s' {1..64})" --expected-candidate-sha256 "$candidate_sha"; then echo 'drift check unexpectedly passed' >&2; exit 1; fi
[[ "$(readlink -f "$enabled")" == "$(realpath "$current")" ]]

FAKE_NGINX_FAIL_ACTIVE_ONCE=1 "$script" activate "${common[@]}" --expected-current-sha256 "$current_sha" --expected-candidate-sha256 "$candidate_sha" && { echo 'failed validation activation unexpectedly passed' >&2; exit 1; }
[[ "$(sha256sum "$current"|awk '{print $1}')" == "$current_sha" ]]
rm -f "$tmp/nginx-failed"

FAKE_RELOAD_FAIL_ONCE=1 "$script" activate "${common[@]}" --expected-current-sha256 "$current_sha" --expected-candidate-sha256 "$candidate_sha" && { echo 'failed reload activation unexpectedly passed' >&2; exit 1; }
[[ "$(sha256sum "$current"|awk '{print $1}')" == "$current_sha" ]]
rm -f "$tmp/reload-failed"

activation=$("$script" activate "${common[@]}" --expected-current-sha256 "$current_sha" --expected-candidate-sha256 "$candidate_sha")
[[ "$(sha256sum "$current"|awk '{print $1}')" == "$candidate_sha" ]]
backup=$(sed -n 's/.*backup=\([^ ]*\).*/\1/p' <<<"$activation"); backup_sha=$(sha256sum "$backup"|awk '{print $1}')
[[ "$backup_sha" == "$current_sha" && "$(readlink -f "$enabled")" == "$(realpath "$current")" ]]
"$script" rollback "${common[@]}" --backup "$backup" --expected-current-sha256 "$candidate_sha" --expected-candidate-sha256 "$candidate_sha" --expected-active-sha256 "$candidate_sha" --expected-backup-sha256 "$backup_sha"
[[ "$(sha256sum "$current"|awk '{print $1}')" == "$current_sha" ]]
grep -q 'systemctl reload nginx' "$FAKE_LOG"
printf 'nginx activation check/drift/validation/backup/install/rollback/reload tests passed\n'
