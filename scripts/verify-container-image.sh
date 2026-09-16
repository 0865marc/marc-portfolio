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

for path in / /proyectos/ainkii/ /aprendizaje/ /robots.txt /sitemap.xml /og-card.png; do
    status="$(curl --silent --show-error --max-time 5 --output "$BODY_FILE" --write-out '%{http_code}' "http://127.0.0.1:$PORT$path")"
    [[ "$status" == '200' ]] || { echo "$path returned HTTP $status" >&2; exit 1; }
done

for path in \
    /admin/ \
    /admin/index.html \
    /admin/config.yml \
    /admin/bootstrap.js \
    /admin/sveltia-cms.js \
    /admin/sveltia-cms-package.json \
    /admin/locales/es-CO.json \
    /admin/locales/es.json \
    /admin/fonts/source-sans-3-latin-wght-normal.woff2 \
    /roadmap/ \
    /career-sprint-daily/ \
    /career-sprint-daily/2026-08-24/ \
    /career-sprint-daily/2026-08-25/ \
    /career-sprint-daily/2026-08-29/ \
    /career-sprint-daily/2026-08-31/ \
    /blog/ \
    /blog/entorno-reproducible/ \
    /blog/lo-que-decidi-no-contar-en-este-portfolio/ \
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
    grep -Fq 'Esta página no existe o ha cambiado de dirección. Puedes volver al portfolio.' "$BODY_FILE"
    grep -Fq 'Volver al portfolio' "$BODY_FILE"
done

while IFS= read -r asset; do
    asset="${asset#/usr/share/nginx/html}"
    curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT$asset" | grep -Eqi '^cache-control:.*immutable'
done < <(docker exec "$CONTAINER" find /usr/share/nginx/html/assets -type f)
curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT/index.html" | grep -Eqi '^cache-control:.*no-cache'

public_paths=(/ /admin/ /roadmap/ /career-sprint-daily/ /career-sprint-daily/2026-08-24/ /career-sprint-daily/2026-08-25/ /proyectos/ainkii/ /aprendizaje/ /blog/ /missing)
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

curl --silent --show-error --header 'Accept-Encoding: gzip' --dump-header "$HEADERS_FILE" --output "$BODY_FILE" --max-time 5 "http://127.0.0.1:$PORT/"
grep -Eqi '^content-encoding: *gzip' "$HEADERS_FILE"

curl --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/robots.txt" > "$BODY_FILE"
grep -Fq 'Sitemap: https://portfolio.mybrawl.io/sitemap.xml' "$BODY_FILE"
curl --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/sitemap.xml" > "$BODY_FILE"
if grep -Eq '/(admin|blog|roadmap|career-sprint-daily|progreso)/' "$BODY_FILE"; then
    echo 'removed route found in sitemap' >&2
    exit 1
fi
grep -Fq '<loc>https://portfolio.mybrawl.io/aprendizaje/</loc>' "$BODY_FILE"
grep -Fq '<loc>https://portfolio.mybrawl.io/proyectos/ainkii/</loc>' "$BODY_FILE"

healthcheck="$(docker inspect --format '{{json .Config.Healthcheck.Test}}' "$CONTAINER")"
[[ "$healthcheck" != 'null' ]] || { echo 'container image has no healthcheck' >&2; exit 1; }

printf 'container smoke test passed image=%s port=%s\n' "$IMAGE" "$PORT"
