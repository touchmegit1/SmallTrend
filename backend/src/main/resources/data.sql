-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE - Comprehensive Sample Data
-- =============================================================================
-- Password for all users: password123
-- Hashed: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW
-- =============================================================================

-- Compatibility bootstrap for environments where JPA cannot create JSON columns
CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      tax_code VARCHAR(255),
      address VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(255),
      contact_person VARCHAR(255),
      contract_files LONGTEXT,
      contract_signed_date DATE,
      contract_expiry DATE,
      active BIT(1) NOT NULL DEFAULT b'1',
      notes TEXT,
      created_at DATETIME,
      updated_at DATETIME,
      UNIQUE KEY uk_suppliers_tax_code (tax_code)
);

CREATE TABLE IF NOT EXISTS shift_handovers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      handover_code VARCHAR(50) NOT NULL UNIQUE,
      shift_id INT NOT NULL,
      from_user_id INT NOT NULL,
      to_user_id INT NOT NULL,
      cash_register_id INT,
      handover_time DATETIME NOT NULL,
      cash_amount DECIMAL(15,2),
      expected_cash DECIMAL(15,2),
      actual_cash DECIMAL(15,2),
      variance DECIMAL(15,2),
      cash_breakdown LONGTEXT,
      total_transactions INT,
      total_sales DECIMAL(15,2),
      total_refunds DECIMAL(15,2),
      total_customers INT,
      equipment_status LONGTEXT,
      inventory_notes LONGTEXT,
      low_stock_items LONGTEXT,
      issues_reported TEXT,
      important_notes TEXT,
      confirmed BIT(1),
      confirmed_at DATETIME,
      status VARCHAR(20),
      dispute_reason TEXT,
      attachment_url VARCHAR(255),
      created_at DATETIME,
      updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      campaign_code VARCHAR(50) NOT NULL UNIQUE,
      campaign_name VARCHAR(200) NOT NULL,
      campaign_type VARCHAR(50),
      description TEXT,
      banner_image_url VARCHAR(255),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      start_time DATETIME,
      end_time DATETIME,
      status VARCHAR(20),
      budget DECIMAL(15,2),
      actual_spent DECIMAL(15,2),
      target_revenue DECIMAL(15,2),
      actual_revenue DECIMAL(15,2),
      total_orders INT,
      total_discount DECIMAL(15,2),
      min_purchase_amount DECIMAL(15,2),
      target_categories LONGTEXT,
      is_public BIT(1),
      created_by INT,
      approved_by INT,
      approved_at DATETIME,
      internal_notes TEXT,
      created_at DATETIME,
      updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      coupon_code VARCHAR(50) NOT NULL UNIQUE,
      coupon_name VARCHAR(200) NOT NULL,
      description TEXT,
      coupon_type VARCHAR(30),
      campaign_id INT,
      discount_percent DECIMAL(5,2),
      discount_amount DECIMAL(15,2),
      max_discount_amount DECIMAL(15,2),
      min_purchase_amount DECIMAL(15,2),
      min_quantity INT,
      allowed_categories LONGTEXT,
      start_date DATE,
      end_date DATE NOT NULL,
      start_time DATETIME,
      end_time DATETIME,
      total_usage_limit INT,
      usage_per_customer INT,
      current_usage_count INT,
      buy_quantity INT,
      get_quantity INT,
      status VARCHAR(20),
      created_by INT,
      internal_notes TEXT,
      created_at DATETIME,
      updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS tickets (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      ticket_code VARCHAR(20) NOT NULL UNIQUE,
      ticket_type VARCHAR(255) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(255) NOT NULL,
      priority VARCHAR(255),
      created_by_user_id INT,
      assigned_to_user_id INT,
      resolved_by_user_id INT,
      related_entity_type VARCHAR(50),
      related_entity_id BIGINT,
      resolution TEXT,
      resolved_at DATETIME,
      created_at DATETIME,
      updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS cash_registers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      register_code VARCHAR(50) NOT NULL UNIQUE,
      register_name VARCHAR(100) NOT NULL,
      store_name VARCHAR(100),
      location VARCHAR(100),
      register_type VARCHAR(20),
      status VARCHAR(20),
      device_id VARCHAR(100),
      current_cash DECIMAL(15,2),
      opening_balance DECIMAL(15,2),
      expected_balance DECIMAL(15,2),
      variance DECIMAL(15,2),
      total_transactions_today INT,
      total_sales_today DECIMAL(15,2),
      total_cash_today DECIMAL(15,2),
      total_card_today DECIMAL(15,2),
      current_operator_id INT,
      session_start_time DATETIME,
      last_transaction_time DATETIME,
      max_cash_limit DECIMAL(15,2),
      notes TEXT,
      created_at DATETIME,
      updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS salary_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      base_salary DECIMAL(12,2) NOT NULL,
      hourly_rate DECIMAL(8,2),
      overtime_rate_multiplier DECIMAL(3,2),
      allowances DECIMAL(10,2),
      bonus_percentage DECIMAL(5,2),
      is_active BIT(1) NOT NULL,
      effective_from DATETIME NOT NULL,
      effective_until DATETIME,
      notes TEXT,
      created_at DATETIME,
      updated_at DATETIME,
      UNIQUE KEY uk_salary_configs_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS payroll_calculations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pay_period_start DATE NOT NULL,
      pay_period_end DATE NOT NULL,
      payment_cycle VARCHAR(20) NOT NULL,
      total_worked_days INT,
      total_worked_minutes INT,
      regular_minutes INT,
      overtime_minutes INT,
      night_shift_minutes INT,
      weekend_minutes INT,
      holiday_minutes INT,
      late_days INT,
      absent_days INT,
      leave_days INT,
      base_pay DECIMAL(15,2),
      overtime_pay DECIMAL(15,2),
      night_shift_bonus DECIMAL(15,2),
      weekend_bonus DECIMAL(15,2),
      holiday_bonus DECIMAL(15,2),
      allowances DECIMAL(15,2),
      commission_amount DECIMAL(15,2),
      bonus_amount DECIMAL(15,2),
      late_penalty DECIMAL(15,2),
      absent_penalty DECIMAL(15,2),
      social_insurance DECIMAL(15,2),
      health_insurance DECIMAL(15,2),
      unemployment_insurance DECIMAL(15,2),
      personal_income_tax DECIMAL(15,2),
      other_deductions DECIMAL(15,2),
      gross_pay DECIMAL(15,2),
      total_deductions DECIMAL(15,2),
      net_pay DECIMAL(15,2),
      status VARCHAR(20),
      calculated_by INT,
      approved_by INT,
      calculated_at DATETIME,
      approved_at DATETIME,
      paid_at DATETIME,
      calculation_details VARCHAR(2000),
      notes VARCHAR(1000),
      created_at DATETIME,
      updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS shift_swap_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_code VARCHAR(50) NOT NULL UNIQUE,
      requester_id INT NOT NULL,
      original_shift_id INT NOT NULL,
      original_shift_date DATE NOT NULL,
      target_user_id INT,
      target_shift_id INT,
      target_shift_date DATE,
      swap_type VARCHAR(20) NOT NULL,
      reason VARCHAR(500),
      status VARCHAR(20),
      accepted_by INT,
      accepted_at DATETIME,
      approved_by INT,
      approved_at DATETIME,
      rejection_reason VARCHAR(500),
      expiry_time DATETIME,
      notes TEXT,
      created_at DATETIME,
      updated_at DATETIME
);

-- STRICT RESET FOR SEED PROFILE
-- Đảm bảo mỗi lần chạy seed đều về trạng thái sạch và id ổn định
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE shift_handovers;
TRUNCATE TABLE shift_swap_requests;
TRUNCATE TABLE payroll_calculations;
TRUNCATE TABLE salary_configs;
TRUNCATE TABLE attendance;
TRUNCATE TABLE user_credentials;
TRUNCATE TABLE tickets;
TRUNCATE TABLE cash_registers;
TRUNCATE TABLE product_combo_items;
TRUNCATE TABLE product_combos;
TRUNCATE TABLE coupons;
TRUNCATE TABLE campaigns;
TRUNCATE TABLE work_shift_assignments;
TRUNCATE TABLE work_shifts;
TRUNCATE TABLE product_batches;
TRUNCATE TABLE locations;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE customers;
TRUNCATE TABLE customer_tiers;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE tax_rates;
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
ON DUPLICATE KEY UPDATE
name = VALUES(name),
address = VALUES(address),
email = VALUES(email),
phone = VALUES(phone),
contact_person = VALUES(contact_person),
contract_files = VALUES(contract_files),
contract_signed_date = VALUES(contract_signed_date),
contract_expiry = VALUES(contract_expiry),
active = VALUES(active),
notes = VALUES(notes),
updated_at = NOW();

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
                                                                              'Inventory Staff' );

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
                                                                                         3 );

-- 5. USERS (Schema mới: username, password trong users table trực tiếp)
-- Password for all users: password123
-- Hashed: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW
INSERT INTO users (username, password, active, full_name, email, phone, address, status, role_id) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW', TRUE, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, HCMC', 'ACTIVE', 1),
('manager', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW', TRUE, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, HCMC', 'ACTIVE', 2),
('cashier', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW', TRUE, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, HCMC', 'ACTIVE', 3)
ON DUPLICATE KEY UPDATE
password = VALUES(password),
active = VALUES(active),
full_name = VALUES(full_name),
email = VALUES(email),
phone = VALUES(phone),
address = VALUES(address),
status = VALUES(status),
role_id = VALUES(role_id);

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

-- 8. PRODUCTS (Product entity KHÔNG có created_at)
INSERT IGNORE INTO products (name, description, brand_id, category_id, tax_rate_id) VALUES 
('Fresh Milk 1L', 'Vinamilk Fresh Milk', 1, 2, 2),
('Dove Soap 90g', 'Dove Beauty Bar', 4, 3, 1),
('Nescafe 3in1', 'Instant Coffee 20g x 10', 2, 1, 1),
('Coca Cola 330ml', 'Coca Cola Classic', 3, 1, 1),
('Oishi Snack', 'Potato Chips 50g', 7, 5, 1);

-- 9. PRODUCT VARIANTS (ProductVariant entity KHÔNG có created_at, có is_active BOOLEAN)
INSERT IGNORE INTO product_variants (product_id, sku, barcode, sell_price, is_active) VALUES 
(1, 'VMILK-1L', '8901234567890', 25000.00, TRUE),
(2, 'DOVE-90G', '8901234567891', 15000.00, TRUE),
(3, 'NESCAFE-200G', '8901234567892', 45000.00, TRUE),
(4, 'COCA-330ML', '8901234567893', 12000.00, TRUE),
(5, 'OISHI-50G', '8901234567894', 8000.00, TRUE);

-- 10. LOCATIONS (Location entity KHÔNG có created_at)
INSERT IGNORE INTO locations (name, type) VALUES 
('Main Warehouse', 'WAREHOUSE'),
('Store Front', 'SHOWROOM');

-- 11. PRODUCT BATCHES (ProductBatch entity KHÔNG có created_at)
INSERT IGNORE INTO product_batches (variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES 
(1, 'VM2026001', 20000.00, '2026-01-15', '2026-04-15'),
(2, 'DV2026001', 12000.00, '2026-02-01', '2027-02-01'),
(3, 'NC2026001', 35000.00, '2026-01-20', '2027-01-20'),
(4, 'CC2026001', 8000.00, '2026-02-10', '2026-08-10'),
(5, 'OI2026001', 6000.00, '2026-02-01', '2026-06-01');

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
(3, 'cashier', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG');

-- 20. ATTENDANCE (Chấm công thực tế theo phân ca)
INSERT IGNORE INTO attendance (user_id, date, time_in, time_out, status) VALUES
(1, '2026-02-24', '08:01:00', '17:03:00', 'PRESENT'),
(1, '2026-02-25', '08:12:00', '17:00:00', 'LATE'),
(2, '2026-02-24', '13:00:00', '22:05:00', 'PRESENT'),
(2, '2026-02-25', '13:25:00', '22:00:00', 'LATE'),
(3, '2026-02-24', '18:00:00', '23:02:00', 'PRESENT'),
(3, '2026-02-27', NULL, NULL, 'ABSENT');

-- 21. SALARY CONFIGS
INSERT IGNORE INTO salary_configs (
      user_id,
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
(1, 30000000.00, 180000.00, 1.50, 1500000.00, 5.00, TRUE, '2026-01-01 00:00:00', NULL, 'Admin package', NOW(), NOW()),
(2, 18000000.00, 105000.00, 1.50, 1000000.00, 3.00, TRUE, '2026-01-01 00:00:00', NULL, 'Manager package', NOW(), NOW()),
(3, 12000000.00, 70000.00, 1.50, 500000.00, 1.00, TRUE, '2026-01-01 00:00:00', NULL, 'Cashier package', NOW(), NOW());

-- 22. PAYROLL CALCULATIONS (Kết quả tính lương mẫu theo tháng)
INSERT IGNORE INTO payroll_calculations (
      user_id,
      pay_period_start,
      pay_period_end,
      payment_cycle,
      total_worked_days,
      total_worked_minutes,
      regular_minutes,
      overtime_minutes,
      night_shift_minutes,
      weekend_minutes,
      holiday_minutes,
      late_days,
      absent_days,
      leave_days,
      base_pay,
      overtime_pay,
      night_shift_bonus,
      weekend_bonus,
      holiday_bonus,
      allowances,
      commission_amount,
      bonus_amount,
      late_penalty,
      absent_penalty,
      social_insurance,
      health_insurance,
      unemployment_insurance,
      personal_income_tax,
      other_deductions,
      gross_pay,
      total_deductions,
      net_pay,
      status,
      calculated_by,
      approved_by,
      calculated_at,
      approved_at,
      paid_at,
      calculation_details,
      notes,
      created_at,
      updated_at
) VALUES
(2, '2026-02-01', '2026-02-28', 'MONTHLY', 24, 10560, 9600, 960, 120, 240, 0, 1, 0, 0, 16800000.00, 1512000.00, 150000.00, 300000.00, 0.00, 1000000.00, 0.00, 500000.00, 200000.00, 0.00, 1411200.00, 264600.00, 176400.00, 750000.00, 0.00, 20262000.00, 2802200.00, 17459800.00, 'APPROVED', 1, 1, NOW(), NOW(), NULL, '{"source":"attendance+shift"}', 'Payroll tháng 02/2026 - manager', NOW(), NOW()),
(3, '2026-02-01', '2026-02-28', 'MONTHLY', 23, 9840, 9360, 480, 240, 120, 0, 2, 1, 0, 10920000.00, 504000.00, 120000.00, 90000.00, 0.00, 500000.00, 0.00, 200000.00, 250000.00, 560000.00, 780000.00, 146250.00, 97500.00, 250000.00, 0.00, 12334000.00, 2083750.00, 10250250.00, 'CALCULATED', 2, NULL, NOW(), NULL, NULL, '{"source":"attendance+shift"}', 'Payroll tháng 02/2026 - cashier', NOW(), NOW());

-- 23. SHIFT SWAP REQUESTS
INSERT IGNORE INTO shift_swap_requests (
      request_code,
      requester_id,
      original_shift_id,
      original_shift_date,
      target_user_id,
      target_shift_id,
      target_shift_date,
      swap_type,
      reason,
      status,
      accepted_by,
      accepted_at,
      approved_by,
      approved_at,
      rejection_reason,
      expiry_time,
      notes,
      created_at,
      updated_at
) VALUES
('SWAP-REQ-001', 3, 3, '2026-02-24', 2, 2, '2026-02-24', 'DIRECT_SWAP', 'Đổi ca tối để xử lý việc cá nhân buổi tối', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-02-26 23:59:59', 'Đang chờ manager duyệt', NOW(), NOW()),
('SWAP-REQ-002', 2, 2, '2026-02-27', 1, 1, '2026-02-27', 'DIRECT_SWAP', 'Đổi ca để tham gia họp vùng', 'ACCEPTED', 1, NOW(), 1, NOW(), NULL, '2026-02-28 23:59:59', 'Đã duyệt đổi ca', NOW(), NOW());

-- 24. SHIFT HANDOVERS
INSERT IGNORE INTO shift_handovers (
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
('HANDOVER-001', 3, 3, 2, 1, '2026-02-24 23:10:00', 2500000.00, 2500000.00, 2500000.00, 0.00, '{"500k":2,"200k":5,"100k":5}', 15, 8200000.00, 120000.00, 96, '{"printer":"OK","scanner":"OK"}', '{"note":"Bổ sung nước ngọt tầng 2"}', '[4,5]', 'Không có sự cố lớn', 'Đã bàn giao đầy đủ', TRUE, '2026-02-24 23:15:00', 'CONFIRMED', NULL, NULL, NOW(), NOW());

-- =============================================================================
-- End of SmallTrend Sample Data
-- =============================================================================
