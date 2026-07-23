#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE="${1:?usage: verify-container-image.sh <image>}"
CONTAINER="marc-portfolio-smoke-$$-$RANDOM"
BODY_FILE="$(mktemp)"

cleanup() {
    docker rm --force "$CONTAINER" >/dev/null 2>&1 || true
    rm -f -- "$BODY_FILE"
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
grep -Fq '<title>Marc — Director de proyectos y desarrollador fullstack</title>' "$BODY_FILE"

for path in / /blog/ /blog/arquitecturas-plataformas-iot/; do
    status="$(curl --silent --show-error --max-time 5 --output "$BODY_FILE" --write-out '%{http_code}' "http://127.0.0.1:$PORT$path")"
    [[ "$status" == '200' ]] || { echo "$path returned HTTP $status" >&2; exit 1; }
done

for path in /404.html /missing; do
    status="$(curl --silent --show-error --max-time 5 --output "$BODY_FILE" --write-out '%{http_code}' "http://127.0.0.1:$PORT$path")"
    [[ "$status" == '404' ]] || { echo "$path returned HTTP $status" >&2; exit 1; }
    grep -Fq 'Página no encontrada' "$BODY_FILE"
done

asset="$(docker exec "$CONTAINER" sh -c 'find /usr/share/nginx/html/assets -type f | head -n 1')"
asset="${asset#/usr/share/nginx/html}"
curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT$asset" | grep -Eqi '^cache-control:.*immutable'
curl --silent --show-error --head --max-time 5 "http://127.0.0.1:$PORT/index.html" | grep -Eqi '^cache-control:.*no-cache'

healthcheck="$(docker inspect --format '{{json .Config.Healthcheck.Test}}' "$CONTAINER")"
[[ "$healthcheck" != 'null' ]] || { echo 'container image has no healthcheck' >&2; exit 1; }

printf 'container smoke test passed image=%s port=%s\n' "$IMAGE" "$PORT"
