# Dev Branch Auto Deployment

This repository now includes a GitHub Actions workflow at:

- `.github/workflows/deploy-dev.yml`

It runs automatically on every push to `dev` (including merges into `dev`).

## What gets deployed

- Backend (`backend/**`) -> Hostinger VPS over SSH, then restarts PM2 process `sindhu-api`
- Frontend (`ionic-project/**`) -> Hostinger Web Hosting over FTP after production build

## Required GitHub Secrets

Set these in repository settings: **Settings -> Secrets and variables -> Actions**

### Backend (VPS)

- `VPS_HOST` = VPS public IP or domain
- `VPS_USERNAME` = SSH username (often `root` or a sudo user)
- `VPS_SSH_KEY` = private SSH key (full PEM text)
- `VPS_APP_DIR` = absolute path where repo is cloned on VPS (example: `/var/www/ionic-ecom`)

### Frontend (Hostinger FTP)

- `HOSTINGER_FTP_SERVER` = FTP host (example: `ftp.yourdomain.com`)
- `HOSTINGER_FTP_USERNAME` = FTP user
- `HOSTINGER_FTP_PASSWORD` = FTP password
- `HOSTINGER_FTP_TARGET_DIR` = target path (example: `/public_html/`)

## One-time VPS setup

Run these once on the VPS:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

sudo mkdir -p /var/www
cd /var/www
git clone <YOUR_REPOSITORY_GIT_URL> ionic-ecom
cd ionic-ecom/backend
npm ci

# create and edit environment file
cp .env.production.example .env
nano .env

# first app start
pm2 start src/server.js --name sindhu-api
pm2 save
pm2 startup
```

## Important

- The workflow triggers on `push` to `dev`. A merge into `dev` is also a `push`, so it deploys automatically.
- If only backend files changed, frontend job is skipped.
- If only frontend files changed, backend job is skipped.
- If a job is skipped unexpectedly, check branch name and secrets.
