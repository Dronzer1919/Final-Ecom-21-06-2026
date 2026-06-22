# RouteRetail Deployment (Docker + GitHub Actions)

This project is configured so that every push or merge into dev deploys automatically to Hostinger VPS.

## Flow

1. Developer pushes to dev
2. GitHub Actions workflow runs: .github/workflows/deploy-dev.yml
3. Workflow SSHs into VPS
4. VPS runs: deploy/scripts/deploy-hostinger.sh
5. Script pulls latest dev, rebuilds Docker containers, reloads Nginx, runs health checks

## Required VPS Path

- /var/www/routeretail

## Required GitHub Secrets

- VPS_HOST
- VPS_USERNAME
- VPS_SSH_KEY
- VPS_APP_DIR=/var/www/routeretail

## Runtime Topology

- Host Nginx
  - app.routeretail.com -> 127.0.0.1:8080 (web container)
  - api.routeretail.com -> 127.0.0.1:3000 (api container)
- Docker Compose services
  - sindhu-web
  - sindhu-api
- MongoDB service on host
  - bound to localhost
  - accessed from api container via host.docker.internal

## Quick Verification

```bash
docker compose ps
curl -I https://app.routeretail.com
curl -I https://api.routeretail.com
```
