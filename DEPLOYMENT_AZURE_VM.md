# SmallTrend Deployment On Azure VM

This guide deploys SmallTrend with Docker on an Ubuntu Azure VM, with Nginx + Certbot on host.

## 1. Prerequisites

- Azure Ubuntu VM with public IP
- Domain DNS A record points to VM public IP
- NSG inbound rules: 22, 80, 443
- GitHub repository secrets configured

## 2. One-time setup on Azure VM

### 2.1 Install packages

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release nginx certbot python3-certbot-nginx
```

### 2.2 Install Docker + Compose plugin

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Re-login after adding your user to docker group.

### 2.3 Prepare deployment directory

```bash
sudo mkdir -p /opt/smalltrend
sudo chown -R $USER:$USER /opt/smalltrend
cd /opt/smalltrend
git clone <YOUR_REPO_URL> .
cp deploy/env/backend.env.example deploy/env/backend.env
```

Update `deploy/env/backend.env` with production values.

### 2.4 Configure Nginx

```bash
sudo cp deploy/nginx/smalltrend.conf /etc/nginx/sites-available/smalltrend
sudo ln -s /etc/nginx/sites-available/smalltrend /etc/nginx/sites-enabled/smalltrend
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Replace `domain.com` and `www.domain.com` in `deploy/nginx/smalltrend.conf` before reloading Nginx.

### 2.5 Issue SSL cert

```bash
sudo certbot --nginx -d domain.com -d www.domain.com
sudo systemctl status certbot.timer
```

## 3. GitHub Actions secrets

Create these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `SSH_PORT` (optional, default 22)
- `DEPLOY_PATH` (example: `/opt/smalltrend`)
- `HEALTHCHECK_URL` (example: `https://domain.com/api/ai/health`)
- `MIGRATION_COMMAND` (optional, example: `docker compose -f docker-compose.prod.yml exec -T backend java -jar app.jar --spring.flyway.enabled=true`)

## 4. Deploy flow

- Push code to `main` or tag `v*`
- CI checks run
- CD builds and pushes docker images
- CD deploys through SSH with:
  - `docker compose -f docker-compose.prod.yml pull`
  - `docker compose -f docker-compose.prod.yml up -d --remove-orphans`
  - optional migration command
  - healthcheck
  - rollback to previous SHA if healthcheck fails

## 5. Local verification on VM

```bash
cd /opt/smalltrend
export REGISTRY=docker.io
export IMAGE_NAMESPACE=<dockerhub-user>
export IMAGE_TAG=latest
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
curl -f https://domain.com/api/ai/health
```

## 6. Security checklist

- Keep SSH key-based login only
- Disable password SSH login in `sshd_config`
- Restrict NSG port 22 to trusted IPs
- Never commit real `.env` files or private keys
- Rotate Docker Hub token periodically
