# 🚀 Hostinger VPS Deployment Guide — routeretail.com

Deploy the Ionic e-commerce app to a Hostinger VPS with Docker and **automatic
deployment on every push to the `dev` branch**.

## Architecture (single domain + /api)

```
                          https://routeretail.com
                                   │
                        ┌──────────┴───────────┐  host nginx (reverse proxy + SSL)
                        │                      │
                 location /            location /api/
                        │                      │
              web container (8080)     api container (3000)
              Ionic SPA (nginx)        Node/Express  ──►  MongoDB (host, 27017)
```

- Frontend: `https://routeretail.com`
- Backend API: `https://routeretail.com/api`
- One SSL certificate covers `routeretail.com` + `www.routeretail.com`.

The auto-deploy flow: **push to `dev` → GitHub Actions SSHes into the VPS →
`deploy/scripts/deploy-hostinger.sh` pulls code, rebuilds the Docker images,
restarts containers, reloads nginx, and runs health checks.**

---

## Step 1 — GitHub repository secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**.
Add these 4 secrets (used by `.github/workflows/deploy-dev.yml`):

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Your VPS IP, e.g. `123.45.67.89` |
| `VPS_USERNAME` | SSH user, e.g. `deploy` (or `root`) |
| `VPS_SSH_KEY` | The **private** key whose public key is on the VPS (full `-----BEGIN...END-----`, no passphrase) |
| `VPS_APP_DIR` | `/var/www/routeretail` |

---

## Step 2 — Point DNS at the VPS

In the Hostinger DNS panel for `routeretail.com`, add two **A** records:

| Type | Name | Value |
|------|------|-------|
| A | `@`   | YOUR_VPS_IP |
| A | `www` | YOUR_VPS_IP |

Wait for propagation, then verify: `nslookup routeretail.com` should return your VPS IP.

---

## Step 3 — One-time VPS setup

SSH in (`ssh root@YOUR_VPS_IP`) and run:

```bash
# Clone the repo into the app directory
sudo mkdir -p /var/www/routeretail
sudo chown -R "$USER":"$USER" /var/www/routeretail
cd /var/www/routeretail
git clone <YOUR_REPO_URL> .
git checkout dev
chmod +x deploy/scripts/*.sh

# Install Docker, Nginx, firewall, fail2ban, certbot, and a 'deploy' user
sudo bash deploy/scripts/vps-bootstrap.sh

# Install MongoDB locally (the api container reaches it via host.docker.internal)
sudo bash deploy/scripts/install-mongodb-local.sh
```

> After bootstrap, log out and back in (or `newgrp docker`) so the `deploy`
> user picks up docker-group permissions. If you set `VPS_USERNAME=deploy`,
> make sure that user's `authorized_keys` contains the public key for `VPS_SSH_KEY`.

### Create MongoDB users

```bash
mongosh
```
```javascript
use admin
db.createUser({ user: "mongoAdmin", pwd: "STRONG_ADMIN_PW",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" },
          { role: "readWriteAnyDatabase", db: "admin" }] })

use ecommerce
db.createUser({ user: "ecomUser", pwd: "STRONG_DB_PW",
  roles: [{ role: "readWrite", db: "ecommerce" }] })
exit
```

---

## Step 4 — Backend environment file

```bash
cd /var/www/routeretail/backend
cp .env.production.example .env
nano .env
```

Set at minimum:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://ecomUser:STRONG_DB_PW@host.docker.internal:27017/ecommerce?authSource=ecommerce
CORS_ORIGINS=https://routeretail.com,https://www.routeretail.com
JWT_SECRET=...            # openssl rand -base64 48
JWT_REFRESH_SECRET=...    # openssl rand -base64 48
ENCRYPTION_KEY=...        # 32 chars
ENCRYPTION_IV=...         # 16 chars
```

`backend/.env` is git-ignored and never baked into the image — it lives only on the VPS.

---

## Step 5 — Host Nginx reverse proxy

```bash
sudo cp /var/www/routeretail/deploy/nginx/routeretail.hostinger.conf \
        /etc/nginx/sites-available/routeretail
sudo ln -sf /etc/nginx/sites-available/routeretail /etc/nginx/sites-enabled/routeretail
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 6 — First Docker build + SSL

```bash
cd /var/www/routeretail
docker compose up -d --build
docker compose ps        # both sindhu-api and sindhu-web should be Up

# Issue the certificate (also rewrites the nginx config for HTTPS + redirect)
sudo certbot --nginx -d routeretail.com -d www.routeretail.com \
  --non-interactive --agree-tos -m rushimore302@gmail.com
sudo certbot renew --dry-run
```

Verify:

```bash
curl -i https://routeretail.com/api/health   # -> {"success":true,"status":"ok",...}
```
Open `https://routeretail.com` in a browser — the app should load.

---

## Step 7 — Test automatic deployment

From your machine:

```bash
git checkout dev
git commit --allow-empty -m "Test auto deploy"
git push origin dev
```

Watch **GitHub → Actions → "Deploy Dev to Hostinger Docker"**. On success the VPS
has rebuilt and your changes are live.

---

## Everyday commands (on the VPS)

```bash
cd /var/www/routeretail
docker compose ps
docker compose logs -f api          # or: web
docker compose up -d --build        # manual redeploy
sudo tail -f /var/log/nginx/routeretail_error.log
sudo bash deploy/scripts/backup-mongodb.sh
```

## Troubleshooting

- **Actions SSH fails** → check the 4 secrets; key must have no passphrase; port 22 open (UFW allows it).
- **Containers won't start** → `backend/.env` missing or bad `MONGODB_URI`; see `docker compose logs`.
- **502 from /api** → api container down, or Mongo auth wrong (`host.docker.internal` requires the `extra_hosts` mapping already in `docker-compose.yml`).
- **Frontend loads but API calls fail** → confirm `environment.prod.ts` `apiUrl` is `https://routeretail.com/api` and `CORS_ORIGINS` matches the site URL.
