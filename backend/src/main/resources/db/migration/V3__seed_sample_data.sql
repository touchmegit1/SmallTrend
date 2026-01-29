-- =============================================================================
-- V3__seed_sample_data.sql
-- SmallTrend Grocery Store Sample Data for Team Development
-- =============================================================================

-- Insert Users
INSERT IGNORE
INTO users
(id, full_name, email, phone, address, status, role_id) VALUES
(1, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, District 1, Ho Chi Minh City', 'ACTIVE', 1),
(2, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, District 3, Ho Chi Minh City', 'ACTIVE', 2),
(3, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, District 5, Ho Chi Minh City', 'ACTIVE', 3),
(4, 'Pham Thi Inventory', 'inventory@smalltrend.com', '0934567890', '321 Cach Mang Thang 8, District 10, Ho Chi Minh City', 'ACTIVE', 4),
(5, 'Hoang Van Sales', 'sales@smalltrend.com', '0945678901', '654 Truong Chinh, District 12, Ho Chi Minh City', 'ACTIVE', 5);

-- Insert User Credentials (password = "password123" for all)
INSERT IGNORE
INTO user_credentials
(user_id, username, password_hash) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFVMLVaue6IZ0jjhSdsFkcm'),
(2, 'manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'),
(3, 'cashier', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'),
(4, 'inventory', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'),
(5, 'sales', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');

-- Insert Customers
INSERT IGNORE
INTO customers
(id, name, phone, loyalty_points) VALUES
(1, 'Nguyen Van A', '0987654321', 150),
(2, 'Tran Thi B', '0976543210', 250),
(3, 'Le Van C', '0965432109', 100),
(4, 'Pham Thi D', '0954321098', 300),
(5, 'Hoang Van E', '0943210987', 50);

-- Insert Products
INSERT IGNORE
INTO products
(id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(1, 'Fresh Milk 1L', 'Vinamilk Fresh Milk 1 Liter Pack', 'https://example.com/vinamilk1l.jpg', 1, 1, 2),
(2, 'Maggi Instant Noodles', 'Nestle Maggi 2-Minute Noodles', 'https://example.com/maggi.jpg', 2, 1, 2),
(3, 'Coca-Cola 330ml', 'Coca-Cola Classic Can 330ml', 'https://example.com/coke330.jpg', 3, 1, 1),
(4, 'Dove Soap Bar', 'Unilever Dove Beauty Bar 90g', 'https://example.com/dove.jpg', 4, 2, 1),
(5, 'Head & Shoulders Shampoo', 'P&G Head & Shoulders 400ml', 'https://example.com/hs400.jpg', 5, 2, 1);

-- Insert Product Variants
INSERT IGNORE
INTO product_variants
(id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(1, 1, 'VMILK-1L-001', '8901234567890', 25000.00, 1, 'https://example.com/vinamilk1l.jpg'),
(2, 1, 'VMILK-1L-002', '8901234567891', 27000.00, 1, 'https://example.com/vinamilk1l-choc.jpg'),
(3, 2, 'MAGGI-TOM-001', '8901234567892', 4500.00, 1, 'https://example.com/maggi-tom.jpg'),
(4, 3, 'COKE-330-001', '8901234567893', 12000.00, 1, 'https://example.com/coke330.jpg'),
(5, 4, 'DOVE-90G-001', '8901234567894', 15000.00, 1, 'https://example.com/dove90.jpg');

-- Insert Product Batches
INSERT IGNORE
INTO product_batches
(id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(1, 1, 'BATCH001', 20000.00, '2024-01-15', '2024-04-15'),
(2, 2, 'BATCH002', 22000.00, '2024-01-20', '2024-04-20'),
(3, 3, 'BATCH003', 3500.00, '2024-02-01', '2024-08-01'),
(4, 4, 'BATCH004', 9500.00, '2024-02-10', '2025-02-10'),
(5, 5, 'BATCH005', 12000.00, '2024-02-15', '2025-02-15');

-- Insert Inventory Stock
INSERT IGNORE
INTO inventory_stock
(id, variant_id, batch_id, bin_id, quantity) VALUES
(1, 1, 1, 1, 250),
(2, 2, 2, 1, 180),
(3, 3, 3, 2, 800),
(4, 4, 4, 3, 350),
(5, 5, 5, 4, 220);

-- Insert Purchase Orders
INSERT IGNORE
INTO purchase_orders
(id, supplier_id, order_date, status, total_amount, received_by) VALUES
(1, 1, '2024-01-10', 'COMPLETED', 5000000.00, 2),
(2, 2, '2024-01-15', 'COMPLETED', 3500000.00, 2),
(3, 3, '2024-02-01', 'PENDING', 2400000.00, 2),
(4, 4, '2024-02-05', 'COMPLETED', 1800000.00, 4),
(5, 5, '2024-02-10', 'PROCESSING', 2200000.00, 4);

-- Insert Purchase Order Items
INSERT IGNORE
INTO purchase_order_items
(id, purchase_order_id, variant_id, quantity, unit_price) VALUES
(1, 1, 1, 250, 20000.00),
(2, 2, 2, 160, 22000.00),
(3, 3, 3, 800, 3500.00),
(4, 4, 4, 200, 9500.00),
(5, 5, 5, 180, 12000.00);

-- Insert Sales Orders
INSERT IGNORE
INTO sales_orders
(id, cashier_id, customer_id, order_date, payment_method, total_amount) VALUES
(1, 3, 1, '2024-02-20 10:30:00', 'CASH', 175000.00),
(2, 3, 2, '2024-02-21 14:15:00', 'CREDIT_CARD', 95000.00),
(3, 5, 3, '2024-02-22 09:45:00', 'BANK_TRANSFER', 58000.00),
(4, 3, 4, '2024-02-23 16:20:00', 'CASH', 120000.00),
(5, 5, 5, '2024-02-24 11:10:00', 'QR_CODE', 67000.00);

-- Insert Sales Order Items  
INSERT IGNORE
INTO sales_order_items
(id, order_id, variant_id, batch_id, quantity, unit_price, cost_price_at_sale) VALUES
(1, 1, 1, 1, 7, 25000.00, 20000.00),
(2, 2, 2, 2, 4, 27000.00, 22000.00),
(3, 3, 3, 3, 12, 4500.00, 3500.00),
(4, 4, 4, 4, 10, 12000.00, 9500.00),
(5, 5, 5, 5, 5, 15000.00, 12000.00);

-- Insert Loyalty History
INSERT IGNORE
INTO loyalty_history
(id, customer_id, order_id, points_earned, points_used) VALUES
(1, 1, 1, 18, 0),
(2, 2, 2, 10, 0),
(3, 3, 3, 6, 0),
(4, 4, 4, 12, 0),
(5, 5, 5, 7, 0);

-- Insert Price History
INSERT IGNORE
INTO price_history
(id, product_id, old_price, new_price, applied_at, changed_by) VALUES
(1, 1, 27000.00, 25000.00, '2024-02-01 00:00:00', 2),
(2, 2, 5000.00, 4500.00, '2024-02-01 00:00:00', 2),
(3, 3, 13000.00, 12000.00, '2024-02-05 00:00:00', 2),
(4, 4, 16000.00, 15000.00, '2024-02-10 00:00:00', 2),
(5, 5, 16000.00, 15000.00, '2024-02-15 00:00:00', 2);

-- Insert Shift Assignments
INSERT IGNORE
INTO shift_assignments
(id, shift_id, user_id, status) VALUES
(1, 1, 3, 'ASSIGNED'),
(2, 1, 5, 'ASSIGNED'),
(3, 2, 3, 'ASSIGNED'),
(4, 3, 4, 'ASSIGNED'),
(5, 4, 5, 'ASSIGNED');

-- Insert Attendance
INSERT IGNORE
INTO attendance
(id, user_id, date, time_in, time_out, status) VALUES
(1, 3, '2024-02-26', '08:05:00', '12:03:00', 'PRESENT'),
(2, 5, '2024-02-26', '08:00:00', '12:00:00', 'PRESENT'),
(3, 3, '2024-02-26', '13:02:00', '17:01:00', 'PRESENT'),
(4, 4, '2024-02-26', '18:00:00', '22:00:00', 'PRESENT'),
(5, 5, '2024-02-27', '08:10:00', '11:50:00', 'PRESENT');

-- Insert Salary Config
INSERT IGNORE
INTO salary_config
(id, user_id, base_salary, hourly_rate, overtime_rate) VALUES
(1, 1, 25000000.00, NULL, NULL),
(2, 2, 20000000.00, NULL, NULL),
(3, 3, 12000000.00, 50000.00, 75000.00),
(4, 4, 13000000.00, 55000.00, 82500.00),
(5, 5, 11000000.00, 45000.00, 67500.00);

-- Insert Salary Payout
INSERT IGNORE
INTO salary_payout
(id, user_id, pay_period_start, pay_period_end, pay_date, base_amount, overtime_amount, total_amount) VALUES
(1, 1, '2024-02-01', '2024-02-29', '2024-03-05', 25000000.00, 0.00, 25000000.00),
(2, 2, '2024-02-01', '2024-02-29', '2024-03-05', 20000000.00, 0.00, 20000000.00),
(3, 3, '2024-02-01', '2024-02-29', '2024-03-05', 12000000.00, 150000.00, 12150000.00),
(4, 4, '2024-02-01', '2024-02-29', '2024-03-05', 13000000.00, 165000.00, 13165000.00),
(5, 5, '2024-02-01', '2024-02-29', '2024-03-05', 11000000.00, 135000.00, 11135000.00);

-- Insert Stock Movements
INSERT IGNORE
INTO stock_movements
(id, variant_id, type, quantity, from_bin_id, to_bin_id) VALUES
(1, 1, 'IN', 250, NULL, 1),
(2, 2, 'IN', 180, NULL, 1),
(3, 3, 'TRANSFER', 50, 2, 3),
(4, 4, 'OUT', 25, 3, NULL),
(5, 5, 'ADJUSTMENT', -10, 4, 4);

-- Insert Reports
INSERT IGNORE
INTO reports
(id, type, report_date, data, created_by) VALUES
(1, 'SALES_DAILY', '2024-02-26', 'Daily sales report data JSON here', 2),
(2, 'INVENTORY_WEEKLY', '2024-02-25', 'Weekly inventory report data JSON here', 4),
(3, 'REVENUE_MONTHLY', '2024-01-31', 'Monthly revenue report data JSON here', 2),
(4, 'STAFF_PERFORMANCE', '2024-02-25', 'Staff performance report data JSON here', 2),
(5, 'PROFIT_ANALYSIS', '2024-01-31', 'Profit analysis report data JSON here', 1);

-- Insert Audit Logs
INSERT IGNORE
INTO audit_logs
(id, entity_name, entity_id, action, details, timestamp, user_id) VALUES
(1, 'Product', 1, 'CREATE', 'Created new product: Fresh Milk 1L', '2024-01-15 10:00:00', 2),
(2, 'SalesOrder', 1, 'CREATE', 'New sales order created', '2024-02-20 10:30:00', 3),
(3, 'User', 3, 'UPDATE', 'Updated user profile', '2024-02-21 09:15:00', 1),
(4, 'Inventory', 1, 'ADJUSTMENT', 'Stock adjustment made', '2024-02-22 14:20:00', 4),
(5, 'Price', 1, 'UPDATE', 'Price updated for Fresh Milk 1L', '2024-02-01 00:00:00', 2);