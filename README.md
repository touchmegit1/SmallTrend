# SmallTrend - Hệ Thống Quản Lý Bán Hàng (POS)

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5.2.0-yellowgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

**SmallTrend** là một giải pháp phần mềm quản lý bán hàng (POS) toàn diện, được thiết kế đặc biệt cho các cửa hàng bán lẻ quy mô vừa và nhỏ. Hệ thống tập trung vào hiệu suất, tính ổn định và trải nghiệm người dùng thân thiện.

**Nhóm phát triển**: SE1992 - Group 5

---

## 🚀 Công nghệ sử dụng

<details>
  <summary><strong>Backend (Spring Boot)</strong></summary>
  
  - **Framework**: Spring Boot 3.2.5
  - **Ngôn ngữ**: Java 17
  - **Database**: MySQL 8.0
  - **Migration**: Flyway
  - **Bảo mật**: Spring Security, JWT (JSON Web Tokens)
  - **Build Tool**: Apache Maven
  - **API Docs**: OpenAPI (Swagger)
</details>

<details>
  <summary><strong>Frontend (React)</strong></summary>
  
  - **Framework**: React 18 (sử dụng Vite)
  - **Styling**: Tailwind CSS
  - **UI Components**: Shadcn UI, Radix UI
  - **Icons**: Lucide React
  - **Quản lý state**: Zustand, React Context
  - **Build Tool**: Node.js, npm
</details>

---

## 🌟 Các Module Chức Năng Chính

Dự án được chia thành các module nghiệp vụ chính, mỗi module có một người phụ trách riêng:

-   **POS (Bán hàng)**: Giao diện bán hàng, xử lý thanh toán, in hóa đơn.
-   **Inventory (Quản lý kho)**: Nhập/xuất/kiểm kê kho, quản lý lô và hạn sử dụng.
-   **Product (Sản phẩm & Giá)**: Quản lý sản phẩm, danh mục, thương hiệu và các bảng giá.
-   **CRM & Promotion (Khách hàng & Khuyến mãi)**: Quản lý thông tin khách hàng, tích điểm, tạo và áp dụng khuyến mãi.
-   **HR & Shift (Nhân sự & Ca làm việc)**: Quản lý nhân viên, phân quyền, chấm công và tính lương.
-   **Reports & AI (Báo cáo & Trí tuệ nhân tạo)**: Thống kê, báo cáo kinh doanh và tích hợp AI để dự báo.

---

## 🏁 Bắt đầu nhanh (Quick Start)

Để khởi chạy dự án, vui lòng làm theo hướng dẫn chi tiết trong file **[SETUP_GUIDE.md](SETUP_GUIDE.md)**.

Dưới đây là các lệnh cơ bản để chạy dự án sau khi đã hoàn tất cài đặt:

### Chạy Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy ứng dụng Spring Boot
mvn spring-boot:run
```
Backend sẽ khởi động tại `http://localhost:8081`.

### Chạy Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các dependencies
npm install

# Khởi chạy development server
npm run dev
```
Frontend sẽ có sẵn tại `http://localhost:5173`.

---

## 🤝 Quy tắc đóng góp

Để đảm bảo chất lượng code và sự ổn định của dự án, tất cả các thành viên cần tuân thủ các quy tắc sau:

1.  **Branching Model**: Sử dụng Git Flow. Tạo branch mới từ `develop` cho mỗi tính năng (`feature/ten-tinh-nang`).
2.  **Commit Message**: Viết commit message rõ ràng theo chuẩn (ví dụ: `feat: Add login functionality`).
3.  **Pull Request**: Tạo Pull Request (PR) vào nhánh `develop` để review code. PR phải được ít nhất một thành viên khác approve trước khi merge.
4.  **Security**: **Tuyệt đối không** push các thông tin nhạy cảm như `.env`, `application.properties` (chứa mật khẩu), hoặc các thư mục như `target/`, `node_modules/` lên repository.

