# Release and deployment domain

## Source of truth

Release policy is defined by [`.hermes.md`](../../.hermes.md) and the operator-local Hermes project registry. Operational implementation lives under [`ops/`](../../ops/). This domain note is a map, not deployment authorization.

## Current contract

- Environment: production.
- Branch: `main`.
- Public target: `portfolio.mybrawl.io`.
- Delivery model: direct static release.
- Automatic deployment after implementation: disabled.
- Commit and push permission for agents: disabled.
- Approval before deployment: required.

## Required order

1. Implement a closed task without deployment.
2. Run the requested tests/build and inspect the scoped diff.
3. Obtain independent review.
4. Obtain explicit production deployment approval.
5. Only then may the documented release command be considered by the user-facing owner.
6. Verify the activated release and public HTTPS result independently.

Knowledge indexing is local and has no deployment effect. `.agents/generated/` is versioned only as a reproducible knowledge bootstrap snapshot; publishing it is not an application release or deployment.
