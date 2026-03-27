# SmallTrend Production Setup On Azure VM - Step by Step

Sau khi hoàn tất DNS + NSG, thực hiện các bước sau trên Azure VM Ubuntu.

---

## Phase 1: Run One-Time Setup Script

SSH vào VM và chạy script setup:

```bash
# Download và chạy script
curl -fsSL https://raw.githubusercontent.com/touchmegit1/SmallTrend/main/deploy/scripts/azure-vm-setup.sh | bash
```

**Hoặc** chạy manual từng bước:

```bash
# 1. Update hệ thống
sudo apt-get update && sudo apt-get upgrade -y

# 2. Cài độc lập packages
sudo apt-get install -y ca-certificates curl gnupg lsb-release nginx certbot python3-certbot-nginx git

# 3. Cài Docker (full guide từ docker.com)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Thêm user vào docker group
sudo usermod -aG docker $USER

# 5. Đăng xuất rồi đăng nhập lại để group có hiệu lực
# Hoặc chạy: newgrp docker

# 6. Tạo thư mục deploy
sudo mkdir -p /opt/smalltrend
sudo chown -R $USER:$USER /opt/smalltrend

# 7. Clone repo
cd /opt/smalltrend
git clone https://github.com/touchmegit1/SmallTrend.git .
git checkout main

# 8. Tạo env file
cp deploy/env/backend.env.example deploy/env/backend.env
```

---

## Phase 2: Cấu hình Backend Environment

Mở file env và điền đầy đủ thông tin production:

```bash
nano /opt/smalltrend/deploy/env/backend.env
```

**Bắt buộc phải sửa:**
- `DB_PASSWORD` → mật khẩu MySQL production thật
- `JWT_SECRET` → chuỗi ngẫu nhiên dài (tối thiểu 32 ký tự)
- `CORS_ALLOWED_ORIGINS` → đã là `https://smalltrend.me,https://www.smalltrend.me`

**Optional nhưng khuyên:**
- `CLOUDINARY_*` → điền CloudinaryAPI nếu có
- `MAIL_USERNAME`, `MAIL_PASSWORD` → email server nếu cần notify

---

## Phase 3: Cấu hình Nginx Reverse Proxy

```bash
# 1. Copy cấu hình Nginx
sudo cp /opt/smalltrend/deploy/nginx/smalltrend.conf /etc/nginx/sites-available/smalltrend

# 2. Enable site
sudo ln -s /etc/nginx/sites-available/smalltrend /etc/nginx/sites-enabled/smalltrend

# 3. Vô hiệu hóa site mặc định
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Kiểm tra cấu hình
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx
```

Nếu có lỗi trong `nginx -t`, xem chi tiết:
```bash
sudo journalctl -u nginx -n 20
```

---

## Phase 4: Cấp SSL Certificate bằng Certbot

```bash
# 1. Cấp cert cho smalltrend.me và www.smalltrend.me
sudo certbot --nginx -d smalltrend.me -d www.smalltrend.me

# 2. Khi Certbot hỏi, chọn:
#    "Please choose whether or not to redirect HTTP traffic to HTTPS"
#    → Chọn 2: Redirect all traffic to HTTPS

# 3. Kiểm tra cert được cấp:
sudo certbot certificates

# 4. Kiểm tra auto-renewal timer:
sudo systemctl status certbot.timer

# 5. Test renewal (lần đầu):
sudo certbot renew --dry-run
```

Nếu renewal fail, xem log:
```bash
sudo journalctl -u certbot -n 50
```

---

## Phase 5: Chuẩn bị Docker Compose Stack

```bash
cd /opt/smalltrend

# 1. Kiểm tra backend.env có đầy đủ chưa
cat deploy/env/backend.env | grep -E "DB_PASSWORD|JWT_SECRET"

# 2. Tạo MySQL container (nếu bạn muốn container riêng)
# Hoặc dùng MySQL external ngoài VM

# 3. Kiểm tra compose file
cat docker-compose.prod.yml
```

---

## Phase 6: Pull Image và Deploy

Beofre deploying, bạn cần có Docker image sẵn. Cách tiếp cận:

### Option A: Use GitHub Actions (Recommended)
- Khai báo GitHub Secrets SSH
- Push lên main
- Workflow CD tự động build/push image và deploy

### Option B: Manual deploy
```bash
# 1. Login Docker Hub
docker login

# 2. Pull image
export REGISTRY=docker.io
export IMAGE_NAMESPACE=YOUR_DOCKERHUB_USERNAME
export IMAGE_TAG=latest

docker compose -f docker-compose.prod.yml pull

# 3. Start containers
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 4. Verify
docker compose -f docker-compose.prod.yml ps
```

---

## Phase 7: Verify Deployment

```bash
# 1. Check frontend
curl -v https://smalltrend.me

# 2. Check backend health
curl -f https://smalltrend.me/api/ai/health

# 3. Check docker logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# 4. Check Nginx reverse proxy
sudo journalctl -u nginx -f
```

---

## Phase 8: Setup GitHub Actions CD (Optional but Recommended)

Khai báo secrets trong GitHub Repository → Settings → Secrets:

```
DOCKERHUB_USERNAME       = YOUR_HUB_USERNAME
DOCKERHUB_TOKEN          = YOUR_HUB_TOKEN
SSH_HOST                 = smalltrend.me (hoặc IP VM)
SSH_USER                 = ubuntu (hoặc user Azure VM)
SSH_PRIVATE_KEY          = nội dung key PEM của azureuser
SSH_PORT                 = 22
DEPLOY_PATH              = /opt/smalltrend
HEALTHCHECK_URL          = https://smalltrend.me/api/ai/health
MIGRATION_COMMAND        = (để trống nếu không cần)
```

Sau đó:
- Push code lên main
- Workflow .github/workflows/cd.yml tự động chạy
- Build image, push Docker Hub, SSH deploy vào VM

---

## Phase 9: Hardening (Security Best Practice)

```bash
# 1. Tắt password SSH login (chỉ dùng key)
sudo nano /etc/ssh/sshd_config
# Sửa: PasswordAuthentication no

# 2. Restart SSH
sudo systemctl restart sshd

# 3. Kiểm tra Azure NSG: cổng 22 chỉ whitelist IP quản trị

# 4. (Optional) Cài fail2ban
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban

# 5. Kiểm tra Docker logs storage
# Để tránh logs chiếm hết disk, cấu hình log rotation:
sudo nano /etc/docker/daemon.json
# Thêm:
# {
#   "log-driver": "json-file",
#   "log-opts": {
#     "max-size": "10m",
#     "max-file": "3"
#   }
# }
sudo systemctl restart docker
```

---

## Troubleshooting

### 1. SSL cert fail
```bash
sudo systemctl status certbot
sudo journalctl -u certbot -n 50
```

### 2. Container không start
```bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

### 3. Nginx 502 Bad Gateway
```bash
sudo journalctl -u nginx -f
docker compose -f docker-compose.prod.yml ps
```

### 4. Port conflict
```bash
sudo netstat -tlnp | grep LISTEN
```

---

## Success Indicators

✅ Domain trỏ đúng:
```bash
nslookup smalltrend.me
```

✅ SSL valid:
```bash
curl -v https://smalltrend.me 2>&1 | grep "certificate"
```

✅ Backend health:
```bash
curl -f https://smalltrend.me/api/ai/health
```

✅ Containers running:
```bash
docker compose -f docker-compose.prod.yml ps
```

---

**Khi mọi thứ xanh 🟢, bạn đã sẵn sàng production!**
