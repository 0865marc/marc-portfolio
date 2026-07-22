#!/usr/bin/env bash
set -Eeuo pipefail

domain='portfolio.mybrawl.io'
action=${1:-}; [[ -n "$action" ]] && shift || true
current="/etc/nginx/sites-available/$domain"
enabled="/etc/nginx/sites-enabled/$domain"
candidate="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/nginx/$domain.certbot.conf"
backup_dir='/etc/nginx/sites-available'
nginx_bin='/usr/sbin/nginx'
systemctl_bin='/usr/bin/systemctl'
expected_current=''; expected_candidate=''; expected_active=''; expected_backup=''; backup=''; test_mode=0
enabled_explicit=0

usage(){ printf 'Usage: %s {check|activate|rollback} --expected-current-sha256 SHA --expected-candidate-sha256 SHA [options]\n' "$0" >&2; }
fail(){ printf 'activate-nginx-static: %s\n' "$*" >&2; exit 1; }
sha(){ sha256sum -- "$1" | awk '{print $1}'; }
while (($#)); do
  case "$1" in
    --current) current=$2; shift 2;; --enabled) enabled=$2; enabled_explicit=1; shift 2;;
    --candidate) candidate=$2; shift 2;; --backup-dir) backup_dir=$2; shift 2;;
    --backup) backup=$2; shift 2;; --nginx) nginx_bin=$2; shift 2;;
    --systemctl) systemctl_bin=$2; shift 2;;
    --expected-current-sha256) expected_current=$2; shift 2;;
    --expected-candidate-sha256) expected_candidate=$2; shift 2;;
    --expected-active-sha256) expected_active=$2; shift 2;;
    --expected-backup-sha256) expected_backup=$2; shift 2;;
    --test-mode) test_mode=1; shift;; *) usage; fail "unknown option: $1";;
  esac
done
[[ "$action" =~ ^(check|activate|rollback)$ ]] || { usage; exit 2; }
[[ "$expected_current" =~ ^[0-9a-f]{64}$ ]] || fail 'an exact expected current SHA-256 is required'
[[ "$expected_candidate" =~ ^[0-9a-f]{64}$ ]] || fail 'an exact expected candidate SHA-256 is required'
[[ -f "$current" && ! -L "$current" ]] || fail "current site must be a regular file: $current"
[[ -f "$candidate" && ! -L "$candidate" ]] || fail "candidate must be a regular file: $candidate"
current=$(realpath -- "$current"); candidate=$(realpath -- "$candidate")
[[ "$(sha "$current")" == "$expected_current" ]] || fail 'live configuration digest drifted'
[[ "$(sha "$candidate")" == "$expected_candidate" ]] || fail 'candidate configuration digest is not approved'

required=(
  'server_name portfolio.mybrawl.io;' 'root /var/www/portfolio.mybrawl.io/current;'
  'listen 443 ssl; # managed by Certbot' 'listen [::]:443 ssl; # managed by Certbot'
  'ssl_certificate /etc/letsencrypt/live/portfolio.mybrawl.io/fullchain.pem; # managed by Certbot'
  'ssl_certificate_key /etc/letsencrypt/live/portfolio.mybrawl.io/privkey.pem; # managed by Certbot'
  'include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot'
  'ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot'
  'return 301 https://$host$request_uri;' 'return 404; # managed by Certbot'
)
for directive in "${required[@]}"; do grep -Fq -- "$directive" "$current" || fail "current site lacks required directive: $directive"; grep -Fq -- "$directive" "$candidate" || fail "candidate lacks required directive: $directive"; done
grep -Fq 'try_files $uri $uri/ =404;' "$candidate" || fail 'candidate lacks static route semantics'
grep -Fq 'error_page 404 /404.html;' "$candidate" || fail 'candidate lacks designed 404 semantics'

if (( test_mode && ! enabled_explicit )); then
  : # Fixture-only checks may omit the production enabled path explicitly.
elif [[ -e "$enabled" || -L "$enabled" ]]; then
  [[ -L "$enabled" ]] || fail "enabled site is not a symlink: $enabled"
  [[ "$(readlink -f -- "$enabled")" == "$(realpath -- "$current")" ]] || fail 'enabled symlink target is unexpected'
elif (( ! test_mode )); then fail "enabled site symlink is missing: $enabled"; fi

top=$(mktemp); validation_candidate=$candidate; sanitized=''
if (( test_mode )); then
  sanitized=$(mktemp)
  sed -E '/^[[:space:]]*(listen |ssl_certificate |ssl_certificate_key |include \/etc\/letsencrypt|ssl_dhparam \/etc\/letsencrypt)/d; s/^server \{/server { listen 127.0.0.1:18089;/' "$candidate" >"$sanitized"
  validation_candidate=$sanitized
fi
trap 'rm -f -- "$top" "$sanitized"' EXIT
printf 'pid %s.pid;\nerror_log stderr;\nevents {}\nhttp { access_log off; include %s; }\n' "$top" "$validation_candidate" >"$top"
"$nginx_bin" -t -c "$top" >/dev/null || fail 'candidate syntax validation failed'
if [[ "$action" == check ]]; then printf 'check passed current=%s candidate=%s\n' "$(sha "$current")" "$(sha "$candidate")"; exit 0; fi
if (( ! test_mode && ${EUID:-$(id -u)} != 0 )); then fail 'mutating production mode requires root'; fi

reload(){ "$systemctl_bin" reload nginx; }
validate_active(){ "$nginx_bin" -t; }
restore(){ install -o "$(stat -c %u "$current")" -g "$(stat -c %g "$current")" -m 0644 -- "$1" "$current"; validate_active && reload; }

if [[ "$action" == activate ]]; then
  mkdir -p -- "$backup_dir"
  stamp=$(date -u +%Y%m%dT%H%M%SZ); backup="$backup_dir/$domain.$stamp.$$.bak"
  install -m 0644 -- "$current" "$backup"
  backup_sha=$(sha "$backup")
  tmp="$current.new.$$"; install -m 0644 -- "$candidate" "$tmp"; mv -fT -- "$tmp" "$current"
  if ! validate_active || ! reload; then
    restore "$backup" || fail "activation failed and automatic restore failed; backup=$backup sha256=$backup_sha"
    fail "activation failed; restored backup=$backup sha256=$backup_sha"
  fi
  printf 'activated active_sha256=%s backup=%s backup_sha256=%s\n' "$(sha "$current")" "$backup" "$backup_sha"
else
  [[ -n "$backup" && -f "$backup" && ! -L "$backup" ]] || fail 'rollback requires a regular --backup file'
  [[ "$expected_active" =~ ^[0-9a-f]{64}$ && "$expected_backup" =~ ^[0-9a-f]{64}$ ]] || fail 'rollback requires expected active and backup SHA-256 values'
  [[ "$(sha "$current")" == "$expected_active" ]] || fail 'active digest does not match rollback approval'
  [[ "$(sha "$backup")" == "$expected_backup" ]] || fail 'backup digest does not match rollback approval'
  restore "$backup" || fail 'rollback validation or reload failed'
  printf 'rolled back active_sha256=%s backup=%s\n' "$(sha "$current")" "$backup"
fi
