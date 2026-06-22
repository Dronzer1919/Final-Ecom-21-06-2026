# Hostinger VPS Deployment Guide (Docker + CI/CD)

This guide deploys your project on Ubuntu 24.04 VPS with Docker and GitHub Actions.

Stack:

- Frontend: Ionic Angular in Docker
- Backend: Node.js Express in Docker
- Database: MongoDB on VPS host (localhost only)
- Reverse proxy: Nginx on VPS host
- CI/CD: GitHub Actions on push to dev
- SSL: Let's Encrypt

Domains:

- App: https://app.routeretail.com
- API: https://api.routeretail.com

## 1) One-Time VPS Bootstrap

Run as root on VPS:

```bash
cd /var/www/routeretail
sudo bash deploy/scripts/vps-bootstrap.sh
sudo bash deploy/scripts/install-mongodb-local.sh
```

What this does:

- installs Docker Engine + Docker Compose plugin
- installs Nginx, UFW, fail2ban, certbot
- disables root SSH login and password auth
- enables UFW for 22, 80, 443
- installs MongoDB locally and enables auth

## 2) Prepare Application Directory

Use one repo path for CI/CD script:

```bash
sudo mkdir -p /var/www/routeretail
sudo chown -R $USER:$USER /var/www/routeretail
cd /var/www/routeretail
git clone https://github.com/Dronzer1919/Final-Ecom-21-06-2026.git .
git checkout dev
chmod +x deploy/scripts/*.sh
```

## 3) Create MongoDB Users

```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "mongoAdmin",
  pwd: "REPLACE_WITH_STRONG_PASSWORD",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

use ecommerce
db.createUser({
  user: "ecomUser",
  pwd: "REPLACE_WITH_STRONG_PASSWORD",
  roles: [{ role: "readWrite", db: "ecommerce" }]
})
```

## 4) Backend Environment

```bash
cd /var/www/routeretail/backend
cp .env.production.example .env
nano .env
```

Set these values:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://ecomUser:APP_DB_PASSWORD@host.docker.internal:27017/ecommerce?authSource=ecommerce
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=YOUR_LONG_RANDOM_REFRESH_SECRET
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d
ENCRYPTION_KEY=32_CHAR_STRING
ENCRYPTION_IV=16_CHAR_STRING
CORS_ORIGINS=https://app.routeretail.com,https://routeretail.com,https://www.routeretail.com
```

## 5) Nginx Reverse Proxy

```bash
sudo cp /var/www/routeretail/deploy/nginx/routeretail.hostinger.conf /etc/nginx/sites-available/routeretail
sudo ln -s /etc/nginx/sites-available/routeretail /etc/nginx/sites-enabled/routeretail
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

The Nginx config routes:

- app.routeretail.com -> 127.0.0.1:8080 (frontend container)
- api.routeretail.com -> 127.0.0.1:3000 (backend container)

## 6) First Manual Docker Run

```bash
cd /var/www/routeretail
docker compose up -d --build
docker compose ps
```

## 7) DNS and SSL

Set Hostinger DNS A records:

- app -> VPS IP
- api -> VPS IP

After propagation:

```bash
sudo certbot --nginx -d app.routeretail.com -d api.routeretail.com
sudo certbot renew --dry-run
```

## 8) Configure GitHub Actions CI/CD

Workflow file:

- .github/workflows/deploy-dev.yml

It triggers on every push to dev and runs deployment script on VPS over SSH.

Set these GitHub repository secrets:

- VPS_HOST
- VPS_USERNAME
- VPS_SSH_KEY
- VPS_APP_DIR

Recommended value:

- VPS_APP_DIR=/var/www/routeretail

## 9) Deployment Script Used by CI/CD

Script path:

- deploy/scripts/deploy-hostinger.sh

It performs:

- git pull on dev
- docker compose down
- docker compose up -d --build
- nginx config test and reload
- API and App health checks

## 10) Backups and Monitoring

Daily MongoDB backup (retain 7):

```bash
sudo bash /var/www/routeretail/deploy/scripts/setup-cron-backup.sh
sudo nano /etc/routeretail/mongodb-backup.env
```

Set MONGO_PASSWORD there, then test once:

```bash
source /etc/routeretail/mongodb-backup.env
sudo -E bash /var/www/routeretail/deploy/scripts/backup-mongodb.sh
```

Logs and status:

```bash
docker compose ps
docker compose logs --tail 100 api
docker compose logs --tail 100 web
sudo tail -f /var/log/nginx/routeretail_app_error.log
sudo tail -f /var/log/nginx/routeretail_api_error.log
```

## 11) Expected Result

- push or merge to dev triggers GitHub Actions automatically
- VPS pulls latest code and rebuilds containers automatically
- app.routeretail.com serves frontend over HTTPS
- api.routeretail.com serves API over HTTPS
- MongoDB remains local and protected
