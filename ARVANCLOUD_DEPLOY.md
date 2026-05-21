# ArvanCloud VM Deployment Guide — Dr. Salehi Landing Page

## What you need
- ArvanCloud account (you have this)
- A Linux VM on ArvanCloud (Ubuntu 22.04 recommended, 1 vCPU / 1GB RAM is enough)
- Your custom domain managed in ArvanCloud DNS

---

## Step 1 — Create the VM on ArvanCloud

1. Log in to ArvanCloud dashboard → **Cloud Compute** → **Create Server**
2. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: 1 vCPU, 1 GB RAM (ECO plan, ~50,000 تومان/month)
   - **Region**: Iran (Tehran) — this is the key step that bypasses filtering
3. Add your SSH public key during creation (or set a root password)
4. Note the server's **public IP address** after it starts

---

## Step 2 — Point your domain DNS to ArvanCloud

1. In ArvanCloud dashboard → **CDN** → add your domain
2. Update your domain's nameservers to ArvanCloud's nameservers (shown in dashboard)
3. In ArvanCloud DNS settings, add an **A record**:
   - Name: `@` (root domain) or `www`
   - Value: your VM's public IP
   - Enable **ArvanCloud CDN proxy** (the orange cloud icon) — this routes traffic through ArvanCloud's Iranian PoPs

---

## Step 3 — Set up the VM

SSH into your server:
```bash
ssh root@YOUR_VM_IP
```

Install Node.js 20 and PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/dr-salehi
sudo chown $USER:$USER /var/www/dr-salehi
```

Install Nginx (reverse proxy):
```bash
sudo apt-get install -y nginx
```

---

## Step 4 — Upload and build the site on the server

**Option A: Upload from your Mac (easiest)**

On your Mac, build first, then upload the standalone output:
```bash
# On your Mac, in the project directory:
npm run build

# Upload the required files to the server
rsync -avz --progress \
  .next/standalone/ \
  .next/static \
  public/ \
  ecosystem.config.js \
  root@YOUR_VM_IP:/var/www/dr-salehi/
```

After rsync, on the server fix the static paths:
```bash
cd /var/www/dr-salehi
mkdir -p .next
cp -r static .next/static
```

**Option B: Clone from git on the server**
```bash
cd /var/www/dr-salehi
git clone YOUR_GIT_REPO_URL .
npm install
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

---

## Step 5 — Start the app with PM2

```bash
cd /var/www/dr-salehi
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

Verify it's running:
```bash
pm2 status
curl http://localhost:3000
```

---

## Step 6 — Configure Nginx as reverse proxy

```bash
sudo nano /etc/nginx/sites-available/dr-salehi
```

Paste this config (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers (ArvanCloud CDN adds HTTPS, Nginx handles HTTP internally)
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";

    # Serve static assets directly from disk (faster, bypasses Node.js)
    location /_next/static/ {
        alias /var/www/dr-salehi/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /var/www/dr-salehi/public/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Everything else goes to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/dr-salehi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 7 — Enable HTTPS with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot auto-renews certificates.

**Note:** If ArvanCloud CDN proxy is enabled (orange cloud), SSL terminates at ArvanCloud's edge. In that case, skip certbot and instead enable SSL in the ArvanCloud CDN dashboard (free SSL option). Set Nginx to listen on port 80 only — ArvanCloud handles 443.

---

## Step 8 — Open firewall ports

In ArvanCloud VM security group settings, allow:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Block port 3000 externally (Node.js only accessible via Nginx)

---

## Updating the site after code changes

```bash
# On your Mac: rebuild
npm run build

# Upload new build
rsync -avz .next/standalone/ .next/static public/ root@YOUR_VM_IP:/var/www/dr-salehi/
ssh root@YOUR_VM_IP "cd /var/www/dr-salehi && cp -r static .next/static && pm2 restart dr-salehi"
```

---

## Summary of what changed in the codebase

- `next.config.js` — added `output: 'standalone'` (enables the self-contained Node.js server)
- `Dockerfile` — available if you later want to use ArvanCloud Container service
- `ecosystem.config.js` — PM2 process config for the VM
