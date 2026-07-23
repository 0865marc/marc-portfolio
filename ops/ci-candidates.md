# CI and production candidates

## Contract

`.github/workflows/ci.yml` is the repository CI and candidate-build workflow. It has two distinct responsibilities:

1. Every pull request targeting `main`, every push to `main`, and every manual run executes the repository gate plus the configured Chromium regression matrix.
2. A successful push to `main` additionally builds, smoke-tests, and publishes a candidate image to GHCR. Pull requests and manual runs never publish packages.

The candidate image is named `ghcr.io/0865marc/marc-portfolio`, tagged as `sha-<full-commit>`, and recorded by immutable digest in the workflow summary. Production promotion must select the digest, not a mutable tag. GitHub Actions receives only `contents: read` by default; the candidate job alone receives `packages: write`, `id-token: write`, and `attestations: write`.

The workflow does not deploy, connect to the VPS, or receive production secrets. The image serves the generated Astro site through the container-only Nginx configuration at `ops/nginx/container.conf` on port 8080. It includes a healthcheck and is tested with `scripts/verify-container-image.sh` before publication.

## Required GitHub settings

Protect `main` in the GitHub repository settings:

- Require a pull request before merging.
- Require the `CI / Verify` status check.
- Require the branch to be up to date before merging.
- Block force pushes and branch deletion.

Ensure Actions may publish packages with `GITHUB_TOKEN`. No personal access token is required for the workflow. Configure the GHCR package visibility separately if anonymous pulls are desired; otherwise the future VPS deployer needs a pull-only credential.

## Production boundary

Merging to `main` verifies the exact commit and publishes a candidate; it does not promote that candidate to production. Production promotion is deliberately private and separate from this repository. A deployer must accept an explicitly approved image digest, with a separate production approval and post-deploy verification.

## Local equivalents

Run the repository CI gate locally:

```sh
npm ci --no-audit --no-fund
npm run codegraph:init # only when .codegraph/ is absent
npm run verify
npx playwright install chromium
npm run test:e2e -- --project=chromium --project=chromium-mobile-320 --project=chromium-mobile-375 --project=chromium-768 --project=chromium-1024 --project=chromium-1440 --project=chromium-js-off --project=chromium-reduced-motion
```

Build and smoke-test the candidate container:

```sh
docker build --tag marc-portfolio:ci .
npm run test:container -- marc-portfolio:ci
```
