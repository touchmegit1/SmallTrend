# CI/CD Pipeline Setup & Guide

SmallTrend project sử dụng **GitHub Actions** để tự động kiểm tra (lint, test) và build code.

## 📋 Current Setup

### Workflow File
- **Location**: `.github/workflows/ci.yml`
- **Triggers**: Push + Pull Request trên branches: `main`, `dev`, `shift`
- **Jobs**: 2 jobs chạy song song

### Frontend Job: "Frontend (Lint & Build)"
```
Node 20 → npm ci → npm run lint:ci → npm run build → upload dist/
```
- **Lint Script**: `npm run lint:ci` (--quiet flag, chỉ báo errors, ignore warnings)
- **Build Script**: `npm run build` (Vite)
- **Artifact**: `frontend/dist/` (giữ 7 ngày)

### Backend Job: "Backend (Build & Test)"
```
Java 17 → MySQL 8.0 → maven compile → maven test+coverage → upload reports
```
- **Compile**: `./mvnw -B compile -DskipTests`
- **Test**: `./mvnw -B verify` (chạy JUnit5 tests + JaCoCo coverage)
- **Artifacts**:
  - `backend/target/site/jacoco/` (coverage report)
  - `backend/target/surefire-reports/` (JUnit XML results)

---

## ✅ Status Badges (For README)

Thêm badge này vào `README.md` để hiển thị CI status:

```markdown
[![CI Workflow](https://github.com/touchmegit1/SmallTrend/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/touchmegit1/SmallTrend/actions/workflows/ci.yml)
```

---

## 🔒 Branch Protection Rules (REQUIRED for Auto-Merge)

Để GitHub tự động merge PR khi CI pass, cần cài đặt Branch Protection:

### Step 1: Settings → Branches
1. Vào **Settings** → **Branches**
2. Click **Add rule**

### Step 2: Configure Rule for `main` branch
```
Branch name pattern: main
```

Enable các tùy chọn:
- ✅ **Require a pull request before merging**
  - Dismiss stale pull request approvals: ON
  - Required number of approvals: 1

- ✅ **Require status checks to pass before merging**
  - Select checks:
    - ✓ Frontend (Lint & Build)
    - ✓ Backend (Build & Test)
  - Require branches to be up to date: ON

- ✅ **Require code reviews from code owners**: Optional

- ✅ **Allow force pushes**: OFF (bảo vệ history)

### Step 3: Configure Rule for `dev` branch (similar)
```
Branch name pattern: dev
```

Enable:
- ✅ **Require status checks to pass** (không cần PR approval cho dev)
  - Select: Frontend + Backend

---

## 🚀 How Auto-Merge Works

### Without Branch Protection (Current State)
1. Tạo PR: dev → main
2. CI chạy: Frontend + Backend
3. PR merge lúc dùng "Squash and merge"
4. **Issue**: Có thể merge dù CI fail (git không kiểm tra CI status)

### With Branch Protection (Production Ready)
1. Tạo PR: dev → main
2. CI chạy: Frontend + Backend
3. **PR bị LOCK** nếu CI fail
4. Khi CI **xanh** + approvals đủ:
   - Click "Enable auto-merge" trên PR
   - GitHub tự động merge khi check pass
5. **Kết quả**: Chỉ code clean được merge → main

---

## 📊 Viewing Results

### GitHub Actions Dashboard
```
https://github.com/touchmegit1/SmallTrend/actions
```

Mỗi workflow run có:
- ✅ Frontend (Lint & Build) - Job status
- ✅ Backend (Build & Test) - Job status
- 📁 Artifacts tab: Download reports

### Viewing Artifacts
1. Click vào workflow run
2. Scroll down → **Artifacts** section
3. Download:
   - `frontend-dist/` - Built frontend
   - `jacoco-report/` - Code coverage HTML
   - `junit-test-results/` - Test results XML

---

## 🛠️ Local Testing (Before Push)

### Test Frontend Locally
```bash
cd frontend
npm run lint:ci          # Run CI linter (exits clean even with warnings)
npm run lint            # Run full lint (shows all issues)
npm run lint:fix        # Auto-fix issues
npm run build           # Build for production
```

### Test Backend Locally
```bash
cd backend
./mvnw clean compile    # Compile
./mvnw verify           # Run tests + JaCoCo
open target/site/jacoco/index.html  # View coverage report
```

---

## 📝 Scripts Reference

### Frontend (`frontend/package.json`)
```json
{
  "scripts": {
    "lint": "eslint src",           // Full lint report (shows warnings)
    "lint:ci": "eslint src --quiet", // CI mode (errors only, exit 0)
    "lint:fix": "eslint src --fix",  // Auto-fix issues
    "build": "vite build"            // Production build
  }
}
```

### Backend Verify Phase
```bash
./mvnw verify
```

Runs:
1. **compile** - Java compilation
2. **test** - JUnit 5 tests
3. **jacoco:report** - Code coverage metrics
4. **surefire:report** - Test report generation

---

## 🐛 Troubleshooting

### Issue: Backend Permission Denied on Linux
**Fix**: Already fixed in workflow
```yaml
- name: Make Maven wrapper executable
  run: chmod +x mvnw
```

### Issue: ESLint warnings fail CI
**Fix**: Using `npm run lint:ci` (--quiet flag)
- Shows: 0 errors
- Hides: 253 warnings
- Exit code: 0 (pass)

### Issue: Frontend build fails
**Fix**: Check frontend logs
```bash
cd frontend
npm ci --verbose    # Reinstall with verbose output
npm run build       # Test build locally
```

### Issue: Backend tests timeout
**Fix**: MySQL service health check
```yaml
options: >-
  --health-cmd="mysqladmin ping -h localhost"
  --health-timeout=5s
  --health-retries=5
```

---

## 🔄 Deployment (Optional Future Enhancement)

Workflow hiện tại build → artifact nhưng chưa deploy.
Để thêm deployment, có thể extend workflow:

```yaml
deploy:
  name: Deploy to Azure (or AWS)
  needs: [frontend, backend]
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  
  runs-on: ubuntu-latest
  steps:
    # Download artifacts
    # Deploy frontend to Azure Static Web Apps
    # Deploy backend to Azure App Service
    # Run smoke tests
```

---

## 📞 Reference

- **Actions Docs**: https://docs.github.com/en/actions
- **Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **Auto-Merge**: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
