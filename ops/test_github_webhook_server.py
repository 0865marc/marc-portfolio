#!/usr/bin/env python3
"""Focused dependency-free tests for the marc-portfolio webhook receiver."""

from __future__ import annotations

import hashlib
import hmac
import os
import unittest
from http import HTTPStatus
from unittest.mock import patch

import github_webhook_server as webhook


class SignatureTests(unittest.TestCase):
    def test_accepts_correct_sha256_signature(self) -> None:
        body = b'{"ref":"refs/heads/main"}'
        secret = b"unit-test-secret"
        signature = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()
        self.assertTrue(webhook.signature_is_valid(body, signature, secret))

    def test_rejects_missing_or_incorrect_signature(self) -> None:
        body = b"{}"
        self.assertFalse(webhook.signature_is_valid(body, None, b"secret"))
        self.assertFalse(webhook.signature_is_valid(body, "sha256=bad", b"secret"))

    def test_requires_nonempty_environment_secret(self) -> None:
        with patch.dict(os.environ, {"GITHUB_WEBHOOK_SECRET": ""}, clear=False):
            with self.assertRaisesRegex(RuntimeError, "GITHUB_WEBHOOK_SECRET"):
                webhook.webhook_secret()


class EventFilteringTests(unittest.TestCase):
    def test_ping_is_accepted(self) -> None:
        decision = webhook.classify_event("ping", b"{}")
        self.assertEqual((decision.action, decision.status), ("ping", HTTPStatus.OK))

    def test_non_push_event_is_ignored(self) -> None:
        decision = webhook.classify_event("issues", b"not-json")
        self.assertEqual(decision.action, "ignore_event")

    def test_only_main_push_is_deployed(self) -> None:
        main = webhook.classify_event("push", b'{"ref":"refs/heads/main","after":"abc"}')
        other = webhook.classify_event("push", b'{"ref":"refs/heads/staging"}')
        self.assertEqual(main.action, "deploy")
        self.assertEqual(other.action, "ignore_ref")

    def test_invalid_push_json_is_rejected(self) -> None:
        decision = webhook.classify_event("push", b"not-json")
        self.assertEqual((decision.action, decision.status), ("invalid_json", HTTPStatus.BAD_REQUEST))

    def test_security_constants_are_pinned(self) -> None:
        self.assertEqual(webhook.HOST, "127.0.0.1")
        self.assertEqual(webhook.BRANCH_REF, "refs/heads/main")
        self.assertEqual(webhook.MAX_BODY_BYTES, 1024 * 1024)

    def test_default_deploy_script_matches_repository_layout(self) -> None:
        if "MARC_PORTFOLIO_DEPLOY_SCRIPT" not in os.environ:
            self.assertEqual(
                webhook.DEPLOY_SCRIPT,
                webhook.PRODUCTION_DIR / "ops/auto-deploy-production.sh",
            )


if __name__ == "__main__":
    unittest.main()
