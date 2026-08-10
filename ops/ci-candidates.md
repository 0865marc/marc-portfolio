# CI and production candidates

## Contract

`.github/workflows/ci.yml` is the repository CI and candidate-build workflow. It has two distinct responsibilities:

1. Every pull request targeting `main`, every push to `main`, and every manual run executes the repository gate, the configured Chromium responsive matrix, Firefox/WebKit coverage, and a smoke test of the production Nginx image.
2. A successful push to `main` additionally publishes a candidate image to GHCR after both verification jobs pass. Pull requests and manual runs never publish packages.

The candidate image is named `ghcr.io/0865marc/marc-portfolio`, tagged as `sha-<full-commit>`, smoke-tested by immutable digest before attestation, and recorded in the workflow summary. Production promotion must select the digest, not a mutable tag. GitHub Actions receives only `contents: read` by default; the candidate job alone receives `packages: write`, `id-token: write`, and `attestations: write`.

The workflow does not deploy, connect to the VPS, or receive production secrets. The image serves the generated Astro site through the container-only Nginx configuration at `ops/nginx/container.conf` on port 8080. It includes a healthcheck; pull requests test a local production build, while successful `main` runs also test the exact published digest before provenance attestation.

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
npm run verify
npx playwright install chromium firefox webkit
npm run test:e2e
```

Build and smoke-test the candidate container:

```sh
docker build --tag marc-portfolio:ci .
npm run test:container -- marc-portfolio:ci
```
