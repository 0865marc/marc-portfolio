#!/usr/bin/env python3
"""Local-only GitHub webhook receiver for marc-portfolio production deploys."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, NamedTuple

HOST = "127.0.0.1"
PORT = int(os.environ.get("MARC_PORTFOLIO_WEBHOOK_PORT", "9003"))
WEBHOOK_PATH = os.environ.get(
    "MARC_PORTFOLIO_WEBHOOK_PATH", "/github-webhook-marc-portfolio"
)
MAX_BODY_BYTES = 1024 * 1024
BRANCH_REF = "refs/heads/main"
PRODUCTION_DIR = Path(
    os.environ.get(
        "PRODUCTION_DIR", "/home/agent/deployments/marc-portfolio-production"
    )
)
DEPLOY_SCRIPT = Path(
    os.environ.get(
        "MARC_PORTFOLIO_DEPLOY_SCRIPT",
        str(PRODUCTION_DIR / "ops/auto-deploy-production.sh"),
    )
)
LOG_FILE = Path(
    os.environ.get(
        "MARC_PORTFOLIO_WEBHOOK_LOG",
        "/home/agent/.hermes/logs/marc-portfolio-github-webhook.log",
    )
)


class Decision(NamedTuple):
    action: str
    status: HTTPStatus
    response: str
    ref: str
    after: str


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_log_value(value: object, max_length: int = 200) -> str:
    """Quote untrusted values so control characters cannot forge log lines."""
    text = str(value)[:max_length]
    return json.dumps(text, ensure_ascii=True)


def log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(f"[{utc_now()}] {message}\n")


def webhook_secret() -> bytes:
    secret = os.environ.get("GITHUB_WEBHOOK_SECRET", "")
    if not secret:
        raise RuntimeError("GITHUB_WEBHOOK_SECRET is required")
    return secret.encode("utf-8")


def expected_signature(body: bytes, secret: bytes | None = None) -> str:
    digest = hmac.new(secret or webhook_secret(), body, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def signature_is_valid(
    body: bytes, header_value: str | None, secret: bytes | None = None
) -> bool:
    if not header_value:
        return False
    return hmac.compare_digest(
        expected_signature(body, secret), header_value.strip()
    )


def classify_event(event: str, body: bytes) -> Decision:
    if event == "ping":
        return Decision("ping", HTTPStatus.OK, "pong", "", "")
    if event != "push":
        return Decision("ignore_event", HTTPStatus.ACCEPTED, "ignored event", "", "")

    try:
        payload = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return Decision("invalid_json", HTTPStatus.BAD_REQUEST, "invalid json", "", "")
    if not isinstance(payload, dict):
        return Decision("invalid_json", HTTPStatus.BAD_REQUEST, "invalid json", "", "")

    ref = str(payload.get("ref", ""))
    after = str(payload.get("after", "unknown"))
    if ref != BRANCH_REF:
        return Decision("ignore_ref", HTTPStatus.ACCEPTED, "ignored ref", ref, after)
    return Decision("deploy", HTTPStatus.ACCEPTED, "deploy queued", ref, after)


def launch_deploy(delivery_id: str) -> None:
    if not PRODUCTION_DIR.is_dir():
        raise RuntimeError(f"production directory not found: {PRODUCTION_DIR}")
    if not DEPLOY_SCRIPT.is_file():
        raise RuntimeError(f"deploy script not found: {DEPLOY_SCRIPT}")

    environment = os.environ.copy()
    environment["PRODUCTION_DIR"] = str(PRODUCTION_DIR)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(
            f"[{utc_now()}] starting deploy delivery={safe_log_value(delivery_id)}\n"
        )
        subprocess.Popen(
            ["bash", str(DEPLOY_SCRIPT)],
            cwd=str(PRODUCTION_DIR),
            env=environment,
            stdin=subprocess.DEVNULL,
            stdout=handle,
            stderr=subprocess.STDOUT,
            close_fds=True,
            start_new_session=True,
        )


class Handler(BaseHTTPRequestHandler):
    server_version = "MarcPortfolioGitHubWebhook/1.0"

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002, A003
        rendered = format % args
        log(f"http client={safe_log_value(self.client_address[0])} message={safe_log_value(rendered)}")

    def send_text(self, status: HTTPStatus, message: str) -> None:
        payload = f"{message}\n".encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self.send_text(HTTPStatus.OK, "ok")
        else:
            self.send_text(HTTPStatus.NOT_FOUND, "not found")

    def do_POST(self) -> None:  # noqa: N802
        if self.path != WEBHOOK_PATH:
            self.send_text(HTTPStatus.NOT_FOUND, "not found")
            return

        delivery_id = self.headers.get("X-GitHub-Delivery", "unknown")
        event = self.headers.get("X-GitHub-Event", "unknown")
        try:
            length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self.send_text(HTTPStatus.LENGTH_REQUIRED, "valid content length required")
            return
        if length <= 0:
            self.send_text(HTTPStatus.BAD_REQUEST, "request body required")
            return
        if length > MAX_BODY_BYTES:
            log(
                f"reject delivery={safe_log_value(delivery_id)} "
                f"event={safe_log_value(event)} reason=body_too_large"
            )
            self.send_text(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "request body too large")
            return

        body = self.rfile.read(length)
        if len(body) != length:
            self.send_text(HTTPStatus.BAD_REQUEST, "incomplete request body")
            return
        if not signature_is_valid(body, self.headers.get("X-Hub-Signature-256")):
            log(
                f"reject delivery={safe_log_value(delivery_id)} "
                f"event={safe_log_value(event)} reason=invalid_signature"
            )
            self.send_text(HTTPStatus.UNAUTHORIZED, "invalid signature")
            return

        decision = classify_event(event, body)
        if decision.action == "ping":
            log(f"accepted ping delivery={safe_log_value(delivery_id)}")
        elif decision.action == "ignore_event":
            log(
                f"ignored delivery={safe_log_value(delivery_id)} "
                f"event={safe_log_value(event)}"
            )
        elif decision.action == "invalid_json":
            log(f"reject delivery={safe_log_value(delivery_id)} reason=invalid_json")
        elif decision.action == "ignore_ref":
            log(
                f"ignored delivery={safe_log_value(delivery_id)} "
                f"ref={safe_log_value(decision.ref)} after={safe_log_value(decision.after)}"
            )
        elif decision.action == "deploy":
            try:
                launch_deploy(delivery_id)
            except Exception as exc:  # noqa: BLE001
                log(
                    f"failed delivery={safe_log_value(delivery_id)} "
                    f"reason={safe_log_value(exc)}"
                )
                self.send_text(HTTPStatus.INTERNAL_SERVER_ERROR, "deploy launch failed")
                return
            log(
                f"accepted delivery={safe_log_value(delivery_id)} deploy_queued "
                f"ref={safe_log_value(decision.ref)} after={safe_log_value(decision.after)}"
            )

        self.send_text(decision.status, decision.response)


class Server(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> int:
    try:
        webhook_secret()
        if not (1 <= PORT <= 65535):
            raise RuntimeError("webhook port must be between 1 and 65535")
        if not WEBHOOK_PATH.startswith("/"):
            raise RuntimeError("webhook path must start with /")
        if not PRODUCTION_DIR.is_dir():
            raise RuntimeError(f"production directory not found: {PRODUCTION_DIR}")
        if not DEPLOY_SCRIPT.is_file():
            raise RuntimeError(f"deploy script not found: {DEPLOY_SCRIPT}")
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    log(
        f"starting webhook server on {HOST}:{PORT}{WEBHOOK_PATH} "
        f"branch={BRANCH_REF} production_dir={PRODUCTION_DIR}"
    )
    server = Server((HOST, PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log("stopping webhook server")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
