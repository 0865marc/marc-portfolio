# Release and deployment domain

## Source of truth

Repository candidate policy is defined by [`.workflow/policy.yaml`](../../.workflow/policy.yaml) and [`ops/ci-candidates.md`](../../ops/ci-candidates.md). Private production policy and deployer configuration are deliberately outside the public repository. This note is a map, not deployment authorization.

## Current contract

- Branch: `main`.
- Public target: `portfolio.mybrawl.io`.
- Delivery model: static Astro output inside an Nginx container.
- Pull requests verify but never publish or deploy.
- A successful `main` push publishes a GHCR candidate identified by commit tag and immutable digest.
- No repository event deploys production.

## Required order

1. Complete implementation and run `npm run verify`.
2. Open a pull request and require a successful `CI / Verify` check before merge.
3. Let the `main` workflow publish the exact verified candidate.
4. Record the image digest from the workflow summary.
5. Use a separate private release process to approve and promote that exact digest.
6. Verify production independently after promotion.

CodeGraph indexing is local and has no deployment effect. `.codegraph/` is ignored, must not be published, and is not an application release artifact or deployment input.
