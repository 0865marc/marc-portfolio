# marc-portfolio GitHub webhook autodeploy

This repository contains the versioned half of a localhost-only production webhook. Host installation, secrets, GitHub configuration, and the first deploy remain explicit operator actions.

## 1. Prepare the dedicated checkout

Run only after reviewed `main` has been pushed to GitHub:

```bash
install -d -m 0755 /home/agent/deployments
git clone --branch main --single-branch \
  git@github.com:0865marc/marc-portfolio.git \
  /home/agent/deployments/marc-portfolio-production
git -C /home/agent/deployments/marc-portfolio-production status --short --branch
```

The deploy wrapper is pinned to `main`, refuses tracked changes, resets only this dedicated checkout to `origin/main`, runs `npm ci`, `npm run build`, and the existing `./ops/deploy-static.sh`, then verifies the activated release and public HTTPS content. Do not point `PRODUCTION_DIR` at a development or agent checkout.

Before enabling automatic deploys, the existing `/var/www/portfolio.mybrawl.io/releases` permissions and active `current` symlink must already support `ops/deploy-static.sh` for the deploy user.

## 2. Create the server-local secret file

Create the file outside Git with the same high-entropy secret that will be entered in GitHub. Do not paste the value into this repository or logs.

```bash
install -m 0600 /dev/null /home/agent/.hermes/marc-portfolio-github-webhook.env
${EDITOR:-vi} /home/agent/.hermes/marc-portfolio-github-webhook.env
chmod 0600 /home/agent/.hermes/marc-portfolio-github-webhook.env
```

Its only required line is:

```text
GITHUB_WEBHOOK_SECRET='replace-in-the-server-local-file-only'
```

The start script refuses symlinks, non-owner files, modes other than `0600`, and an empty secret.

## 3. Start and supervise the receiver

```bash
/home/agent/deployments/marc-portfolio-production/ops/start-github-webhook.sh
curl -fsS http://127.0.0.1:9003/health
```

The receiver binds to `127.0.0.1:9003`; its default webhook path is `/github-webhook-marc-portfolio`. It logs decisions to `/home/agent/.hermes/logs/marc-portfolio-github-webhook.log` without logging signatures, bodies, or secret values.

A simple no-sudo watchdog option is:

```cron
* * * * * /home/agent/deployments/marc-portfolio-production/ops/start-github-webhook.sh
```

The start script checks health first and uses a non-blocking start lock, so it does not intentionally duplicate a healthy receiver. A reviewed systemd user service may be used instead.

## 4. Merge the exact Nginx route

`ops/nginx/portfolio.mybrawl.io.conf` includes the route for a fresh HTTP setup. For the existing Certbot-managed site, merge only `ops/nginx/portfolio.mybrawl.io-webhook-location.conf` into the active `portfolio.mybrawl.io` HTTPS server block; do not overwrite unrelated TLS directives or the existing static `/`, `/index.html`, and `/assets/` routes.

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -i -X POST https://portfolio.mybrawl.io/github-webhook-marc-portfolio \
  -H 'X-GitHub-Event: ping' -d '{}'
```

The unsigned probe must return `401 invalid signature`. A public `/health` receiver route is deliberately not configured.

## 5. Configure one GitHub webhook

In `0865marc/marc-portfolio` → Settings → Webhooks:

- Payload URL: `https://portfolio.mybrawl.io/github-webhook-marc-portfolio`
- Content type: `application/json`
- Secret: the exact server-local value
- SSL verification: enabled
- Events: only **Pushes**

GitHub's signed `ping` should return `200 pong`. Non-push events and pushes not targeting `refs/heads/main` are acknowledged but ignored. Accepted pushes return `202 deploy queued`; the deploy itself continues detached.

## 6. Verify before declaring production updated

```bash
python3 /home/agent/deployments/marc-portfolio-production/ops/test_github_webhook_server.py
tail -n 80 /home/agent/.hermes/logs/marc-portfolio-github-webhook.log
git -C /home/agent/deployments/marc-portfolio-production status --short --branch
readlink -f /var/www/portfolio.mybrawl.io/current
curl -fsS https://portfolio.mybrawl.io/ \
  | grep -F '<title>Marc — Director de proyectos y desarrollador fullstack</title>'
```

Confirm the dedicated checkout SHA matches the pushed SHA. A successful push or a healthy receiver alone is not deployment proof. If the title is intentionally changed later, review and update the deploy wrapper's non-secret expected marker in the same change.
