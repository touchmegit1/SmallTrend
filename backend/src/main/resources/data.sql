-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE MOCK DATA - NO VIETNAMESE DIACRITICS
-- =============================================================================

-- Clear existing data (in reverse order of foreign key dependencies)
DELETE FROM audit_logs;
DELETE FROM reports;
DELETE FROM stock_movements;
DELETE FROM salary_payout;
DELETE FROM salary_config;
DELETE FROM attendance;
DELETE FROM shift_assignments;
DELETE FROM shifts;
DELETE FROM price_history;
DELETE FROM promotion_conditions;
DELETE FROM promotions;
DELETE FROM loyalty_history;
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM inventory_stock;
DELETE FROM product_batches;
DELETE FROM shelves_bins;
DELETE FROM locations;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM user_credentials;
DELETE FROM users;
DELETE FROM role_permissions;
DELETE FROM permissions;
DELETE FROM roles;
DELETE FROM tax_rates;
DELETE FROM suppliers;
DELETE FROM categories;
DELETE FROM brands;

-- Reset auto-increment counters
ALTER TABLE audit_logs AUTO_INCREMENT = 1;
ALTER TABLE reports AUTO_INCREMENT = 1;
ALTER TABLE stock_movements AUTO_INCREMENT = 1;
ALTER TABLE salary_payout AUTO_INCREMENT = 1;
ALTER TABLE salary_config AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE shift_assignments AUTO_INCREMENT = 1;
ALTER TABLE shifts AUTO_INCREMENT = 1;
ALTER TABLE price_history AUTO_INCREMENT = 1;
ALTER TABLE promotion_conditions AUTO_INCREMENT = 1;
ALTER TABLE promotions AUTO_INCREMENT = 1;
ALTER TABLE loyalty_history AUTO_INCREMENT = 1;
ALTER TABLE sales_order_items AUTO_INCREMENT = 1;
ALTER TABLE sales_orders AUTO_INCREMENT = 1;
ALTER TABLE purchase_order_items AUTO_INCREMENT = 1;
ALTER TABLE purchase_orders AUTO_INCREMENT = 1;
ALTER TABLE inventory_stock AUTO_INCREMENT = 1;
ALTER TABLE product_batches AUTO_INCREMENT = 1;
ALTER TABLE shelves_bins AUTO_INCREMENT = 1;
ALTER TABLE locations AUTO_INCREMENT = 1;
ALTER TABLE product_variants AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE user_credentials AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE role_permissions AUTO_INCREMENT = 1;
ALTER TABLE permissions AUTO_INCREMENT = 1;
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE tax_rates AUTO_INCREMENT = 1;
ALTER TABLE suppliers AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE brands AUTO_INCREMENT = 1;

-- Insert Brands
INSERT INTO brands
(id, name) VALUES
(1, 'Vinamilk'),
(2, 'Nestle'),
(3, 'Coca-Cola'),
(4, 'Unilever'),
(5, 'P&G');

-- Insert Categories  
INSERT INTO categories
(id, name) VALUES
(1, 'Food & Beverage'),
(2, 'Personal Care'),
(3, 'Household Items'),
(4, 'Health & Medicine'),
(5, 'Snacks & Confectionery');

-- Insert Suppliers
INSERT INTO suppliers
(id, name, contact_info) VALUES
(1, 'Vinamilk Distribution', 'sales@vinamilk.com.vn | 1800 1199'),
(2, 'Unilever Vietnam', 'contact@unilever.com.vn | 1800 5588'),
(3, 'Nestle Vietnam', 'info@nestle.com.vn | 1800 6793'),
(4, 'FMCG Distributor Co', 'order@fmcgdist.com.vn | 1900 2468'),
(5, 'Local Wholesale Market', 'wholesale@localmarket.vn | 0909123456');

-- Insert Tax Rates
INSERT INTO tax_rates
(id, name, rate, is_active) VALUES
(1, 'VAT Standard', 10.00, 1),
(2, 'VAT Reduced', 5.00, 1),
(3, 'Import Tax', 15.00, 1),
(4, 'Luxury Tax', 20.00, 1),
(5, 'No Tax', 0.00, 1);

-- Insert Roles
INSERT INTO roles
(id, name, description) VALUES
(1, 'ADMIN', 'System Administrator'),
(2, 'MANAGER', 'Store Manager'),
(3, 'CASHIER', 'Cashier Staff'),
(4, 'INVENTORY_STAFF', 'Inventory Staff'),
(5, 'SALES_STAFF', 'Sales Staff');

-- Insert Permissions
INSERT INTO permissions
(id, name, description) VALUES
(1, 'USER_MANAGEMENT', 'User Management'),
(2, 'PRODUCT_MANAGEMENT', 'Product Management'),
(3, 'INVENTORY_MANAGEMENT', 'Inventory Management'),
(4, 'SALES_PROCESSING', 'Sales Processing'),
(5, 'REPORT_VIEWING', 'Report Viewing');

-- Insert Role Permissions
INSERT INTO role_permissions
(id, role_id, permission_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 2, 2),
(7, 2, 3),
(8, 2, 4),
(9, 2, 5),
(10, 3, 4),
(11, 4, 2),
(12, 4, 3),
(13, 5, 4);

-- Insert Users
INSERT INTO users
(id, full_name, email, phone, address, status, role_id) VALUES
(1, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, District 1, Ho Chi Minh City', 'ACTIVE', 1),
(2, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, District 3, Ho Chi Minh City', 'ACTIVE', 2),
(3, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, District 5, Ho Chi Minh City', 'ACTIVE', 3),
(4, 'Pham Thi Inventory', 'inventory@smalltrend.com', '0934567890', '321 Cach Mang Thang 8, District 10, Ho Chi Minh City', 'ACTIVE', 4),
(5, 'Hoang Van Sales', 'sales@smalltrend.com', '0945678901', '654 Truong Chinh, District 12, Ho Chi Minh City', 'ACTIVE', 5);

-- Insert lại 5 user ban đầu với password đúng
INSERT INTO user_credentials
(user_id, username, password_hash) VALUES
(1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(2, 'manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(3, 'cashier', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(4, 'inventory', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(5, 'sales', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG');
-- Insert Customers
INSERT INTO customers
(id, name, phone, loyalty_points) VALUES
(1, 'Nguyen Van A', '0987654321', 150),
(2, 'Tran Thi B', '0976543210', 250),
(3, 'Le Van C', '0965432109', 100),
(4, 'Pham Thi D', '0954321098', 300),
(5, 'Hoang Van E', '0943210987', 50);

-- Insert Products
INSERT INTO products
(id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(1, 'Fresh Milk 1L', 'Vinamilk Fresh Milk 1 Liter Pack', 'https://example.com/vinamilk1l.jpg', 1, 1, 2),
(2, 'Maggi Instant Noodles', 'Nestle Maggi 2-Minute Noodles', 'https://example.com/maggi.jpg', 2, 1, 2),
(3, 'Coca-Cola 330ml', 'Coca-Cola Classic Can 330ml', 'https://example.com/coke330.jpg', 3, 1, 1),
(4, 'Dove Soap Bar', 'Unilever Dove Beauty Bar 90g', 'https://example.com/dove.jpg', 4, 2, 1),
(5, 'Head & Shoulders Shampoo', 'P&G Head & Shoulders 400ml', 'https://example.com/hs400.jpg', 5, 2, 1);

-- Insert Product Variants
INSERT INTO product_variants
(id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(1, 1, 'VMILK-1L-001', '8901234567890', 25000.00, 1, 'https://example.com/vinamilk1l.jpg'),
(2, 1, 'VMILK-1L-002', '8901234567891', 27000.00, 1, 'https://example.com/vinamilk1l-choc.jpg'),
(3, 2, 'MAGGI-TOM-001', '8901234567892', 4500.00, 1, 'https://example.com/maggi-tom.jpg'),
(4, 3, 'COKE-330-001', '8901234567893', 12000.00, 1, 'https://example.com/coke330.jpg'),
(5, 4, 'DOVE-90G-001', '8901234567894', 15000.00, 1, 'https://example.com/dove90.jpg');

-- Insert Locations
INSERT INTO locations
(id, name, type, location_code, address, capacity, description, status, created_at) VALUES
(1, 'Kệ hàng chính', 'SHELF', 'KE-001', 'Tầng 1, dãy A', 150, 'Kệ trưng bày hàng hóa chính trong cửa hàng', 'ACTIVE', '2024-01-01 00:00:00'),
(2, 'Kho phía sau', 'STORAGE', 'KHO-001', 'Phòng kho phía sau', 300, 'Kho lưu trữ hàng tồn, hàng nhập mới', 'ACTIVE', '2024-01-01 00:00:00'),
(3, 'Khu trưng bày cửa', 'DISPLAY_AREA', 'TB-001', 'Khu vực cửa ra vào', 50, 'Khu vực trưng bày sản phẩm khuyến mãi', 'ACTIVE', '2024-01-01 00:00:00'),
(4, 'Tủ lạnh / Kho lạnh', 'COLD_STORAGE', 'TL-001', 'Góc phải cửa hàng', 80, 'Tủ lạnh bảo quản đồ tươi sống, sữa, nước giải khát', 'ACTIVE', '2024-01-01 00:00:00'),
(5, 'Quầy thu ngân', 'CASHIER', 'QTN-001', 'Khu vực cửa ra', 30, 'Khu vực quầy thanh toán, bày kẹo bánh nhỏ', 'ACTIVE', '2024-01-01 00:00:00');

-- Insert Shelf Bins
INSERT INTO shelves_bins
(id, location_id, bin_code) VALUES
(1, 1, 'A-01-001'),
(2, 1, 'A-01-002'),
(3, 2, 'B-02-001'),
(4, 3, 'C-03-001'),
(5, 4, 'D-04-001');

-- Insert Product Batches
INSERT INTO product_batches
(id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(1, 1, 'BATCH001', 20000.00, '2024-01-15', '2024-04-15'),
(2, 2, 'BATCH002', 22000.00, '2024-01-20', '2024-04-20'),
(3, 3, 'BATCH003', 3500.00, '2024-02-01', '2024-08-01'),
(4, 4, 'BATCH004', 9500.00, '2024-02-10', '2025-02-10'),
(5, 5, 'BATCH005', 12000.00, '2024-02-15', '2025-02-15');

-- Insert Inventory Stock
INSERT INTO inventory_stock
(id, variant_id, batch_id, bin_id, quantity) VALUES
(1, 1, 1, 1, 250),
(2, 2, 2, 1, 180),
(3, 3, 3, 2, 800),
(4, 4, 4, 3, 350),
(5, 5, 5, 4, 220);

-- Insert Purchase Orders
INSERT INTO purchase_orders
(id, po_number, supplier_id, location_id, order_date, status, subtotal, discount, tax_percent, tax_amount, shipping_fee, total_amount, paid_amount, remaining_amount, created_at, confirmed_at, received_by, notes) VALUES
(1, 'PO-20240110-001', 1, 2, '2024-01-10', 'COMPLETED', 5000000.00, 0.00, 10.00, 500000.00, 0.00, 5500000.00, 5000000.00, 500000.00, '2024-01-10 08:30:00', '2024-01-10 10:00:00', 2, 'Nhap sua Vinamilk dot 1'),
(2, 'PO-20240115-001', 2, 2, '2024-01-15', 'COMPLETED', 3500000.00, 0.00, 10.00, 350000.00, 0.00, 3850000.00, 3500000.00, 350000.00, '2024-01-15 09:00:00', '2024-01-15 11:00:00', 2, 'Nhap mi Maggi tu Unilever'),
(3, 'PO-20240201-001', 3, 2, '2024-02-01', 'PENDING', 2400000.00, 0.00, 10.00, 240000.00, 0.00, 2640000.00, 0.00, 2400000.00, '2024-02-01 14:00:00', NULL, 2, 'Nhap nuoc ngot Coca-Cola'),
(4, 'PO-20240205-001', 4, 2, '2024-02-05', 'COMPLETED', 1800000.00, 0.00, 10.00, 180000.00, 0.00, 1980000.00, 1800000.00, 180000.00, '2024-02-05 10:15:00', '2024-02-05 14:30:00', 4, 'Nhap xa phong Dove'),
(5, 'PO-20240210-001', 5, 2, '2024-02-10', 'PROCESSING', 2200000.00, 0.00, 10.00, 220000.00, 0.00, 2420000.00, 0.00, 2200000.00, '2024-02-10 08:00:00', NULL, 4, 'Nhap hang tap hoa tong hop');


-- Insert Purchase Order Items
INSERT INTO purchase_order_items
(id, purchase_order_id, variant_id, quantity, unit_price) VALUES
(1, 1, 1, 250, 20000.00),
(2, 2, 2, 160, 22000.00),
(3, 3, 3, 800, 3500.00),
(4, 4, 4, 200, 9500.00),
(5, 5, 5, 180, 12000.00);

-- Insert Sales Orders
INSERT INTO sales_orders
(id, cashier_id, customer_id, order_date, payment_method, total_amount) VALUES
(1, 3, 1, '2024-02-20 10:30:00', 'CASH', 175000.00),
(2, 3, 2, '2024-02-21 14:15:00', 'CREDIT_CARD', 95000.00),
(3, 5, 3, '2024-02-22 09:45:00', 'BANK_TRANSFER', 58000.00),
(4, 3, 4, '2024-02-23 16:20:00', 'CASH', 120000.00),
(5, 5, 5, '2024-02-24 11:10:00', 'QR_CODE', 67000.00);

-- Insert Sales Order Items  
INSERT INTO sales_order_items
(id, order_id, variant_id, batch_id, quantity, unit_price, cost_price_at_sale) VALUES
(1, 1, 1, 1, 7, 25000.00, 20000.00),
(2, 2, 2, 2, 4, 27000.00, 22000.00),
(3, 3, 3, 3, 12, 4500.00, 3500.00),
(4, 4, 4, 4, 10, 12000.00, 9500.00),
(5, 5, 5, 5, 5, 15000.00, 12000.00);

-- Insert Loyalty History
INSERT INTO loyalty_history
(id, customer_id, order_id, points_earned, points_used) VALUES
(1, 1, 1, 18, 0),
(2, 2, 2, 10, 0),
(3, 3, 3, 6, 0),
(4, 4, 4, 12, 0),
(5, 5, 5, 7, 0);

-- Insert Promotions
INSERT INTO promotions
(id, name, start_date, end_date, is_active) VALUES
(1, 'Tet Sale 2024', '2024-02-01', '2024-02-29', 1),
(2, 'Back to School', '2024-08-01', '2024-08-31', 0),
(3, 'Black Friday', '2024-11-24', '2024-11-30', 0),
(4, 'Christmas Sale', '2024-12-20', '2024-12-31', 0),
(5, 'New Year Deal', '2025-01-01', '2025-01-15', 0);

-- Insert Promotion Conditions
INSERT INTO promotion_conditions
(id, promotion_id, min_order_value, discount_percent) VALUES
(1, 1, 100000.00, 5.00),
(2, 1, 200000.00, 8.00),
(3, 2, 150000.00, 10.00),
(4, 3, 50000.00, 15.00),
(5, 4, 300000.00, 12.00);

-- Insert Price History
INSERT INTO price_history
(id, product_id, old_price, new_price, applied_at, changed_by) VALUES
(1, 1, 27000.00, 25000.00, '2024-02-01 00:00:00', 2),
(2, 2, 5000.00, 4500.00, '2024-02-01 00:00:00', 2),
(3, 3, 13000.00, 12000.00, '2024-02-05 00:00:00', 2),
(4, 4, 16000.00, 15000.00, '2024-02-10 00:00:00', 2),
(5, 5, 16000.00, 15000.00, '2024-02-15 00:00:00', 2);

-- Insert Shifts
INSERT INTO shifts
(id, name, date, start_time, end_time) VALUES
(1, 'Morning Shift', '2024-02-26', '08:00:00', '12:00:00'),
(2, 'Afternoon Shift', '2024-02-26', '13:00:00', '17:00:00'),
(3, 'Evening Shift', '2024-02-26', '18:00:00', '22:00:00'),
(4, 'Morning Shift', '2024-02-27', '08:00:00', '12:00:00'),
(5, 'Afternoon Shift', '2024-02-27', '13:00:00', '17:00:00');

-- Insert Shift Assignments
INSERT INTO shift_assignments
(id, shift_id, user_id, status) VALUES
(1, 1, 3, 'ASSIGNED'),
(2, 1, 5, 'ASSIGNED'),
(3, 2, 3, 'ASSIGNED'),
(4, 3, 4, 'ASSIGNED'),
(5, 4, 5, 'ASSIGNED');

-- Insert Attendance
INSERT INTO attendance
(id, user_id, date, time_in, time_out, status) VALUES
(1, 3, '2024-02-26', '08:05:00', '12:03:00', 'PRESENT'),
(2, 5, '2024-02-26', '08:00:00', '12:00:00', 'PRESENT'),
(3, 3, '2024-02-26', '13:02:00', '17:01:00', 'PRESENT'),
(4, 4, '2024-02-26', '18:00:00', '22:00:00', 'PRESENT'),
(5, 5, '2024-02-27', '08:10:00', '11:50:00', 'PRESENT');

-- Insert Salary Config
INSERT INTO salary_config
(id, user_id, base_salary, hourly_rate, overtime_rate) VALUES
(1, 1, 25000000.00, NULL, NULL),
(2, 2, 20000000.00, NULL, NULL),
(3, 3, 12000000.00, 50000.00, 75000.00),
(4, 4, 13000000.00, 55000.00, 82500.00),
(5, 5, 11000000.00, 45000.00, 67500.00);

-- Insert Salary Payout
INSERT INTO salary_payout
(id, user_id, pay_period_start, pay_period_end, pay_date, base_amount, overtime_amount, total_amount) VALUES
(1, 1, '2024-02-01', '2024-02-29', '2024-03-05', 25000000.00, 0.00, 25000000.00),
(2, 2, '2024-02-01', '2024-02-29', '2024-03-05', 20000000.00, 0.00, 20000000.00),
(3, 3, '2024-02-01', '2024-02-29', '2024-03-05', 12000000.00, 150000.00, 12150000.00),
(4, 4, '2024-02-01', '2024-02-29', '2024-03-05', 13000000.00, 165000.00, 13165000.00),
(5, 5, '2024-02-01', '2024-02-29', '2024-03-05', 11000000.00, 135000.00, 11135000.00);

-- Insert Stock Movements
INSERT INTO stock_movements
(id, variant_id, type, quantity, from_bin_id, to_bin_id) VALUES
(1, 1, 'IN', 250, NULL, 1),
(2, 2, 'IN', 180, NULL, 1),
(3, 3, 'TRANSFER', 50, 2, 3),
(4, 4, 'OUT', 25, 3, NULL),
(5, 5, 'ADJUSTMENT', -10, 4, 4);

-- Insert Reports
INSERT INTO reports
(id, type, report_date, data, created_by) VALUES
(1, 'SALES_DAILY', '2024-02-26', 'Daily sales report data JSON here', 2),
(2, 'INVENTORY_WEEKLY', '2024-02-25', 'Weekly inventory report data JSON here', 4),
(3, 'REVENUE_MONTHLY', '2024-01-31', 'Monthly revenue report data JSON here', 2),
(4, 'STAFF_PERFORMANCE', '2024-02-25', 'Staff performance report data JSON here', 2),
(5, 'PROFIT_ANALYSIS', '2024-01-31', 'Profit analysis report data JSON here', 1);

-- Insert Audit Logs
INSERT INTO audit_logs
(id, entity_name, entity_id, action, details, timestamp, user_id) VALUES
(1, 'Product', 1, 'CREATE', 'Created new product: Fresh Milk 1L', '2024-01-15 10:00:00', 2),
(2, 'SalesOrder', 1, 'CREATE', 'New sales order created', '2024-02-20 10:30:00', 3),
(3, 'User', 3, 'UPDATE', 'Updated user profile', '2024-02-21 09:15:00', 1),
(4, 'Inventory', 1, 'ADJUSTMENT', 'Stock adjustment made', '2024-02-22 14:20:00', 4),
(5, 'Price', 1, 'UPDATE', 'Price updated for Fresh Milk 1L', '2024-02-01 00:00:00', 2);