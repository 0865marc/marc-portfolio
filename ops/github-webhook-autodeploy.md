# marc-portfolio GitHub webhook autodeploy

## Current architecture

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

## Deployment verification

After an approved push, verify the deployment independently of the gateway response:

```bash
git -C /home/agent/deployments/marc-portfolio-production status --short --branch
readlink -f /var/www/portfolio.mybrawl.io/current
curl -fsS https://portfolio.mybrawl.io/ >/dev/null
```

Confirm that the dedicated checkout SHA matches the pushed SHA, that the active release resolves below the expected releases directory, and that public HTTPS serves the expected content. An accepted webhook delivery alone is not deployment proof.
