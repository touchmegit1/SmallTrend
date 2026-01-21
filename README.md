# SmallTrend - Hệ Thống Quản Lý Bán Hàng (POS)

## 1. Giới thiệu dự án
**SmallTrend** là ứng dụng web quản lý toàn diện cho một cửa hàng bán lẻ/tiện lợi quy mô vừa và nhỏ. Hệ thống được thiết kế để hoạt động ổn định, tốc độ xử lý nhanh và giao diện thân thiện.

**Nhóm phát triển**: SE1961 - Group 4

## 2. Công nghệ sử dụng
*   **Frontend**: React (Vite), Tailwind CSS v4, Lucide React Symbols.
*   **Backend**: Spring Boot (Java), Maven.
*   **Database**: (Cập nhật sau).

## 3. Cấu trúc thư mục
Cấu trúc dự án được tổ chức rõ ràng theo mô hình Client-Server, đảm bảo tiêu chuẩn bảo mật và dễ dàng mở rộng.

```
SmallTrend/
├── backend/                    # Backend (Java Spring Boot)
│   ├── src/main/java/com/be/
│   │   ├── config/             # System Configuration (Security, AppConfig)
│   │   ├── controller/         # REST Controllers (API Endpoints)
│   │   ├── dto/                # Data Transfer Objects (Request/Response)
│   │   ├── entity/             # Database Entities (JPA Models)
│   │   ├── exception/          # Global Error Handling
│   │   ├── repository/         # Data Access Layer (JPA Repositories)
│   │   ├── service/            # Business Logic Layer
│   │   └── util/               # Utility Classes
│   └── pom.xml                 # Maven Dependencies
│
└── frontend/                   # Frontend (React + Vite)
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
    ├── .env                    # Frontend Environment Variables (Local only)
    ├── tailwind.config.js      # Tailwind CSS Configuration
    └── vite.config.js          # Vite Configuration
```

### Git Security Standards
*   **Strict Ignore**, Các file sau **tuyệt đối không** được push lên GitHub:
    *   `node_modules/` (Frontend dependencies)
    *   `target/` (Backend build artifacts)
    *   `.env`, `.env.local` (Chứa API Keys, Database Credentials)
    *   `.vscode/`, `.idea/` (Cấu hình editor cá nhân)

## 4. Chi tiết các Module nghiệp vụ

### Module 1: POS (Bán hàng)
*   **Người phụ trách**: Huy
*   **Chức năng**:
    *   Giao diện bán hàng (hỗ trợ phím tắt).
    *   Tra cứu sản phẩm (Scan barcode/Tìm kiếm).
    *   Xử lý giỏ hàng & Thanh toán.
    *   Đơn hàng treo & in hóa đơn.

### Module 2: Inventory (Kho)
*   **Người phụ trách**: Dương
*   **Chức năng**:
    *   Nhập kho (Phiếu nhập NCC).
    *   Xuất kho (Hủy/Nội bộ).
    *   Kiểm kê kho & Cân bằng kho.
    *   Quản lý Lô & Hạn sử dụng (Date).
    *   Cảnh báo hàng sắp hết hạn.

### Module 3: Product (Sản phẩm & Giá)
*   **Người phụ trách**: Tú
*   **Chức năng**:
    *   Quản lý Sản phẩm, Danh mục, Thương hiệu.
    *   Thiết lập Bảng giá (Vốn, Lẻ, Sỉ).
    *   In tem mã vạch.

### Module 4: CRM & Promotion (Khách hàng & KM)
*   **Người phụ trách**: Hưng
*   **Chức năng**:
    *   Hồ sơ khách hàng & Tích điểm thành viên.
    *   Cấu hình Khuyến mãi & Voucher.
    *   Xử lý khiếu nại.

### Module 5: HR & Shift (Nhân sự & Ca)
*   **Người phụ trách**: Kiên
*   **Chức năng**:
    *   Hồ sơ nhân viên & Phân quyền.
    *   Thiết lập Ca làm việc & Phân ca.
    *   Chấm công & Tính lương cơ bản.

### Module 6: Reports & AI (Báo cáo & AI)
*   **Người phụ trách**: Huy Anh
*   **Chức năng**:
    *   Nhật ký hoạt động.
    *   Hệ thống báo cáo tổng hợp.
    *   Tích hợp AI dự báo.

## 5. Hướng dẫn chạy dự án

### Frontend
```bash
cd frontend
npm install   # Cài đặt dependencies (bao gồm Lucide, Tailwind)
npm run dev   # Khởi chạy server development
```

### Backend
```bash
cd backend
mvn spring-boot:run # Khởi chạy server Spring Boot
```
