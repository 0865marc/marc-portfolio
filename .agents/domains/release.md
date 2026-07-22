# Release and deployment domain

## Source of truth

Release policy is defined by [`.hermes.md`](../../.hermes.md) and the operator-local Hermes project registry. Operational implementation lives under [`ops/`](../../ops/). This domain note is a map, not deployment authorization.

## Current contract

- Environment: production.
- Branch: `main`.
- Public target: `portfolio.mybrawl.io`.
- Delivery model: Astro directory-format static release through an atomic publisher.
- Automatic deployment after implementation: disabled; an explicitly approved push to `origin/main` triggers the host-managed production webhook.
- Commit and push permission for agents: disabled.
- Approval before deployment: required.

## Required order

1. Complete and close the implementation run without waiting for production deployment.
2. Run `npm run verify`, inspect the scoped diff, and obtain independent implementation verification.
3. Open a distinct release run bound to the closed implementation result and exact commit.
4. Obtain separately approved, digest-bound Nginx activation when the reviewed configuration is not yet active.
5. Obtain a single-use deployment approval for the exact commit, `origin/main`, `production`, and `github_push_webhook` trigger.
6. Push only under that approval; the push inherently triggers deployment.
7. Verify the activated release and public HTTPS result independently.

CodeGraph indexing is local and has no deployment effect. `.codegraph/` is ignored, must not be published, and is not an application release artifact or deployment input.
