#!/usr/bin/env bash
set -euo pipefail

DOMAIN='portfolio.mybrawl.io'
ORIGIN_IPV4='178.104.235.140'
DEPLOY_ROOT="/var/www/$DOMAIN"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_LINK="$DEPLOY_ROOT/current"
NGINX_AVAILABLE_DIR='/etc/nginx/sites-available'
NGINX_ENABLED_DIR='/etc/nginx/sites-enabled'
AVAILABLE_CONFIG="$NGINX_AVAILABLE_DIR/$DOMAIN"
ENABLED_CONFIG="$NGINX_ENABLED_DIR/$DOMAIN"
BACKUP_CONFIG="$NGINX_AVAILABLE_DIR/$DOMAIN.pre-certbot"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_SOURCE="$SCRIPT_DIR/nginx/$DOMAIN.conf"
EXPECTED_TITLE='<title>Marc -- Fullstack Developer</title>'

usage() {
    printf 'Usage: %s {prepare|enable-http|enable-tls}\n' "$0" >&2
}

fail() {
    printf 'portfolio-host: %s\n' "$*" >&2
    exit 1
}

path_exists() {
    [[ -e "$1" || -L "$1" ]]
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
    fail 'must be run as root'
fi

if [[ $# -ne 1 ]]; then
    usage
    exit 2
fi

prepare() {
    if [[ -L "$DEPLOY_ROOT" || -L "$RELEASES_DIR" ]]; then
        fail 'deployment paths must not be symlinks'
    fi

    require_command install
    install -d -o agent -g www-data -m 0755 -- "$DEPLOY_ROOT" "$RELEASES_DIR"
    printf 'Prepared %s and %s as agent:www-data (0755).\n' "$DEPLOY_ROOT" "$RELEASES_DIR"
}

require_nginx_site_directories() {
    [[ -d "$NGINX_AVAILABLE_DIR" ]] || fail "missing Nginx directory: $NGINX_AVAILABLE_DIR"
    [[ -d "$NGINX_ENABLED_DIR" ]] || fail "missing Nginx directory: $NGINX_ENABLED_DIR"
}

cleanup_new_http_paths() {
    if (( created_enabled )); then
        rm -f -- "$ENABLED_CONFIG"
    fi
    if (( created_available )); then
        rm -f -- "$AVAILABLE_CONFIG"
    fi
}

enable_http() {
    require_nginx_site_directories
    require_command install
    require_command nginx
    require_command systemctl
    [[ -r "$CONFIG_SOURCE" ]] || fail "missing reviewed config: $CONFIG_SOURCE"
    [[ -s "$CURRENT_LINK/index.html" ]] || fail "missing or empty $CURRENT_LINK/index.html"

    if path_exists "$AVAILABLE_CONFIG"; then
        fail "refusing to overwrite existing site path: $AVAILABLE_CONFIG"
    fi
    if path_exists "$ENABLED_CONFIG"; then
        fail "refusing to overwrite existing site path: $ENABLED_CONFIG"
    fi

    created_available=0
    created_enabled=0
    http_success=0
    cleanup_on_failure() {
        if (( ! http_success )); then
            cleanup_new_http_paths
        fi
    }
    trap cleanup_on_failure EXIT

    install -o root -g root -m 0644 -- "$CONFIG_SOURCE" "$AVAILABLE_CONFIG"
    created_available=1
    ln -s -- "$AVAILABLE_CONFIG" "$ENABLED_CONFIG"
    created_enabled=1

    if ! nginx -t; then
        fail 'Nginx configuration validation failed; new portfolio paths were removed'
    fi

    if ! systemctl reload nginx; then
        fail 'Nginx reload failed; new portfolio paths were removed'
    fi

    http_success=1
    trap - EXIT
    printf 'Enabled HTTP site for %s.\n' "$DOMAIN"
}

validate_public_dns() {
    local resolver="$1"
    local a_records
    local aaaa_records

    if ! a_records="$(dig +short A "$DOMAIN" "@$resolver")"; then
        fail "DNS A lookup failed through $resolver"
    fi
    if [[ "$a_records" != "$ORIGIN_IPV4" ]]; then
        fail "DNS A lookup through $resolver returned '$a_records'; expected '$ORIGIN_IPV4'"
    fi

    if ! aaaa_records="$(dig +short AAAA "$DOMAIN" "@$resolver")"; then
        fail "DNS AAAA lookup failed through $resolver"
    fi
    if [[ -n "$aaaa_records" ]]; then
        fail "DNS AAAA lookup through $resolver returned '$aaaa_records'; expected no record"
    fi

    printf 'Public DNS validated through %s.\n' "$resolver"
}

enable_tls() {
    require_nginx_site_directories
    require_command dig
    require_command curl
    require_command cp
    require_command certbot
    require_command nginx
    require_command systemctl
    [[ -f "$AVAILABLE_CONFIG" ]] || fail "HTTP site config is missing: $AVAILABLE_CONFIG"
    [[ -L "$ENABLED_CONFIG" ]] || fail "HTTP site symlink is missing: $ENABLED_CONFIG"
    if path_exists "$BACKUP_CONFIG"; then
        fail "refusing to overwrite existing Certbot backup: $BACKUP_CONFIG"
    fi

    validate_public_dns '1.1.1.1'
    validate_public_dns '8.8.8.8'

    local http_body
    if ! http_body="$(curl --noproxy '*' -fsS --max-time 15 --proto '=http' "http://$DOMAIN/")"; then
        fail "public HTTP request failed: http://$DOMAIN/"
    fi
    if ! grep -Fq -- "$EXPECTED_TITLE" <<<"$http_body"; then
        fail "public HTTP response did not contain the expected page title"
    fi
    printf 'Public HTTP title validated for %s.\n' "$DOMAIN"

    cp -p -- "$AVAILABLE_CONFIG" "$BACKUP_CONFIG"
    certbot --nginx --domain "$DOMAIN" --redirect

    if ! nginx -t; then
        fail 'Nginx configuration validation failed after Certbot; reload was skipped'
    fi
    systemctl reload nginx
    printf 'TLS enabled for %s and Nginx reloaded.\n' "$DOMAIN"
}

case "$1" in
    prepare)
        prepare
        ;;
    enable-http)
        enable_http
        ;;
    enable-tls)
        enable_tls
        ;;
    *)
        usage
        exit 2
        ;;
esac
