# Hướng dẫn sử dụng JSON Server cho SmallTrend

## 1. Cài đặt JSON Server

```bash
npm install -g json-server
# hoặc
npm install --save-dev json-server
```

## 2. Chạy JSON Server

Từ thư mục `frontend`:

```bash
json-server --watch db.json --port 3001
```

Hoặc nếu cài đặt local:

```bash
npx json-server --watch db.json --port 3001
```

## 3. Cấu hình Axios trong Frontend

Tạo file `src/config/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

## 4. Sử dụng API trong Components

### Ví dụ: Lấy danh sách sản phẩm

```javascript
import api from '../config/api';

// GET
const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// GET by ID
const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
  }
};

// POST
const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
  }
};

// PUT
const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
  }
};

// DELETE
const deleteProduct = async (id) => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};
```

## 5. Các Endpoint có sẵn

### Users
- `GET /users` - Lấy danh sách người dùng
- `GET /users/:id` - Lấy chi tiết người dùng
- `POST /users` - Tạo người dùng mới
- `PUT /users/:id` - Cập nhật người dùng
- `DELETE /users/:id` - Xóa người dùng

### Products
- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/:id` - Lấy chi tiết sản phẩm
- `POST /products` - Tạo sản phẩm mới
- `PUT /products/:id` - Cập nhật sản phẩm
- `DELETE /products/:id` - Xóa sản phẩm

### Variants
- `GET /products_variants` - Lấy danh sách biến thể
- `GET /products_variants/:id` - Lấy chi tiết biến thể
- `POST /products_variants` - Tạo biến thể mới
- `PUT /products_variants/:id` - Cập nhật biến thể
- `DELETE /products_variants/:id` - Xóa biến thể

### Inventory
- `GET /inventory_stock` - Lấy tồn kho
- `GET /inventory_batches` - Lấy danh sách lô hàng
- `GET /shelves_bins` - Lấy danh sách kệ/thùng
- `GET /locations` - Lấy danh sách vị trí

### Users & Roles
- `GET /roles` - Lấy danh sách vai trò
- `GET /user_credentials` - Lấy thông tin đăng nhập

### Shifts & Attendance
- `GET /shifts` - Lấy danh sách ca làm việc
- `GET /shift_assignments` - Lấy danh sách phân ca
- `GET /attendance` - Lấy danh sách chấm công

### Salary
- `GET /salary_configs` - Lấy cấu hình lương
- `GET /salary_payouts` - Lấy danh sách trả lương

### Audit & Logs
- `GET /audit_logs` - Lấy nhật ký hoạt động

## 6. Filtering & Searching

JSON Server hỗ trợ filtering:

```javascript
// Lấy sản phẩm theo category
GET /products?category=Nước uống

// Lấy người dùng theo role
GET /users?role_id=3

// Lấy sản phẩm với điều kiện
GET /products?brand=Coca Cola&category=Nước uống
```

## 7. Pagination

```javascript
// Lấy 10 sản phẩm đầu tiên
GET /products?_limit=10&_start=0

// Lấy trang 2 (10 sản phẩm)
GET /products?_limit=10&_start=10
```

## 8. Sorting

```javascript
// Sắp xếp theo tên tăng dần
GET /products?_sort=name&_order=asc

// Sắp xếp theo giá giảm dần
GET /products_variants?_sort=sell_price&_order=desc
```

## 9. Full-text Search

```javascript
// Tìm kiếm sản phẩm
GET /products?q=Coca
```

## 10. Cấu hình Environment

Tạo file `.env` trong thư mục `frontend`:

```
REACT_APP_API_URL=http://localhost:3001
```

## 11. Dữ liệu có sẵn

File `db.json` chứa dữ liệu mẫu cho:
- 6 người dùng (Admin, Manager, Cashier, Warehouse, Accountant)
- 8 sản phẩm (Nước uống, Bánh, Sữa, Kem, Kẹo)
- 9 biến thể sản phẩm
- 3 ca làm việc
- 6 vị trí kho
- Dữ liệu tồn kho, lô hàng, chấm công, lương, nhật ký

## 12. Thêm dữ liệu mới

Bạn có thể:
1. Chỉnh sửa trực tiếp file `db.json`
2. Sử dụng POST request để thêm dữ liệu mới
3. Sử dụng PUT request để cập nhật dữ liệu

## 13. Lưu ý quan trọng

- JSON Server tự động lưu thay đổi vào file `db.json`
- Mỗi lần khởi động lại, dữ liệu sẽ được reset về trạng thái ban đầu
- Để giữ dữ liệu, hãy chỉnh sửa file `db.json` trực tiếp
- JSON Server không có authentication, chỉ dùng cho development

## 14. Troubleshooting

### Port đã được sử dụng
```bash
json-server --watch db.json --port 3002
```

### CORS Error
Thêm middleware CORS:
```bash
json-server --watch db.json --port 3001 --middlewares ./cors.js
```

Tạo file `cors.js`:
```javascript
module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
```

## 15. Kết nối với Backend thực

Khi backend sẵn sàng, chỉ cần thay đổi `REACT_APP_API_URL`:

```
REACT_APP_API_URL=http://localhost:8080/api
```

Tất cả các endpoint sẽ tự động chuyển sang backend thực!
