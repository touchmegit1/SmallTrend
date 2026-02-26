-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE - Comprehensive Sample Data
-- =============================================================================
-- Password for all users: password
-- Hashed: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW
-- =============================================================================

-- JPA/Hibernate là nguồn chân lý schema.
-- File này chỉ dùng để seed dữ liệu mẫu (idempotent).

-- FULL RESET DATA (seed lại từ đầu)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE purchase_history;
TRUNCATE TABLE sale_order_histories;
TRUNCATE TABLE sale_order_items;
TRUNCATE TABLE sale_orders;
TRUNCATE TABLE loyalty_transactions;
TRUNCATE TABLE coupon_usage;
TRUNCATE TABLE cash_transactions;
TRUNCATE TABLE shift_handovers;
TRUNCATE TABLE shift_swap_requests;
TRUNCATE TABLE payroll_calculations;
TRUNCATE TABLE salary_configs;
TRUNCATE TABLE attendance;
TRUNCATE TABLE user_credentials;
TRUNCATE TABLE tickets;
TRUNCATE TABLE cash_registers;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE product_combo_items;
TRUNCATE TABLE product_combos;
TRUNCATE TABLE coupons;
TRUNCATE TABLE campaigns;
TRUNCATE TABLE work_shift_assignments;
TRUNCATE TABLE work_shifts;
TRUNCATE TABLE inventory_stock;
TRUNCATE TABLE product_batches;
TRUNCATE TABLE locations;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE units;
TRUNCATE TABLE products;
TRUNCATE TABLE customers;
TRUNCATE TABLE customer_tiers;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE tax_rates;
TRUNCATE TABLE supplier_contracts;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. BRANDS & CATEGORIES
insert ignore into brands ( name ) values ( 'Vinamilk' ),( 'Nestle' ),( 'Coca-Cola' ),( 'Unilever' ),( 'P&G' ),( 'Kinh Do' ),( 'Oishi'
);

insert ignore into categories ( name ) values ( 'Beverages' ),( 'Dairy Products' ),( 'Personal Care' ),( 'Household Items' ),( 'Snacks'

),( 'Health Care' );

-- 2. SUPPLIERS (Supplier entity có @CreationTimestamp/@UpdateTimestamp)
INSERT INTO suppliers (name, tax_code, address, email, phone, contact_person, contract_files, contract_signed_date, contract_expiry, active, notes) VALUES 
('Vinamilk Distribution', '0100170098', '10 Tan Trao, Tan Phu Ward, District 7, HCMC', 'sales@vinamilk.com.vn', '1800-1199', 'Nguyen Van A', '["https://res.cloudinary.com/demo/sample_contract1.pdf"]', '2023-01-15', '2025-01-15', TRUE, 'Main dairy supplier with 2-year contract'),
('Unilever Vietnam', '0300491828', '15 Le Duan Blvd, District 1, HCMC', 'contact@unilever.com.vn', '1800-5588', 'Tran Thi B', '["https://res.cloudinary.com/demo/sample_contract2.pdf", "https://res.cloudinary.com/demo/sample_contract2_annex.pdf"]', '2023-03-01', '2024-12-31', TRUE, 'Personal care and household items supplier'),
('Nestle Vietnam', '0302127854', 'The Vista Building, 628C Hanoi Highway, HCMC', 'info@nestle.com.vn', '1900-6011', 'Le Van C', '["https://res.cloudinary.com/demo/sample_contract3.pdf"]', '2023-06-01', '2025-06-01', TRUE, 'Beverages and snacks supplier'),
('Coca-Cola Vietnam', '0300693409', '124 Kim Ma Street, Ba Dinh, Hanoi', 'vietnam@cocacola.com', '1900-0180', 'Pham Thi D', NULL, NULL, NULL, TRUE, 'Soft drinks supplier - contract pending')
AS new_supplier
ON DUPLICATE KEY UPDATE
name = new_supplier.name,
address = new_supplier.address,
email = new_supplier.email,
phone = new_supplier.phone,
contact_person = new_supplier.contact_person,
contract_files = new_supplier.contract_files,
contract_signed_date = new_supplier.contract_signed_date,
contract_expiry = new_supplier.contract_expiry,
active = new_supplier.active,
notes = new_supplier.notes,
updated_at = NOW();

-- 2.1 SUPPLIER CONTRACTS (hợp đồng nhà cung cấp)
INSERT IGNORE INTO supplier_contracts (
      supplier_id,
      contract_number,
      title,
      description,
      status,
      start_date,
      end_date,
      total_value,
      currency,
      payment_terms,
      delivery_terms,
      signed_by_supplier,
      signed_by_company,
      signed_date,
      notes,
      created_at,
      updated_at
) VALUES
(1, 'SC-VM-2026-001', 'Hợp đồng phân phối sữa Vinamilk 2026', 'Hợp đồng cung ứng sữa và chế phẩm sữa cho toàn hệ thống cửa hàng', 'ACTIVE', '2026-01-01', '2026-12-31', 1200000000.00, 'VND', 'Thanh toán 30 ngày kể từ ngày nhận hóa đơn', 'Giao hàng theo lịch tuần', 'Nguyen Van A', 'Tran Thi Manager', '2025-12-20', 'Ưu tiên giao hàng dịp cao điểm lễ tết', NOW(), NOW()),
(2, 'SC-UL-2026-001', 'Hợp đồng đồ gia dụng Unilever 2026', 'Hợp đồng cung ứng nhóm sản phẩm chăm sóc cá nhân và gia dụng', 'ACTIVE', '2026-01-15', '2026-12-31', 800000000.00, 'VND', 'Thanh toán theo từng lô, tối đa 21 ngày', 'Giao hàng trong 48h sau PO', 'Tran Thi B', 'Tran Thi Manager', '2026-01-10', 'Cam kết đổi trả lô lỗi trong 7 ngày', NOW(), NOW());

-- 3. TAX RATES
insert ignore into tax_rates (
   name,
   rate,
   is_active
) values ( 'VAT Standard',
           10.00,
           1 ),( 'VAT Reduced',
                 5.00,
                 1 ),( 'No Tax',
                       0.00,
                       1 );

-- 4. ROLES & PERMISSIONS
insert ignore into roles (
   name,
   description
) values ( 'ADMIN',
           'System Administrator' ),( 'MANAGER',
                                      'Store Manager' ),( 'CASHIER',
                                                                                                                   'Cashier Staff' ),( 'INVENTORY_STAFF',
                                                                                                                                                            'Inventory Staff' ),( 'SALES_STAFF',
                                                                                                                                                                                                      'Sales Staff' );

insert ignore into permissions (
   name,
   description
) values ( 'USER_MANAGEMENT',
           'User Management' ),( 'PRODUCT_MANAGEMENT',
                                 'Product Management' ),( 'INVENTORY_MANAGEMENT',
                                                          'Inventory Management' ),( 'SALES_PROCESSING',
                                                                                     'Sales Processing' ),( 'REPORT_VIEWING',
                                                                                                            'Report Viewing' )
                                                                                                            ,( 'ADMIN_ACCESS'
                                                                                                            ,
                                                                                                                             'Admin Access'
                                                                                                                             )
                                                                                                                             ;

insert ignore into role_permissions (
   role_id,
   permission_id
) values ( 1,
           1 ),( 1,
                 2 ),( 1,
                       3 ),( 1,
                             4 ),( 1,
                                   5 ),( 1,
                                         6 ),( 2,
                                               1 ),( 2,
                                                     2 ),( 2,
                                                           3 ),( 2,
                                                                 4 ),( 2,
                                                                       5 ),( 3,
                                                                             4 ),( 4,
                                                                                   2 ),( 4,
                                                                                         3 ),( 5,
                                                                                               2 ),( 5,
                                                                                                     4 );

-- 5. USERS (Schema mới: username, password trong users table trực tiếp)
-- Password for all users: password
-- Hashed: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
INSERT INTO users (username, password, active, full_name, email, phone, address, status, role_id) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, HCMC', 'ACTIVE', 1),
('manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, HCMC', 'ACTIVE', 2),
('cashier', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, HCMC', 'ACTIVE', 3),
('inventory1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Pham Van Inventory', 'inventory@smalltrend.com', '0934567890', '12 Nguyen Trai, HCMC', 'ACTIVE', 4),
('sales1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Hoang Thi Sales', 'sales@smalltrend.com', '0945678901', '90 Pasteur, HCMC', 'ACTIVE', 5)
AS new_user
ON DUPLICATE KEY UPDATE
password = new_user.password,
active = new_user.active,
full_name = new_user.full_name,
email = new_user.email,
phone = new_user.phone,
address = new_user.address,
status = new_user.status,
role_id = new_user.role_id;

-- 6. CUSTOMER TIERS (CustomerTier entity có @PrePersist tự động set created_at/updated_at, KHÔNG insert)
INSERT IGNORE INTO customer_tiers (tier_code, tier_name, min_points, max_points, min_spending, points_multiplier, discount_rate, color, is_active, priority) VALUES 
('BRONZE', 'Đồng', 0, 499, 0.00, 1.0, 0.00, '#CD7F32', TRUE, 1),
('SILVER', 'Bạc', 500, 1499, 5000000.00, 1.5, 2.00, '#C0C0C0', TRUE, 2),
('GOLD', 'Vàng', 1500, 4999, 15000000.00, 2.0, 5.00, '#FFD700', TRUE, 3),
('PLATINUM', 'Bạch Kim', 5000, NULL, 50000000.00, 3.0, 10.00, '#E5E4E2', TRUE, 4);

-- 7. CUSTOMERS (Customer entity CHỈ có 3 cột: name, phone, loyalty_points)
INSERT IGNORE INTO customers (name, phone, loyalty_points) VALUES 
('Nguyen Van A', '0987654321', 150),
('Tran Thi B', '0976543210', 800),
('Le Van C', '0965432109', 2000),
('Pham Thi D', '0954321098', 6500);

-- 8. PRODUCTS (seed đầy đủ cột trạng thái + thời gian)
INSERT IGNORE INTO products (name, description, brand_id, category_id, tax_rate_id, is_active, created_at, updated_at) VALUES 
('Fresh Milk 1L', 'Vinamilk Fresh Milk', 1, 2, 2, TRUE, NOW(6), NOW(6)),
('Dove Soap 90g', 'Dove Beauty Bar', 4, 3, 1, TRUE, NOW(6), NOW(6)),
('Nescafe 3in1', 'Instant Coffee 20g x 10', 2, 1, 1, TRUE, NOW(6), NOW(6)),
('Coca Cola 330ml', 'Coca Cola Classic', 3, 1, 1, TRUE, NOW(6), NOW(6)),
('Oishi Snack', 'Potato Chips 50g', 7, 5, 1, TRUE, NOW(6), NOW(6));

-- 8.1 UNITS (quản lý đơn vị + phân loại vật chất + giá chuẩn)
INSERT IGNORE INTO units (code, name, material_type, symbol, default_sell_price, default_cost_price) VALUES
('L', 'Lít', 'LIQUID', 'L', 25000.00, 20000.00),
('ML', 'Mililit', 'LIQUID', 'ml', 12000.00, 8000.00),
('G', 'Gram', 'SOLID', 'g', 15000.00, 12000.00),
('KG', 'Kilogram', 'SOLID', 'kg', 150000.00, 120000.00),
('EA', 'Cái', 'SOLID', 'ea', 8000.00, 6000.00);

-- 9. PRODUCT VARIANTS (liên kết unit_id sang bảng units + cột trạng thái/thời gian)
INSERT IGNORE INTO product_variants (product_id, sku, barcode, unit_id, sell_price, is_active, created_at, updated_at) VALUES 
(1, 'VMILK-1L', '8901234567890', 1, 25000.00, TRUE, NOW(6), NOW(6)),
(2, 'DOVE-90G', '8901234567891', 3, 15000.00, TRUE, NOW(6), NOW(6)),
(3, 'NESCAFE-200G', '8901234567892', 3, 45000.00, TRUE, NOW(6), NOW(6)),
(4, 'COCA-330ML', '8901234567893', 2, 12000.00, TRUE, NOW(6), NOW(6)),
(5, 'OISHI-50G', '8901234567894', 3, 8000.00, TRUE, NOW(6), NOW(6));

-- 10. LOCATIONS (tọa độ ma trận trực quan: zone-row-col-level)
INSERT IGNORE INTO locations (name, type, zone, grid_row, grid_col, grid_level) VALUES 
('Main Warehouse A1', 'STORAGE', 'A', 1, 1, 1),
('Main Warehouse A2', 'STORAGE', 'A', 1, 2, 1),
('Cold Storage B1', 'STORAGE', 'B', 1, 1, 1),
('Store Front C1', 'DISPLAY', 'C', 1, 1, 1),
('POS Display Zone C2', 'DISPLAY', 'C', 1, 2, 1);

-- 11. PRODUCT BATCHES (ProductBatch entity KHÔNG có created_at)
INSERT IGNORE INTO product_batches (variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES 
(1, 'VM2026001', 20000.00, '2026-01-15', '2026-04-15'),
(2, 'DV2026001', 12000.00, '2026-02-01', '2027-02-01'),
(3, 'NC2026001', 35000.00, '2026-01-20', '2027-01-20'),
(4, 'CC2026001', 8000.00, '2026-02-10', '2026-08-10'),
(5, 'OI2026001', 6000.00, '2026-02-01', '2026-06-01');

-- 11.1 INVENTORY STOCK (tồn kho theo lô và vị trí)
INSERT IGNORE INTO inventory_stock (variant_id, location_id, batch_id, quantity) VALUES
(1, 1, 1, 420),
(2, 2, 2, 180),
(3, 3, 3, 260),
(4, 4, 4, 510),
(5, 5, 5, 390);

-- 12. WORK SHIFTS (Ca làm việc mẫu)
-- JPA tự động tính planned_minutes, break_minutes, working_minutes trong @PrePersist
INSERT IGNORE INTO work_shifts (
   shift_code,
   shift_name,
   start_time,
   end_time,
   break_start_time,
   break_end_time,
   shift_type,
   overtime_multiplier,
   night_shift_bonus,
   weekend_bonus,
   holiday_bonus,
   minimum_staff_required,
   maximum_staff_allowed,
   allow_early_clock_in,
   allow_late_clock_out,
   early_clock_in_minutes,
   late_clock_out_minutes,
   grace_peroid_minutes,
   status,
   requires_approval,
   supervisor_role_id,
   description
) VALUES 
-- Ca sáng (8h-17h, nghỉ 12h-13h) -> JPA sẽ tính = 480 phút làm việc
('SHIFT-MORNING', 'Ca Sáng', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 'REGULAR', 1.50, 0.00, 0.00, 0.00, 2, 5, TRUE, TRUE, 15, 30, 10, 'ACTIVE', FALSE, 2, 'Ca sáng từ 8h đến 17h, nghỉ trưa 1 tiếng'),

-- Ca chiều (13h-22h, nghỉ 18h-18h30) -> JPA sẽ tính = 510 phút làm việc
('SHIFT-AFTERNOON', 'Ca Chiều', '13:00:00', '22:00:00', '18:00:00', '18:30:00', 'REGULAR', 1.50, 10.00, 0.00, 0.00, 2, 4, TRUE, TRUE, 15, 30, 10, 'ACTIVE', FALSE, 2, 'Ca chiều từ 13h đến 22h, nghỉ 30 phút'),

-- Ca tối (18h-23h, không nghỉ) -> JPA sẽ tính = 300 phút làm việc
('SHIFT-EVENING', 'Ca Tối', '18:00:00', '23:00:00', NULL, NULL, 'NIGHT', 1.50, 15.00, 0.00, 0.00, 2, 3, TRUE, TRUE, 10, 20, 5, 'ACTIVE', FALSE, 2, 'Ca tối từ 18h đến 23h, phụ cấp ca đêm 15%'),

-- Ca cuối tuần (9h-18h, nghỉ 12h30-13h30) -> JPA sẽ tính = 480 phút làm việc
('SHIFT-WEEKEND', 'Ca Cuối Tuần', '09:00:00', '18:00:00', '12:30:00', '13:30:00', 'WEEKEND', 2.00, 0.00, 20.00, 0.00, 3, 6, TRUE, TRUE, 15, 30, 10, 'ACTIVE', TRUE, 2, 'Ca cuối tuần từ 9h đến 18h, phụ cấp 20%'),

-- Ca full-time (8h-17h, nghỉ 12h-13h) -> JPA sẽ tính = 480 phút làm việc
('SHIFT-FULLTIME', 'Ca Full-time', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 'REGULAR', 1.50, 0.00, 0.00, 0.00, 1, 3, TRUE, TRUE, 15, 30, 10, 'ACTIVE', FALSE, NULL, 'Ca full-time chuẩn 8 tiếng');

-- 13. WORK SHIFT ASSIGNMENTS (Phân ca cho nhân viên)
-- Phân ca cho tuần này (22/02/2026 - 28/02/2026)
INSERT IGNORE INTO work_shift_assignments (work_shift_id, user_id, shift_date, status, notes) VALUES
-- Admin (user 1) - Ca sáng thứ 2, 3, 4
(1, 1, '2026-02-24', 'ASSIGNED', 'Giám sát hoạt động cửa hàng'),
(1, 1, '2026-02-25', 'ASSIGNED', NULL),
(1, 1, '2026-02-26', 'ASSIGNED', NULL),

-- Manager (user 2) - Ca chiều thứ 2, 3, 4, 5
(2, 2, '2026-02-24', 'ASSIGNED', 'Quản lý ca chiều'),
(2, 2, '2026-02-25', 'ASSIGNED', NULL),
(2, 2, '2026-02-26', 'ASSIGNED', NULL),
(2, 2, '2026-02-27', 'ASSIGNED', NULL),

-- Cashier (user 3) - Ca sáng thứ 5, 6 và Ca tối thứ 2, 3
(1, 3, '2026-02-27', 'ASSIGNED', 'Thu ngân ca sáng'),
(1, 3, '2026-02-28', 'ASSIGNED', NULL),
(3, 3, '2026-02-24', 'ASSIGNED', 'Thu ngân ca tối'),
(3, 3, '2026-02-25', 'ASSIGNED', NULL),

-- Cuối tuần (Thứ 7, Chủ nhật = 22, 23/02)
(4, 1, '2026-02-22', 'ASSIGNED', 'Ca cuối tuần - Admin'),
(4, 2, '2026-02-22', 'ASSIGNED', 'Ca cuối tuần - Manager'),
(4, 3, '2026-02-23', 'ASSIGNED', 'Ca cuối tuần - Cashier'),
(4, 1, '2026-02-23', 'ASSIGNED', 'Ca cuối tuần - Admin');

-- 14. CAMPAIGNS (Campaign entity có created_at/updated_at nhưng KHÔNG có @CreationTimestamp, cần insert thủ công)
INSERT IGNORE INTO campaigns (campaign_code, campaign_name, campaign_type, description, start_date, end_date, status, budget, target_revenue, is_public, created_by, created_at, updated_at) VALUES 
('CAMP-202602-001', 'Tết Sale 2026', 'SEASONAL', 'Khuyến mãi Tết Nguyên Đán', '2026-02-10', '2026-02-20', 'ACTIVE', 50000000.00, 200000000.00, TRUE, 2, NOW(), NOW()),
('CAMP-202602-002', 'Flash Sale Cuối Tuần', 'FLASH_SALE', 'Giảm giá sốc cuối tuần', '2026-02-14', '2026-02-15', 'ACTIVE', 10000000.00, 30000000.00, TRUE, 2, NOW(), NOW());

-- 15. COUPONS (Coupon entity có created_at/updated_at thủ công)
INSERT IGNORE INTO coupons (coupon_code, coupon_name, description, coupon_type, campaign_id, discount_percent, discount_amount, max_discount_amount, min_purchase_amount, start_date, end_date, total_usage_limit, usage_per_customer, status, created_by, created_at, updated_at) VALUES 
('WELCOME10', 'Giảm 10% Đơn Đầu', 'Mã giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 1, 10.00, NULL, 50000.00, 100000.00, '2026-02-01', '2026-03-31', 1000, 1, 'ACTIVE', 2, NOW(), NOW()),
('FREESHIP50K', 'Miễn Phí Ship', 'Miễn phí vận chuyển đơn từ 200k', 'FREE_SHIPPING', 1, NULL, 25000.00, NULL, 200000.00, '2026-02-10', '2026-02-28', NULL, 5, 'ACTIVE', 2, NOW(), NOW()),
('FLASH50K', 'Giảm 50K Flash Sale', 'Giảm ngay 50k cho đơn từ 300k', 'FIXED_AMOUNT', 2, NULL, 50000.00, NULL, 300000.00, '2026-02-14', '2026-02-15', 500, 2, 'ACTIVE', 2, NOW(), NOW());

-- 16. PRODUCT COMBOS (ProductCombo entity có @PrePersist tự động set created_at/updated_at, KHÔNG insert)
INSERT IGNORE INTO product_combos (combo_code, combo_name, description, original_price, combo_price, saved_amount, discount_percent, valid_from, valid_to, is_active, status, created_by) VALUES 
('COMBO-BREAKFAST', 'Combo Sáng Năng Động', 'Sữa + Bánh mì + Nước ngọt', 60000.00, 50000.00, 10000.00, 16.67, '2026-02-01', '2026-03-31', TRUE, 'ACTIVE', 2),
('COMBO-SNACK', 'Combo Snack Vui Vẻ', 'Snack + Nước ngọt', 20000.00, 18000.00, 2000.00, 10.00, '2026-02-14', '2026-02-28', TRUE, 'ACTIVE', 2);

insert ignore into product_combo_items (
   combo_id,
   product_variant_id,
   quantity,
   display_order
) values ( 1,
           1,
           1,
           1 ), -- Milk
           ( 1,
                 3,
                 1,
                 2 ), -- Coffee
                 ( 1,
                       4,
                       1,
                       3 ), -- Coca
                       ( 2,
                             5,
                             2,
                             1 ), -- Snack x2
                             ( 2,
                                   4,
                                   2,
                                   2 ); -- Coca x2

-- 17. CASH REGISTERS (CashRegister entity có created_at/updated_at thủ công)
INSERT IGNORE INTO cash_registers (register_code, register_name, store_name, location, register_type, status, device_id, current_cash, opening_balance, current_operator_id, session_start_time, total_transactions_today, created_at, updated_at) VALUES 
('POS-001', 'Quầy 1', 'SmallTrend Store', 'Front Counter', 'MAIN', 'ACTIVE', 'DEV-POS-001', 5000000.00, 2000000.00, 3, NOW(), 0, NOW(), NOW()),
('POS-002', 'Quầy 2', 'SmallTrend Store', 'Express Counter', 'EXPRESS', 'ACTIVE', 'DEV-POS-002', 3000000.00, 1000000.00, NULL, NULL, 0, NOW(), NOW());

-- 18. SALE ORDERS (Đơn hàng bán)
INSERT IGNORE INTO sale_orders (
      order_code,
      customer_id,
      cashier_id,
      cash_register_id,
      order_date,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      payment_method,
      status,
      notes,
      created_at,
      updated_at
) VALUES
('SO-20260224-001', 2, 3, 1, '2026-02-24 09:30:00', 49000.00, 4900.00, 0.00, 53900.00, 'CASH', 'COMPLETED', 'Đơn mua nhanh buổi sáng', '2026-02-24 09:30:00', '2026-02-24 09:31:00'),
('SO-20260224-002', 1, 3, 1, '2026-02-24 19:20:00', 93000.00, 9300.00, 5000.00, 97300.00, 'CARD', 'COMPLETED', 'Khách thành viên đổi điểm', '2026-02-24 19:20:00', '2026-02-24 19:23:00'),
('SO-20260225-001', 3, 3, 2, '2026-02-25 20:10:00', 32000.00, 3200.00, 0.00, 35200.00, 'MOMO', 'REFUNDED', 'Hoàn tiền 1 phần do sản phẩm lỗi', '2026-02-25 20:10:00', '2026-02-25 21:00:00');

-- 19. SALE ORDER ITEMS (Chi tiết đơn bán)
INSERT IGNORE INTO sale_order_items (
      sale_order_id,
      product_variant_id,
      product_name,
      sku,
      quantity,
      unit_price,
      line_discount_amount,
      line_tax_amount,
      line_total_amount,
      notes
) VALUES
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 4, 'Coca Cola 330ml', 'COCA-330ML', 2, 12000.00, 0.00, 2400.00, 26400.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 5, 'Oishi Snack', 'OISHI-50G', 3, 8000.00, 0.00, 2400.00, 26400.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 1, 'Fresh Milk 1L', 'VMILK-1L', 2, 25000.00, 2000.00, 4800.00, 52800.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 3, 'Nescafe 3in1', 'NESCAFE-200G', 1, 45000.00, 3000.00, 4500.00, 46500.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 2, 'Dove Soap 90g', 'DOVE-90G', 2, 15000.00, 0.00, 3000.00, 33000.00, '1 sản phẩm bị lỗi vỏ hộp');

-- 20. SALE ORDER HISTORIES (Lịch sử đơn bán)
INSERT IGNORE INTO sale_order_histories (
      sale_order_id,
      from_status,
      to_status,
      action_type,
      changed_by_user_id,
      change_notes,
      changed_at
) VALUES
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), NULL, 'PENDING', 'CREATED', 3, 'Khởi tạo đơn tại POS-001', '2026-02-24 09:30:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 'PENDING', 'COMPLETED', 'PAYMENT_SUCCESS', 3, 'Thanh toán tiền mặt thành công', '2026-02-24 09:31:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), NULL, 'PENDING', 'CREATED', 3, 'Khởi tạo đơn tại POS-001', '2026-02-24 19:20:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 'PENDING', 'COMPLETED', 'PAYMENT_SUCCESS', 3, 'Thanh toán thẻ thành công', '2026-02-24 19:23:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), NULL, 'PENDING', 'CREATED', 3, 'Khởi tạo đơn tại POS-002', '2026-02-25 20:10:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 'PENDING', 'COMPLETED', 'PAYMENT_SUCCESS', 3, 'Thanh toán ví điện tử thành công', '2026-02-25 20:15:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 'COMPLETED', 'REFUNDED', 'REFUND_PARTIAL', 2, 'Khách trả lại sản phẩm lỗi', '2026-02-25 21:00:00');

-- 20.1 CASH TRANSACTIONS (giao dịch tiền mặt tại quầy)
INSERT IGNORE INTO cash_transactions (
      transaction_code,
      register_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      reason,
      description,
      order_id,
      performed_by,
      approved_by,
      approved_at,
      status,
      receipt_image_url,
      notes,
      transaction_time,
      created_at,
      updated_at
) VALUES
('CT-20260224-001', 1, 'CASH_IN', 53900.00, 5000000.00, 5053900.00, 'SALE', 'Thu tiền mặt từ đơn SO-20260224-001', (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 3, 2, '2026-02-24 09:35:00', 'COMPLETED', NULL, 'Đã đối soát cuối ca', '2026-02-24 09:31:00', NOW(), NOW()),
('CT-20260225-001', 2, 'CASH_OUT', 15000.00, 3000000.00, 2985000.00, 'REFUND', 'Hoàn tiền mặt 1 phần cho đơn SO-20260225-001', (SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 3, 2, '2026-02-25 21:05:00', 'COMPLETED', NULL, 'Refund do sản phẩm lỗi', '2026-02-25 21:00:00', NOW(), NOW());

-- 20.2 COUPON USAGE (lịch sử sử dụng coupon)
INSERT IGNORE INTO coupon_usage (
      coupon_id,
      customer_id,
      order_id,
      usage_code,
      order_amount,
      discount_amount,
      status,
      applied_at,
      redeemed_at,
      cancel_reason,
      created_at,
      updated_at
) VALUES
((SELECT id FROM coupons WHERE coupon_code = 'WELCOME10'), 1, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 'USAGE-20260224-001', 102300.00, 5000.00, 'REDEEMED', '2026-02-24 19:20:00', '2026-02-24 19:23:00', NULL, NOW(), NOW()),
((SELECT id FROM coupons WHERE coupon_code = 'FLASH50K'), 3, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 'USAGE-20260225-001', 35200.00, 0.00, 'CANCELLED', '2026-02-25 20:10:00', NULL, 'Đơn bị hoàn một phần, coupon không ghi nhận', NOW(), NOW());

-- 20.3 LOYALTY TRANSACTIONS (giao dịch điểm khách hàng)
INSERT IGNORE INTO loyalty_transactions (
      transaction_code,
      customer_id,
      transaction_type,
      points,
      balance_before,
      balance_after,
      order_id,
      order_amount,
      points_multiplier,
      reason,
      description,
      expiry_date,
      performed_by,
      status,
      transaction_time,
      created_at,
      updated_at
) VALUES
('LT-20260224-001', 2, 'EARN', 54, 746, 800, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 53900.00, 1.00, 'PURCHASE', 'Tích điểm từ đơn SO-20260224-001', '2027-02-24 23:59:59', 3, 'COMPLETED', '2026-02-24 09:32:00', NOW(), NOW()),
('LT-20260224-002', 1, 'EARN', 97, 53, 150, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 97300.00, 1.00, 'PURCHASE', 'Tích điểm từ đơn SO-20260224-002', '2027-02-24 23:59:59', 3, 'COMPLETED', '2026-02-24 19:24:00', NOW(), NOW());
-- 18. TICKETS (Swap Shift, Handover, Refund)
-- Ticket entity có @CreationTimestamp/@UpdateTimestamp nên JPA tự động set
INSERT IGNORE INTO tickets (
   ticket_code,
   ticket_type,
   title,
   description,
   status,
   priority,
   created_by_user_id,
   assigned_to_user_id,
   resolved_by_user_id,
   related_entity_type,
   related_entity_id,
   resolution,
   resolved_at
) VALUES 
('TCK-SWAP-001', 'SWAP_SHIFT', 'Swap shift ngày 15/02 - Ca sáng <-> Ca chiều', 'Nhân viên A muốn đổi ca sáng sang ca chiều với nhân viên B do có lịch cá nhân', 'OPEN', 'NORMAL', 2, 3, NULL, 'WorkShift', 1, NULL, NULL),
('TCK-HAND-001', 'HANDOVER', 'Bàn giao ca tối 14/02/2026', 'Bàn giao ca tối: Quầy 1 có 2,500,000 VND trong két, 15 giao dịch hoàn tất, cần kiểm kê lại kệ đồ uống', 'RESOLVED', 'HIGH', 2, 3, 2, 'CashRegister', 1, 'Đã bàn giao thành công. Nhân viên ca tối xác nhận đã nhận đầy đủ tiền mặt và ghi chú', '2026-02-21 22:00:00'),
('TCK-REF-001', 'REFUND', 'Hoàn tiền đơn hàng ORD-2026- 001', 'Khách hàng mua nhầm sản phẩm, yêu cầu hoàn tiền. Sản phẩm còn nguyên seal, trong thời hạn đổi trả', 'IN_PROGRESS', 'URGENT', 2, 1, NULL, 'Order', 1, NULL, NULL),
('TCK-COMP-001', 'COMPLAINT', 'Khiếu nại về chất lượng sản phẩm', 'Khách hàng phàn nàn sữa hết hạn sử dụng. Cần kiểm tra lại quy trình kiểm kê', 'OPEN', 'HIGH', 3, 1, NULL, 'Product', 1, NULL, NULL);

-- 19. USER CREDENTIALS (Bảng phụ đăng nhập nếu một số module cũ còn dùng)
INSERT IGNORE INTO user_credentials (user_id, username, password_hash) VALUES
(1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(2, 'manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(3, 'cashier', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(4, 'inventory1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(5, 'sales1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG');

-- 20. ATTENDANCE (Chấm công thực tế theo phân ca)
INSERT IGNORE INTO attendance (user_id, date, time_in, time_out, status) VALUES
(1, '2026-02-24', '08:01:00', '17:03:00', 'PRESENT'),
(1, '2026-02-25', '08:12:00', '17:00:00', 'LATE'),
(2, '2026-02-24', '13:00:00', '22:05:00', 'PRESENT'),
(2, '2026-02-25', '13:25:00', '22:00:00', 'LATE'),
(3, '2026-02-24', '18:00:00', '23:02:00', 'PRESENT'),
(3, '2026-02-27', NULL, NULL, 'ABSENT');

-- 21. SALARY CONFIGS (nhiều cấu hình theo thời điểm cho một nhân viên)
INSERT IGNORE INTO salary_configs (
      user_id,
      salary_type,
      base_salary,
      hourly_rate,
      overtime_rate_multiplier,
      allowances,
      bonus_percentage,
      is_active,
      effective_from,
      effective_until,
      notes,
      created_at,
      updated_at
) VALUES
(1, 'MONTHLY', 28000000.00, NULL, 1.50, 1200000.00, 4.00, FALSE, '2025-07-01 00:00:00', '2025-12-31 23:59:59', 'Admin package - old cycle (monthly)', NOW(), NOW()),
(1, 'MONTHLY', 30000000.00, NULL, 1.50, 1500000.00, 5.00, TRUE, '2026-01-01 00:00:00', NULL, 'Admin package - current (monthly)', NOW(), NOW()),
(2, 'MONTHLY', 18000000.00, NULL, 1.50, 1000000.00, 3.00, TRUE, '2026-01-01 00:00:00', NULL, 'Manager package (monthly)', NOW(), NOW()),
(3, 'HOURLY', NULL, 70000.00, 1.50, 500000.00, 1.00, TRUE, '2026-01-01 00:00:00', NULL, 'Cashier package (hourly)', NOW(), NOW()),
(4, 'MONTHLY', 13000000.00, NULL, 1.50, 400000.00, 1.00, TRUE, '2026-01-01 00:00:00', NULL, 'Inventory package (monthly)', NOW(), NOW()),
(5, 'HOURLY', NULL, 72000.00, 1.50, 450000.00, 1.00, TRUE, '2026-01-01 00:00:00', NULL, 'Sales package (hourly)', NOW(), NOW());

-- Insert Inventory Stock
INSERT INTO inventory_stock
(id, variant_id, batch_id, location_id, quantity) VALUES
(1, 1, 1, 1, 250),
(2, 2, 2, 1, 180),
(3, 3, 3, 2, 800),
(4, 4, 4, 3, 350),
(5, 5, 5, 4, 220);

-- Insert Purchase Orders
INSERT INTO purchase_orders
(id, supplier_id, order_date, status, total_amount, received_by) VALUES
(1, 1, '2024-01-10', 'COMPLETED', 5000000.00, 2),
(2, 2, '2024-01-15', 'COMPLETED', 3500000.00, 2),
(3, 3, '2024-02-01', 'PENDING', 2400000.00, 2),
(4, 4, '2024-02-05', 'COMPLETED', 1800000.00, 4),
(5, 5, '2024-02-10', 'PROCESSING', 2200000.00, 4);

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

-- 24. PURCHASE ORDERS (Đơn đặt hàng từ nhà cung cấp)
INSERT IGNORE INTO purchase_orders (
   order_number,
   supplier_id,
   created_by,
   order_date,
   expected_delivery_date,
   actual_delivery_date,
   status,
   subtotal,
   tax_amount,
   discount_amount,
   total_amount,
   notes,
   created_at,
   updated_at
) VALUES
('PO-2026-001', 1, 2, '2026-02-10', '2026-02-15', '2026-02-14', 'RECEIVED', 47000000.00, 4700000.00, 500000.00, 51200000.00, 'Đơn nhập sữa Vinamilk tháng 2', NOW(), NOW()),
('PO-2026-002', 2, 2, '2026-02-12', '2026-02-18', NULL, 'ORDERED', 18000000.00, 1800000.00, 0.00, 19800000.00, 'Đơn nhập đồ gia dụng Unilever', NOW(), NOW()),
('PO-2026-003', 3, 1, '2026-02-15', '2026-02-20', NULL, 'PENDING', 12000000.00, 1200000.00, 200000.00, 13000000.00, 'Đơn nhập snack Nestle', NOW(), NOW()),
('PO-2026-004', 4, 2, '2026-02-18', '2026-02-25', NULL, 'DRAFT', 24000000.00, 2400000.00, 1000000.00, 25400000.00, 'Đơn nhập nước ngọt Coca-Cola', NOW(), NOW());

-- 25. PURCHASE ORDER ITEMS (Chi tiết đơn đặt hàng)
INSERT IGNORE INTO purchase_order_items (
   purchase_order_id,
   product_variant_id,
   quantity,
   unit_cost,
   total_cost,
   received_quantity,
   notes
) VALUES
-- PO-2026-001: Sữa Vinamilk
((SELECT id FROM purchase_orders WHERE order_number = 'PO-2026-001'), 1, 2000, 20000.00, 40000000.00, 2000, 'Đã nhận đủ 2000 hộp'),
((SELECT id FROM purchase_orders WHERE order_number = 'PO-2026-001'), 3, 200, 35000.00, 7000000.00, 200, 'Đã nhận đủ 200 gói'),
-- PO-2026-002: Unilever
((SELECT id FROM purchase_orders WHERE order_number = 'PO-2026-002'), 2, 1500, 12000.00, 18000000.00, 0, 'Chưa nhận hàng'),
-- PO-2026-003: Nestle
((SELECT id FROM purchase_orders WHERE order_number = 'PO-2026-003'), 5, 2000, 6000.00, 12000000.00, 0, 'Đang chờ giao'),
-- PO-2026-004: Coca-Cola
((SELECT id FROM purchase_orders WHERE order_number = 'PO-2026-004'), 4, 3000, 8000.00, 24000000.00, 0, 'Đơn nháp chưa gửi');

-- 26. SHIFT HANDOVERS
INSERT INTO shift_handovers (
      handover_code,
      shift_id,
      from_user_id,
      to_user_id,
      cash_register_id,
      handover_time,
      cash_amount,
      expected_cash,
      actual_cash,
      variance,
      cash_breakdown,
      total_transactions,
      total_sales,
      total_refunds,
      total_customers,
      equipment_status,
      inventory_notes,
      low_stock_items,
      issues_reported,
      important_notes,
      confirmed,
      confirmed_at,
      status,
      dispute_reason,
      attachment_url,
      created_at,
      updated_at
) VALUES
('HANDOVER-001', 3, 3, 2, 1, '2026-02-24 23:10:00', 2500000.00, 2500000.00, 2500000.00, 0.00, '{"500k":2,"200k":5,"100k":5}', 15, 8200000.00, 120000.00, 96, '{"printer":"OK","scanner":"OK"}', '{"note":"Bổ sung nước ngọt tầng 2"}', '[4,5]', 'Không có sự cố lớn', 'Đã bàn giao đầy đủ', TRUE, '2026-02-24 23:15:00', 'CONFIRMED', NULL, NULL, NOW(), NOW())
AS new_handover
ON DUPLICATE KEY UPDATE
      shift_id = new_handover.shift_id,
      from_user_id = new_handover.from_user_id,
      to_user_id = new_handover.to_user_id,
      cash_register_id = new_handover.cash_register_id,
      handover_time = new_handover.handover_time,
      cash_amount = new_handover.cash_amount,
      expected_cash = new_handover.expected_cash,
      actual_cash = new_handover.actual_cash,
      variance = new_handover.variance,
      cash_breakdown = new_handover.cash_breakdown,
      total_transactions = new_handover.total_transactions,
      total_sales = new_handover.total_sales,
      total_refunds = new_handover.total_refunds,
      total_customers = new_handover.total_customers,
      equipment_status = new_handover.equipment_status,
      inventory_notes = new_handover.inventory_notes,
      low_stock_items = new_handover.low_stock_items,
      issues_reported = new_handover.issues_reported,
      important_notes = new_handover.important_notes,
      confirmed = new_handover.confirmed,
      confirmed_at = new_handover.confirmed_at,
      status = new_handover.status,
      dispute_reason = new_handover.dispute_reason,
      attachment_url = new_handover.attachment_url,
      updated_at = new_handover.updated_at;

-- 27. PURCHASE HISTORY (Lịch sử mua hàng của khách)
INSERT IGNORE INTO purchase_history (
    customer_id,
    customer_name,
    product_id,
    product_name,
    quantity,
    price,
    subtotal,
    payment_method,
    created_at
) VALUES
-- Đơn 1: Nguyen Van A - Sáng 24/02
(1, 'Nguyen Van A', 4, 'Coca Cola 330ml', 2, 12000.00, 24000.00, 'CASH', '2026-02-24 09:30:00'),
(1, 'Nguyen Van A', 5, 'Oishi Snack', 3, 8000.00, 24000.00, 'CASH', '2026-02-24 09:30:00'),
-- Đơn 2: Tran Thi B - Tối 24/02
(2, 'Tran Thi B', 1, 'Fresh Milk 1L', 2, 25000.00, 50000.00, 'CARD', '2026-02-24 19:20:00'),
(2, 'Tran Thi B', 3, 'Nescafe 3in1', 1, 45000.00, 45000.00, 'CARD', '2026-02-24 19:20:00'),
-- Đơn 3: Le Van C - Tối 25/02
(3, 'Le Van C', 2, 'Dove Soap 90g', 2, 15000.00, 30000.00, 'MOMO', '2026-02-25 20:10:00'),
-- Đơn 4: Nguyen Van A - Sáng 26/02
(1, 'Nguyen Van A', 1, 'Fresh Milk 1L', 1, 25000.00, 25000.00, 'CASH', '2026-02-26 10:15:00'),
-- Đơn 5: Pham Thi D - Chiều 26/02
(4, 'Pham Thi D', 4, 'Coca Cola 330ml', 5, 12000.00, 60000.00, 'CASH', '2026-02-26 14:30:00'),
(4, 'Pham Thi D', 5, 'Oishi Snack', 4, 8000.00, 32000.00, 'CASH', '2026-02-26 14:30:00'),
-- Đơn 6: Tran Thi B - Sáng 27/02
(2, 'Tran Thi B', 4, 'Coca Cola 330ml', 3, 12000.00, 36000.00, 'MOMO', '2026-02-27 08:45:00'),
(2, 'Tran Thi B', 2, 'Dove Soap 90g', 1, 15000.00, 15000.00, 'MOMO', '2026-02-27 08:45:00'),
-- Đơn 7: Le Van C - Chiều 27/02
(3, 'Le Van C', 1, 'Fresh Milk 1L', 3, 25000.00, 75000.00, 'CARD', '2026-02-27 15:20:00'),
(3, 'Le Van C', 3, 'Nescafe 3in1', 2, 45000.00, 90000.00, 'CARD', '2026-02-27 15:20:00'),
-- Đơn 8: Nguyen Van A - Tối 27/02
(1, 'Nguyen Van A', 5, 'Oishi Snack', 5, 8000.00, 40000.00, 'CASH', '2026-02-27 20:00:00'),
-- Đơn 9: Pham Thi D - Sáng 28/02
(4, 'Pham Thi D', 1, 'Fresh Milk 1L', 2, 25000.00, 50000.00, 'CARD', '2026-02-28 09:10:00'),
(4, 'Pham Thi D', 2, 'Dove Soap 90g', 3, 15000.00, 45000.00, 'CARD', '2026-02-28 09:10:00'),
-- Đơn 10: Le Van C - Chiều 28/02
(3, 'Le Van C', 4, 'Coca Cola 330ml', 6, 12000.00, 72000.00, 'CASH', '2026-02-28 16:30:00');

-- =============================================================================
-- End of SmallTrend Sample Data
-- =============================================================================
