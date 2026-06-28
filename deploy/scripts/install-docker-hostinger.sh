#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/install-docker-hostinger.sh" >&2
  exit 1
fi

cleanup_docker_repo_conflicts() {
  local file

  if [[ -f /etc/apt/sources.list ]]; then
    sed -i '/download\.docker\.com/d' /etc/apt/sources.list
  fi

  # Remove any sources.list.d entry referencing Docker, whether it's a classic
  # .list file or a deb822 .sources file (Hostinger images ship the latter).
  for file in /etc/apt/sources.list.d/*.list /etc/apt/sources.list.d/*.sources; do
    [[ -e "$file" ]] || continue
    if grep -q 'download\.docker\.com' "$file"; then
      rm -f "$file"
    fi
  done

  # Drop existing Docker keyrings so we re-add a single consistent one
  # (also avoids the interactive "Overwrite? (y/N)" gpg prompt).
  rm -f /etc/apt/keyrings/docker.asc /etc/apt/keyrings/docker.gpg
}

if command -v docker >/dev/null 2>&1; then
  echo "Docker is already installed"
else
  cleanup_docker_repo_conflicts
  apt update
  apt install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --batch --yes --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list

  apt update
  apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

if [[ -n "${SUDO_USER:-}" ]]; then
  usermod -aG docker "$SUDO_USER"
  echo "Added $SUDO_USER to docker group. Re-login required."
fi

systemctl enable docker
systemctl restart docker

docker --version
docker compose version
