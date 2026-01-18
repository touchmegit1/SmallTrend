# SmallTrend - POS System

## Giới thiệu

**SmallTrend** là một hệ thống Point of Sale (POS) 

## Cấu trúc Dự Án

```
SmallTrend/
├── BE/                         # Backend (Java Springboots)
└── FE/                         # Frontend (React)
    ├── public/                 # Static Files (favicon, index.html)
    ├── src/
    │   ├── assets/             # Images, Fonts, Global Styles
    │   ├── components/         # Reusable UI Components
    │   │   ├── common/         # Common Components (Button, Input, Modal)
    │   │   └── layout/         # Layout Components (Header, Sidebar, Footer)
    │   ├── config/             # Configuration (Axios instance, Constants)
    │   ├── context/            # Global State (AuthContext, CartContext)
    │   ├── hooks/              # Custom Hooks (useAuth, useCart)
    │   ├── pages/              # Main Pages
    │   │   ├── Auth/           # Login, Register, ForgotPassword
    │   │   ├── Dashboard/      # Statistics & Analytics Page
    │   │   ├── POS/            # Main Sales Interface
    │   │   └── Products/       # Product Management
    │   ├── services/           # API Services (authService, productService)
    │   ├── utils/              # Utility Functions (formatCurrency, formatDate)
    │   ├── App.jsx             # Main Component
    │   └── main.jsx            # Entry Point
    ├── .env                    # Frontend Environment Variables
    └── package.json
```

## Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- **Node.js**: v16.x hoặc cao hơn
- **npm**: v7.x hoặc cao hơn (hoặc yarn/pnpm)
- **Git**: Để version control

### Cài Đặt Frontend

```bash
cd FE
npm install
npm run dev
```

### Cài Đặt Backend

## Giải Thích Chi Tiết Từng Folder

### Frontend (FE)

#### `public/`
Chứa các file tĩnh như `index.html`, `favicon.ico`, `robots.txt`.

#### `src/assets/`
Lưu trữ hình ảnh, font chữ, và các stylesheet toàn cục.

```
assets/
├── images/
├── fonts/
└── styles/
```

#### `src/components/`
Các component UI tái sử dụng được:

- **common/**: Button, Input, Modal, Card, Loading, Toast
- **layout/**: Header, Sidebar, Footer, MainLayout

#### `src/config/`
Cấu hình ứng dụng:
- `axios.js` - HTTP client instance
- `constants.js` - Constant values
- `api.js` - API endpoints

#### `src/context/`
Global state management:
- `AuthContext.jsx` - Quản lý authentication
- `CartContext.jsx` - Quản lý giỏ hàng
- `ThemeContext.jsx` - Quản lý theme (light/dark)

#### `src/hooks/`
Custom React hooks:
- `useAuth.js` - Lấy dữ liệu auth
- `useCart.js` - Quản lý giỏ hàng
- `useFetch.js` - Fetch dữ liệu từ API

#### `src/pages/`
Các trang chính:
- **Auth/**: Login, Register, ForgotPassword
- **Dashboard/**: Thống kê, analytics
- **POS/**: Giao diện bán hàng chính
- **Products/**: Quản lý sản phẩm

#### `src/services/`
Các hàm gọi API:
- `authService.js`
- `productService.js`
- `orderService.js`
- `userService.js`

#### `src/utils/`
Các hàm tiện ích:
- `formatCurrency.js` - Format tiền tệ
- `formatDate.js` - Format ngày tháng
- `validation.js` - Validate data

## Công Nghệ Sử Dụng

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API / Redux** - State management
- **Tailwind CSS / Material-UI** - CSS framework

### Backend

# Git Commit Convention

Quy ước commit này giúp đảm bảo lịch sử git sạch sẽ, dễ đọc và thuận tiện cho việc tracking thay đổi.

## Định Dạng Commit

Mỗi commit message phải tuân theo định dạng sau:

| Type | Ý Nghĩa | Ví Dụ |
|------|---------|-------|
| **feat** | Thêm tính năng mới | `feat(auth): add login functionality` |
| **fix** | Sửa lỗi (bug) | `fix(pos): correct calculation logic` |
| **docs** | Thay đổi tài liệu | `docs: update README installation guide` |
| **style** | Thay đổi format code, không ảnh hưởng logic | `style(components): format button component` |
| **refactor** | Tái cấu trúc code mà không thay đổi chức năng | `refactor(services): optimize api calls` |
| **perf** | Cải thiện hiệu năng | `perf(dashboard): reduce load time by 50%` |
| **test** | Thêm hoặc cập nhật tests | `test(products): add product list tests` |
| **ci** | Thay đổi CI/CD configuration | `ci: update github workflows` |
| **chore** | Công việc khác (dependencies, build, etc.) | `chore: update dependencies` |