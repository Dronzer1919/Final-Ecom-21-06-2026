#!/usr/bin/env bash
set -euo pipefail

BACKUP_SCRIPT="${BACKUP_SCRIPT:-/var/www/routeretail/deploy/scripts/backup-mongodb.sh}"
ENV_FILE="${ENV_FILE:-/etc/routeretail/mongodb-backup.env}"
CRON_FILE="/etc/cron.d/routeretail-mongodb-backup"

if [[ ! -f "$BACKUP_SCRIPT" ]]; then
  echo "Backup script not found: $BACKUP_SCRIPT" >&2
  exit 1
fi

sudo mkdir -p /etc/routeretail

if [[ ! -f "$ENV_FILE" ]]; then
  sudo tee "$ENV_FILE" >/dev/null <<'EOF'
MONGO_USER=ecomUser
MONGO_PASSWORD=CHANGE_ME
MONGO_DB=ecommerce
MONGO_HOST=127.0.0.1
MONGO_PORT=27017
BACKUP_DIR=/var/backups/mongodb
RETENTION_DAYS=7
EOF
  echo "Created $ENV_FILE. Update MONGO_PASSWORD before first run." >&2
fi

sudo chmod 600 "$ENV_FILE"

sudo tee "$CRON_FILE" >/dev/null <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0 2 * * * root source $ENV_FILE; $BACKUP_SCRIPT >> /var/log/routeretail-mongodb-backup.log 2>&1
EOF

sudo chmod 644 "$CRON_FILE"
sudo systemctl restart cron

echo "Daily MongoDB backup cron installed at 02:00."
