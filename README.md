# 🏪 SmallTrend - Hệ thống quản lý cửa hàng tạp hóa tiện lợi

Hệ thống POS (Point of Sale) hiện đại giúp quản lý toàn diện các hoạt động của cửa hàng tạp hóa/siêu thị mini, từ bán hàng, quản lý kho, nhân sự, khách hàng đến báo cáo thống kê.

---

---

## 🚀 Quick Start - Chạy Dự Án Nhanh Chóng

### Yêu cầu hệ thống
- **Java 17** hoặc cao hơn ([Download JDK](https://www.oracle.com/java/technologies/downloads/#java17))
- **MySQL 8.0** ([Download MySQL](https://dev.mysql.com/downloads/))
- **Node.js 18+** cho Frontend ([Download Node.js](https://nodejs.org/))

### 🎯 Maven Wrapper - Không Cần Cài Maven!

**Maven Wrapper** là tool tự động giúp bạn:
- ✅ **Không cần cài Maven** trên máy
- ✅ **Tự động download** đúng version Maven khi chạy lần đầu
- ✅ **Cross-platform**: Chạy trên Windows, Mac, Linux
- ✅ **Đảm bảo version** giống nhau trong team

**Files quan trọng:**
- `mvnw` - Script cho Linux/Mac
- `mvnw.cmd` - Script cho Windows
- `.mvn/wrapper/` - Chứa cấu hình Maven Wrapper

### 📦 Setup Backend (3 bước đơn giản)

#### Bước 1: Tạo Database
```sql
CREATE DATABASE smalltrend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Bước 2: Cấu hình Database
Mở file `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smalltrend
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE
```

#### Bước 3: Chạy Backend
```bash
# Windows
cd backend
.\mvnw spring-boot:run

# Linux/Mac
cd backend
./mvnw spring-boot:run
```

✅ **Backend chạy tại:** `http://localhost:8081`

### 📱 Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ **Frontend chạy tại:** `http://localhost:5173`

### 🎉 Các Cách Chạy Backend

#### Cách 1: Maven Wrapper (Khuyên dùng)
```bash
cd backend
.\mvnw spring-boot:run          # Windows
./mvnw spring-boot:run          # Linux/Mac
```

#### Cách 2: Script run.cmd (Windows)
```bash
backend\run.cmd
```

#### Cách 3: Build JAR và chạy
```bash
cd backend
.\mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### ✅ Kiểm tra Backend hoạt động

Mở trình duyệt:
- **Health Check**: http://localhost:8081/actuator/health
- **API Endpoint**: http://localhost:8081/api/

---

## 🛠 Công nghệ sử dụng

### Backend (Java Spring Boot)
-   **Spring Boot 3.2.5**: Framework chính
-   **Java 17**: Ngôn ngữ lập trình
-   **Spring Security + JWT**: Xác thực và phân quyền
-   **Spring Data JPA**: ORM (Object-Relational Mapping)
-   **MySQL 8.0**: Cơ sở dữ liệu
-   **Maven Wrapper**: Build tool (không cần cài Maven)

### Frontend (React)
-   **React 18**: Thư viện UI
-   **Vite 5.2.0**: Build tool nhanh
-   **React Router DOM**: Routing
-   **Axios**: HTTP client
-   **Tailwind CSS**: Utility-first CSS framework
-   **Shadcn/ui & Radix UI**: Component library
-   **Lucide React**: Icon library

---

## 🎯 Các Module Chức Năng Chính

### 1. **Quản lý Bán hàng (POS - Point of Sale)**
-   Giao diện bán hàng nhanh tại quầy thu ngân
-   Scan barcode sản phẩm
-   Tính toán tự động: tổng tiền, thuế VAT, giảm giá
-   In hóa đơn
-   Thanh toán đa phương thức: Tiền mặt, Thẻ, Ví điện tử

### 2. **Quản lý Sản phẩm**
-   Thêm/sửa/xóa sản phẩm
-   Quản lý variants (biến thể): kích thước, màu sắc, đóng gói
-   Barcode và SKU
-   Phân loại theo danh mục và thương hiệu
-   Quản lý giá và giá vốn
-   Upload hình ảnh sản phẩm

### 3. **Quản lý Kho (Inventory)**
-   Nhập kho từ nhà cung cấp
-   Xuất kho khi bán hàng (tự động)
-   Kiểm kho định kỳ
-   Cảnh báo sản phẩm sắp hết hàng
-   Lịch sử nhập/xuất kho
-   Quản lý vị trí kho

### 4. **Quản lý Khách hàng**
-   Thông tin khách hàng: tên, SĐT, email, địa chỉ
-   Chương trình tích điểm thành viên
-   Phân loại khách hàng: VIP, thường, mới
-   Lịch sử mua hàng
-   Khuyến mãi riêng cho khách hàng thân thiết

### 5. **Quản lý Khuyến mãi**
-   Tạo mã giảm giá
-   Giảm theo %  hoặc số tiền cố định
-   Áp dụng cho sản phẩm hoặc đơn hàng
-   Thời gian hiệu lực
-   Điều kiện áp dụng

### 6. **Quản lý Nhân viên & Ca làm việc**
-   Thông tin nhân viên
-   Phân quyền: Admin, Quản lý, Thu ngân, Kho
-   Chấm công vào/ra
-   Quản lý ca làm việc
-   Lịch sử thao tác (Audit log)

### 7. **Quản lý Nhà cung cấp**
-   Thông tin nhà cung cấp
-   Lịch sử nhập hàng
-   Công nợ phải trả

### 8. **Báo cáo & Thống kê**
-   Doanh thu theo ngày/tháng/năm
-   Sản phẩm bán chạy
-   Lợi nhuận
-   Tồn kho hiện tại
-   Chi phí vận hành

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 🔵 Kiến trúc Backend (Spring Boot - 3 Layers)

```
backend/
├── src/main/
│   ├── java/com/smalltrend/
│   │   ├── SmallTrendApplication.java    # 🚀 Entry Point
│   │   │
│   │   ├── config/                        # ⚙️ CONFIGURATION
│   │   │   ├── AppConfig.java            # Bean definitions
│   │   │   └── SecurityConfig.java       # Spring Security + JWT
│   │   │
│   │   ├── entity/                        # 🗄️ DATABASE ENTITIES (25 tables)
│   │   │   ├── User.java                 # Người dùng
│   │   │   ├── Product.java              # Sản phẩm (sữa, nước ngọt, snack...)
│   │   │   ├── InventoryStock.java       # Tồn kho
│   │   │   ├── SalesOrder.java           # Đơn hàng
│   │   │   └── ...
│   │   │
│   │   ├── repository/                    # 💾 DATA ACCESS LAYER
│   │   │   ├── UserRepository.java       # CRUD cho User
│   │   │   ├── ProductRepository.java    # CRUD + custom queries
│   │   │   └── ...
│   │   │
│   │   ├── service/                       # 🧠 BUSINESS LOGIC
│   │   │   ├── UserService.java          # Logic user, phân quyền
│   │   │   ├── ProductService.java       # Logic sản phẩm
│   │   │   └── ...
│   │   │
│   │   ├── controller/                    # 🌐 REST API
│   │   │   ├── AuthController.java       # POST /api/auth/login
│   │   │   ├── ProductController.java    # GET/POST/PUT/DELETE /api/products
│   │   │   └── ...
│   │   │
│   │   ├── dto/                           # 📦 DATA TRANSFER OBJECTS
│   │   │   ├── request/                  # Request DTOs
│   │   │   └── response/                 # Response DTOs
│   │   │
│   │   └── exception/                     # ⚠️ EXCEPTION HANDLING
│   │       └── GlobalExceptionHandler.java
│   │
│   └── resources/
│       ├── application.properties         # Config (xem .example)
│       └── db/migration/                  # Flyway SQL scripts
│           └── V1__create_schema.sql     # Tạo 25 tables
```

**Luồng xử lý:**
```
HTTP Request → Controller → Service → Repository → Database
                   ↓            ↓          ↓
              Validate     Business    Query DB
                           Logic
                   ↓            ↓          ↓
HTTP Response ← DTO Response ← Entity ← Database
```

---

### 🔴 Kiến trúc Frontend (React - Đơn giản)

```
frontend/src/
├── pages/                           # 📄 PAGES (Mỗi trang = 1 route)
│   ├── Auth/Login.jsx              # Trang đăng nhập
│   ├── Dashboard/Dashboard.jsx     # Trang dashboard
│   └── ...
│
├── components/                      # 🧩 COMPONENTS TÁI SỬ DỤNG
│   ├── common/                     # Components chung
│   │   └── ProtectedRoute.jsx     # Bảo vệ route cần đăng nhập
│   └── layout/                     # Layout
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       └── MainLayout.jsx
│
├── services/                        # 🌐 API CALLS
│   ├── authService.js              # login(), logout()
│   ├── shiftService.js             # API shift
│   └── ...
│
├── context/                         # ⚡ GLOBAL STATE
│   └── AuthContext.jsx             # user, token, login/logout
│
├── config/                          # ⚙️ CONFIG
│   └── axiosConfig.js              # Axios với JWT interceptor
│
├── App.jsx                          # Root component
├── main.jsx                         # Entry point
└── index.css                        # Tailwind CSS
```

**Luồng data:**
```
User → Component → Service (API) → Backend → Response → Context → Re-render
```

---

## 🗄️ DATABASE SCHEMA (25 Tables)

### 📊 ER Diagram Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMALLTREND POS DATABASE                       │
│                     (Cửa hàng tạp hóa)                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   users      │────▶│    roles     │     │  customers   │
│              │     │              │     │              │
│ - id         │     │ - id         │     │ - id         │
│ - username   │     │ - name       │     │ - name       │
│ - password   │     │ - permissions│     │ - phone      │
│ - role_id    │     └──────────────┘     │ - points     │
└───────┬──────┘                          └──────────────┘
        │                                          │
        │                                          │
        ▼                                          ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ sales_orders │────▶│ order_items  │────▶│  products    │
│              │     │              │     │              │
│ - id         │     │ - order_id   │     │ - id         │
│ - user_id    │     │ - product_id │     │ - name       │
│ - customer_id│     │ - variant_id │     │ - barcode    │
│ - total      │     │ - quantity   │     │ - category_id│
│ - paid_amount│     │ - price      │     │ - brand_id   │
│ - created_at │     └──────────────┘     └───────┬──────┘
└──────────────┘              │                    │
                              │                    │
                              ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   payments   │     │   variants   │     │  categories  │
│              │     │              │     │              │
│ - id         │     │ - id         │     │ - id         │
│ - order_id   │     │ - product_id │     │ - name       │
│ - method     │     │ - sku        │     │ - parent_id  │
│ - amount     │     │ - price      │     └──────────────┘
└──────────────┘     └──────────────┘
                              │
                              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ inventory_   │────▶│ inventory_   │     │   brands     │
│  stocks      │     │ transactions │     │              │
│              │     │              │     │ - id         │
│ - variant_id │     │ - variant_id │     │ - name       │
│ - quantity   │     │ - type       │     │ - country    │
│ - location   │     │ - quantity   │     └──────────────┘
└──────────────┘     │ - reason     │
                     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ promotions   │────▶│ promotion_   │     │  suppliers   │
│              │     │  products    │     │              │
│ - id         │     │              │     │ - id         │
│ - code       │     │ - promo_id   │     │ - name       │
│ - type       │     │ - product_id │     │ - contact    │
│ - value      │     └──────────────┘     │ - address    │
│ - start_date │                          └──────────────┘
│ - end_date   │
└──────────────┘

... + 13 tables khác (shifts, attendance, expenses, daily_reports, 
audit_logs, notifications, settings, price_histories, 
loyalty_transactions, return_orders)
```

### 📋 Danh sách 25 Tables Chi Tiết

| # | Tên Bảng | Mô tả | Ví dụ Data |
|---|----------|-------|------------|
| 1 | **roles** | Vai trò người dùng | Admin, Cashier, Manager |
| 2 | **users** | Tài khoản người dùng | admin, cashier01 |
| 3 | **customers** | Khách hàng thân thiết | Trần Văn A - 0912345678 - 1500 điểm |
| 4 | **categories** | Danh mục sản phẩm | Đồ uống, Thực phẩm, Gia vị |
| 5 | **brands** | Thương hiệu | Vinamilk, Coca-Cola, Oishi, OMO |
| 6 | **suppliers** | Nhà cung cấp | Vinamilk, TH True Milk |
| 7 | **products** | Sản phẩm chính | Coca-Cola 330ml, Sữa Vinamilk 1L |
| 8 | **variants** | Biến thể sản phẩm | Coca 330ml Can, 1.5L Bottle |
| 9 | **inventory_stocks** | Tồn kho hiện tại | Variant_ID: 1, Kho A, SL: 500 |
| 10 | **inventory_transactions** | Lịch sử nhập/xuất kho | Nhập 100 thùng Coca ngày 15/1 |
| 11 | **sales_orders** | Đơn hàng bán | Order #00123 - Tổng: 150.000đ |
| 12 | **order_items** | Chi tiết từng món trong đơn | 2x Coca @ 10.000đ |
| 13 | **payments** | Thanh toán | Tiền mặt 200.000đ |
| 14 | **promotions** | Khuyến mãi | Giảm 10% đồ uống |
| 15 | **promotion_products** | Sản phẩm được KM | Promotion #1 → Product #5 |
| 16 | **shifts** | Ca làm việc | Ca sáng 7:00-12:00 |
| 17 | **attendance** | Chấm công | Check-in 7:05 |
| 18 | **expenses** | Chi phí vận hành | Tiền điện 500k |
| 19 | **daily_reports** | Báo cáo hàng ngày | Doanh thu 2.5M |
| 20 | **audit_logs** | Lịch sử thao tác | Admin xóa sản phẩm #10 |
| 21 | **notifications** | Thông báo hệ thống | "Sản phẩm X sắp hết" |
| 22 | **settings** | Cấu hình hệ thống | TAX_RATE = 0.1 |
| 23 | **price_histories** | Lịch sử giá | Coca 9k → 10k |
| 24 | **loyalty_transactions** | Tích điểm | +15 điểm cho đơn 150k |
| 25 | **return_orders** | Đơn trả hàng | Trả 2 chai sữa hỏng |

### 🔑 Quan Hệ Foreign Keys

```sql
-- User & Role
users.role_id → roles.id

-- Product Structure
products.category_id → categories.id
products.brand_id → brands.id
products.supplier_id → suppliers.id
variants.product_id → products.id

-- Inventory
inventory_stocks.variant_id → variants.id
inventory_transactions.variant_id → variants.id

-- Sales Order
sales_orders.user_id → users.id
sales_orders.customer_id → customers.id
order_items.order_id → sales_orders.id
order_items.product_id → products.id
order_items.variant_id → variants.id
payments.order_id → sales_orders.id

-- Promotions
promotion_products.promotion_id → promotions.id
promotion_products.product_id → products.id
```

---

## 🔄 DATA FLOW & USE CASES

### 🛒 Use Case 1: Bán Hàng Tại Quầy (POS)

**Luồng xử lý:**
```
1. Cashier scan barcode/search sản phẩm
   → GET /api/products?barcode=123456

2. Thêm vào giỏ hàng (CartContext)

3. Áp dụng khuyến mãi
   → POST /api/promotions/apply

4. Thanh toán
   → POST /api/orders
   Body: {
     customerId: 5,
     items: [{ variantId: 1, quantity: 2, price: 10000 }],
     payments: [{ method: "CASH", amount: 30000 }]
   }

5. Backend:
   - Tạo sales_order
   - Tạo order_items
   - Tạo payments
   - Trừ inventory_stocks
   - Cộng loyalty_points

6. In hóa đơn
   → GET /api/orders/{id}/receipt
```

---

### 📦 Use Case 2: Nhập Kho

**Luồng xử lý:**
```
1. Staff chọn sản phẩm và số lượng

2. Submit phiếu nhập
   → POST /api/inventory/inbound
   Body: {
     supplierId: 2,
     items: [{ variantId: 1, quantity: 100, cost: 8000 }]
   }

3. Backend:
   - Tạo inventory_transactions (type: INBOUND)
   - Cộng inventory_stocks.quantity
   - Cập nhật average_cost
```

---

### 📊 Use Case 3: Báo Cáo Doanh Thu

**API:**
```http
GET /api/reports/revenue?from=2025-01-01&to=2025-01-31
```

**SQL Query:**
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    SUM(total_amount) as revenue,
    SUM(discount) as total_discount
FROM sales_orders
WHERE created_at BETWEEN ? AND ?
  AND status = 'COMPLETED'
GROUP BY DATE(created_at)
```

---

## 📚 API DOCUMENTATION

### 🔐 Authentication

#### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "admin",
  "roles": ["ROLE_ADMIN"]
}
```

---

### 🛍️ Products

#### Lấy danh sách sản phẩm (có phân trang)
```http
GET /api/products?page=0&size=20&search=coca
Authorization: Bearer {token}
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Coca-Cola 330ml",
      "barcode": "8934588012345",
      "sku": "COCA-330ML",
      "category": { "id": 2, "name": "Đồ uống" },
      "brand": { "id": 2, "name": "Coca-Cola" },
      "variants": [
        {
          "id": 1,
          "name": "Lon 330ml",
          "price": 10000,
          "stock": 500
        }
      ]
    }
  ],
  "totalElements": 150,
  "totalPages": 8
}
```

---

#### Tạo sản phẩm mới
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sữa tươi Vinamilk 1L",
  "barcode": "8934588123456",
  "sku": "VINAMILK-1L",
  "categoryId": 1,
  "brandId": 1,
  "variants": [
    {
      "name": "Hộp 1L",
      "sku": "VINAMILK-1L-BOX",
      "price": 28000,
      "cost": 24000,
      "initialStock": 100
    }
  ]
}
```

---

### 🛒 Orders

#### Tạo đơn hàng
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": 5,
  "items": [
    { "variantId": 1, "quantity": 2, "price": 10000 },
    { "variantId": 3, "quantity": 1, "price": 28000 }
  ],
  "promotionCode": "GIAM10",
  "payments": [
    { "method": "CASH", "amount": 50000 }
  ]
}
```

**Response:**
```json
{
  "id": 12345,
  "orderNumber": "ORD-20250115-12345",
  "subtotal": 48000,
  "discount": 4800,
  "tax": 4320,
  "total": 47520,
  "paidAmount": 50000,
  "changeAmount": 2480
}
```

---

### 📦 Inventory

#### Nhập kho
```http
POST /api/inventory/inbound
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplierId": 2,
  "items": [
    { "variantId": 1, "quantity": 100, "cost": 8000 }
  ],
  "notes": "Nhập đợt 15/1/2025"
}
```

---

#### Kiểm tra tồn kho thấp
```http
GET /api/inventory/stocks?lowStockOnly=true&threshold=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "lowStockItems": [
    {
      "variantId": 15,
      "productName": "Snack Oishi 50g",
      "currentStock": 8,
      "threshold": 10,
      "status": "LOW_STOCK"
    }
  ]
}
```

---

### 👥 Customers

#### Tìm khách hàng theo SĐT
```http
GET /api/customers/search?phone=0912345678
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 5,
  "name": "Trần Văn A",
  "phone": "0912345678",
  "loyaltyPoints": 1547,
  "tier": "GOLD",
  "totalPurchases": 2450000
}
```

---

### 📊 Reports

#### Báo cáo doanh thu theo ngày
```http
GET /api/reports/revenue/daily?from=2025-01-01&to=2025-01-15
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "date": "2025-01-15",
      "totalOrders": 45,
      "revenue": 2750000,
      "discount": 275000,
      "netRevenue": 2475000
    }
  ],
  "summary": {
    "totalRevenue": 35000000,
    "totalOrders": 650
  }
}
```

---

### ⚠️ Error Responses

Tất cả API trả error theo format:

```json
{
  "timestamp": "2025-01-15T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Số lượng sản phẩm không đủ trong kho",
  "path": "/api/orders"
}
```

**HTTP Status Codes:**
- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không có quyền
- `404 Not Found`: Không tìm thấy
- `500 Internal Server Error`: Lỗi server

---

## 📋 Mục lục

- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Các Module Chức Năng](#-các-module-chức-năng-chính)
- [Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [Database Schema](#️-database-schema-25-tables)
- [Data Flow & Use Cases](#-data-flow--use-cases)
- [API Documentation](#-api-documentation)
- [Yêu cầu phần mềm](#-yêu-cầu-phần-mềm-prerequisites)
- [Hướng dẫn Cài đặt](#-hướng-dẫn-cài-đặt)
- [Test API](#-test-api-với-postman)
- [Quy tắc đóng góp](#-quy-tắc-đóng-góp)

---

## 📦 Yêu cầu phần mềm (Prerequisites)

| Công cụ | Phiên bản | Ghi chú |
|---------|-----------|---------|
| **JDK** | **17** | Bắt buộc |
| **Maven** | 3.8+ | Build tool |
| **Node.js** | 20.x LTS | Frontend |
| **MySQL** | 8.0+ | Database |
| **Git** | Latest | Version control |

---

## 🚀 Hướng dẫn Cài đặt

### 1. Cài đặt Backend (Spring Boot)

#### Bước 1.1: Clone dự án

```bash
git clone <your-repository-url>
cd SmallTrend
```

#### Bước 1.2: Cấu hình Database MySQL

**Tạo Database:**

```sql
CREATE DATABASE smalltrend_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Cấu hình kết nối:**

Copy file template và điền thông tin:

```bash
cd backend/src/main/resources
cp application.properties.example application-local.properties
```

Mở `application-local.properties` và cập nhật:
- `spring.datasource.username` = MySQL username của bạn
- `spring.datasource.password` = MySQL password của bạn
- `jwt.secret` = Tạo secret key mới (256 bits)

#### Bước 1.3: Cấu hình JDK 17 trong IntelliJ

1. Mở dự án (`File` > `Open...`)
2. `File` > `Project Structure` (Ctrl+Alt+Shift+S)
3. **Project**: Chọn **SDK = JDK 17**, **Language level = 17**
4. **Modules** > **Dependencies**: **Module SDK = Project SDK (17)**
5. Nhấn `OK`

#### Bước 1.4: Build và Chạy Backend

1. Maven: `View` > `Tool Windows` > `Maven` → `Reload All Maven Projects`
2. Chạy: Chuột phải `SmallTrendApplication.java` → `Run`

Backend khởi động tại `http://localhost:8080`

---

### 2. Cài đặt Frontend (React)

#### Bước 2.1: Cài đặt Dependencies

```bash
cd frontend
npm install
```

#### Bước 2.2: Cấu hình Environment

Copy file template:

```bash
cp .env.example .env
```

Mở `.env` và điền thông tin (xem hướng dẫn trong `.env.example`)

#### Bước 2.3: Chạy Frontend

```bash
npm run dev
```

Frontend chạy tại `http://localhost:5173`

---

### 3. Khắc phục lỗi thường gặp

<details>
<summary><strong>❌ Lỗi: Port already in use</strong></summary>

**Windows:**
```powershell
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay <PID> bằng số tìm được)
taskkill /PID <PID> /F
```

Hoặc đổi port trong `application.properties`:
```properties
server.port=8081
```
</details>

<details>
<summary><strong>❌ Lỗi: Access denied for user 'root'@'localhost'</strong></summary>

Sai username/password MySQL. Kiểm tra lại `application-local.properties`:
```properties
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```
</details>

<details>
<summary><strong>❌ Lỗi: Unknown database 'smalltrend_db'</strong></summary>

Chưa tạo database. Chạy:
```sql
CREATE DATABASE smalltrend_db CHARACTER SET utf8mb4;
```
</details>

<details>
<summary><strong>❌ Lỗi: Maven build failed - Java version</strong></summary>

Sai JDK version. Kiểm tra:
```bash
java -version  # Phải là 17.x.x
mvn -version   # Java version phải là 17
```

Nếu sai: IntelliJ → `File` > `Project Structure` → Chọn JDK 17
</details>

---

## 🧪 Test API với Postman

### 1. Import Collection

Tạo collection mới trong Postman với các request sau:

### 2. Test Login

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Lưu token từ response để dùng cho các request khác.

### 3. Test Protected Endpoint

```http
GET http://localhost:8080/api/products
Authorization: Bearer {token_từ_login}
```

### 4. Các mã lỗi thường gặp

| HTTP Code | Ý nghĩa | Nguyên nhân |
|-----------|---------|-------------|
| **200** | OK | Thành công |
| **401** | Unauthorized | Token không hợp lệ/hết hạn |
| **403** | Forbidden | Không có quyền |
| **404** | Not Found | API không tồn tại |
| **400** | Bad Request | Dữ liệu sai định dạng |

---

## 🤝 Quy tắc đóng góp

1. **Branching**: Dùng Git Flow. Tạo branch từ `develop`:
   ```bash
   git checkout -b feature/ten-tinh-nang
   ```

2. **Commit Message**: Viết rõ ràng
   ```
   feat: Add login functionality
   fix: Fix inventory stock calculation
   docs: Update README
   ```

3. **Pull Request**: Tạo PR vào `develop`, cần ít nhất 1 approve

4. **Security**: 
   - ❌ KHÔNG commit `.env`, `application-local.properties`
   - ❌ KHÔNG commit `target/`, `node_modules/`
   - ✅ Chỉ commit file `.example`

---

---

## 🔧 Xử lý lỗi thường gặp

### ❌ "Table doesn't exist"
**Nguyên nhân:** Database chưa có tables  
**Giải pháp:** Hibernate tự động tạo schema khi chạy lần đầu (đã được config sẵn)

### ❌ "Connection refused"
**Nguyên nhân:** MySQL chưa chạy  
**Giải pháp:**
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### ❌ "Failed to execute goal"
**Nguyên nhân:** Port 8081 đã được sử dụng  
**Giải pháp:** Tắt ứng dụng đang dùng port đó hoặc đổi port trong `application.properties`

### ⚠️ Security Warning
- Password được generate mỗi lần chạy (hiển thị trong console)
- Chỉ dùng cho development
- Production cần configure JWT authentication đầy đủ

---

## �️ Database Migration với Flyway

### Trạng thái hiện tại
- ✅ **Flyway đã BẬT** trong `application.properties`
- ✅ **Auto-migration enabled** - Database tự động migrate khi khởi động
- ✅ **Migration files** nằm trong `backend/src/main/resources/db/migration/`
- ✅ **Không cần chạy lệnh thủ công** - Mọi thứ tự động

### Cách hoạt động

#### 🚀 Lần đầu chạy (Database trống)
```bash
cd backend
.\mvnw spring-boot:run
```
**Flyway sẽ tự động:**
1. Tạo bảng `flyway_schema_history` để track migrations
2. Chạy `V1__create_schema.sql` → Tạo 25 tables
3. Chạy `V2__seed_basic_data.sql` → Thêm data mẫu
4. Chạy `V3__seed_sample_data.sql` → Thêm dữ liệu demo
5. Application khởi động thành công ✅

#### 🔄 Lần sau chạy
```bash
.\mvnw spring-boot:run
```
**Flyway kiểm tra:**
- ✅ Migrations nào đã chạy? (xem trong `flyway_schema_history`)
- ✅ Có migration mới không? → Tự động chạy
- ✅ Không có gì mới → Bỏ qua, chạy app ngay

### Migration Files (Đã có sẵn)

```
backend/src/main/resources/db/migration/
├── V1__create_schema.sql      ✅ Tạo 25 tables
├── V2__seed_basic_data.sql    ✅ Data cơ bản (roles, settings...)
├── V3__seed_sample_data.sql   ✅ Data mẫu để test
└── V4__cleanup_and_reset.sql  ⚠️ Dùng khi reset database
```

### Thêm Migration mới

#### Ví dụ 1: Thêm cột mới
```sql
-- File: V5__add_user_avatar.sql
ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(500);

ALTER TABLE users 
ADD COLUMN last_login_at DATETIME;
```

#### Ví dụ 2: Tạo bảng mới
```sql
-- File: V6__create_discount_tiers.sql
CREATE TABLE discount_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(15,2),
    discount_percent DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Ví dụ 3: Seed data mới
```sql
-- File: V7__add_premium_products.sql
INSERT INTO products (name, barcode, price, category_id) VALUES
('iPhone 15 Pro', '0123456789012', 29999000, 5),
('MacBook Air M3', '0123456789013', 34999000, 5);
```

**Quy tắc đặt tên:**
- Format: `V{version}__{description}.sql`
- Version: Số tăng dần (V5, V6, V7...)
- Dùng `__` (2 dấu gạch dưới) giữa version và description
- Description: dùng snake_case, ngắn gọn

### Kiểm tra trạng thái migrations

```bash
cd backend

# Xem migrations đã chạy
.\mvnw flyway:info

# Output mẫu:
+-----------+---------+---------------------+------+---------------------+----------+
| Category  | Version | Description         | Type | Installed On        | State    |
+-----------+---------+---------------------+------+---------------------+----------+
| Versioned | 1       | create schema       | SQL  | 2025-01-29 10:15:30 | Success  |
| Versioned | 2       | seed basic data     | SQL  | 2025-01-29 10:15:31 | Success  |
| Versioned | 3       | seed sample data    | SQL  | 2025-01-29 10:15:32 | Success  |
| Versioned | 5       | add user avatar     | SQL  |                     | Pending  |
+-----------+---------+---------------------+------+---------------------+----------+
```

### Xử lý lỗi Migration

#### ❌ Lỗi: "Migration checksum mismatch"
**Nguyên nhân:** Sửa file migration đã chạy  
**Giải pháp:**
```bash
# Sửa checksum trong database
.\mvnw flyway:repair

# Hoặc xóa database và tạo lại
mysql -u root -p
DROP DATABASE smalltrend;
CREATE DATABASE smalltrend;
exit

# Chạy lại
.\mvnw spring-boot:run
```

#### ❌ Lỗi: "Failed migration"
**Nguyên nhân:** Lỗi SQL trong migration file  
**Giải pháp:**
```bash
# 1. Xem lỗi trong console log
# 2. Fix file migration
# 3. Repair
.\mvnw flyway:repair

# 4. Chạy lại
.\mvnw spring-boot:run
```

#### ⚠️ Reset hoàn toàn Database
```bash
# Xóa tất cả data (NGUY HIỂM!)
.\mvnw flyway:clean

# Chạy lại tất cả migrations
.\mvnw spring-boot:run
```

### Config Flyway (Hiện tại)

Trong `backend/src/main/resources/application.properties`:
```properties
# Flyway Configuration (Auto-migration enabled)
spring.flyway.enabled=true                    # ✅ Bật Flyway
spring.flyway.baseline-on-migrate=true        # ✅ Cho phép migrate trên DB có sẵn
spring.flyway.baseline-version=0              # Version baseline
spring.flyway.locations=classpath:db/migration # Folder chứa migrations
spring.flyway.validate-on-migrate=false       # Không validate checksum (dev mode)
spring.flyway.clean-disabled=true             # Không cho phép clean từ code
spring.flyway.out-of-order=true               # Cho phép chạy migration cũ hơn
```

### Tắt Flyway (Nếu cần)

Nếu muốn dùng Hibernate auto-DDL thay vì Flyway:

**Bước 1:** Tắt Flyway trong `application.properties`:
```properties
spring.flyway.enabled=false
```

**Bước 2:** Bật Hibernate auto-create:
```properties
spring.jpa.hibernate.ddl-auto=update  # hoặc create-drop
```

**⚠️ Lưu ý:** Không khuyến khích trong production!

### Khi nào dùng Flyway?

#### ✅ Nên dùng khi:
- Deploy lên production
- Làm việc team > 3 người
- Cần track lịch sử thay đổi database
- Có nhiều môi trường (dev/staging/prod)
- Muốn rollback database

#### ❌ Không cần khi:
- Development cá nhân
- Prototype/Demo nhanh
- Database thay đổi liên tục
- Team nhỏ < 3 người

### Maven Wrapper - Chạy Flyway commands

```bash
# Xem thông tin migrations
.\mvnw flyway:info

# Sửa lỗi migration
.\mvnw flyway:repair

# Validate migrations
.\mvnw flyway:validate

# Clean database (NGUY HIỂM!)
.\mvnw flyway:clean

# Migrate thủ công
.\mvnw flyway:migrate
```

### Best Practices

1. **Không sửa migrations đã chạy** → Tạo migration mới để sửa
2. **Backup database trước khi migrate** quan trọng
3. **Test migrations trên dev trước** rồi mới lên production
4. **Commit migrations cùng code** để đồng bộ
5. **Đặt tên file rõ ràng** để dễ hiểu

---

## �👥 Team Development

### Setup cho người mới
1. Clone repository:
   ```bash
   git clone [repo-url]
   cd SmallTrend
   ```

2. Tạo database MySQL
   ```sql
   CREATE DATABASE smalltrend;
   ```

3. Copy file config:
   ```bash
   cd backend/src/main/resources
   cp application.properties.example application.properties
   # Sửa username/password MySQL trong file này
   ```

4. Chạy backend:
   ```bash
   cd backend
   .\mvnw spring-boot:run
   ```

5. Chạy frontend (terminal khác):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

✅ **Xong!** Không cần setup phức tạp, Maven Wrapper lo hết.

---

## 📞 Liên hệ & Hỗ trợ

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Xem folder `docs/`
- **API Reference**: Xem section [API Documentation](#-api-documentation)

---

## 📄 License

MIT License - Xem file `LICENSE` để biết thêm chi tiết

---

**Made with ❤️ by SmallTrend Team**

