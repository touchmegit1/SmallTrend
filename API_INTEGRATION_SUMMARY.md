# API Integration Summary - Frontend to Backend Connection

## Overview
Đã hoàn thiện kết nối Frontend React với Backend Spring Boot, thay thế toàn bộ mock data bằng API thật từ database.

---

## 🔧 Backend Changes

### 1. **ProductVariantController.java** - Enhanced
- ✅ Thêm query parameters: `search` và `barcode`
- ✅ Endpoint: `GET /api/pos/product?search=coca&barcode=123456`

### 2. **ProductVariantService.java** - Enhanced
- ✅ Thêm logic tìm kiếm sản phẩm theo tên, SKU, barcode
- ✅ Tích hợp với InventoryStock để lấy số lượng tồn kho
- ✅ Lấy thông tin Category và Brand

### 3. **ProductVariantResponse.java** - Enhanced
```java
- Integer id
- String name
- String sku
- String barcode
- BigDecimal sellPrice
- Integer stockQuantity
- String categoryName
- String brandName
```

### 4. **CustomerController.java** - Enhanced
- ✅ Thêm query parameter: `phone`
- ✅ Cho phép CASHIER role truy cập
- ✅ Endpoint: `GET /api/crm/customers?phone=0912345678`

### 5. **CustomerService.java** - Enhanced
- ✅ Thêm logic tìm kiếm khách hàng theo số điện thoại

### 6. **InventoryStockRepository.java** - Enhanced
- ✅ Thêm method: `findByProductVariantId(Integer productVariantId)`

---

## 🎨 Frontend Changes

### 1. **posService.js** - NEW FILE
```javascript
// Services for POS operations
- getAllProducts()
- searchProducts(searchTerm)
- getProductByBarcode(barcode)
```

### 2. **customerService.js** - NEW FILE
```javascript
// Services for customer operations
- getAllCustomers()
- searchByPhone(phone)
```

### 3. **pos.jsx** - Major Update
- ✅ Xóa mock data
- ✅ Fetch products từ backend khi component mount
- ✅ Transform data từ backend sang format frontend
- ✅ Tích hợp QR Scanner với API
- ✅ Thêm loading state

**Key Changes:**
```javascript
// Before: Mock data
const mockProducts = [...]

// After: Real API
useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  const data = await posService.getAllProducts();
  setProducts(transformedData);
};
```

### 4. **Cart.jsx** - Enhanced
- ✅ Tích hợp customerService
- ✅ Tìm kiếm khách hàng thật từ database
- ✅ Xử lý khách hàng mới vs khách hàng cũ
- ✅ Thêm loading state khi search

---

## 📡 API Endpoints Summary

### POS Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pos/product` | Lấy tất cả sản phẩm | ADMIN, MANAGER, CASHIER |
| GET | `/api/pos/product?search=coca` | Tìm sản phẩm theo tên/SKU | ADMIN, MANAGER, CASHIER |
| GET | `/api/pos/product?barcode=123456` | Tìm sản phẩm theo barcode | ADMIN, MANAGER, CASHIER |

### Customer Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/customers` | Lấy tất cả khách hàng | ADMIN, MANAGER, CASHIER |
| GET | `/api/crm/customers?phone=0912` | Tìm khách hàng theo SĐT | ADMIN, MANAGER, CASHIER |

### Auth Endpoints (Already existed)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/validate` | Validate token |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

---

## 🔄 Data Flow

### 1. Product Loading Flow
```
Frontend (pos.jsx)
  → posService.getAllProducts()
  → axios GET /api/pos/product
  → ProductVariantController
  → ProductVariantService
  → ProductVariantRepository + InventoryStockRepository
  → Database (product_variants, products, inventory_stocks)
  → Response: List<ProductVariantResponse>
  → Frontend transforms & displays
```

### 2. Customer Search Flow
```
Frontend (Cart.jsx)
  → customerService.searchByPhone(phone)
  → axios GET /api/crm/customers?phone=xxx
  → CustomerController
  → CustomerService
  → CustomerRepository
  → Database (customers)
  → Response: List<CustomerResponse>
  → Frontend displays customer info
```

### 3. QR Scanner Flow
```
Frontend (QRScanner)
  → Scan barcode
  → posService.getProductByBarcode(barcode)
  → axios GET /api/pos/product?barcode=xxx
  → Backend filters by barcode
  → Response: Product data
  → Add to cart
```

---

## ✅ Testing Checklist

### Backend Testing
- [ ] Start backend: `cd backend && .\mvnw spring-boot:run`
- [ ] Check health: http://localhost:8081/actuator/health
- [ ] Test product API: http://localhost:8081/api/pos/product (with JWT token)
- [ ] Test customer API: http://localhost:8081/api/crm/customers (with JWT token)

### Frontend Testing
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Login with valid credentials
- [ ] Check if products load from database
- [ ] Test search functionality
- [ ] Test customer phone search
- [ ] Test QR scanner with barcode
- [ ] Test add to cart
- [ ] Test checkout flow

---

## 🚀 How to Run

### 1. Start Backend
```bash
cd backend
.\mvnw spring-boot:run
```
Backend runs at: http://localhost:8081

### 2. Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```
Frontend runs at: http://localhost:5173

### 3. Login
- URL: http://localhost:5173/login
- Use credentials from database (users table)
- Default: Check migration files for seed data

---

## 🔐 Authentication Flow

1. User logs in → POST `/api/auth/login`
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. All subsequent API calls include: `Authorization: Bearer {token}`
5. Backend validates token via JwtAuthenticationFilter
6. If token invalid/expired → 401 → Redirect to login

---

## 📝 Notes

### Important Points
1. **CORS**: Backend đã config cho phép `localhost:5173`, `5174`, `3000`
2. **JWT Token**: Tự động thêm vào header bởi axios interceptor
3. **Error Handling**: 401 errors tự động redirect về login
4. **Data Transform**: Backend trả BigDecimal, frontend convert sang Number
5. **Stock Quantity**: Tính tổng từ tất cả locations trong inventory_stocks

### Known Limitations
1. Chưa có API tạo đơn hàng (SalesOrder) - cần implement
2. Chưa có API cập nhật điểm khách hàng - cần implement
3. Chưa có API trừ tồn kho khi bán - cần implement
4. Payment processing vẫn dùng localStorage - cần API

### Next Steps
1. Implement SalesOrder API (POST /api/pos/orders)
2. Implement inventory deduction on sale
3. Implement loyalty points update
4. Add transaction history API
5. Add real-time stock validation

---

## 🐛 Troubleshooting

### Problem: Products not loading
**Solution:**
- Check backend is running on port 8081
- Check JWT token is valid
- Check database has product data
- Check browser console for errors

### Problem: 401 Unauthorized
**Solution:**
- Login again to get fresh token
- Check token in localStorage
- Check backend JWT secret matches

### Problem: CORS errors
**Solution:**
- Check backend CORS config includes your frontend URL
- Clear browser cache
- Restart backend

### Problem: Empty product list
**Solution:**
- Check database has data in `product_variants` table
- Run migration scripts if needed
- Check backend logs for SQL errors

---

## 📚 Related Files

### Backend
- `controller/pos/ProductVariantController.java`
- `service/ProductVariantService.java`
- `dto/pos/ProductVariantResponse.java`
- `controller/CustomerController.java`
- `service/CustomerService.java`
- `repository/InventoryStockRepository.java`

### Frontend
- `services/posService.js`
- `services/customerService.js`
- `pages/Pos/pos.jsx`
- `pages/Pos/Cart.jsx`
- `config/axiosConfig.js`

---

**Status**: ✅ COMPLETED - Frontend now fully connected to Backend API
**Date**: 2025-01-29
**Version**: 1.0
