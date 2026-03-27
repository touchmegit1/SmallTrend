#!/bin/bash
# SmallTrend Azure VM One-Time Setup Script
# Run this once on Ubuntu Azure VM to prepare for deployment

set -e

echo "=========================================="
echo "SmallTrend Azure VM Setup"
echo "=========================================="

# Variables
REPO_URL="https://github.com/YOUR_USERNAME/SmallTrend.git"
DEPLOY_PATH="/opt/smalltrend"

# Step 1: Update system
echo "[1/7] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Step 2: Install prerequisites
echo "[2/7] Installing prerequisites..."
sudo apt-get install -y \
  ca-certificates curl gnupg lsb-release \
  nginx certbot python3-certbot-nginx \
  git

# Step 3: Install Docker
echo "[3/7] Installing Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Step 4: Configure Docker permissions
echo "[4/7] Configuring Docker permissions..."
sudo usermod -aG docker $USER
echo "⚠️  Please log out and log back in for Docker group to take effect"
echo "    Or run: newgrp docker"

# Step 5: Create deployment directory
echo "[5/7] Creating deployment directory..."
sudo mkdir -p "$DEPLOY_PATH"
sudo chown -R $USER:$USER "$DEPLOY_PATH"

# Step 6: Clone repository
echo "[6/7] Cloning SmallTrend repository..."
cd "$DEPLOY_PATH"
git clone "$REPO_URL" .
git checkout main

# Step 7: Prepare environment file
echo "[7/7] Creating backend environment file..."
cp deploy/env/backend.env.example deploy/env/backend.env

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Log out and back in (or run: newgrp docker)"
echo ""
echo "2. Edit deployment environment:"
echo "   nano $DEPLOY_PATH/deploy/env/backend.env"
echo "   Update: DB_PASSWORD, JWT_SECRET, Cloudinary, Mail settings"
echo ""
echo "3. Copy Nginx config:"
echo "   sudo cp $DEPLOY_PATH/deploy/nginx/smalltrend.conf /etc/nginx/sites-available/smalltrend"
echo "   sudo ln -s /etc/nginx/sites-available/smalltrend /etc/nginx/sites-enabled/smalltrend"
echo "   sudo rm -f /etc/nginx/sites-enabled/default"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. Issue SSL certificate:"
echo "   sudo certbot --nginx -d smalltrend.me -d www.smalltrend.me"
echo ""
echo "5. Verify Certbot timer:"
echo "   sudo systemctl status certbot.timer"
echo ""
echo "6. Deploy application:"
echo "   cd $DEPLOY_PATH"
echo "   export REGISTRY=docker.io"
echo "   export IMAGE_NAMESPACE=YOUR_DOCKERHUB_USERNAME"
echo "   export IMAGE_TAG=latest"
echo "   docker compose -f docker-compose.prod.yml pull"
echo "   docker compose -f docker-compose.prod.yml up -d --remove-orphans"
echo ""
echo "7. Verify deployment:"
echo "   curl -f https://smalltrend.me/api/ai/health"
echo ""
