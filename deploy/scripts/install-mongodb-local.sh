#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/install-mongodb-local.sh" >&2
  exit 1
fi

MONGO_VERSION="${MONGO_VERSION:-8.0}"
DISTRO="noble"

curl -fsSL "https://pgp.mongodb.com/server-${MONGO_VERSION}.asc" | \
  gpg -o "/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg" --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu ${DISTRO}/mongodb-org/${MONGO_VERSION} multiverse" \
  > "/etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list"

apt update
apt install -y mongodb-org

MONGOD_CONF="/etc/mongod.conf"
if ! grep -q "^security:" "$MONGOD_CONF"; then
  cat >> "$MONGOD_CONF" <<'EOF'

security:
  authorization: enabled
EOF
fi

sed -i 's/^  bindIp:.*/  bindIp: 127.0.0.1/' "$MONGOD_CONF"

systemctl enable mongod
systemctl restart mongod
systemctl status mongod --no-pager

echo "MongoDB installed and configured for localhost access with auth enabled."
echo "Next: create DB users with mongosh."
