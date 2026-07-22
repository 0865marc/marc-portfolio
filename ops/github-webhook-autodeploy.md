# marc-portfolio GitHub webhook autodeploy

## Current architecture

The application now emits Astro static directory output. The shared gateway contract is unchanged. The hook verifies the landing page, blog index, all known articles, `404.html`, hashed assets, and canonical public routes. Activating the reviewed Nginx cache and internal designed-404 rules is a separate privileged release prerequisite; the webhook does not install Nginx configuration.

marc-portfolio uses the host's shared GitHub webhook gateway. The repository keeps the application deploy backend, `ops/auto-deploy-production.sh`, and the atomic publisher, `ops/deploy-static.sh`; it does not contain or supervise a webhook receiver and its application Nginx config does not define a webhook route.

Use this high-level GitHub registration:

- Payload URL: `https://mybrawl.io/github-webhook/marc-portfolio-production`
- Hook ID: `marc-portfolio-production`
- Repository and branch: `0865marc/marc-portfolio`, `main`
- Content type: `application/json`
- Events: pushes only
- SSL verification: enabled

The secret is independent for this registration and remains in host-managed configuration outside Git. Never put its value in this repository, commands, logs, or reports.

The shared gateway validates the signature, event, repository target, and exact branch before a static allowlist invokes `ops/auto-deploy-production.sh` in the dedicated production checkout. Do not add a project-local receiver, cron watchdog, service, port, or per-project Nginx webhook location.

## Certbot-preserving activation prerequisite

The bootstrap file `ops/nginx/portfolio.mybrawl.io.conf` is not an update source for an existing TLS site. Before any release-triggering push, an independent reviewer must bind the exact final commit plus SHA-256 digests of the live site, `ops/nginx/portfolio.mybrawl.io.certbot.conf`, and `ops/activate-nginx-static.sh`. A separate privileged approval must name the actor, those digests, the expected enabled symlink, the backup path/digest to be created, and the exact check, activate, and rollback commands.

The privileged actor first runs `activate-nginx-static.sh check` with the approved live and candidate digests. Only a passing, drift-free check may be followed by `activate`; the tool validates the candidate, creates a unique backup, installs atomically without replacing the enabled symlink, runs `nginx -t`, and reloads once. A failed validation or reload restores, revalidates, and reloads the exact backup. Confirm the certificate paths, TLS response, root, blog/article routes, immutable assets, no-cache HTML, and designed HTTP 404 before considering activation complete.

Only after that evidence and all application gates pass may a distinct single-use deployment approval authorize the exact commit, `origin/main`, production environment, and `github_push_webhook` trigger. Webhook publication remains separate from Nginx activation. If the live configuration, candidate, certificate directives, or commit changes, the affected approval is stale. Explicit rollback likewise requires the approved active and backup digests; it does not deploy files, switch the release symlink, invoke Certbot, or alter DNS.

## Deployment verification

After an approved push, verify the deployment independently of the gateway response:

```bash
git -C /home/agent/deployments/marc-portfolio-production status --short --branch
readlink -f /var/www/portfolio.mybrawl.io/current
curl -fsS https://portfolio.mybrawl.io/ >/dev/null
```

Confirm that the dedicated checkout SHA matches the pushed SHA, that the active release resolves below the expected releases directory, and that public HTTPS serves the expected content. An accepted webhook delivery alone is not deployment proof.
