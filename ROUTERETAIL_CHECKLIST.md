# RouteRetail Docker CI/CD Checklist

Target:

- App: https://app.routeretail.com
- API: https://api.routeretail.com
- Deploy mode: automatic on push to dev via GitHub Actions

## VPS One-Time Setup

- [ ] Clone repository to `/var/www/routeretail`
- [ ] Run bootstrap:
  - `sudo bash deploy/scripts/vps-bootstrap.sh`
- [ ] Run MongoDB local install:
  - `sudo bash deploy/scripts/install-mongodb-local.sh`
- [ ] Confirm Docker is working:
  - `docker --version`
  - `docker compose version`
- [ ] Confirm UFW: only 22/80/443 open
- [ ] Confirm fail2ban is active

## MongoDB Security

- [ ] Create MongoDB users in `mongosh`
- [ ] Confirm `/etc/mongod.conf` has:
  - bindIp: `127.0.0.1`
  - authorization: enabled
- [ ] Confirm `mongod` is enabled on boot

## Backend Environment

- [ ] `cp backend/.env.production.example backend/.env`
- [ ] Update `backend/.env`:
  - `MONGODB_URI=mongodb://ecomUser:...@host.docker.internal:27017/ecommerce?authSource=ecommerce`
  - JWT and encryption secrets
  - CORS origins with app domain

## Nginx Setup

- [ ] Copy site config:
  - `sudo cp deploy/nginx/routeretail.hostinger.conf /etc/nginx/sites-available/routeretail`
- [ ] Enable and reload:
  - `sudo ln -s /etc/nginx/sites-available/routeretail /etc/nginx/sites-enabled/routeretail`
  - `sudo rm -f /etc/nginx/sites-enabled/default`
  - `sudo nginx -t`
  - `sudo systemctl reload nginx`

## First Container Start

- [ ] Start containers once:
  - `docker compose up -d --build`
- [ ] Confirm running:
  - `docker compose ps`

## DNS and SSL

- [ ] Hostinger DNS:
  - `A app -> VPS_IP`
  - `A api -> VPS_IP`
- [ ] Issue SSL certs:
  - `sudo certbot --nginx -d app.routeretail.com -d api.routeretail.com`
- [ ] Verify renew:
  - `sudo certbot renew --dry-run`

## GitHub CI/CD Setup

- [ ] Confirm workflow exists:
  - `.github/workflows/deploy-dev.yml`
- [ ] Add repository secrets:
  - `VPS_HOST`
  - `VPS_USERNAME`
  - `VPS_SSH_KEY`
  - `VPS_APP_DIR` as `/var/www/routeretail`
- [ ] Push commit to `dev`
- [ ] Verify GitHub Action success

## Backup and Operations

- [ ] Setup cron backup:
  - `sudo bash deploy/scripts/setup-cron-backup.sh`
- [ ] Set backup password in:
  - `/etc/routeretail/mongodb-backup.env`
- [ ] Test backup script manually
- [ ] Check logs:
  - `docker compose logs --tail 100 api`
  - `docker compose logs --tail 100 web`
  - Nginx error logs

## Success Criteria

- [ ] Push or merge to dev auto-deploys latest code
- [ ] app.routeretail.com is live over HTTPS
- [ ] api.routeretail.com is live over HTTPS
- [ ] Containers restart cleanly after server reboot
- [ ] Daily MongoDB backup is running
