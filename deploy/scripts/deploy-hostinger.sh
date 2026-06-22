#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/routeretail}"
BRANCH="${BRANCH:-dev}"
FRONTEND_HEALTH_URL="${FRONTEND_HEALTH_URL:-https://app.routeretail.com}"
API_HEALTH_URL="${API_HEALTH_URL:-https://api.routeretail.com}"

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

  log "Reloading host nginx"
  sudo nginx -t
  sudo systemctl reload nginx

  log "Running endpoint checks"
  health_check "$API_HEALTH_URL" "API"
  health_check "$FRONTEND_HEALTH_URL" "Frontend"

  log "Docker deployment completed successfully"
}

main
