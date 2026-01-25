# Hướng dẫn Test API với Postman - Dự án SmallTrend

Tài liệu này hướng dẫn chi tiết cách kiểm thử các API của dự án SmallTrend bằng công cụ Postman.

---

## 1. Chuẩn bị

1. Đảm bảo Backend đang chạy tại địa chỉ: `http://localhost:8088`.
2. Cài đặt phần mềm [Postman](https://www.postman.com/downloads/).

---

## 2. API Authentication (Đăng nhập)

Để truy cập được các API bảo mật của hệ thống, trước tiên bạn phải đăng nhập để lấy **Token**.

### Request

- **Method**: `POST`
- **URL**: `http://localhost:8088/api/auth/login`
- **Header**: `Content-Type: application/json`
- **Body (raw JSON)**:

```json
{
  "username": "admin",
  "password": "password"
}
```

*(Lưu ý: `admin` / `password` là tài khoản mặc định được tạo khi khởi chạy dự án lần đầu)*

### Response (Thành công)

Nếu đăng nhập thành công, bạn sẽ nhận được phản hồi `200 OK` với cấu trúc JSON như sau:

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxN...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roles": [
    "ADMIN"
  ]
}
```

> **QUAN TRỌNG**: Hãy copy chuỗi `token` trong phản hồi này. Bạn sẽ cần nó cho các bước tiếp theo.

---

## 3. Gọi API được bảo vệ (Authorized Request)

Sau khi có Token, bạn có thể gọi các API yêu cầu quyền hạn.

### Cấu hình Authorization trong Postman

1. Tạo một request mới (ví dụ: `GET`).
2. Chuyển sang tab **Authorization**.
3. Tại mục **Type**, chọn **Bearer Token**.
4. Dán chuỗi token bạn vừa copy ở Bước 2 vào ô **Token**.

### Ví dụ: Lấy thông tin người dùng hiện tại

- **Method**: `GET`
- **URL**: `http://localhost:8088/api/auth/me` (Chưa được implement trong demo, ví dụ generic)
- **Hoặc Test API Admin**: `GET http://localhost:8088/api/test/admin`

### Ví dụ Response

```json
"Content for admin"
```

---

## 4. Các mã lỗi thường gặp

| HTTP Code | Ý nghĩa      | Nguyên nhân                                                                         |
|:----------|:-------------|:------------------------------------------------------------------------------------|
| **200**   | OK           | Thành công.                                                                         |
| **401**   | Unauthorized | Chưa đăng nhập hoặc Token không hợp lệ/hết hạn.                                     |
| **403**   | Forbidden    | Đã đăng nhập nhưng không có quyền truy cập (Ví dụ: User thường truy cập API Admin). |
| **404**   | Not Found    | API không tồn tại hoặc sai đường dẫn.                                               |
| **400**   | Bad Request  | Dữ liệu gửi lên sai định dạng (thiếu trường, sai kiểu dữ liệu...).                  |

---

## 5. Dữ liệu Test Mẫu (Seed Data)

Khi khởi chạy lần đầu, hệ thống tự động tạo các dữ liệu sau:

**Người dùng:**

- **Admin**: `admin` / `password`

**Danh mục (Categories):**

- Electronics
- Fashion
- Groceries

**Thương hiệu (Brands):**

- Apple
- Samsung
- Nike

**Sản phẩm mẫu:**

- iPhone 13 (SKU: `IP13-128`)
