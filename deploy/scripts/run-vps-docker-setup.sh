#!/usr/bin/env bash
set -euo pipefail

# One-shot VPS setup for routeretail.com (single domain + /api, Dockerized Mongo).
# Run from the cloned project root as root:
#   cd /var/www/routeretail
#   bash deploy/scripts/run-vps-docker-setup.sh
#
# Optional overrides:
#   SKIP_CERTBOT=1   -> skip SSL issuance (use if DNS hasn't propagated yet)

APP_ROOT="${APP_ROOT:-$PWD}"
DOMAIN="${DOMAIN:-routeretail.com}"
WWW_DOMAIN="${WWW_DOMAIN:-www.routeretail.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-rushimore302@gmail.com}"
SKIP_CERTBOT="${SKIP_CERTBOT:-0}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
warn() { echo "[WARN] $*"; }

ensure_env_value() {
  local key="$1" value="$2" file="$3"
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf "%s=%s\n" "$key" "$value" >> "$file"
  fi
}

main() {
  if [[ "$EUID" -ne 0 ]]; then
    echo "[ERROR] Run as root: bash deploy/scripts/run-vps-docker-setup.sh" >&2
    exit 1
  fi

  if [[ ! -f "$APP_ROOT/docker-compose.yml" ]]; then
    echo "[ERROR] docker-compose.yml not found in $APP_ROOT. Run from the project root." >&2
    exit 1
  fi

  log "Step 1/6: Installing Docker"
  bash "$APP_ROOT/deploy/scripts/install-docker-hostinger.sh"

  log "Step 2/6: Base VPS hardening (nginx, firewall, fail2ban, certbot)"
  bash "$APP_ROOT/deploy/scripts/vps-bootstrap.sh"

  log "Step 3/6: Generating backend/.env (secrets auto-generated, kept only on this VPS)"
  if [[ ! -f "$APP_ROOT/backend/.env" ]]; then
    cp "$APP_ROOT/backend/.env.production.example" "$APP_ROOT/backend/.env"
  fi
  ensure_env_value "NODE_ENV" "production" "$APP_ROOT/backend/.env"
  ensure_env_value "PORT" "3000" "$APP_ROOT/backend/.env"
  ensure_env_value "MONGODB_URI" "mongodb://mongo:27017/ecommerce" "$APP_ROOT/backend/.env"
  ensure_env_value "CORS_ORIGINS" "https://${DOMAIN},https://${WWW_DOMAIN}" "$APP_ROOT/backend/.env"

  # Generate strong secrets only if they are still placeholders / empty.
  if grep -qE "^JWT_SECRET=(your_|$)" "$APP_ROOT/backend/.env"; then
    ensure_env_value "JWT_SECRET" "$(openssl rand -base64 48 | tr -d '\n')" "$APP_ROOT/backend/.env"
  fi
  if grep -qE "^JWT_REFRESH_SECRET=(your_|$)" "$APP_ROOT/backend/.env"; then
    ensure_env_value "JWT_REFRESH_SECRET" "$(openssl rand -base64 48 | tr -d '\n')" "$APP_ROOT/backend/.env"
  fi
  if grep -qE "^ENCRYPTION_KEY=(your_|$)" "$APP_ROOT/backend/.env"; then
    ensure_env_value "ENCRYPTION_KEY" "$(openssl rand -hex 16)" "$APP_ROOT/backend/.env"   # 32 chars
  fi
  if grep -qE "^ENCRYPTION_IV=(your_|$)" "$APP_ROOT/backend/.env"; then
    ensure_env_value "ENCRYPTION_IV" "$(openssl rand -hex 8)" "$APP_ROOT/backend/.env"      # 16 chars
  fi
  chmod 600 "$APP_ROOT/backend/.env"

  log "Step 4/6: Configuring host Nginx reverse proxy"
  cp "$APP_ROOT/deploy/nginx/routeretail.hostinger.conf" /etc/nginx/sites-available/routeretail
  ln -sf /etc/nginx/sites-available/routeretail /etc/nginx/sites-enabled/routeretail
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx

  log "Step 5/6: Building and starting containers (mongo + api + web)"
  cd "$APP_ROOT"
  docker compose down || true
  docker compose up -d --build
  docker compose ps

  if [[ "$SKIP_CERTBOT" == "1" ]]; then
    warn "Skipping certbot (SKIP_CERTBOT=1). Issue SSL later with:"
    warn "  certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN} --agree-tos -m ${CERTBOT_EMAIL}"
  else
    log "Step 6/6: Issuing SSL certificate for ${DOMAIN} + ${WWW_DOMAIN}"
    if certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
         --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" --redirect; then
      certbot renew --dry-run || true
    else
      warn "Certbot failed (usually DNS not propagated yet). Re-run later:"
      warn "  certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN} --agree-tos -m ${CERTBOT_EMAIL} --redirect"
    fi
  fi

  log "Setup complete."
  echo
  echo "Verify:"
  echo "  docker compose ps"
  echo "  curl -i https://${DOMAIN}/api/health"
  echo "  open https://${DOMAIN} in a browser"
}

main
