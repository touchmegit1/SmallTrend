-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE - Comprehensive Sample Data
-- =============================================================================
-- Password for all users: password123
-- Hashed: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW
-- =============================================================================

-- 1. BRANDS & CATEGORIES
insert into brands ( name ) values ( 'Vinamilk' ),( 'Nestle' ),( 'Coca-Cola' ),( 'Unilever' ),( 'P&G' ),( 'Kinh Do' ),( 'Oishi'
);

insert into categories ( name ) values ( 'Beverages' ),( 'Dairy Products' ),( 'Personal Care' ),( 'Household Items' ),( 'Snacks'

),( 'Health Care' );

-- 2. SUPPLIERS (Supplier entity có @CreationTimestamp/@UpdateTimestamp)
INSERT INTO suppliers (name, tax_code, address, email, phone, contact_person, contract_files, contract_signed_date, contract_expiry, active, notes) VALUES 
('Vinamilk Distribution', '0100170098', '10 Tan Trao, Tan Phu Ward, District 7, HCMC', 'sales@vinamilk.com.vn', '1800-1199', 'Nguyen Van A', '["https://res.cloudinary.com/demo/sample_contract1.pdf"]', '2023-01-15', '2025-01-15', TRUE, 'Main dairy supplier with 2-year contract'),
('Unilever Vietnam', '0300491828', '15 Le Duan Blvd, District 1, HCMC', 'contact@unilever.com.vn', '1800-5588', 'Tran Thi B', '["https://res.cloudinary.com/demo/sample_contract2.pdf", "https://res.cloudinary.com/demo/sample_contract2_annex.pdf"]', '2023-03-01', '2024-12-31', TRUE, 'Personal care and household items supplier'),
('Nestle Vietnam', '0302127854', 'The Vista Building, 628C Hanoi Highway, HCMC', 'info@nestle.com.vn', '1900-6011', 'Le Van C', '["https://res.cloudinary.com/demo/sample_contract3.pdf"]', '2023-06-01', '2025-06-01', TRUE, 'Beverages and snacks supplier'),
('Coca-Cola Vietnam', '0300693409', '124 Kim Ma Street, Ba Dinh, Hanoi', 'vietnam@cocacola.com', '1900-0180', 'Pham Thi D', NULL, NULL, NULL, TRUE, 'Soft drinks supplier - contract pending');

-- 3. TAX RATES
insert into tax_rates (
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
insert into roles (
   name,
   description
) values ( 'ADMIN',
           'System Administrator' ),( 'MANAGER',
                                      'Store Manager' ),( 'CASHIER',
                                                          'Cashier Staff' ),( 'INVENTORY_STAFF',
                                                                              'Inventory Staff' );

insert into permissions (
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

insert into role_permissions (
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
('cashier', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW', TRUE, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, HCMC', 'ACTIVE', 3);

-- 6. CUSTOMER TIERS (CustomerTier entity có @PrePersist tự động set created_at/updated_at, KHÔNG insert)
INSERT INTO customer_tiers (tier_code, tier_name, min_points, max_points, min_spending, points_multiplier, discount_rate, color, is_active, priority) VALUES 
('BRONZE', 'Đồng', 0, 499, 0.00, 1.0, 0.00, '#CD7F32', TRUE, 1),
('SILVER', 'Bạc', 500, 1499, 5000000.00, 1.5, 2.00, '#C0C0C0', TRUE, 2),
('GOLD', 'Vàng', 1500, 4999, 15000000.00, 2.0, 5.00, '#FFD700', TRUE, 3),
('PLATINUM', 'Bạch Kim', 5000, NULL, 50000000.00, 3.0, 10.00, '#E5E4E2', TRUE, 4);

-- 7. CUSTOMERS (Customer entity CHỈ có 3 cột: name, phone, loyalty_points)
INSERT INTO customers (name, phone, loyalty_points) VALUES 
('Nguyen Van A', '0987654321', 150),
('Tran Thi B', '0976543210', 800),
('Le Van C', '0965432109', 2000),
('Pham Thi D', '0954321098', 6500);

-- 8. PRODUCTS (Product entity KHÔNG có created_at)
INSERT INTO products (name, description, brand_id, category_id, tax_rate_id) VALUES 
('Fresh Milk 1L', 'Vinamilk Fresh Milk', 1, 2, 2),
('Dove Soap 90g', 'Dove Beauty Bar', 4, 3, 1),
('Nescafe 3in1', 'Instant Coffee 20g x 10', 2, 1, 1),
('Coca Cola 330ml', 'Coca Cola Classic', 3, 1, 1),
('Oishi Snack', 'Potato Chips 50g', 7, 5, 1);

-- 9. PRODUCT VARIANTS (ProductVariant entity KHÔNG có created_at, có is_active BOOLEAN)
INSERT INTO product_variants (product_id, sku, barcode, sell_price, is_active) VALUES 
(1, 'VMILK-1L', '8901234567890', 25000.00, TRUE),
(2, 'DOVE-90G', '8901234567891', 15000.00, TRUE),
(3, 'NESCAFE-200G', '8901234567892', 45000.00, TRUE),
(4, 'COCA-330ML', '8901234567893', 12000.00, TRUE),
(5, 'OISHI-50G', '8901234567894', 8000.00, TRUE);

-- 10. LOCATIONS (Location entity KHÔNG có created_at)
INSERT INTO locations (name, type) VALUES 
('Main Warehouse', 'WAREHOUSE'),
('Store Front', 'SHOWROOM');

-- 11. PRODUCT BATCHES (ProductBatch entity KHÔNG có created_at)
INSERT INTO product_batches (variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES 
(1, 'VM2026001', 20000.00, '2026-01-15', '2026-04-15'),
(2, 'DV2026001', 12000.00, '2026-02-01', '2027-02-01'),
(3, 'NC2026001', 35000.00, '2026-01-20', '2027-01-20'),
(4, 'CC2026001', 8000.00, '2026-02-10', '2026-08-10'),
(5, 'OI2026001', 6000.00, '2026-02-01', '2026-06-01');

-- 12. WORK SHIFTS (Ca làm việc mẫu)
-- JPA tự động tính planned_minutes, break_minutes, working_minutes trong @PrePersist
INSERT INTO work_shifts (
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
INSERT INTO work_shift_assignments (work_shift_id, user_id, shift_date, status, notes) VALUES
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
INSERT INTO campaigns (campaign_code, campaign_name, campaign_type, description, start_date, end_date, status, budget, target_revenue, is_public, created_by, created_at, updated_at) VALUES 
('CAMP-202602-001', 'Tết Sale 2026', 'SEASONAL', 'Khuyến mãi Tết Nguyên Đán', '2026-02-10', '2026-02-20', 'ACTIVE', 50000000.00, 200000000.00, TRUE, 2, NOW(), NOW()),
('CAMP-202602-002', 'Flash Sale Cuối Tuần', 'FLASH_SALE', 'Giảm giá sốc cuối tuần', '2026-02-14', '2026-02-15', 'ACTIVE', 10000000.00, 30000000.00, TRUE, 2, NOW(), NOW());

-- 15. COUPONS (Coupon entity có created_at/updated_at thủ công)
INSERT INTO coupons (coupon_code, coupon_name, description, coupon_type, campaign_id, discount_percent, discount_amount, max_discount_amount, min_purchase_amount, start_date, end_date, total_usage_limit, usage_per_customer, status, created_by, created_at, updated_at) VALUES 
('WELCOME10', 'Giảm 10% Đơn Đầu', 'Mã giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 1, 10.00, NULL, 50000.00, 100000.00, '2026-02-01', '2026-03-31', 1000, 1, 'ACTIVE', 2, NOW(), NOW()),
('FREESHIP50K', 'Miễn Phí Ship', 'Miễn phí vận chuyển đơn từ 200k', 'FREE_SHIPPING', 1, NULL, 25000.00, NULL, 200000.00, '2026-02-10', '2026-02-28', NULL, 5, 'ACTIVE', 2, NOW(), NOW()),
('FLASH50K', 'Giảm 50K Flash Sale', 'Giảm ngay 50k cho đơn từ 300k', 'FIXED_AMOUNT', 2, NULL, 50000.00, NULL, 300000.00, '2026-02-14', '2026-02-15', 500, 2, 'ACTIVE', 2, NOW(), NOW());

-- 16. PRODUCT COMBOS (ProductCombo entity có @PrePersist tự động set created_at/updated_at, KHÔNG insert)
INSERT INTO product_combos (combo_code, combo_name, description, original_price, combo_price, saved_amount, discount_percent, valid_from, valid_to, is_active, status, created_by) VALUES 
('COMBO-BREAKFAST', 'Combo Sáng Năng Động', 'Sữa + Bánh mì + Nước ngọt', 60000.00, 50000.00, 10000.00, 16.67, '2026-02-01', '2026-03-31', TRUE, 'ACTIVE', 2),
('COMBO-SNACK', 'Combo Snack Vui Vẻ', 'Snack + Nước ngọt', 20000.00, 18000.00, 2000.00, 10.00, '2026-02-14', '2026-02-28', TRUE, 'ACTIVE', 2);

insert into product_combo_items (
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
INSERT INTO cash_registers (register_code, register_name, store_name, location, register_type, status, device_id, current_cash, opening_balance, current_operator_id, session_start_time, total_transactions_today, created_at, updated_at) VALUES 
('POS-001', 'Quầy 1', 'SmallTrend Store', 'Front Counter', 'MAIN', 'ACTIVE', 'DEV-POS-001', 5000000.00, 2000000.00, 3, NOW(), 0, NOW(), NOW()),
('POS-002', 'Quầy 2', 'SmallTrend Store', 'Express Counter', 'EXPRESS', 'ACTIVE', 'DEV-POS-002', 3000000.00, 1000000.00, NULL, NULL, 0, NOW(), NOW());
-- 18. TICKETS (Swap Shift, Handover, Refund)
-- Ticket entity có @CreationTimestamp/@UpdateTimestamp nên JPA tự động set
INSERT INTO tickets (
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

-- =============================================================================
-- End of SmallTrend Sample Data
-- =============================================================================
