#!/usr/bin/env bash
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/vps-bootstrap.sh" >&2
  exit 1
fi

cleanup_docker_repo_conflicts() {
  local file

  if [[ -f /etc/apt/sources.list ]]; then
    sed -i '/download\.docker\.com\/linux\/ubuntu/d' /etc/apt/sources.list
  fi

  for file in /etc/apt/sources.list.d/*.list; do
    [[ -e "$file" ]] || continue
    sed -i '/download\.docker\.com\/linux\/ubuntu/d' "$file"
    if [[ ! -s "$file" ]]; then
      rm -f "$file"
    fi
  done

  rm -f /etc/apt/keyrings/docker.asc
}

cleanup_docker_repo_conflicts

apt update && apt upgrade -y
apt install -y nginx git curl unzip ufw fail2ban certbot python3-certbot-nginx gnupg ca-certificates

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG sudo "$DEPLOY_USER"

if [[ -f /root/.ssh/authorized_keys ]]; then
  mkdir -p "/home/$DEPLOY_USER/.ssh"
  cp /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  chmod 700 "/home/$DEPLOY_USER/.ssh"
  chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker "$DEPLOY_USER"
systemctl enable docker
systemctl restart docker

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable fail2ban
systemctl restart fail2ban

SSH_CONFIG="/etc/ssh/sshd_config"
# Allow key-based root login (the GitHub Actions deploy logs in as root with a
# key) while still blocking password-based root login.
sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin prohibit-password/' "$SSH_CONFIG"
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' "$SSH_CONFIG"
sed -i 's/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/' "$SSH_CONFIG"
systemctl restart ssh

echo "Bootstrap complete. Verify SSH access for user '$DEPLOY_USER' before closing current session."
echo "Re-login required for docker group permissions."
