# 🎉 Mockup Data Generator - SmallTrend POS

## 📊 Dữ liệu đã tạo: **227,266 bản ghi**

### Chi tiết dữ liệu:

| Bảng | Số lượng | Mô tả |
|------|----------|-------|
| **Users** | 500 | Người dùng hệ thống (Admin, Manager, Cashier, Warehouse, Accountant) |
| **Products** | 2,000 | Sản phẩm đa dạng (Nước uống, Bánh, Sữa, Kem, Kẹo, v.v.) |
| **Product Variants** | 5,000 | Biến thể sản phẩm với SKU, barcode, giá bán |
| **Inventory Batches** | 10,000 | Lô hàng với ngày sản xuất, hạn sử dụng, giá vốn |
| **Inventory Stock** | 15,000 | Tồn kho theo từng vị trí và lô hàng |
| **Stock Movements** | 8,000 | Lịch sử di chuyển hàng hóa |
| **Customers** | 3,000 | Khách hàng với điểm tích lũy |
| **Suppliers** | 200 | Nhà cung cấp |
| **Orders** | 20,000 | Đơn hàng bán lẻ |
| **Order Items** | 110,346 | Chi tiết sản phẩm trong đơn hàng |
| **Payments** | 20,000 | Thanh toán (Cash, Card, Transfer, Momo, ZaloPay) |
| **Shift Assignments** | 5,000 | Phân ca làm việc |
| **Attendance** | 5,000 | Chấm công nhân viên |
| **Salary Payouts** | 2,000 | Trả lương nhân viên |
| **Price History** | 8,000 | Lịch sử thay đổi giá |
| **Audit Logs** | 10,000 | Nhật ký hoạt động hệ thống |
| **Promotions** | 500 | Chương trình khuyến mãi |
| **Vouchers** | 2,000 | Mã giảm giá |

---

## 🚀 Cách sử dụng

### 1. Generate lại data (nếu cần)

```bash
node generate-mockdata.cjs
```

Script sẽ tạo file `db.json` mới với dữ liệu ngẫu nhiên.

### 2. Cài đặt JSON Server

```bash
npm install -g json-server
```

### 3. Chạy JSON Server

```bash
json-server --watch db.json --port 3001
```

### 4. Truy cập API

**Base URL**: `http://localhost:3001`

**Ví dụ endpoints:**
- `GET http://localhost:3001/products` - Lấy tất cả sản phẩm
- `GET http://localhost:3001/products/1` - Lấy sản phẩm ID 1
- `GET http://localhost:3001/orders?_limit=10` - Lấy 10 đơn hàng đầu tiên
- `GET http://localhost:3001/customers?_sort=total_spent&_order=desc` - Khách hàng theo tổng chi tiêu

---

## 📝 Các tính năng JSON Server

### Filtering
```javascript
// Lọc sản phẩm theo category
GET /products?category=Nước uống

// Lọc đơn hàng theo status
GET /orders?status=completed

// Lọc nhiều điều kiện
GET /products?category=Nước uống&brand=Coca Cola
```

### Pagination
```javascript
// Lấy 20 bản ghi đầu tiên
GET /products?_limit=20

// Lấy trang 2 (20 bản ghi)
GET /products?_page=2&_limit=20

// Hoặc dùng start
GET /products?_start=20&_limit=20
```

### Sorting
```javascript
// Sắp xếp tăng dần
GET /products?_sort=name&_order=asc

// Sắp xếp giảm dần theo giá
GET /products_variants?_sort=sell_price&_order=desc

// Sắp xếp nhiều trường
GET /orders?_sort=order_date,total_amount&_order=desc,asc
```

### Full-text Search
```javascript
// Tìm kiếm trong tất cả các trường
GET /products?q=Coca

// Tìm kiếm khách hàng
GET /customers?q=Nguyễn
```

### Relationships
```javascript
// Lấy order với order_items
GET /orders/1?_embed=order_items

// Lấy variant với product
GET /products_variants/1?_expand=product
```

### Operators
```javascript
// Greater than
GET /products_variants?sell_price_gte=50000

// Less than
GET /products_variants?sell_price_lte=100000

// Not equal
GET /users?status_ne=inactive

// Like (contains)
GET /products?name_like=Coca
```

---

## 💡 Ví dụ sử dụng trong React

### Setup Axios

```javascript
// src/config/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Lấy danh sách sản phẩm

```javascript
import { useState, useEffect } from 'react';
import api from './config/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?_limit=20');
        setProducts(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.brand} - {product.category}</p>
        </div>
      ))}
    </div>
  );
}
```

### Tạo đơn hàng mới

```javascript
const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', {
      customer_id: orderData.customerId,
      cashier_id: orderData.cashierId,
      order_date: new Date().toISOString(),
      subtotal: orderData.subtotal,
      tax_amount: orderData.taxAmount,
      discount_amount: orderData.discountAmount,
      total_amount: orderData.totalAmount,
      payment_method: orderData.paymentMethod,
      status: 'completed'
    });
    
    console.log('Order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

### Cập nhật tồn kho

```javascript
const updateStock = async (stockId, newQuantity) => {
  try {
    const response = await api.patch(`/inventory_stock/${stockId}`, {
      quantity: newQuantity
    });
    
    console.log('Stock updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating stock:', error);
  }
};
```

---

## 🎯 Use Cases phổ biến

### 1. Dashboard - Thống kê doanh thu
```javascript
// Lấy tổng doanh thu hôm nay
const today = new Date().toISOString().split('T')[0];
const response = await api.get(`/orders?order_date_gte=${today}T00:00:00Z&status=completed`);
const totalRevenue = response.data.reduce((sum, order) => sum + order.total_amount, 0);
```

### 2. POS - Tìm sản phẩm theo barcode
```javascript
const findProductByBarcode = async (barcode) => {
  const response = await api.get(`/products_variants?barcode=${barcode}`);
  return response.data[0];
};
```

### 3. Inventory - Sản phẩm sắp hết hạn
```javascript
const getExpiringProducts = async () => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const response = await api.get(
    `/inventory_batches?expiry_date_lte=${nextMonth.toISOString().split('T')[0]}`
  );
  return response.data;
};
```

### 4. CRM - Top khách hàng VIP
```javascript
const getTopCustomers = async (limit = 10) => {
  const response = await api.get(
    `/customers?_sort=total_spent&_order=desc&_limit=${limit}`
  );
  return response.data;
};
```

---

## ⚙️ Tùy chỉnh Script Generator

Bạn có thể chỉnh sửa file `generate-mockdata.cjs` để:

- Thay đổi số lượng bản ghi (dòng 50-60)
- Thêm/bớt trường dữ liệu
- Thay đổi logic generate (tên, địa chỉ, giá, v.v.)
- Thêm bảng mới

**Ví dụ tăng số lượng:**
```javascript
// Thay đổi từ 2000 lên 5000 sản phẩm
for (let i = 1; i <= 5000; i++) {
  // ...
}
```

---

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
json-server --watch db.json --port 3002
```

### File db.json quá lớn
Nếu file quá lớn (>100MB), có thể giảm số lượng bản ghi trong script.

### CORS Error
JSON Server tự động hỗ trợ CORS, nhưng nếu gặp lỗi:
```bash
json-server --watch db.json --port 3001 --host 0.0.0.0
```

---

## 📦 Kích thước file

File `db.json` sau khi generate có kích thước khoảng **50-80MB** với **227,266 bản ghi**.

Nếu cần file nhỏ hơn, chỉnh sửa số lượng trong `generate-mockdata.cjs`:
- Users: 500 → 100
- Products: 2000 → 500
- Orders: 20000 → 5000
- v.v.

---

## 🎓 Lưu ý quan trọng

1. **JSON Server chỉ dùng cho development**, không dùng cho production
2. Dữ liệu được lưu vào file `db.json`, mọi thay đổi qua API sẽ được lưu lại
3. Để reset data, chạy lại `node generate-mockdata.cjs`
4. Khi chuyển sang backend thực, chỉ cần đổi `baseURL` trong Axios config

---

## 🚀 Bắt đầu ngay

```bash
# 1. Generate data
node generate-mockdata.cjs

# 2. Start JSON Server
json-server --watch db.json --port 3001

# 3. Test API
curl http://localhost:3001/products?_limit=5
```

**Happy Coding! 🎉**
