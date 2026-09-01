#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE="${1:?usage: verify-container-image.sh <image>}"
CONTAINER="marc-portfolio-smoke-$$-$RANDOM"
BODY_FILE="$(mktemp)"
HEADERS_FILE="$(mktemp)"

cleanup() {
    docker rm --force "$CONTAINER" >/dev/null 2>&1 || true
    rm -f -- "$BODY_FILE" "$HEADERS_FILE"
}
trap cleanup EXIT

docker run --detach --name "$CONTAINER" --publish 127.0.0.1::8080 "$IMAGE" >/dev/null

PORT=''
for _ in $(seq 1 30); do
    PORT="$(docker port "$CONTAINER" 8080/tcp 2>/dev/null | awk -F: 'NR == 1 { print $NF }')"
    if [[ -n "$PORT" ]] && curl --silent --fail --max-time 2 "http://127.0.0.1:$PORT/" > "$BODY_FILE"; then
        break
    fi
    sleep 1
done

[[ -n "$PORT" ]] || { echo 'container did not publish port 8080' >&2; exit 1; }
grep -Fq 'Marc Teixidó' "$BODY_FILE"
grep -Fq 'Ainkii' "$BODY_FILE"
grep -Fvq '/admin/' "$BODY_FILE"

for path in / /roadmap/ /career-sprint-daily/ /career-sprint-daily/2026-08-24/ /career-sprint-daily/2026-08-25/ /proyectos/ainkii/ /blog/ /admin/ /robots.txt /sitemap.xml /og-card.png; do
    status="$(curl --silent --show-error --max-time 5 --output "$BODY_FILE" --write-out '%{http_code}' "http://127.0.0.1:$PORT$path")"
    [[ "$status" == '200' ]] || { echo "$path returned HTTP $status" >&2; exit 1; }
done

PUBLISHED_BLOG_PATH="$(
    curl --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/sitemap.xml" |
        python3 -c 'import re, sys; matches = re.findall(r"<loc>https://portfolio\.mybrawl\.io(/blog/[^<]+)</loc>", sys.stdin.read()); print(matches[0] if matches else "")'
)"
if [[ -n "$PUBLISHED_BLOG_PATH" ]]; then
    status="$(curl --silent --show-error --max-time 5 --output "$BODY_FILE" --write-out '%{http_code}' "http://127.0.0.1:$PORT$PUBLISHED_BLOG_PATH")"
    [[ "$status" == '200' ]] || { echo "$PUBLISHED_BLOG_PATH returned HTTP $status" >&2; exit 1; }
fi

for path in \
    /blog/entorno-reproducible-con-agentes/ \
    /blog/setup-pi-orquestacion-subagentes/ \
    /blog/hermes-agent-hetzner-instalacion-segura/ \
    /blog/pi-orquestacion-subagentes/ \
    /blog/arquitecturas-plataformas-iot/ \
    /blog/rabbitmq-celery-procesos-pesados/ \
    /blog/infraestructura-distribuida-latencia/ \
    /404.html \
    /progreso/ \
    /progreso/2026-08-24/ \
    /progreso/2026-08-25/ \
    /missing; do
    status="$(curl --silent --show-error --max-time 5 --output "$BODY_FILE" --write-out '%{http_code}' "http://127.0.0.1:$PORT$path")"
    [[ "$status" == '404' ]] || { echo "$path returned HTTP $status" >&2; exit 1; }
    grep -Fq 'No encuentro esa página' "$BODY_FILE"
    grep -Fq 'Parece que esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o continuar por el Career Sprint.' "$BODY_FILE"
    grep -Fq 'Ver el Career Sprint' "$BODY_FILE"
done

while IFS= read -r asset; do
    asset="${asset#/usr/share/nginx/html}"
    curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT$asset" | grep -Eqi '^cache-control:.*immutable'
done < <(docker exec "$CONTAINER" find /usr/share/nginx/html/assets -type f)
curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT/index.html" | grep -Eqi '^cache-control:.*no-cache'

public_paths=(/ /roadmap/ /career-sprint-daily/ /career-sprint-daily/2026-08-24/ /career-sprint-daily/2026-08-25/ /proyectos/ainkii/ /blog/ /missing)
if [[ -n "$PUBLISHED_BLOG_PATH" ]]; then
    public_paths+=("$PUBLISHED_BLOG_PATH")
fi
for path in "${public_paths[@]}"; do
    curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT$path" > "$HEADERS_FILE"
    grep -Eqi "^content-security-policy:.*default-src 'self'.*frame-ancestors 'none'" "$HEADERS_FILE"
    grep -Eqi '^cross-origin-opener-policy: *same-origin[[:space:]]*$' "$HEADERS_FILE"
    grep -Eqi '^cross-origin-resource-policy: *same-origin' "$HEADERS_FILE"
    grep -Eqi '^permissions-policy:.*camera=\(\).*geolocation=\(\).*microphone=\(\)' "$HEADERS_FILE"
    grep -Eqi '^referrer-policy: *strict-origin-when-cross-origin' "$HEADERS_FILE"
    grep -Eqi '^x-content-type-options: *nosniff' "$HEADERS_FILE"
    grep -Eqi '^x-frame-options: *DENY' "$HEADERS_FILE"
done

curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT/admin/" > "$HEADERS_FILE"
grep -Eqi '^cache-control: *no-store' "$HEADERS_FILE"
grep -Eqi '^x-robots-tag: *noindex, nofollow' "$HEADERS_FILE"
grep -Eqi "^content-security-policy:.*connect-src.*https://api\.github\.com.*https://cms-auth\.portfolio\.mybrawl\.io" "$HEADERS_FILE"
grep -Eqi '^cross-origin-opener-policy: *same-origin-allow-popups[[:space:]]*$' "$HEADERS_FILE"
grep -Eqi '^cross-origin-resource-policy: *same-origin' "$HEADERS_FILE"
grep -Eqi '^permissions-policy:.*camera=\(\).*geolocation=\(\).*microphone=\(\)' "$HEADERS_FILE"
grep -Eqi '^referrer-policy: *strict-origin-when-cross-origin' "$HEADERS_FILE"
grep -Eqi '^x-content-type-options: *nosniff' "$HEADERS_FILE"
grep -Eqi '^x-frame-options: *DENY' "$HEADERS_FILE"
curl --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/admin/" > "$BODY_FILE"
grep -Fq 'content="noindex,nofollow"' "$BODY_FILE"
grep -Fq 'src="./bootstrap.js"' "$BODY_FILE"
grep -Fq 'src="./sveltia-cms.js"' "$BODY_FILE"
for path in \
    /admin/bootstrap.js \
    /admin/sveltia-cms.js \
    /admin/sveltia-cms-package.json \
    /admin/locales/es-CO.json \
    /admin/locales/es.json \
    /admin/fonts/source-sans-3-latin-wght-normal.woff2 \
    /admin/fonts/noto-mono-latin-400-normal.woff2 \
    /admin/fonts/material-symbols-outlined-latin-wght-normal.woff2; do
    curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT$path" | grep -Eqi '^cache-control: *no-store'
done

curl --silent --show-error --header 'Accept-Encoding: gzip' --dump-header "$HEADERS_FILE" --output "$BODY_FILE" --max-time 5 "http://127.0.0.1:$PORT/"
grep -Eqi '^content-encoding: *gzip' "$HEADERS_FILE"

curl --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/robots.txt" > "$BODY_FILE"
grep -Fq 'Disallow: /admin/' "$BODY_FILE"
grep -Fq 'Sitemap: https://portfolio.mybrawl.io/sitemap.xml' "$BODY_FILE"
curl --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/sitemap.xml" > "$BODY_FILE"
grep -Fq '<loc>https://portfolio.mybrawl.io/proyectos/ainkii/</loc>' "$BODY_FILE"
grep -Fq '<loc>https://portfolio.mybrawl.io/roadmap/</loc>' "$BODY_FILE"
grep -Fq '<loc>https://portfolio.mybrawl.io/career-sprint-daily/</loc>' "$BODY_FILE"
grep -Fq '<loc>https://portfolio.mybrawl.io/career-sprint-daily/2026-08-24/</loc>' "$BODY_FILE"
grep -Fq '<loc>https://portfolio.mybrawl.io/career-sprint-daily/2026-08-25/</loc>' "$BODY_FILE"
grep -Fvq '<loc>https://portfolio.mybrawl.io/progreso/' "$BODY_FILE"
if [[ -n "$PUBLISHED_BLOG_PATH" ]]; then
    grep -Fq "<loc>https://portfolio.mybrawl.io${PUBLISHED_BLOG_PATH}</loc>" "$BODY_FILE"
fi

healthcheck="$(docker inspect --format '{{json .Config.Healthcheck.Test}}' "$CONTAINER")"
[[ "$healthcheck" != 'null' ]] || { echo 'container image has no healthcheck' >&2; exit 1; }

printf 'container smoke test passed image=%s port=%s published=%s\n' "$IMAGE" "$PORT" "$PUBLISHED_BLOG_PATH"
