# 🚀 Quick Hostinger VPS Deployment Guide

This guide will help you deploy your Ionic E-commerce app to Hostinger VPS with automatic deployment on `dev` branch pushes.

## 📋 Prerequisites

1. **Hostinger VPS** with Ubuntu (recommended 24.04 LTS)
2. **Domain names** pointed to your VPS IP (e.g., app.yourdomain.com, api.yourdomain.com)
3. **GitHub repository** with admin access to add secrets
4. **SSH access** to your VPS

---

## 🔧 Step 1: Setup GitHub Repository Secrets

Go to your GitHub repository: `https://github.com/Dronzer1919/Final-Ecom-21-06-2026`

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `VPS_HOST` | Your VPS IP address | e.g., `123.45.67.89` |
| `VPS_USERNAME` | Your VPS username | e.g., `root` or your user |
| `VPS_SSH_KEY` | Your private SSH key | Entire content of your `~/.ssh/id_rsa` |
| `VPS_APP_DIR` | `/var/www/routeretail` | App directory on VPS |

### How to get your SSH Key:

On your local machine:
```bash
cat ~/.ssh/id_rsa
```

Copy the entire output (including `-----BEGIN` and `-----END` lines) and paste it as the value for `VPS_SSH_KEY`.

---

## 🖥️ Step 2: Initial VPS Setup

SSH into your Hostinger VPS:

```bash
ssh root@YOUR_VPS_IP
```

### 2.1 Clone Your Repository

```bash
# Create directory
sudo mkdir -p /var/www/routeretail
sudo chown -R $USER:$USER /var/www/routeretail

# Clone repository
cd /var/www/routeretail
git clone https://github.com/Dronzer1919/Final-Ecom-21-06-2026.git .
git checkout dev

# Make scripts executable
chmod +x deploy/scripts/*.sh
```

### 2.2 Run Bootstrap Script

This installs Docker, MongoDB, Nginx, SSL tools, and security:

```bash
sudo bash deploy/scripts/vps-bootstrap.sh
sudo bash deploy/scripts/install-mongodb-local.sh
```

**What this does:**
- ✅ Installs Docker and Docker Compose
- ✅ Installs MongoDB locally
- ✅ Installs Nginx as reverse proxy
- ✅ Sets up firewall (UFW) for ports 22, 80, 443
- ✅ Installs fail2ban for security
- ✅ Installs Certbot for SSL certificates

---

## 🗄️ Step 3: Configure MongoDB

### 3.1 Create MongoDB Admin User

```bash
mongosh
```

In the MongoDB shell:

```javascript
use admin
db.createUser({
  user: "mongoAdmin",
  pwd: "YOUR_STRONG_ADMIN_PASSWORD",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})
```

### 3.2 Create Application Database User

```javascript
use ecommerce
db.createUser({
  user: "ecomUser",
  pwd: "YOUR_STRONG_DB_PASSWORD",
  roles: [{ role: "readWrite", db: "ecommerce" }]
})

exit
```

**💡 Remember these credentials - you'll need them in the next step!**

---

## ⚙️ Step 4: Configure Backend Environment

```bash
cd /var/www/routeretail/backend
cp .env.production.example .env
nano .env
```

Update the following values in the `.env` file:

```env
NODE_ENV=production
PORT=3000

# IMPORTANT: Replace with MongoDB credentials from Step 3.2
MONGODB_URI=mongodb://ecomUser:YOUR_STRONG_DB_PASSWORD@host.docker.internal:27017/ecommerce?authSource=ecommerce

# Generate random secrets (see below)
JWT_SECRET=your_super_secure_random_jwt_secret_key_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secure_random_refresh_secret_key_minimum_32_characters
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# Generate random encryption keys (see below)
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_IV=your_16_char_iv

# Replace with your actual domains
CORS_ORIGINS=https://app.yourdomain.com,https://yourdomain.com,https://www.yourdomain.com
```

### Generate Secure Random Keys

On your VPS, run these commands to generate secure keys:

```bash
# JWT Secret (64 characters)
openssl rand -base64 48

# JWT Refresh Secret (64 characters)
openssl rand -base64 48

# Encryption Key (32 characters)
openssl rand -base64 24

# Encryption IV (16 characters)
openssl rand -base64 12
```

Copy the output and paste into your `.env` file. Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## 🌐 Step 5: Configure Nginx Reverse Proxy

### 5.1 Setup Nginx Configuration

```bash
sudo cp /var/www/routeretail/deploy/nginx/routeretail.hostinger.conf /etc/nginx/sites-available/routeretail
sudo ln -s /etc/nginx/sites-available/routeretail /etc/nginx/sites-enabled/routeretail
sudo rm -f /etc/nginx/sites-enabled/default
```

### 5.2 Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Step 6: Configure DNS and SSL

### 6.1 Set DNS Records in Hostinger

In your Hostinger control panel, add these A records:

| Type | Name | Value |
|------|------|-------|
| A | app | YOUR_VPS_IP |
| A | api | YOUR_VPS_IP |

Wait 5-10 minutes for DNS propagation.

### 6.2 Check DNS Propagation

```bash
nslookup app.yourdomain.com
nslookup api.yourdomain.com
```

Both should show your VPS IP.

### 6.3 Install SSL Certificates

**Replace `yourdomain.com` with your actual domain:**

```bash
sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com --non-interactive --agree-tos -m your-email@example.com
```

### 6.4 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## 🐳 Step 7: First Docker Deployment

Build and start your containers:

```bash
cd /var/www/routeretail
docker compose up -d --build
```

### Check Container Status

```bash
docker compose ps
docker compose logs api
docker compose logs web
```

You should see both containers running.

---

## ✅ Step 8: Verify Deployment

### 8.1 Check API Health

```bash
curl -i https://api.yourdomain.com
```

You should see a response from your backend.

### 8.2 Check Frontend

Open your browser and visit:
- `https://app.yourdomain.com` - Your Ionic app should load

---

## 🔄 Step 9: Test Automatic Deployment

Now that everything is set up, test the automatic deployment:

### 9.1 Make a Change and Push

On your local machine:

```bash
cd "c:\Users\MSI Brand\OneDrive\Desktop\ionic-ecom - Copy"
git checkout dev

# Make a small test change
echo "# Deployment test" >> README.md

# Commit and push
git add .
git commit -m "Test automatic deployment"
git push origin dev
```

### 9.2 Watch GitHub Actions

1. Go to: `https://github.com/Dronzer1919/Final-Ecom-21-06-2026/actions`
2. You should see a new workflow running: "Deploy Dev to Hostinger Docker"
3. Click on it to see the progress

### 9.3 Check VPS Logs

On your VPS, you can watch the deployment in real-time:

```bash
cd /var/www/routeretail
docker compose logs -f
```

Press `Ctrl+C` to exit.

---

## 🎉 SUCCESS!

Your automatic deployment is now configured! Every time you push to the `dev` branch:

1. ✅ GitHub Actions detects the push
2. ✅ Connects to your VPS via SSH
3. ✅ Pulls latest code
4. ✅ Rebuilds Docker containers
5. ✅ Restarts services
6. ✅ Verifies deployment health
7. ✅ Your website is live with latest changes!

---

## 🛠️ Useful Commands

### View Container Logs
```bash
docker compose logs api --tail 100
docker compose logs web --tail 100
```

### Restart Containers
```bash
docker compose restart
```

### Rebuild Containers
```bash
docker compose down
docker compose up -d --build
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/routeretail_app_error.log
sudo tail -f /var/log/nginx/routeretail_api_error.log
```

### MongoDB Backup
```bash
sudo bash /var/www/routeretail/deploy/scripts/backup-mongodb.sh
```

---

## 🚨 Troubleshooting

### Deployment fails with SSH error
- Verify GitHub secrets are correct
- Check SSH key has no passphrase
- Ensure VPS firewall allows port 22

### Containers won't start
- Check `.env` file exists in `backend/`
- Verify MongoDB credentials are correct
- Check logs: `docker compose logs`

### Site not accessible
- Verify DNS records point to VPS IP
- Check Nginx is running: `sudo systemctl status nginx`
- Test SSL: `sudo certbot certificates`

### Database connection errors
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check MongoDB credentials in `backend/.env`
- Test connection: `mongosh -u ecomUser -p`

---

## 📞 Need Help?

If you encounter issues, check:
1. GitHub Actions logs
2. Docker container logs: `docker compose logs`
3. Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
4. MongoDB logs: `sudo journalctl -u mongod -f`

---

## 🔄 Regular Maintenance

### Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Clean Docker Resources
```bash
docker system prune -a --volumes
```

### Monitor Disk Space
```bash
df -h
```

### Check Security Updates
```bash
sudo unattended-upgrades --dry-run
```

---

**🎊 Congratulations! Your app is now live and will auto-deploy on every push to `dev` branch!**
