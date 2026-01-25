# Hướng dẫn Cài đặt và Khắc phục sự cố - Dự án SmallTrend

Tài liệu này cung cấp hướng dẫn chi tiết từ A-Z để cài đặt môi trường, cấu hình và khởi chạy dự án SmallTrend. Vui lòng đọc kỹ và thực hiện theo từng bước.

---

## 1. Yêu cầu phần mềm (Prerequisites)

Đảm bảo bạn đã cài đặt đầy đủ các công cụ sau trên máy tính của mình.

| Công cụ                                       | Phiên bản đề xuất | Ghi chú                                                                                             |
| --------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| **JDK (Java Development Kit)**                | **17**            | Bắt buộc. Phiên bản thấp hoặc cao hơn có thể gây lỗi.                                                |
| **Maven**                                     | 3.8+              | Dùng để quản lý và build dự án backend.                                                             |
| **Node.js**                                   | 20.x (LTS)        | Dùng để quản lý và build dự án frontend.                                                            |
| **MySQL**                                     | 8.0+              | Hệ quản trị cơ sở dữ liệu.                                                                          |
| **Git**                                       | Mới nhất          | Hệ thống quản lý phiên bản.                                                                         |
| **IDE (Trình soạn thảo code)**                | IntelliJ, VSCode  | Khuyến khích dùng IntelliJ cho backend và VSCode cho frontend.                                       |
| **MySQL Workbench (hoặc tương tự)**           | Mới nhất          | Công cụ quản lý database trực quan (DataGrip, DBeaver...).                                          |

---

## 2. Cài đặt Backend (Spring Boot)

### Bước 2.1: Clone dự án

Mở terminal và clone repository từ GitHub:
```bash
git clone <your-repository-url>
cd SmallTrend
```

### Bước 2.2: Cấu hình Database MySQL

1.  **Tạo Database**:
    -   Mở MySQL Workbench hoặc công cụ tương tự.
    -   Chạy câu lệnh sau để tạo một database mới:
        ```sql
        CREATE DATABASE smalltrend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```

2.  **Cấu hình kết nối**:
    -   Mở file `backend/src/main/resources/application.properties`.
    -   Tìm và cập nhật các thông tin sau cho phù hợp với cấu hình MySQL của bạn:
        ```properties
        # Thay đổi username và password của bạn ở đây
        spring.datasource.username=root
        spring.datasource.password=your_password_here
        ```
    -   **Lưu ý**: File này đã được cấu hình sẵn để chạy với database `smalltrend` trên `localhost:3306`.

### Bước 2.3: Cấu hình JDK trong IntelliJ IDEA (Rất quan trọng!)

Để tránh lỗi biên dịch, hãy đảm bảo IntelliJ sử dụng đúng phiên bản JDK 17.

1.  Mở dự án trong IntelliJ (`File` > `Open...` và chọn thư mục `SmallTrend`).
2.  Đi tới `File` > `Project Structure...` (hoặc `Ctrl+Alt+Shift+S`).
3.  **Project Settings** > **Project**:
    -   **SDK**: Chọn phiên bản **JDK 17**. Nếu chưa có, nhấn `Add SDK` > `Download JDK...` và chọn phiên bản 17.
    -   **Language level**: Chọn **17**.
4.  **Project Settings** > **Modules**:
    -   Chọn module `backend`.
    -   Trong tab **Dependencies**, đảm bảo **Module SDK** được đặt thành **Project SDK (17)**.
5.  Nhấn `OK` để lưu lại.

### Bước 2.4: Build và Chạy Backend

1.  **Tải Dependencies**: Mở cửa sổ `Maven` trong IntelliJ (View > Tool Windows > Maven), và nhấn nút `Reload All Maven Projects`.
2.  **Chạy ứng dụng**:
    -   Tìm file `SmallTrendApplication.java` trong `backend/src/main/java/com/smalltrend`.
    -   Chuột phải vào file và chọn `Run 'SmallTrendApplication'`.

Backend sẽ khởi động. Lần đầu tiên chạy, Flyway sẽ tự động tạo các bảng trong database. Nếu thành công, bạn sẽ thấy log
báo `Tomcat started on port(s): 8088`.

---

## 3. Cài đặt Frontend (React)

### Bước 3.1: Cài đặt Dependencies

1.  Mở một terminal mới.
2.  Di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```
3.  Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết:
    ```bash
    npm install
    ```

### Bước 3.2: Cấu hình Biến môi trường

1.  Trong thư mục `frontend`, tạo một file mới tên là `.env`.
2.  Thêm vào nội dung sau để kết nối với backend:
    ```
    VITE_API_BASE_URL=http://localhost:8088
    ```

### Bước 3.3: Chạy Frontend

Chạy lệnh sau để khởi động server development:
```bash
npm run dev
```
Trang web sẽ được mở tại `http://localhost:5173`.

---

## 4. Khắc phục các lỗi thường gặp

<details>
  <summary><strong>Lỗi: `Port 8088 was already in use`</strong></summary>
  
  - **Nguyên nhân**: Một chương trình khác đang chiếm cổng mà ứng dụng của bạn muốn sử dụng.
  - **Giải pháp**:
    1.  **Tìm và dừng tiến trình**:
        -   Mở PowerShell (với quyền Admin).
        - Tìm PID của tiến trình: `netstat -ano | findstr :<PORT_NUMBER>` (ví dụ: `findstr :8088`).
        -   Dừng tiến trình: `taskkill /PID <PID> /F`.
    2.  **Đổi cổng**: Mở file `application.properties` và thay đổi giá trị `server.port`.
</details>

<details>
  <summary><strong>Lỗi: `java.lang.ExceptionInInitializerError` khi build</strong></summary>
  
  - **Nguyên nhân**: IntelliJ không sử dụng đúng phiên bản JDK (17) để biên dịch.
  - **Giải pháp**: Quay lại **Bước 2.3** và cấu hình lại JDK cho dự án một cách cẩn thận.
</details>

<details>
  <summary><strong>Lỗi: `Field '...' doesn't have a default value`</strong></summary>
  
  - **Nguyên nhân**: Code đang cố gắng lưu dữ liệu vào một cột `NOT NULL` trong database mà không cung cấp giá trị.
  - **Giải pháp**:
    -   **Trong Entity (Java)**: Gán một giá trị mặc định cho thuộc tính tương ứng.
      ```java
      // Ví dụ trong Product.java
      @Column(nullable = false)
      private String status = "ACTIVE";
      ```
    -   **Trong Database (Flyway)**: Tạo một file migration mới để thêm giá trị mặc định cho cột.
</details>

<details>
  <summary><strong>Lỗi: `Could not connect to database` hoặc `Access denied for user...`</strong></summary>
  
  - **Nguyên nhân**: Sai thông tin `username` hoặc `password` trong file `application.properties`.
  - **Giải pháp**: Kiểm tra lại thông tin đăng nhập MySQL của bạn và cập nhật lại file `application.properties`.
</details>

---

## 5. Kiểm tra (Test) Luồng Xác thực với JWT

Sau khi backend đã khởi chạy, bạn có thể sử dụng một công cụ như `curl` hoặc Postman để kiểm tra luồng đăng nhập và lấy token JWT.

### Bước 5.1: Lấy Token JWT qua API Đăng nhập

Hệ thống đã tạo sẵn một người dùng `admin` khi khởi tạo. Bạn có thể dùng tài khoản này để đăng nhập.

-   **Endpoint**: `POST /api/auth/login`
-   **Body (raw/json)**:
    ```json
    {
        "username": "admin",
        "password": "password"
    }
    ```

**Sử dụng `curl`:**

Mở terminal và chạy lệnh sau:

```bash
curl -X POST http://localhost:8088/api/auth/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"password\"}"
```

**Kết quả mong đợi:**

Bạn sẽ nhận lại một đối tượng JSON chứa token:

```json
{
  "token": "eyJhbGciOiJIUz...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roles": [
    "ADMIN"
  ]
}
```

### Bước 5.2: Sử dụng Token để truy cập API được bảo vệ

Bây giờ, bạn có thể sử dụng token vừa nhận được để truy cập vào các endpoint yêu cầu xác thực.

-   **Ví dụ**: `GET /api/test/admin` (Đây là một API ví dụ chỉ cho phép quyền `ADMIN`).
-   **Header**: `Authorization: Bearer <your_jwt_token>`

**Sử dụng `curl`:**

Thay thế `<your_jwt_token>` bằng chuỗi token bạn nhận được ở bước trên.

```bash
curl -X GET http://localhost:8088/api/test/admin -H "Authorization: Bearer <your_jwt_token>"
```

**Kết quả mong đợi:**

Nếu token hợp lệ, bạn sẽ nhận được phản hồi thành công từ API:

```
Content for admin
```

Nếu bạn thử truy cập mà không có token hoặc token không hợp lệ, bạn sẽ nhận được lỗi `401 Unauthorized` hoặc `403 Forbidden`.
