#!/usr/bin/env bash
set -euo pipefail

# One-shot VPS setup for RouteRetail Docker deployment.
# Run this on VPS after cloning repo:
#   chmod +x deploy/scripts/run-vps-docker-setup.sh
#   bash deploy/scripts/run-vps-docker-setup.sh

APP_ROOT="${APP_ROOT:-$PWD}"
APP_DOMAIN="${APP_DOMAIN:-app.routeretail.com}"
API_DOMAIN="${API_DOMAIN:-api.routeretail.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@routeretail.com}"

# Set SKIP_CERTBOT=1 if DNS is not ready yet.
SKIP_CERTBOT="${SKIP_CERTBOT:-0}"

# Set MONGO_URI only if you want to override automatic default.
MONGO_URI="${MONGO_URI:-}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

warn() {
  echo "[WARN] $*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[ERROR] Missing command: $1" >&2
    exit 1
  }
}

ensure_env_value() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$file"
  fi
}

main() {
  log "Starting RouteRetail VPS setup at: $APP_ROOT"

  require_cmd bash
  require_cmd sudo
  require_cmd grep
  require_cmd sed
  require_cmd git

  if [[ ! -f "$APP_ROOT/docker-compose.yml" ]]; then
    echo "[ERROR] docker-compose.yml not found in $APP_ROOT" >&2
    echo "Run this from your cloned project root." >&2
    exit 1
  fi

  log "Step 1/9: Installing Docker (if missing)"
  sudo bash "$APP_ROOT/deploy/scripts/install-docker-hostinger.sh"

  log "Step 2/9: Applying base VPS hardening and packages"
  sudo bash "$APP_ROOT/deploy/scripts/vps-bootstrap.sh"

  log "Step 3/9: Installing/ensuring MongoDB local service"
  sudo bash "$APP_ROOT/deploy/scripts/install-mongodb-local.sh"

  log "Step 4/9: Preparing backend environment file"
  if [[ ! -f "$APP_ROOT/backend/.env" ]]; then
    cp "$APP_ROOT/backend/.env.production.example" "$APP_ROOT/backend/.env"
  fi

  if [[ -z "$MONGO_URI" ]]; then
    MONGO_URI="mongodb://host.docker.internal:27017/ecommerce"
  fi

  ensure_env_value "NODE_ENV" "production" "$APP_ROOT/backend/.env"
  ensure_env_value "PORT" "3000" "$APP_ROOT/backend/.env"
  ensure_env_value "MONGODB_URI" "$MONGO_URI" "$APP_ROOT/backend/.env"
  ensure_env_value "CORS_ORIGINS" "https://$APP_DOMAIN,https://$API_DOMAIN,https://routeretail.com,https://www.routeretail.com" "$APP_ROOT/backend/.env"

  if grep -q "PUT_YOUR_MONGODB_URI_HERE" "$APP_ROOT/backend/.env"; then
    echo "[ERROR] backend/.env still has placeholder Mongo URI" >&2
    exit 1
  fi

  log "Step 5/9: Configuring host Nginx reverse proxy"
  sudo cp "$APP_ROOT/deploy/nginx/routeretail.hostinger.conf" /etc/nginx/sites-available/routeretail
  sudo ln -s /etc/nginx/sites-available/routeretail /etc/nginx/sites-enabled/routeretail 2>/dev/null || true
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx

  log "Step 6/9: Building and starting Docker services"
  cd "$APP_ROOT"
  docker compose down || true
  docker compose up -d --build

  log "Step 7/9: Service status and logs"
  docker compose ps
  docker compose logs --tail 80 api || true
  docker compose logs --tail 40 web || true

  log "Step 8/9: Setting up daily MongoDB backups"
  sudo bash "$APP_ROOT/deploy/scripts/setup-cron-backup.sh"

  if [[ "$SKIP_CERTBOT" == "1" ]]; then
    warn "Skipping certbot because SKIP_CERTBOT=1"
    warn "Run later: sudo certbot --nginx -d $APP_DOMAIN -d $API_DOMAIN"
  else
    log "Step 9/9: Issuing SSL certificates"
    sudo certbot --nginx -d "$APP_DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" || {
      warn "Certbot failed. Usually DNS not propagated yet. Re-run later:"
      warn "sudo certbot --nginx -d $APP_DOMAIN -d $API_DOMAIN"
    }
    sudo certbot renew --dry-run || true
  fi

  log "Setup completed"
  echo
  echo "Next checks:"
  echo "  docker compose ps"
  echo "  sudo nginx -t"
  echo "  curl -I https://$APP_DOMAIN"
  echo "  curl -I https://$API_DOMAIN"
}

main
