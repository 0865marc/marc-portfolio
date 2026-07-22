#!/usr/bin/env bash
set -Eeuo pipefail
dist='dist'; nginx_bin='/usr/sbin/nginx'; while (($#));do case "$1" in --dist)dist="$2";shift 2;;--nginx)nginx_bin="$2";shift 2;;*)exit 2;;esac;done
[[ -d "$dist" && -x "$nginx_bin" ]]||{ echo 'dist or nginx unavailable' >&2;exit 2;}; dist="$(realpath "$dist")"; tmp="$(mktemp -d)"; pid='';cleanup(){ [[ -n "$pid" ]]&&kill "$pid" 2>/dev/null||true;rm -rf -- "$tmp";};trap cleanup EXIT
mkdir -p "$tmp/logs";cp /etc/nginx/mime.types "$tmp/mime.types";sed "s|DIST_ROOT|$dist|g" tests/fixtures/nginx.conf >"$tmp/nginx.conf";"$nginx_bin" -t -p "$tmp/" -c nginx.conf;"$nginx_bin" -p "$tmp/" -c nginx.conf & pid=$!
for _ in {1..30};do curl -fsS http://127.0.0.1:18088/ >/dev/null&&break;sleep .1;done
for p in / /blog/ /blog/arquitecturas-plataformas-iot/ /blog/rabbitmq-celery-procesos-pesados/ /blog/infraestructura-distribuida-latencia/;do [[ "$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:18088$p")" == 200 ]];done
body="$tmp/missing";[[ "$(curl -sS -o "$body" -w '%{http_code}' http://127.0.0.1:18088/missing)" == 404 ]];grep -Fq 'Página no encontrada' "$body";curl -sSI http://127.0.0.1:18088/404.html|grep -qi '404';echo 'isolated nginx route/status matrix passed'
