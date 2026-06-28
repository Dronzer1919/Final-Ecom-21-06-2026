#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/routeretail}"
BRANCH="${BRANCH:-dev}"
FRONTEND_HEALTH_URL="${FRONTEND_HEALTH_URL:-https://routeretail.com}"
API_HEALTH_URL="${API_HEALTH_URL:-https://routeretail.com/api/health}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Required command not found: $1" >&2
    exit 1
  }
}

health_check() {
  local url="$1"
  local name="$2"

  if curl -fsS --max-time 20 "$url" >/dev/null; then
    log "$name health check passed: $url"
  else
    echo "$name health check failed: $url" >&2
    exit 1
  fi
}

main() {
  require_cmd git
  require_cmd docker
  require_cmd curl
  require_cmd sudo

  log "Updating code at $APP_ROOT"
  cd "$APP_ROOT"
  git fetch --all --prune
  git checkout "$BRANCH"
  git pull origin "$BRANCH"

  if [[ ! -f backend/.env ]]; then
    echo "Missing backend env file: $APP_ROOT/backend/.env" >&2
    exit 1
  fi

  log "Building and starting containers"
  docker compose down
  docker compose up -d --build

  log "Validating container status"
  docker compose ps

  # Reload host nginx best-effort. The reverse-proxy config is static across
  # deploys, so a failure here (e.g. no passwordless sudo for the deploy user)
  # must not fail the deployment.
  if sudo -n true 2>/dev/null; then
    log "Reloading host nginx"
    if sudo nginx -t; then
      sudo systemctl reload nginx
    else
      log "WARNING: nginx config test failed; skipping reload"
    fi
  else
    log "Skipping nginx reload (no non-interactive sudo available)"
  fi

  log "Running endpoint checks"
  health_check "$API_HEALTH_URL" "API"
  health_check "$FRONTEND_HEALTH_URL" "Frontend"

  log "Docker deployment completed successfully"
}

main
