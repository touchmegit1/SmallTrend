# SmallTrend

SmallTrend là hệ thống POS quản lý cửa hàng tiện lợi gồm backend Spring Boot và frontend React.

## Tech Stack
- Backend: Java 17, Spring Boot 3, Spring Security JWT, JPA, MySQL
- Frontend: React 18, Vite, Tailwind
- DevOps: Docker, GitHub Actions (CI/CD), deploy lên Azure VM qua SSH

## Cấu trúc dự án
- backend: API + business logic
- frontend: giao diện web
- deploy: file môi trường production
- .github/workflows: CI/CD pipeline

## Chạy nhanh local

### 1) Backend
Yêu cầu: Java 17+, MySQL 8

Tạo DB:

```sql
CREATE DATABASE smalltrend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Cấu hình biến trong backend/.env hoặc backend/src/main/resources/application.properties.

Chạy backend:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Hoặc dùng script:

```bash
cd backend
.\run.cmd
```

Backend mặc định: http://localhost:8081

### 2) Seed dữ liệu

```bash
cd backend
.\run-seed.cmd
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định: http://localhost:5173

## Tài khoản mặc định sau khi seed
- admin / password
- manager / password
- cashier1 / password

## CI/CD hiện tại
Pipeline ở .github/workflows/cd.yml gồm 4 job:
1. Frontend Quality: npm ci, lint, build
2. Backend Quality: build backend với MySQL service
3. Build And Push Images: build/push Docker images backend + frontend lên Docker Hub
4. Deploy To Azure VM: SSH vào VM, pull image, up docker compose, healthcheck, rollback nếu fail

## Secrets cần có cho CD
Thiết lập trong GitHub repository secrets:
- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN
- SSH_HOST
- SSH_USER
- SSH_PRIVATE_KEY
- SSH_PORT (optional, mặc định 22)
- DEPLOY_PATH (thư mục chứa docker-compose.prod.yml trên VM)
- HEALTHCHECK_URL
- MIGRATION_COMMAND (optional)

## Deploy thủ công nhanh trên VM

```bash
cd <DEPLOY_PATH>
REGISTRY=docker.io
IMAGE_NAMESPACE=<dockerhub_username>
IMAGE_TAG=latest
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

## Docker production
File docker-compose.prod.yml dùng image:
- docker.io/<IMAGE_NAMESPACE>/smalltrend-backend:<IMAGE_TAG>
- docker.io/<IMAGE_NAMESPACE>/smalltrend-frontend:<IMAGE_TAG>

## Lưu ý quan trọng về seed
Đã chuẩn hóa nhiều đoạn INSERT trong backend/src/main/resources/data.sql theo kiểu có danh sách cột để tránh lỗi lệch thứ tự cột giữa các máy.
Nếu gặp lỗi seed sau khi pull code mới:
1. Xóa và tạo lại DB nhỏ gọn
2. Chạy lại run-seed.cmd

## Tài liệu bổ sung
- PRODUCTION_SETUP_STEPS.md
- DEPLOYMENT_AZURE_VM.md
