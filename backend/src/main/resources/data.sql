-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE - Comprehensive Combined Sample Data
-- =============================================================================
-- Password for all users: password
-- Hashed: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- =============================================================================

-- JPA/Hibernate là nguồn chân lý schema.
-- File này chỉ dùng để seed dữ liệu mẫu (idempotent).

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sale_order_histories;
TRUNCATE TABLE sale_order_items;
TRUNCATE TABLE sale_orders;
TRUNCATE TABLE loyalty_transactions;
TRUNCATE TABLE coupon_usage;
TRUNCATE TABLE cash_transactions;
TRUNCATE TABLE shift_handovers;
TRUNCATE TABLE shift_swap_requests;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE payroll_calculations;
TRUNCATE TABLE salary_configs;
TRUNCATE TABLE attendance;
TRUNCATE TABLE user_credentials;
TRUNCATE TABLE tickets;
TRUNCATE TABLE reports;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE cash_registers;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE product_combo_items;
TRUNCATE TABLE product_combos;
TRUNCATE TABLE coupons;
TRUNCATE TABLE campaigns;
TRUNCATE TABLE work_shift_assignments;
TRUNCATE TABLE work_shifts;
TRUNCATE TABLE inventory_count_items;
TRUNCATE TABLE inventory_counts;
TRUNCATE TABLE disposal_voucher_items;
TRUNCATE TABLE disposal_vouchers;
TRUNCATE TABLE inventory_count_items;
TRUNCATE TABLE inventory_counts;
TRUNCATE TABLE disposal_voucher_items;
TRUNCATE TABLE disposal_vouchers;
TRUNCATE TABLE inventory_stock;
TRUNCATE TABLE product_batches;
TRUNCATE TABLE locations;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE gift_redemption_history;
TRUNCATE TABLE loyalty_gifts;
TRUNCATE TABLE purchase_history;
TRUNCATE TABLE gift_redemption_history;
TRUNCATE TABLE loyalty_gifts;
TRUNCATE TABLE purchase_history;
TRUNCATE TABLE unit_conversions;
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
TRUNCATE TABLE advertisements;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. SUPPLIERS
INSERT INTO suppliers
(name, tax_code, address, email, phone, contact_person, contract_files, contract_signed_date, contract_expiry, active, notes)
VALUES
('Vinamilk Distribution', '0100170098', '10 Tan Trao, District 7, Ho Chi Minh City, Vietnam', 'sales@vinamilk.com.vn', '1800-1199', 'Nguyen Van A', NULL, '2023-01-15', '2025-01-15', TRUE, 'Main dairy supplier'),

('Unilever Vietnam', '0300491828', '15 Le Duan Blvd, District 1, Ho Chi Minh City, Vietnam', 'contact@unilever.com.vn', '1800-5588', 'Tran Thi B', NULL, '2023-03-01', '2025-03-01', TRUE, 'Personal care and household products'),

('Nestle Vietnam', '0302127854', 'The Vista Building, Hanoi Highway, Ho Chi Minh City, Vietnam', 'info@nestle.com.vn', '1900-6011', 'Le Van C', NULL, '2023-06-01', '2025-06-01', TRUE, 'Food and beverage supplier'),

('Coca-Cola Vietnam', '0300693409', '124 Kim Ma Street, Ba Dinh, Hanoi, Vietnam', 'vietnam@cocacola.com', '1900-0180', 'Pham Thi D', NULL, '2023-07-01', '2025-07-01', TRUE, 'Soft drinks supplier'),

('Masan Consumer', '0302017440', '39 Le Duan, District 1, Ho Chi Minh City, Vietnam', 'contact@masan.com.vn', '1800-9090', 'Le Van M', NULL, '2023-08-01', '2025-08-01', TRUE, 'Consumer goods supplier'),

('Heineken Vietnam', '0300847056', '1 Bach Dang, Tan Binh District, Ho Chi Minh City, Vietnam', 'sales@heineken.com.vn', '1900-1111', 'Tran Van H', NULL, '2023-10-01', '2025-10-01', TRUE, 'Beer and beverages supplier'),

('KIDO Group (Tuong An)', '0302266881', '138 Hai Ba Trung, District 1, Ho Chi Minh City, Vietnam', 'info@kido.vn', '1800-6688', 'Bui Van K', NULL, '2023-05-01', '2025-05-01', TRUE, 'Edible oils and foods'),

('PepsiCo Vietnam', '0300811445', '182 Le Dai Hanh, District 11, Ho Chi Minh City, Vietnam', 'contact@pepsico.com.vn', '1900-1220', 'Nguyen Van P', NULL, '2023-04-01', '2025-04-01', TRUE, 'Soft drinks and snacks'),

('TH Milk Distribution', '2900326335', 'Thai Hoa Town, Nghe An Province, Vietnam', 'sales@thmilk.vn', '1800-545440', 'Tran Thi T', NULL, '2023-02-01', '2025-02-01', TRUE, 'Dairy supplier'),

('Acecook Vietnam', '0300808680', 'Tan Binh Industrial Park, Ho Chi Minh City, Vietnam', 'info@acecookvietnam.vn', '1900-0120', 'Le Van AC', NULL, '2023-05-01', '2025-05-01', TRUE, 'Instant noodle supplier'),

('Vifon Vietnam', '0300391837', 'Tan Binh District, Ho Chi Minh City, Vietnam', 'info@vifon.com.vn', '028-3815-4364', 'Pham Van V', NULL, '2023-05-10', '2025-05-10', TRUE, 'Instant noodles and pho'),

('Orion Food Vina', '3700381324', 'My Phuoc Industrial Park, Binh Duong, Vietnam', 'contact@orion.vn', '0274-355-0166', 'Kim Orion', NULL, '2023-04-01', '2025-04-01', TRUE, 'Snack supplier'),

('Oishi Vietnam', '0302752277', 'VSIP Industrial Park, Binh Duong, Vietnam', 'sales@oishi.vn', '0274-378-4088', 'Nguyen Van O', NULL, '2023-04-15', '2025-04-15', TRUE, 'Snack foods'),

('Cholimex Food', '0304475742', 'Vinh Loc Industrial Park, Binh Chanh, Ho Chi Minh City, Vietnam', 'info@cholimexfood.com.vn', '028-3765-2101', 'Tran Thi C', NULL, '2023-03-15', '2025-03-15', TRUE, 'Sauces and condiments'),

('CP Vietnam Corporation', '3600235308', 'Bien Hoa Industrial Zone, Dong Nai, Vietnam', 'info@cp.com.vn', '0251-3836-501', 'Somchai CP', NULL, '2023-06-01', '2025-06-01', TRUE, 'Meat and food products'),

('Perfetti Van Melle Vietnam', '0300588569', 'VSIP Industrial Park, Binh Duong, Vietnam', 'info@perfettivanmelle.com', '0274-376-8586', 'Marco Perfetti', NULL, '2023-06-10', '2025-06-10', TRUE, 'Candy supplier (Chupa Chups)')
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

-- 2. BRANDS & CATEGORIES
INSERT IGNORE INTO brands (name, country, supplier_id) VALUES
('Vinamilk', 'Việt Nam', 1),
('Nestle', 'Thuỵ Sĩ', 3),
('Coca-Cola', 'Hoa Kỳ', 4),
('P&G', 'Hoa Kỳ', 2),
('Kinh Do', 'Việt Nam', 7),
('Oishi', 'Philippines', 13),

('Cholimex', 'Việt Nam', 14),
('CP', 'Thái Lan', 15),
('Vissan', 'Việt Nam', 15),
('Orion', 'Hàn Quốc', 12),
('Chupa Chups', 'Tây Ban Nha', 16),
('Vifon', 'Việt Nam', 11),
('Acecook', 'Nhật Bản', 10),

('Masan', 'Việt Nam', 5),
('TH True Milk', 'Việt Nam', 9),
('Pepsico', 'Hoa Kỳ', 8),
('Maggi', 'Thụy Sĩ', 3),

('Dove', 'Vương Quốc Anh', 2),
('Knorr', 'Đức', 2),
('Lifebuoy', 'Vương Quốc Anh', 2),
('OMO', 'Vương Quốc Anh', 2),
('Sunsilk', 'Vương Quốc Anh', 2),

('Heineken', 'Hà Lan', 6),
('Tiger', 'Singapore', 6),
('Tường An', 'Việt Nam', 7);

INSERT IGNORE INTO categories (name) VALUES
('Đồ uống'), ('Sữa & Sản phẩm từ sữa'), ('Chăm sóc cá nhân'), ('Đồ dùng gia đình'), ('Bánh kẹo ăn vặt'), ('Chăm sóc sức khỏe'),
('Đồ hộp'), ('Bánh ngọt'), ('Thịt & Hải sản'), ('Gia vị & Nước chấm'), ('Mì ăn liền');

-- 2.1 SUPPLIER CONTRACTS
INSERT IGNORE INTO supplier_contracts (
    supplier_id, contract_number, title, description, status,
    start_date, end_date, total_value, currency, payment_terms,
    delivery_terms, signed_by_supplier, signed_by_company, signed_date,
    notes, created_at, updated_at
) VALUES
(1, 'SC-VM-2026-001', 'Hợp đồng phân phối sữa Vinamilk 2026', 'Hợp đồng cung ứng sữa và chế phẩm sữa cho toàn hệ thống cửa hàng', 'ACTIVE', '2026-01-01', '2026-12-31', 1200000000.00, 'VND', 'Thanh toán 30 ngày kể từ ngày nhận hóa đơn', 'Giao hàng theo lịch tuần', 'Nguyen Van A', 'Tran Thi Manager', '2025-12-20', 'Ưu tiên giao hàng dịp cao điểm lễ tết', NOW(), NOW()),
(2, 'SC-UL-2026-001', 'Hợp đồng đồ gia dụng Unilever 2026', 'Hợp đồng cung ứng nhóm sản phẩm chăm sóc cá nhân và gia dụng', 'ACTIVE', '2026-01-15', '2026-12-31', 800000000.00, 'VND', 'Thanh toán theo từng lô, tối đa 21 ngày', 'Giao hàng trong 48h sau PO', 'Tran Thi B', 'Tran Thi Manager', '2026-01-10', 'Cam kết đổi trả lô lỗi trong 7 ngày', NOW(), NOW());

-- 3. TAX RATES
INSERT IGNORE INTO tax_rates (name, rate, is_active) VALUES
('VAT Standard', 10.00, 1),
('VAT Reduced', 5.00, 1),
('No Tax', 0.00, 1);

-- 4. ROLES & PERMISSIONS
INSERT IGNORE INTO roles (name, description) VALUES
('ADMIN', 'System Administrator'),
('MANAGER', 'Store Manager'),
('CASHIER', 'Cashier Staff'),
('INVENTORY_STAFF', 'Inventory Staff'),
('SALES_STAFF', 'Sales Staff');

INSERT IGNORE INTO permissions (name, description) VALUES
('USER_MANAGEMENT', 'User Management'),
('PRODUCT_MANAGEMENT', 'Product Management'),
('INVENTORY_MANAGEMENT', 'Inventory Management'),
('SALES_PROCESSING', 'Sales Processing'),
('REPORT_VIEWING', 'Report Viewing'),
('ADMIN_ACCESS', 'Admin Access');

INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),
(2,1),(2,2),(2,3),(2,4),(2,5),
(3,4),(4,2),(4,3),(5,2),(5,4);

-- 5. USERS (Employee list with diverse roles and work patterns)
INSERT INTO users (
    username, password, active, full_name, email, phone, address, status, role_id,
    avatar_url,
    salary_type, base_salary, hourly_rate, min_required_shifts, count_late_as_present, working_hours_per_month,
    created_at, updated_at
) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, HCMC', 'ACTIVE', 1, 'https://i.pravatar.cc/150?img=12', 'MONTHLY', 30000000.00, NULL, NULL, TRUE, 208.00, NOW(), NOW()),
('manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, HCMC', 'ACTIVE', 2, 'https://i.pravatar.cc/150?img=32', 'MONTHLY', 18000000.00, NULL, NULL, TRUE, 208.00, NOW(), NOW()),
('cashier1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Le Van Cashier', 'cashier1@smalltrend.com', '0923456789', '789 Dien Bien Phu, HCMC', 'ACTIVE', 3, 'https://i.pravatar.cc/150?img=15', 'HOURLY', 13500000.00, 75000.00, NULL, TRUE, 208.00, NOW(), NOW()),
('cashier2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Vo Thi Cashier 2', 'cashier2@smalltrend.com', '0968765432', '321 Ba Trieu, HCMC', 'ACTIVE', 3, 'https://i.pravatar.cc/150?img=47', 'HOURLY', 13200000.00, 72000.00, NULL, TRUE, 208.00, NOW(), NOW()),
('inventory1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Pham Van Inventory', 'inventory@smalltrend.com', '0934567890', '12 Nguyen Trai, HCMC', 'ACTIVE', 4, 'https://i.pravatar.cc/150?img=25', 'MONTHLY', 13000000.00, NULL, NULL, TRUE, 208.00, NOW(), NOW()),
('sales1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Hoang Thi Sales', 'sales@smalltrend.com', '0945678901', '90 Pasteur, HCMC', 'ACTIVE', 5, 'https://i.pravatar.cc/150?img=41', 'HOURLY', 12600000.00, 70000.00, NULL, TRUE, 208.00, NOW(), NOW()),
('sales2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Nguyen Van Sales 2', 'sales2@smalltrend.com', '0987654012', '45 Hai Ba Trung, HCMC', 'ACTIVE', 5, 'https://i.pravatar.cc/150?img=6', 'MONTHLY_MIN_SHIFTS', 12500000.00, NULL, 20, TRUE, 208.00, NOW(), NOW())
ON DUPLICATE KEY UPDATE
password = VALUES(password),
active = VALUES(active),
full_name = VALUES(full_name),
email = VALUES(email),
phone = VALUES(phone),
address = VALUES(address),
status = VALUES(status),
role_id = VALUES(role_id),
avatar_url = VALUES(avatar_url),
salary_type = VALUES(salary_type),
base_salary = VALUES(base_salary),
hourly_rate = VALUES(hourly_rate),
min_required_shifts = VALUES(min_required_shifts),
count_late_as_present = VALUES(count_late_as_present),
working_hours_per_month = VALUES(working_hours_per_month),
updated_at = NOW();

-- 6. CUSTOMER TIERS
INSERT IGNORE INTO customer_tiers (tier_code, tier_name, min_points, max_points, min_spending, points_multiplier, discount_rate, color, is_active, priority) VALUES
('BRONZE', 'Đồng', 0, 499, 0.00, 1.0, 0.00, '#CD7F32', TRUE, 1),
('SILVER', 'Bạc', 500, 1499, 5000000.00, 1.5, 2.00, '#C0C0C0', TRUE, 2),
('GOLD', 'Vàng', 1500, 4999, 15000000.00, 2.0, 5.00, '#FFD700', TRUE, 3),
('PLATINUM', 'Bạch Kim', 5000, NULL, 50000000.00, 3.0, 10.00, '#E5E4E2', TRUE, 4);

-- 7. CUSTOMERS
INSERT IGNORE INTO customers (name, phone, loyalty_points) VALUES
('Nguyen Van A', '0987654321', 150),
('Tran Thi B', '0976543210', 800),
('Le Van C', '0965432109', 2000),
('Pham Thi D', '0954321098', 6500);

-- 8. PRODUCTS
INSERT IGNORE INTO products (name, description, brand_id, category_id, tax_rate_id, is_active, created_at, updated_at) VALUES
('Sữa dinh dưỡng Vinamilk', 'Vinamilk Fresh Milk', 1, 2, 2, TRUE, NOW(6), NOW(6)),
('Xà Phòng Dove', 'Dove Beauty Bar', 4, 3, 1, TRUE, NOW(6), NOW(6)),
('Cà phê Nescafe 3in1', 'Instant Coffee 20g x 10', 2, 1, 1, TRUE, NOW(6), NOW(6)),
('Nước ngọt Coca Cola', 'Coca Cola Classic', 3, 1, 1, TRUE, NOW(6), NOW(6)),
('Bánh snack Oishi', 'Potato Chips ', 7, 5, 1, TRUE, NOW(6), NOW(6)),
('Tương ớt Cholimex', 'Tương ớt chua cay ', 8, 10, 1, TRUE, NOW(6), NOW(6)),
('Xúc xích CP', 'Xúc xích Vườn Hồng ', 9, 9, 1, TRUE, NOW(6), NOW(6)),
('Đồ hộp Vissan', 'Thịt heo hầm ', 10, 7, 1, TRUE, NOW(6), NOW(6)),
('Bánh Chocopie', 'Bánh chocopie Orion hộp 12 cái', 11, 8, 1, TRUE, NOW(6), NOW(6)),
('Kẹo mút Chupa Chups', 'Kẹo mút hương trái cây', 12, 5, 1, TRUE, NOW(6), NOW(6)),
('Phở sắn Vifon', 'Phở hương vị bò ', 13, 11, 1, TRUE, NOW(6), NOW(6)),
('Mì Hảo Hảo', 'Mì tôm chua cay ', 14, 11, 1, TRUE, NOW(6), NOW(6)),
('Mì Omachi', 'Mì khoai tây sườn hầm ', 15, 11, 1, TRUE, NOW(6), NOW(6)),
('Nước tương Chin-su', 'Nước tương tỏi ớt ', 15, 10, 1, TRUE, NOW(6), NOW(6)),
('Sữa chua TH True Milk', 'Sữa chua nha đam ', 16, 2, 2, TRUE, NOW(6), NOW(6)),
('Sữa tươi TH True Milk', 'Sữa tươi ít đường ', 16, 2, 2, TRUE, NOW(6), NOW(6)),
('Snack Lays', 'Snack khoai tây tự nhiên ', 17, 5, 1, TRUE, NOW(6), NOW(6)),
('Trà Ô Long TEA+ Plus', 'Trà Ô Long giảm béo ', 17, 1, 1, TRUE, NOW(6), NOW(6)),
('Hạt nêm Knorr', 'Hạt nêm thịt thăn xương ống ', 18, 10, 1, TRUE, NOW(6), NOW(6)),
('Dầu hào Maggi', 'Dầu hào tự nhiên nấm hương ', 19, 10, 1, TRUE, NOW(6), NOW(6)),
('Bia Heineken Silver', 'Bia Heineken Silver lon ', 23, 1, 1, TRUE, NOW(6), NOW(6)),
('Bia Tiger Bạc', 'Bia Tiger Crystal lon ', 24, 1, 1, TRUE, NOW(6), NOW(6)),
('Nước mắm Nam Ngư', 'Nước mắm Nam Ngư chai ', 14, 10, 1, TRUE, NOW(6), NOW(6)),
('Sữa đặc Ông Thọ', 'Sữa đặc có đường Ông Thọ đỏ lon ', 1, 2, 2, TRUE, NOW(6), NOW(6)),
('Dầu ăn Tường An', 'Dầu ăn thực vật Tường An chai', 25, 10, 1, TRUE, NOW(6), NOW(6)),
('Bột giặt OMO', 'Bột giặt OMO hệ bọt thông minh ', 21, 4, 1, TRUE, NOW(6), NOW(6));

-- 8.1 UNITS
INSERT IGNORE INTO units (code, name, material_type, symbol) VALUES
('HOP', 'Hộp', 'SOLID', 'hộp'),
('LOC', 'Lốc', 'SOLID', 'lốc'),
('THUNG', 'Thùng', 'SOLID', 'thùng'),
('GOI', 'Gói', 'SOLID', 'gói'),
('CAI', 'Cái', 'SOLID', 'cái'),
('LON', 'Lon', 'SOLID', 'lon'),
('CHAI', 'Chai', 'SOLID', 'chai'),
('BICH', 'Bịch', 'SOLID', 'bich');


-- 8.2 UNIT CONVERSIONS (Conversion between units for variants)
-- Example: 1 carton (THUNG) = 12 boxes (HOP), 1 pack (LOC) = 4 boxes
INSERT IGNORE INTO unit_conversions (variant_id, to_unit_id, conversion_factor, sell_price, description, is_active) VALUES
-- Fresh Milk 1L (variant 1, base unit: HOP=1): 1 LOC = 4 HOP, 1 THUNG = 12 HOP
(1, (SELECT id FROM units WHERE code = 'LOC'), 4.0000, 100000.00, '1 lốc = 4 hộp sữa tươi 1L', TRUE),
(1, (SELECT id FROM units WHERE code = 'THUNG'), 12.0000, 300000.00, '1 thùng = 12 hộp sữa tươi 1L', TRUE),

-- Dove Soap (variant 2, base unit: GOI=3): 1 THUNG = 48 GOI
(2, (SELECT id FROM units WHERE code = 'THUNG'), 48.0000, 720000.00, '1 thùng = 48 gói xà phòng Dove 90g', TRUE),

-- Nescafe 3in1 (variant 3, base unit: GOI=3): 1 THUNG = 30 GOI
(3, (SELECT id FROM units WHERE code = 'THUNG'), 30.0000, 1350000.00, '1 thùng = 30 gói Nescafe 3in1', TRUE),

-- Coca Cola 330ml (variant 4, base unit: LOC=2): 1 THUNG = 24 LOC
(4, (SELECT id FROM units WHERE code = 'THUNG'), 24.0000, 288000.00, '1 thùng = 24 lon Coca Cola 330ml', TRUE),

-- Oishi Snack (variant 5, base unit: GOI=3): 1 THUNG = 30 GOI
(5, (SELECT id FROM units WHERE code = 'THUNG'), 30.0000, 240000.00, '1 thùng = 30 gói Oishi Snack 50g', TRUE),

-- Mì Hảo Hảo (variant 12, base unit: GOI=4): 1 THUNG = 30 GOI
(12, (SELECT id FROM units WHERE code = 'THUNG'), 30.0000, 135000.00, '1 thùng = 30 gói mì Hảo Hảo 75g', TRUE),

-- Mì Omachi (variant 13, base unit: GOI=4): 1 THUNG = 30 GOI
(13, (SELECT id FROM units WHERE code = 'THUNG'), 30.0000, 300000.00, '1 thùng = 30 gói mì Omachi 80g', TRUE),

(21, (SELECT id FROM units WHERE code = 'THUNG'), 24.0000, 470000.00, '1 thùng = 24 lon Bia Heineken', TRUE),
(22, (SELECT id FROM units WHERE code = 'THUNG'), 24.0000, 420000.00, '1 thùng = 24 lon Bia Tiger', TRUE),
(23, (SELECT id FROM units WHERE code = 'THUNG'), 15.0000, 510000.00, '1 thùng = 15 chai Nước mắm Nam Ngư', TRUE),
(24, (SELECT id FROM units WHERE code = 'THUNG'), 48.0000, 1180000.00, '1 thùng = 48 lon Sữa đặc Ông Thọ', TRUE),
(25, (SELECT id FROM units WHERE code = 'THUNG'), 12.0000, 590000.00, '1 thùng = 12 chai Dầu ăn Tường An', TRUE),
(26, (SELECT id FROM units WHERE code = 'THUNG'), 20.0000, 780000.00, '1 thùng = 20 gói Bột giặt OMO', TRUE);

-- 9. PRODUCT VARIANTS
INSERT IGNORE INTO product_variants (product_id, sku, barcode, unit_id, sell_price, is_active, is_base_unit, created_at, updated_at) VALUES
(1, 'VMILK-220ml-BICH', '8901234567890', 1, 9333.00, TRUE, TRUE, NOW(6), NOW(6)),
(2, 'DOVE-90G', '8901234567891', 3, 15000.00, TRUE, TRUE, NOW(6), NOW(6)),
(3, 'NESCAFE-200G', '8901234567892', 3, 45000.00, TRUE, TRUE, NOW(6), NOW(6)),
(4, 'COCA-330ML', '8901234567893', 2, 12000.00, TRUE, TRUE, NOW(6), NOW(6)),
(5, 'OISHI-50G', '8901234567894', 3, 8000.00, TRUE, TRUE, NOW(6), NOW(6)),
(6, 'CHOLI-250G', '8901234567895', 5, 13000.00, TRUE, TRUE, NOW(6), NOW(6)),
(7, 'CP-XX-500G', '8901234567896', 4, 55000.00, TRUE, TRUE, NOW(6), NOW(6)),
(8, 'VISSAN-HH-150G', '8901234567897', 1, 22000.00, TRUE, TRUE, NOW(6), NOW(6)),
(9, 'ORION-CHOCO-12', '8901234567898', 1, 40000.00, TRUE, TRUE, NOW(6), NOW(6)),
(10, 'CHUPA-FRUIT', '8901234567899', 5, 2000.00, TRUE, TRUE, NOW(6), NOW(6)),
(11, 'VIFON-PHO-80G', '8901234567900', 4, 8000.00, TRUE, TRUE, NOW(6), NOW(6)),
(12, 'HAOHAO-CC-75G', '8901234567901', 4, 4500.00, TRUE, TRUE, NOW(6), NOW(6)),
(13, 'OMACHI-S-80G', '8901234567902', 4, 10000.00, TRUE, TRUE, NOW(6), NOW(6)),
(14, 'CHINSU-T-250ML', '8901234567903', 1, 15000.00, TRUE, TRUE, NOW(6), NOW(6)),
(15, 'TH-N-100G', '8901234567904', 1, 6000.00, TRUE, TRUE, NOW(6), NOW(6)),
(16, 'TH-I-1L', '8901234567905', 1, 35000.00, TRUE, TRUE, NOW(6), NOW(6)),
(17, 'LAYS-K-50G', '8901234567906', 4, 12000.00, TRUE, TRUE, NOW(6), NOW(6)),
(18, 'TEA-PLUS-455ML', '8901234567907', 1, 10000.00, TRUE, TRUE, NOW(6), NOW(6)),
(19, 'KNORR-T-400G', '8901234567908', 4, 30000.00, TRUE, TRUE, NOW(6), NOW(6)),
(20, 'MAGGI-H-350G', '8901234567909', 1, 25000.00, TRUE, TRUE, NOW(6), NOW(6)),
(21, 'HEI-SIL-330ML', '8901234567910', 6, 20000.00, TRUE, TRUE, NOW(6), NOW(6)),
(22, 'TIG-CRY-330ML', '8901234567911', 6, 18000.00, TRUE, TRUE, NOW(6), NOW(6)),
(23, 'NN-500ML', '8901234567912', 7, 35000.00, TRUE, TRUE, NOW(6), NOW(6)),
(24, 'ONGTHO-D-380G', '8901234567913', 6, 25000.00, TRUE, TRUE, NOW(6), NOW(6)),
(25, 'TA-1L', '8901234567914', 7, 50000.00, TRUE, TRUE, NOW(6), NOW(6)),
(26, 'OMO-800G', '8901234567915', 4, 40000.00, TRUE, TRUE, NOW(6), NOW(6));

-- 10. LOCATIONS
INSERT IGNORE INTO locations (id, name, type, zone, grid_row, grid_col, grid_level, location_code, address, capacity, status, created_at) VALUES
(1, 'Main Warehouse A1', 'STORAGE', 'A', 1, 1, 1, 'WH-A1', 'Kho chính, Dãy A, Hàng 1', 500, 'ACTIVE', NOW()),
(2, 'Main Warehouse A2', 'STORAGE', 'A', 1, 2, 1, 'WH-A2', 'Kho chính, Dãy A, Hàng 2', 500, 'ACTIVE', NOW()),
(3, 'Cold Storage B1', 'COLD_STORAGE', 'B', 1, 1, 1, 'CS-B1', 'Kho lạnh, Dãy B, Tầng 1', 200, 'ACTIVE', NOW()),
(4, 'Store Front C1', 'DISPLAY', 'C', 1, 1, 1, 'DF-C1', 'Khu trưng bày, Dãy C, Vị trí 1', 100, 'ACTIVE', NOW()),
(5, 'POS Display Zone C2', 'DISPLAY', 'C', 1, 2, 1, 'DF-C2', 'Khu trưng bày, Dãy C, Vị trí 2', 150, 'ACTIVE', NOW());


-- 11. PRODUCT BATCHES
INSERT IGNORE INTO product_batches (variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(1, 'VM2026001', 20000.00, '2026-01-15', '2026-04-15'),
(2, 'DV2026001', 12000.00, '2026-02-01', '2027-02-01'),
(3, 'NC2026001', 35000.00, '2026-01-20', '2027-01-20'),
(4, 'CC2026001', 8000.00, '2026-02-10', '2026-08-10'),
(5, 'OI2026001', 6000.00, '2026-02-01', '2026-06-01'),
(6, 'CH2026001', 10000.00, '2026-01-15', '2026-10-15'),
(7, 'CP2026001', 45000.00, '2026-02-01', '2026-04-01'),
(8, 'VS2026001', 18000.00, '2026-01-20', '2027-01-20'),
(9, 'OR2026001', 32000.00, '2026-02-10', '2026-12-10'),
(10, 'CU2026001', 1000.00, '2026-02-01', '2027-06-01'),
(11, 'VF2026001', 6000.00, '2026-01-15', '2026-07-15'),
(12, 'HH2026001', 3000.00, '2026-02-01', '2026-08-01'),
(13, 'OM2026001', 7000.00, '2026-01-20', '2026-07-20'),
(14, 'CS2026001', 11000.00, '2026-02-10', '2027-02-10'),
(15, 'THY2026001', 4000.00, '2026-03-01', '2026-04-01'),
(16, 'THM2026001', 25000.00, '2026-03-01', '2026-09-01'),
(17, 'LA2026001', 8000.00, '2026-02-10', '2026-11-10'),
(18, 'TP2026001', 7000.00, '2026-02-15', '2026-10-15'),
(19, 'KN2026001', 24000.00, '2026-01-20', '2027-01-20'),
(20, 'MG2026001', 20000.00, '2026-02-10', '2027-02-10'),
(21, 'HEI2026001', 16000.00, '2026-02-15', '2027-02-15'),
(22, 'TIG2026001', 14000.00, '2026-02-15', '2027-02-15'),
(23, 'NN2026001', 28000.00, '2026-02-15', '2027-02-15'),
(24, 'OT2026001', 20000.00, '2026-02-15', '2027-02-15'),
(25, 'TA2026001', 40000.00, '2026-02-15', '2027-02-15'),
(26, 'OMO2026001', 32000.00, '2026-02-15', '2027-02-15');

-- 11.1 INVENTORY STOCK
INSERT IGNORE INTO inventory_stock (variant_id, location_id, batch_id, quantity) VALUES
(1, 1, 1, 420),
(2, 2, 2, 180),
(3, 3, 3, 260),
(4, 4, 4, 510),
(5, 5, 5, 390),
(6, 1, 6, 120),
(7, 2, 7, 85),
(8, 3, 8, 150),
(9, 4, 9, 200),
(10, 5, 10, 1000),
(11, 1, 11, 300),
(12, 2, 12, 500),
(13, 3, 13, 400),
(14, 4, 14, 250),
(15, 5, 15, 180),
(16, 1, 16, 210),
(17, 2, 17, 320),
(18, 3, 18, 280),
(19, 4, 19, 140),
(20, 5, 20, 190),
(21, 1, 21, 300),
(22, 2, 22, 250),
(23, 3, 23, 100),
(24, 4, 24, 150),
(25, 5, 25, 200),
(26, 1, 26, 80);

-- Điều chỉnh số lượng tồn kho để phản ánh trạng thái sau khi đã xác nhận phiếu kiểm kho
-- và các giao dịch bán hàng đã ghi nhận trong stock_movements
-- variant 1 (Fresh Milk 1L, loc 1): 250 khởi đầu - 5 (IC-2026-0001) - 4 (bán) - 150 (transfer out) → ~91, giữ 245 như mức đã được audit
UPDATE inventory_stock SET quantity = 245 WHERE variant_id = 1 AND location_id = 1 AND batch_id = 1;
-- variant 2 (Dove Soap, loc 2): OK theo kiểm kho, giảm 2 do bán
UPDATE inventory_stock SET quantity = 178 WHERE variant_id = 2 AND location_id = 2 AND batch_id = 2;
-- variant 3 (Nescafe, loc 3): 260 + 1 (IC-2026-0002) - 1 (bán) = 260
UPDATE inventory_stock SET quantity = 260 WHERE variant_id = 3 AND location_id = 3 AND batch_id = 3;
-- variant 4 (Coca Cola, loc 4): 510 - 4 (sale 1) - 4 (lẻ) = ~502, để ở mức trước kiểm
UPDATE inventory_stock SET quantity = 502 WHERE variant_id = 4 AND location_id = 4 AND batch_id = 4;
-- variant 5 (Oishi, loc 5): 390 - 3 (sale 1) = 387
UPDATE inventory_stock SET quantity = 387 WHERE variant_id = 5 AND location_id = 5 AND batch_id = 5;

-- 12. WORK SHIFTS (Matching JPA Schema)
-- 12. WORK SHIFTS (Matching JPA Schema)
INSERT IGNORE INTO work_shifts (
   shift_code, shift_name, start_time, end_time, break_start_time, break_end_time,
   shift_type, overtime_multiplier, night_shift_bonus, weekend_bonus, holiday_bonus,
   minimum_staff_required, maximum_staff_allowed, allow_early_clock_in, allow_late_clock_out,
    early_clock_in_minutes, late_clock_out_minutes, grace_peroid_minutes, status, effective_from, effective_to,
   requires_approval, description
) VALUES
('SHIFT-MORNING', 'Ca Sáng', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 'REGULAR', 1.50, 0.00, 0.00, 0.00, 2, 5, TRUE, TRUE, 15, 30, 10, 'ACTIVE', NULL, NULL, FALSE, 'Ca sáng từ 8h đến 17h, nghỉ trưa 1 tiếng'),
('SHIFT-AFTERNOON', 'Ca Chiều', '13:00:00', '22:00:00', '18:00:00', '18:30:00', 'REGULAR', 1.50, 10.00, 0.00, 0.00, 2, 4, TRUE, TRUE, 15, 30, 10, 'ACTIVE', NULL, NULL, FALSE, 'Ca chiều từ 13h đến 22h, nghỉ 30 phút'),
('SHIFT-EVENING', 'Ca Tối', '18:00:00', '23:00:00', NULL, NULL, 'NIGHT', 1.50, 15.00, 0.00, 0.00, 2, 3, TRUE, TRUE, 10, 20, 5, 'ACTIVE', NULL, NULL, FALSE, 'Ca tối từ 18h đến 23h, phụ cấp ca đêm 15%'),
('SHIFT-WEEKEND', 'Ca Cuối Tuần', '09:00:00', '18:00:00', '12:30:00', '13:30:00', 'WEEKEND', 2.00, 0.00, 20.00, 0.00, 3, 6, TRUE, TRUE, 15, 30, 10, 'ACTIVE', NULL, NULL, TRUE, 'Ca cuối tuần từ 9h đến 18h, phụ cấp 20%'),
('SHIFT-FULLTIME', 'Ca Full-time', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 'REGULAR', 1.50, 0.00, 0.00, 0.00, 1, 3, TRUE, TRUE, 15, 30, 10, 'ACTIVE', NULL, NULL, FALSE, 'Ca full-time chuẩn 8 tiếng');

-- 13. WORK SHIFT ASSIGNMENTS (with expanded employee coverage)
INSERT IGNORE INTO work_shift_assignments (work_shift_id, user_id, shift_date, status, notes, created_at, updated_at) VALUES
(1, 1, '2026-02-24', 'ASSIGNED', 'Giám sát hoạt động cửa hàng', NOW(), NOW()),
(1, 1, '2026-02-25', 'ASSIGNED', NULL, NOW(), NOW()),
(1, 1, '2026-02-26', 'ASSIGNED', NULL, NOW(), NOW()),
(1, 1, '2026-02-27', 'ASSIGNED', NULL, NOW(), NOW()),
(1, 3, '2026-02-24', 'ASSIGNED', 'Thu ngân ca sáng', NOW(), NOW()),
(1, 3, '2026-02-25', 'ASSIGNED', NULL, NOW(), NOW()),
(1, 3, '2026-02-26', 'ASSIGNED', NULL, NOW(), NOW()),
(1, 3, '2026-02-27', 'ABSENT', 'Xin nghỉ không lương', NOW(), NOW()),
(1, 5, '2026-02-24', 'ASSIGNED', 'Quản lý kho ca sáng', NOW(), NOW()),
(1, 5, '2026-02-25', 'ASSIGNED', NULL, NOW(), NOW()),
(1, 5, '2026-02-26', 'ASSIGNED', NULL, NOW(), NOW()),
(2, 2, '2026-02-24', 'ASSIGNED', 'Quản lý ca chiều', NOW(), NOW()),
(2, 2, '2026-02-25', 'ASSIGNED', NULL, NOW(), NOW()),
(2, 2, '2026-02-26', 'ASSIGNED', NULL, NOW(), NOW()),
(2, 2, '2026-02-27', 'ASSIGNED', NULL, NOW(), NOW()),
(2, 4, '2026-02-24', 'ASSIGNED', 'Thu ngân ca chiều', NOW(), NOW()),
(2, 4, '2026-02-25', 'ASSIGNED', NULL, NOW(), NOW()),
(2, 4, '2026-02-26', 'ASSIGNED', NULL, NOW(), NOW()),
(2, 4, '2026-02-27', 'ASSIGNED', NULL, NOW(), NOW()),
(3, 3, '2026-02-24', 'ASSIGNED', 'Thu ngân ca tối', NOW(), NOW()),
(3, 3, '2026-02-25', 'ASSIGNED', NULL, NOW(), NOW()),
(3, 6, '2026-02-26', 'ASSIGNED', 'Bán hàng ca tối', NOW(), NOW()),
(3, 6, '2026-02-27', 'ASSIGNED', NULL, NOW(), NOW()),
(4, 1, '2026-02-22', 'ASSIGNED', 'Ca cuối tuần - Quản lý', NOW(), NOW()),
(4, 2, '2026-02-22', 'ASSIGNED', 'Ca cuối tuần - Phó quản lý', NOW(), NOW()),
(4, 3, '2026-02-22', 'ASSIGNED', 'Ca cuối tuần - Thu ngân', NOW(), NOW()),
(4, 4, '2026-02-23', 'ASSIGNED', 'Ca cuối tuần - Thu ngân', NOW(), NOW()),
(4, 6, '2026-02-23', 'ASSIGNED', 'Ca cuối tuần - Bán hàng', NOW(), NOW()),
(4, 7, '2026-02-22', 'ASSIGNED', 'Ca cuối tuần - Bán hàng', NOW(), NOW()),

-- Current month assignments để màn hình HR (attendance/payroll) có dữ liệu mặc định
(1, 1, '2026-03-02', 'ASSIGNED', 'Giám sát đầu tuần', NOW(), NOW()),
(2, 2, '2026-03-02', 'ASSIGNED', 'Quản lý ca chiều đầu tuần', NOW(), NOW()),
(1, 3, '2026-03-02', 'ASSIGNED', 'Thu ngân ca sáng', NOW(), NOW()),
(2, 4, '2026-03-02', 'ASSIGNED', 'Thu ngân ca chiều', NOW(), NOW()),
(1, 5, '2026-03-02', 'ASSIGNED', 'Kiểm kho ca sáng', NOW(), NOW()),
(3, 6, '2026-03-02', 'ASSIGNED', 'Bán hàng ca tối', NOW(), NOW()),
(1, 7, '2026-03-02', 'ASSIGNED', 'Hỗ trợ bán hàng ca sáng', NOW(), NOW()),
(4, 1, '2026-03-01', 'ASSIGNED', 'Ca cuối tuần quản lý', NOW(), NOW()),
(4, 3, '2026-03-01', 'ASSIGNED', 'Ca cuối tuần thu ngân', NOW(), NOW()),
(4, 6, '2026-03-01', 'ASSIGNED', 'Ca cuối tuần bán hàng', NOW(), NOW()),

-- Bổ sung đủ dữ liệu tháng 3 cho toàn bộ nhân sự để test payroll cá nhân
(1, 1, '2026-03-03', 'ASSIGNED', 'Giám sát ca sáng', NOW(), NOW()),
(2, 2, '2026-03-03', 'ASSIGNED', 'Quản lý ca chiều', NOW(), NOW()),
(1, 3, '2026-03-03', 'ASSIGNED', 'Thu ngân ca sáng', NOW(), NOW()),
(2, 4, '2026-03-03', 'ASSIGNED', 'Thu ngân ca chiều', NOW(), NOW()),
(1, 5, '2026-03-03', 'ASSIGNED', 'Kiểm kho ca sáng', NOW(), NOW()),
(3, 6, '2026-03-03', 'ASSIGNED', 'Bán hàng ca tối', NOW(), NOW()),
(1, 7, '2026-03-03', 'ASSIGNED', 'Hỗ trợ bán hàng ca sáng', NOW(), NOW()),

(1, 1, '2026-03-04', 'ASSIGNED', 'Giám sát ca sáng', NOW(), NOW()),
(2, 2, '2026-03-04', 'ASSIGNED', 'Quản lý ca chiều', NOW(), NOW()),
(1, 3, '2026-03-04', 'ASSIGNED', 'Thu ngân ca sáng', NOW(), NOW()),
(2, 4, '2026-03-04', 'ASSIGNED', 'Thu ngân ca chiều', NOW(), NOW()),
(1, 5, '2026-03-04', 'ASSIGNED', 'Kiểm kho ca sáng', NOW(), NOW()),
(3, 6, '2026-03-04', 'ASSIGNED', 'Bán hàng ca tối', NOW(), NOW()),
(1, 7, '2026-03-04', 'ASSIGNED', 'Hỗ trợ bán hàng ca sáng', NOW(), NOW()),

(1, 1, '2026-03-05', 'ASSIGNED', 'Giám sát ca sáng', NOW(), NOW()),
(2, 2, '2026-03-05', 'ASSIGNED', 'Quản lý ca chiều', NOW(), NOW()),
(1, 3, '2026-03-05', 'ASSIGNED', 'Thu ngân ca sáng', NOW(), NOW()),
(2, 4, '2026-03-05', 'ASSIGNED', 'Thu ngân ca chiều', NOW(), NOW()),
(1, 5, '2026-03-05', 'ASSIGNED', 'Kiểm kho ca sáng', NOW(), NOW()),
(3, 6, '2026-03-05', 'ASSIGNED', 'Bán hàng ca tối', NOW(), NOW()),
(1, 7, '2026-03-05', 'ASSIGNED', 'Hỗ trợ bán hàng ca sáng', NOW(), NOW()),

(1, 1, '2026-03-06', 'ASSIGNED', 'Giám sát ca sáng', NOW(), NOW()),
(2, 2, '2026-03-06', 'ASSIGNED', 'Quản lý ca chiều', NOW(), NOW()),
(1, 3, '2026-03-06', 'ASSIGNED', 'Thu ngân ca sáng', NOW(), NOW()),
(2, 4, '2026-03-06', 'ASSIGNED', 'Thu ngân ca chiều', NOW(), NOW()),
(1, 5, '2026-03-06', 'ASSIGNED', 'Kiểm kho ca sáng', NOW(), NOW()),
(3, 6, '2026-03-06', 'ASSIGNED', 'Bán hàng ca tối', NOW(), NOW()),
(1, 7, '2026-03-06', 'ASSIGNED', 'Hỗ trợ bán hàng ca sáng', NOW(), NOW());

-- 14. CAMPAIGNS
INSERT IGNORE INTO campaigns (campaign_code, campaign_name, campaign_type, description, start_date, end_date, status, budget, target_revenue, is_public, created_by, created_at, updated_at) VALUES
('CAMP-202602-001', 'Tết Sale 2026', 'SEASONAL', 'Khuyến mãi Tết Nguyên Đán', '2026-02-10', '2026-02-20', 'ACTIVE', 50000000.00, 200000000.00, TRUE, 2, NOW(), NOW()),
('CAMP-202602-002', 'Flash Sale Cuối Tuần', 'FLASH_SALE', 'Giảm giá sốc cuối tuần', '2026-02-14', '2026-02-15', 'ACTIVE', 10000000.00, 30000000.00, TRUE, 2, NOW(), NOW()),
('CAMP-PROMO-2024-001', 'Tet Sale 2024', 'SEASONAL', 'Migrated from legacy promotions', '2024-02-01', '2024-02-29', 'COMPLETED', NULL, NULL, TRUE, 2, NOW(), NOW()),
('CAMP-PROMO-2024-002', 'Back to School', 'SEASONAL', 'Migrated from legacy promotions', '2024-08-01', '2024-08-31', 'COMPLETED', NULL, NULL, TRUE, 2, NOW(), NOW()),
('CAMP-PROMO-2024-003', 'Black Friday', 'FLASH_SALE', 'Migrated from legacy promotions', '2024-11-24', '2024-11-30', 'COMPLETED', NULL, NULL, TRUE, 2, NOW(), NOW()),
('CAMP-PROMO-2024-004', 'Christmas Sale', 'SEASONAL', 'Migrated from legacy promotions', '2024-12-20', '2024-12-31', 'COMPLETED', NULL, NULL, TRUE, 2, NOW(), NOW()),
('CAMP-PROMO-2025-001', 'New Year Deal', 'SEASONAL', 'Migrated from legacy promotions', '2025-01-01', '2025-01-15', 'COMPLETED', NULL, NULL, TRUE, 2, NOW(), NOW());

-- 15. COUPONS
INSERT IGNORE INTO coupons (coupon_code, coupon_name, description, coupon_type, campaign_id, discount_percent, discount_amount, max_discount_amount, min_purchase_amount, start_date, end_date, total_usage_limit, usage_per_customer, status, created_by, created_at, updated_at) VALUES
('WELCOME10', 'Giảm 10% Đơn Đầu', 'Mã giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 1, 10.00, NULL, 50000.00, 100000.00, '2026-02-01', '2026-03-31', 1000, 1, 'ACTIVE', 2, NOW(), NOW()),
('FLASH50K', 'Giảm 50K Flash Sale', 'Giảm ngay 50k cho đơn từ 300k', 'FIXED_AMOUNT', 2, NULL, 50000.00, NULL, 300000.00, '2026-02-14', '2026-02-15', 500, 2, 'ACTIVE', 2, NOW(), NOW());

-- 16. PRODUCT COMBOS
INSERT IGNORE INTO product_combos (
  combo_code, combo_name, description, image_url,
  original_price, combo_price, saved_amount, discount_percent,
  valid_from, valid_to, is_active,
  max_quantity_per_order, total_sold, stock_limit,
  combo_type, is_featured, display_order, tags,
  status, created_by, created_at, updated_at
) VALUES 

('CB-SNACK-1','Combo Siêu Ăn Vặt','Gói snack tổng hợp cho cuối tuần',NULL,31000,25000,6000,19.35,'2026-02-01','2026-12-31',TRUE,5,0,100,'DISCOUNT',TRUE,1,'snack,combo,hot','ACTIVE',1,NOW(),NOW()),

('CB-DRINK-1','Combo Nước Giải Khát','2 lon Coca và 1 bịch Oishi',NULL,32000,28000,4000,12.50,'2026-02-01','2026-12-31',TRUE,10,0,200,'BUNDLE',FALSE,2,'drink,summer','ACTIVE',1,NOW(),NOW()),

('COMBO-BREAKFAST','Combo Sáng Năng Động','Sữa + Bánh mì + Nước ngọt',NULL,60000,50000,10000,16.67,'2026-02-01','2026-03-31',TRUE,10,0,100,'BUNDLE',FALSE,3,'breakfast','ACTIVE',2,NOW(),NOW()),

('COMBO-SNACK','Combo Snack Vui Vẻ','Snack + Nước ngọt',NULL,20000,18000,2000,10.00,'2026-02-14','2026-02-28',TRUE,10,0,100,'DISCOUNT',FALSE,4,'snack','ACTIVE',2,NOW(),NOW()),

('CB-MILK-1','Combo Sữa Gia Đình','Sữa Vinamilk + TH Milk',NULL,60000,52000,8000,13.33,'2026-02-01','2026-12-31',TRUE,10,0,100,'BUNDLE',FALSE,5,'milk,family','ACTIVE',1,NOW(),NOW()),

('CB-NOODLE-1','Combo Mì Tiết Kiệm','Mì Acecook + Mì Vifon',NULL,45000,39000,6000,13.33,'2026-02-01','2026-12-31',TRUE,10,0,150,'DISCOUNT',FALSE,6,'noodle,combo','ACTIVE',1,NOW(),NOW()),

('CB-PARTY-1','Combo Party Nhỏ','Snack + Nước + Kẹo',NULL,70000,59000,11000,15.71,'2026-02-01','2026-12-31',TRUE,5,0,80,'BUNDLE',TRUE,7,'party,snack','ACTIVE',1,NOW(),NOW()),

('CB-COFFEE-1','Combo Cà Phê Sáng','Cà phê + Snack',NULL,30000,26000,4000,13.33,'2026-02-01','2026-12-31',TRUE,10,0,120,'DISCOUNT',FALSE,8,'coffee,morning','ACTIVE',1,NOW(),NOW()),

('CB-SUMMER-1','Combo Mùa Hè','Pepsi + Coca + Snack',NULL,50000,43000,7000,14.00,'2026-04-01','2026-08-31',TRUE,10,0,200,'SUMMER',TRUE,9,'summer,drink','ACTIVE',1,NOW(),NOW()),

('CB-KIDS-1','Combo Trẻ Em','Kẹo + Snack + Sữa',NULL,35000,30000,5000,14.28,'2026-02-01','2026-12-31',TRUE,10,0,120,'BUNDLE',TRUE,10,'kids,candy','ACTIVE',1,NOW(),NOW());


-- PRODUCT COMBO ITEMS
INSERT IGNORE INTO product_combo_items (
combo_id, product_variant_id, quantity, display_order, is_optional
) VALUES

-- Combo 1
(1,5,2,1,FALSE),
(1,17,1,2,FALSE),
(1,10,4,3,FALSE),

-- Combo 2
(2,4,2,1,FALSE),
(2,5,1,2,FALSE),

-- Combo 3
(3,1,1,1,FALSE),
(3,3,1,2,FALSE),
(3,4,1,3,FALSE),

-- Combo 4
(4,5,2,1,FALSE),
(4,4,2,2,FALSE),

-- Combo 5
(5,1,2,1,FALSE),
(5,2,2,2,FALSE),

-- Combo 6
(6,12,3,1,FALSE),
(6,13,3,2,FALSE),

-- Combo 7
(7,5,2,1,FALSE),
(7,4,2,2,FALSE),
(7,10,3,3,FALSE),

-- Combo 8
(8,14,1,1,FALSE),
(8,5,1,2,FALSE),

-- Combo 9
(9,4,2,1,FALSE),
(9,18,2,2,FALSE),
(9,5,1,3,FALSE),

-- Combo 10
(10,10,3,1,FALSE),
(10,5,1,2,FALSE),
(10,1,1,3,FALSE);

-- 17. CASH REGISTERS
INSERT IGNORE INTO cash_registers (register_code, register_name, store_name, location, register_type, status, device_id, current_cash, opening_balance, current_operator_id, session_start_time, total_transactions_today, created_at, updated_at) VALUES
('POS-001', 'Quầy 1', 'SmallTrend Store', 'Front Counter', 'MAIN', 'ACTIVE', 'DEV-POS-001', 5000000.00, 2000000.00, 3, NOW(), 0, NOW(), NOW()),
('POS-002', 'Quầy 2', 'SmallTrend Store', 'Express Counter', 'EXPRESS', 'ACTIVE', 'DEV-POS-002', 3000000.00, 1000000.00, NULL, NULL, 0, NOW(), NOW());

-- 18. SALE ORDERS (2026)
INSERT IGNORE INTO sale_orders (order_code, customer_id, cashier_id, cash_register_id, order_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, status, notes, created_at, updated_at) VALUES
('SO-20260224-001', 2, 3, 1, '2026-02-24 09:30:00', 49000.00, 4900.00, 0.00, 53900.00, 'CASH', 'COMPLETED', 'Đơn mua nhanh buổi sáng', '2026-02-24 09:30:00', '2026-02-24 09:31:00'),
('SO-20260224-002', 1, 3, 1, '2026-02-24 19:20:00', 93000.00, 9300.00, 5000.00, 97300.00, 'CARD', 'COMPLETED', 'Khách thành viên đổi điểm', '2026-02-24 19:20:00', '2026-02-24 19:23:00'),
('SO-20260225-001', 3, 3, 2, '2026-02-25 20:10:00', 32000.00, 3200.00, 0.00, 35200.00, 'MOMO', 'REFUNDED', 'Hoàn tiền 1 phần do sản phẩm lỗi', '2026-02-25 20:10:00', '2026-02-25 21:00:00');

-- Legacy sales_orders migrated to sale_orders
INSERT IGNORE INTO sale_orders (order_code, customer_id, cashier_id, cash_register_id, order_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, status, notes, created_at, updated_at) VALUES
('SO-LEG-20240220-001', 1, 3, 1, '2024-02-20 10:30:00', 175000.00, 0.00, 0.00, 175000.00, 'CASH', 'COMPLETED', 'Migrated from legacy sales_orders', NOW(), NOW()),
('SO-LEG-20240221-002', 2, 3, 1, '2024-02-21 14:15:00', 95000.00, 0.00, 0.00, 95000.00, 'CREDIT_CARD', 'COMPLETED', 'Migrated from legacy sales_orders', NOW(), NOW()),
('SO-LEG-20240222-003', 3, 5, 1, '2024-02-22 09:45:00', 58000.00, 0.00, 0.00, 58000.00, 'BANK_TRANSFER', 'COMPLETED', 'Migrated from legacy sales_orders', NOW(), NOW()),
('SO-LEG-20240223-004', 4, 3, 2, '2024-02-23 16:20:00', 120000.00, 0.00, 0.00, 120000.00, 'CASH', 'COMPLETED', 'Migrated from legacy sales_orders', NOW(), NOW()),
('SO-LEG-20240224-005', 4, 5, 2, '2024-02-24 11:10:00', 67000.00, 0.00, 0.00, 67000.00, 'QR_CODE', 'COMPLETED', 'Migrated from legacy sales_orders', NOW(), NOW());

-- Purchase history migrated to additional sale_orders
INSERT IGNORE INTO sale_orders (order_code, customer_id, cashier_id, cash_register_id, order_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, status, notes, created_at, updated_at) VALUES
('SO-PH-001', 1, 3, 1, '2026-02-24 09:30:00', 48000.00, 0.00, 0.00, 48000.00, 'CASH', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-002', 2, 3, 1, '2026-02-24 19:20:00', 95000.00, 0.00, 0.00, 95000.00, 'CARD', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-003', 3, 3, 2, '2026-02-25 20:10:00', 30000.00, 0.00, 0.00, 30000.00, 'MOMO', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-004', 1, 3, 1, '2026-02-26 10:15:00', 25000.00, 0.00, 0.00, 25000.00, 'CASH', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-005', 4, 3, 2, '2026-02-26 14:30:00', 92000.00, 0.00, 0.00, 92000.00, 'CASH', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-006', 2, 3, 1, '2026-02-27 08:45:00', 51000.00, 0.00, 0.00, 51000.00, 'MOMO', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-007', 3, 3, 2, '2026-02-27 15:20:00', 165000.00, 0.00, 0.00, 165000.00, 'CARD', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-008', 1, 3, 1, '2026-02-27 20:00:00', 40000.00, 0.00, 0.00, 40000.00, 'CASH', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-009', 4, 3, 2, '2026-02-28 09:10:00', 95000.00, 0.00, 0.00, 95000.00, 'CARD', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW()),
('SO-PH-010', 3, 3, 2, '2026-02-28 16:30:00', 72000.00, 0.00, 0.00, 72000.00, 'CASH', 'COMPLETED', 'Migrated from legacy purchase_history', NOW(), NOW());

-- March 2026 orders (past days + today)
INSERT IGNORE INTO sale_orders (order_code, customer_id, cashier_id, cash_register_id, order_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, status, notes, created_at, updated_at) VALUES
-- 2026-03-01
('SO-20260301-001', 1, 3, 1, '2026-03-01 09:15:00', 62000.00, 6200.00, 0.00, 68200.00, 'CASH', 'COMPLETED', 'Đơn sáng đầu tháng 3', '2026-03-01 09:15:00', '2026-03-01 09:16:00'),
('SO-20260301-002', 4, 4, 2, '2026-03-01 14:50:00', 105000.00, 10500.00, 0.00, 115500.00, 'CARD', 'COMPLETED', 'Khách mua số lượng lớn', '2026-03-01 14:50:00', '2026-03-01 14:52:00'),
-- 2026-03-02
('SO-20260302-001', 2, 3, 1, '2026-03-02 10:30:00', 45000.00, 4500.00, 0.00, 49500.00, 'MOMO', 'COMPLETED', 'Đơn thanh toán ví điện tử', '2026-03-02 10:30:00', '2026-03-02 10:31:00'),
('SO-20260302-002', 3, 4, 2, '2026-03-02 18:20:00', 88000.00, 8800.00, 0.00, 96800.00, 'CASH', 'COMPLETED', 'Đơn chiều tối', '2026-03-02 18:20:00', '2026-03-02 18:22:00'),
-- 2026-03-03
('SO-20260303-001', 1, 3, 1, '2026-03-03 08:45:00', 53000.00, 5300.00, 0.00, 58300.00, 'CASH', 'COMPLETED', 'Đơn sáng sớm', '2026-03-03 08:45:00', '2026-03-03 08:46:00'),
-- 2026-03-04 today (NOW)
('SO-20260304-001', 2, 3, 1, NOW(), 37000.00, 3700.00, 0.00, 40700.00, 'CASH', 'COMPLETED', 'Đơn hôm nay - sáng sớm', NOW(), NOW()),
('SO-20260304-002', 1, 4, 2, NOW(), 93000.00, 9300.00, 5000.00, 97300.00, 'CARD', 'COMPLETED', 'Đơn hôm nay - khách thành viên', NOW(), NOW()),
('SO-20260304-003', 4, 3, 1, NOW(), 126000.00, 12600.00, 0.00, 138600.00, 'MOMO', 'COMPLETED', 'Đơn hôm nay - mua nhiều mặt hàng', NOW(), NOW()),
('SO-20260304-004', 3, 4, 2, NOW(), 48000.00, 4800.00, 0.00, 52800.00, 'CASH', 'COMPLETED', 'Đơn hôm nay - buổi chiều', NOW(), NOW());

-- 19. SALE ORDER ITEMS
INSERT IGNORE INTO sale_order_items (sale_order_id, product_variant_id, product_name, sku, quantity, unit_price, line_discount_amount, line_tax_amount, line_total_amount, notes) VALUES
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 4, 'Coca Cola 330ml', 'COCA-330ML', 2, 12000.00, 0.00, 2400.00, 26400.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 5, 'Oishi Snack', 'OISHI-50G', 3, 8000.00, 0.00, 2400.00, 26400.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 1, 'Fresh Milk 1L', 'VMILK-1L', 2, 25000.00, 2000.00, 4800.00, 52800.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 3, 'Nescafe 3in1', 'NESCAFE-200G', 1, 45000.00, 3000.00, 4500.00, 46500.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 2, 'Dove Soap 90g', 'DOVE-90G', 2, 15000.00, 0.00, 3000.00, 33000.00, '1 sản phẩm bị lỗi vỏ hộp'),

((SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240220-001'), 1, 'Fresh Milk 1L', 'VMILK-1L', 7, 25000.00, 0.00, 0.00, 175000.00, 'Migrated from legacy sales_order_items'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240221-002'), 2, 'Dove Soap 90g', 'DOVE-90G', 4, 23750.00, 0.00, 0.00, 95000.00, 'Migrated from legacy sales_order_items'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240222-003'), 3, 'Nescafe 3in1', 'NESCAFE-200G', 12, 4833.33, 0.00, 0.00, 57999.96, 'Migrated from legacy sales_order_items'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240223-004'), 4, 'Coca Cola 330ml', 'COCA-330ML', 10, 12000.00, 0.00, 0.00, 120000.00, 'Migrated from legacy sales_order_items'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240224-005'), 5, 'Oishi Snack', 'OISHI-50G', 5, 13400.00, 0.00, 0.00, 67000.00, 'Migrated from legacy sales_order_items'),

((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-001'), 4, 'Coca Cola 330ml', 'COCA-330ML', 2, 12000.00, 0.00, 0.00, 24000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-001'), 5, 'Oishi Snack', 'OISHI-50G', 3, 8000.00, 0.00, 0.00, 24000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-002'), 1, 'Fresh Milk 1L', 'VMILK-1L', 2, 25000.00, 0.00, 0.00, 50000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-002'), 3, 'Nescafe 3in1', 'NESCAFE-200G', 1, 45000.00, 0.00, 0.00, 45000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-003'), 2, 'Dove Soap 90g', 'DOVE-90G', 2, 15000.00, 0.00, 0.00, 30000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-004'), 1, 'Fresh Milk 1L', 'VMILK-1L', 1, 25000.00, 0.00, 0.00, 25000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-005'), 4, 'Coca Cola 330ml', 'COCA-330ML', 5, 12000.00, 0.00, 0.00, 60000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-005'), 5, 'Oishi Snack', 'OISHI-50G', 4, 8000.00, 0.00, 0.00, 32000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-006'), 4, 'Coca Cola 330ml', 'COCA-330ML', 3, 12000.00, 0.00, 0.00, 36000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-006'), 2, 'Dove Soap 90g', 'DOVE-90G', 1, 15000.00, 0.00, 0.00, 15000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-007'), 1, 'Fresh Milk 1L', 'VMILK-1L', 3, 25000.00, 0.00, 0.00, 75000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-007'), 3, 'Nescafe 3in1', 'NESCAFE-200G', 2, 45000.00, 0.00, 0.00, 90000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-008'), 5, 'Oishi Snack', 'OISHI-50G', 5, 8000.00, 0.00, 0.00, 40000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-009'), 1, 'Fresh Milk 1L', 'VMILK-1L', 2, 25000.00, 0.00, 0.00, 50000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-009'), 2, 'Dove Soap 90g', 'DOVE-90G', 3, 15000.00, 0.00, 0.00, 45000.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-PH-010'), 4, 'Coca Cola 330ml', 'COCA-330ML', 6, 12000.00, 0.00, 0.00, 72000.00, NULL);

-- 20. SALE ORDER HISTORIES
INSERT IGNORE INTO sale_order_histories (sale_order_id, from_status, to_status, action_type, changed_by_user_id, change_notes, changed_at) VALUES
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), NULL, 'PENDING', 'CREATED', 3, 'Khởi tạo đơn tại POS-001', '2026-02-24 09:30:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 'PENDING', 'COMPLETED', 'PAYMENT_SUCCESS', 3, 'Thanh toán tiền mặt thành công', '2026-02-24 09:31:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), NULL, 'PENDING', 'CREATED', 3, 'Khởi tạo đơn tại POS-001', '2026-02-24 19:20:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 'PENDING', 'COMPLETED', 'PAYMENT_SUCCESS', 3, 'Thanh toán thẻ thành công', '2026-02-24 19:23:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), NULL, 'PENDING', 'CREATED', 3, 'Khởi tạo đơn tại POS-002', '2026-02-25 20:10:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 'PENDING', 'COMPLETED', 'PAYMENT_SUCCESS', 3, 'Thanh toán ví điện tử thành công', '2026-02-25 20:15:00'),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 'COMPLETED', 'REFUNDED', 'REFUND_PARTIAL', 2, 'Khách trả lại sản phẩm lỗi', '2026-02-25 21:00:00');

-- 20.1 CASH TRANSACTIONS
INSERT IGNORE INTO cash_transactions (
    transaction_code, register_id, transaction_type, amount, balance_before, balance_after,
    reason, description, order_id, performed_by, approved_by, approved_at,
    status, receipt_image_url, notes, transaction_time, created_at, updated_at
) VALUES
('CT-20260224-001', 1, 'CASH_IN', 53900.00, 5000000.00, 5053900.00, 'SALE', 'Thu tiền mặt từ đơn SO-20260224-001', (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 3, 2, '2026-02-24 09:35:00', 'COMPLETED', NULL, 'Đã đối soát cuối ca', '2026-02-24 09:31:00', NOW(), NOW()),
('CT-20260225-001', 2, 'CASH_OUT', 15000.00, 3000000.00, 2985000.00, 'REFUND', 'Hoàn tiền mặt 1 phần cho đơn SO-20260225-001', (SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 3, 2, '2026-02-25 21:05:00', 'COMPLETED', NULL, 'Refund do sản phẩm lỗi', '2026-02-25 21:00:00', NOW(), NOW());

-- 20.2 COUPON USAGE
INSERT IGNORE INTO coupon_usage (
    coupon_id, customer_id, order_id, usage_code, order_amount, discount_amount,
    status, applied_at, redeemed_at, cancel_reason, created_at, updated_at
) VALUES
((SELECT id FROM coupons WHERE coupon_code = 'WELCOME10'), 1, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 'USAGE-20260224-001', 102300.00, 5000.00, 'REDEEMED', '2026-02-24 19:20:00', '2026-02-24 19:23:00', NULL, NOW(), NOW()),
((SELECT id FROM coupons WHERE coupon_code = 'FLASH50K'), 3, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260225-001'), 'USAGE-20260225-001', 35200.00, 0.00, 'CANCELLED', '2026-02-25 20:10:00', NULL, 'Đơn bị hoàn một phần, coupon không ghi nhận', NOW(), NOW());

-- 20.3 LOYALTY TRANSACTIONS
INSERT IGNORE INTO loyalty_transactions (
    transaction_code, customer_id, transaction_type, points, balance_before, balance_after,
    order_id, order_amount, points_multiplier, reason, description,
    expiry_date, performed_by, status, transaction_time, created_at, updated_at
) VALUES
('LT-20260224-001', 2, 'EARN', 54, 746, 800, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-001'), 53900.00, 1.00, 'PURCHASE', 'Tích điểm từ đơn SO-20260224-001', '2027-02-24 23:59:59', 3, 'COMPLETED', '2026-02-24 09:32:00', NOW(), NOW()),
('LT-20260224-002', 1, 'EARN', 97, 53, 150, (SELECT id FROM sale_orders WHERE order_code = 'SO-20260224-002'), 97300.00, 1.00, 'PURCHASE', 'Tích điểm từ đơn SO-20260224-002', '2027-02-24 23:59:59', 3, 'COMPLETED', '2026-02-24 19:24:00', NOW(), NOW()),
('LT-LEG-001', 1, 'EARN', 18, 0, 18, (SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240220-001'), 175000.00, 1.00, 'PURCHASE', 'Migrated from legacy loyalty_history', '2025-02-20 23:59:59', 3, 'COMPLETED', '2024-02-20 10:31:00', NOW(), NOW()),
('LT-LEG-002', 2, 'EARN', 10, 0, 10, (SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240221-002'), 95000.00, 1.00, 'PURCHASE', 'Migrated from legacy loyalty_history', '2025-02-21 23:59:59', 3, 'COMPLETED', '2024-02-21 14:16:00', NOW(), NOW()),
('LT-LEG-003', 3, 'EARN', 6, 0, 6, (SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240222-003'), 58000.00, 1.00, 'PURCHASE', 'Migrated from legacy loyalty_history', '2025-02-22 23:59:59', 5, 'COMPLETED', '2024-02-22 09:46:00', NOW(), NOW()),
('LT-LEG-004', 4, 'EARN', 12, 0, 12, (SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240223-004'), 120000.00, 1.00, 'PURCHASE', 'Migrated from legacy loyalty_history', '2025-02-23 23:59:59', 3, 'COMPLETED', '2024-02-23 16:21:00', NOW(), NOW()),
('LT-LEG-005', 4, 'EARN', 7, 0, 7, (SELECT id FROM sale_orders WHERE order_code = 'SO-LEG-20240224-005'), 67000.00, 1.00, 'PURCHASE', 'Migrated from legacy loyalty_history', '2025-02-24 23:59:59', 5, 'COMPLETED', '2024-02-24 11:11:00', NOW(), NOW());

-- 21. TICKETS
INSERT IGNORE INTO tickets (
   ticket_code, ticket_type, title, description, status, priority,
   created_by_user_id, assigned_to_user_id, resolved_by_user_id,
   related_entity_type, related_entity_id, resolution, resolved_at
) VALUES
('TCK-SWAP-001', 'SWAP_SHIFT', 'Swap shift ngày 15/02 - Ca sáng <-> Ca chiều', 'Nhân viên A muốn đổi ca sáng sang ca chiều với nhân viên B do có lịch cá nhân', 'OPEN', 'NORMAL', 2, 3, NULL, 'WorkShift', 1, NULL, NULL),
('TCK-HAND-001', 'HANDOVER', 'Bàn giao ca tối 14/02/2026', 'Bàn giao ca tối: Quầy 1 có 2,500,000 VND trong két, 15 giao dịch hoàn tất, cần kiểm kê lại kệ đồ uống', 'RESOLVED', 'HIGH', 2, 3, 2, 'CashRegister', 1, 'Đã bàn giao thành công. Nhân viên ca tối xác nhận đã nhận đầy đủ tiền mặt và ghi chú', '2026-02-21 22:00:00'),
('TCK-REF-001', 'REFUND', 'Hoàn tiền đơn hàng ORD-2026-001', 'Khách hàng mua nhầm sản phẩm, yêu cầu hoàn tiền. Sản phẩm còn nguyên seal, trong thời hạn đổi trả', 'IN_PROGRESS', 'URGENT', 2, 1, NULL, 'Order', 1, NULL, NULL),
('TCK-COMP-001', 'COMPLAINT', 'Khiếu nại về chất lượng sản phẩm', 'Khách hàng phàn nàn sữa hết hạn sử dụng. Cần kiểm tra lại quy trình kiểm kê', 'OPEN', 'HIGH', 3, 1, NULL, 'Product', 1, NULL, NULL);

-- 22. USER CREDENTIALS
INSERT IGNORE INTO user_credentials (user_id, username, password_hash) VALUES
(1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(2, 'manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(3, 'cashier1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(4, 'cashier2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(5, 'inventory1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(6, 'sales1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(7, 'sales2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG');

-- 23. ATTENDANCE (Auto-tracked based on employee login/logout)
-- 23. ATTENDANCE (Auto-tracked based on employee login/logout)
INSERT IGNORE INTO attendance (user_id, date, time_in, time_out, status) VALUES
-- Daily attendance for employees working various shifts
-- Daily attendance for employees working various shifts
(1, '2026-02-24', '08:01:00', '17:03:00', 'PRESENT'),
(1, '2026-02-25', '08:12:00', '17:00:00', 'LATE'),
(1, '2026-02-26', '08:00:00', '17:02:00', 'PRESENT'),
(1, '2026-02-27', '08:05:00', NULL, 'PRESENT'),
(1, '2026-02-26', '08:00:00', '17:02:00', 'PRESENT'),
(1, '2026-02-27', '08:05:00', NULL, 'PRESENT'),
(2, '2026-02-24', '13:00:00', '22:05:00', 'PRESENT'),
(2, '2026-02-25', '13:25:00', '22:00:00', 'LATE'),
(2, '2026-02-26', '13:00:00', '22:03:00', 'PRESENT'),
(2, '2026-02-27', '13:00:00', NULL, 'PRESENT'),
(3, '2026-02-24', '08:00:00', '17:01:00', 'PRESENT'),
(3, '2026-02-25', '08:20:00', '17:00:00', 'LATE'),
(3, '2026-02-26', '08:00:00', '17:00:00', 'PRESENT'),
(3, '2026-02-27', NULL, NULL, 'ABSENT'),
(4, '2026-02-24', '13:00:00', '22:02:00', 'PRESENT'),
(4, '2026-02-25', '13:30:00', '22:00:00', 'LATE'),
(4, '2026-02-26', '13:00:00', '22:01:00', 'PRESENT'),
(4, '2026-02-27', '13:00:00', NULL, 'PRESENT'),
(5, '2026-02-24', '08:00:00', '17:02:00', 'PRESENT'),
(5, '2026-02-25', '08:00:00', '17:00:00', 'PRESENT'),
(5, '2026-02-26', '08:15:00', '17:00:00', 'LATE'),
(6, '2026-02-24', '09:00:00', '18:01:00', 'PRESENT'),
(6, '2026-02-25', '09:00:00', '18:00:00', 'PRESENT'),
(6, '2026-02-26', '09:05:00', '18:02:00', 'PRESENT'),
(7, '2026-02-24', '09:00:00', '18:00:00', 'PRESENT'),
(7, '2026-02-25', '09:15:00', '18:01:00', 'LATE'),
(7, '2026-02-26', '09:00:00', '18:00:00', 'PRESENT'),

-- Current month attendance để trang chấm công mặc định ngày hiện tại có dữ liệu
(1, '2026-03-01', '09:00:00', '18:02:00', 'PRESENT'),
(3, '2026-03-01', '09:02:00', '17:58:00', 'PRESENT'),
(6, '2026-03-01', '09:10:00', '18:00:00', 'LATE'),
(1, '2026-03-02', '08:01:00', '17:05:00', 'PRESENT'),
(2, '2026-03-02', '13:03:00', '22:01:00', 'PRESENT'),
(3, '2026-03-02', '08:11:00', '17:00:00', 'LATE'),
(4, '2026-03-02', '13:00:00', '22:03:00', 'PRESENT'),
(5, '2026-03-02', '08:05:00', '17:02:00', 'PRESENT'),
(6, '2026-03-02', '18:02:00', '23:00:00', 'PRESENT'),
(7, '2026-03-02', NULL, NULL, 'ABSENT'),

(1, '2026-03-03', '08:00:00', '17:04:00', 'PRESENT'),
(2, '2026-03-03', '13:05:00', '22:00:00', 'PRESENT'),
(3, '2026-03-03', '08:06:00', '17:00:00', 'PRESENT'),
(4, '2026-03-03', '13:16:00', '22:00:00', 'LATE'),
(5, '2026-03-03', '08:00:00', '17:00:00', 'PRESENT'),
(6, '2026-03-03', '18:00:00', '23:08:00', 'PRESENT'),
(7, '2026-03-03', '08:10:00', '17:00:00', 'LATE'),

(1, '2026-03-04', '08:03:00', '17:01:00', 'PRESENT'),
(2, '2026-03-04', '13:22:00', '22:00:00', 'LATE'),
(3, '2026-03-04', '08:00:00', '17:12:00', 'PRESENT'),
(4, '2026-03-04', NULL, NULL, 'ABSENT'),
(5, '2026-03-04', '08:08:00', '17:00:00', 'PRESENT'),
(6, '2026-03-04', '18:01:00', '23:00:00', 'PRESENT'),
(7, '2026-03-04', '08:00:00', '17:03:00', 'PRESENT'),

(1, '2026-03-05', '08:02:00', '17:00:00', 'PRESENT'),
(2, '2026-03-05', '13:00:00', '22:06:00', 'PRESENT'),
(3, '2026-03-05', '08:12:00', '17:00:00', 'LATE'),
(4, '2026-03-05', '13:00:00', '22:01:00', 'PRESENT'),
(5, '2026-03-05', '08:00:00', '17:05:00', 'PRESENT'),
(6, '2026-03-05', NULL, NULL, 'ABSENT'),
(7, '2026-03-05', '08:04:00', '17:00:00', 'PRESENT'),

(1, '2026-03-06', '08:01:00', '17:02:00', 'PRESENT'),
(2, '2026-03-06', '13:09:00', '22:00:00', 'LATE'),
(3, '2026-03-06', '08:00:00', '17:01:00', 'PRESENT'),
(4, '2026-03-06', '13:00:00', '22:00:00', 'PRESENT'),
(5, '2026-03-06', '08:06:00', '17:00:00', 'PRESENT'),
(6, '2026-03-06', NULL, NULL, 'ABSENT'),
(7, '2026-03-06', '08:03:00', '17:00:00', 'PRESENT');

-- 24. SALARY CONFIGS (Per-employee base salary configuration with flexible types)
-- Each employee has individual salary setup - Manager can modify base salary for each person
-- Supports both HOURLY and MONTHLY salary types
-- 24. SALARY CONFIGS (Per-employee base salary configuration with flexible types)
-- Each employee has individual salary setup - Manager can modify base salary for each person
-- Supports both HOURLY and MONTHLY salary types
INSERT IGNORE INTO salary_configs (
    user_id, salary_type, base_salary, hourly_rate, overtime_rate_multiplier,
        allowances, bonus_percentage, min_required_shifts, count_late_as_present, working_hours_per_month,
        is_active, effective_from, effective_until,
    notes, created_at, updated_at
) VALUES
-- Admin: Monthly salary with fixed base
(1, 'MONTHLY', 30000000.00, NULL, 1.50, 1500000.00, 5.00, NULL, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL, 
 'Quản lý toàn hệ thống - Lương cố định hàng tháng', NOW(), NOW()),

-- Manager: Monthly salary with fixed base
(2, 'MONTHLY', 18000000.00, NULL, 1.50, 1000000.00, 3.00, NULL, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL, 
 'Quản lý cửa hàng - Lương cố định hàng tháng', NOW(), NOW()),

-- Cashier 1: Hourly rate with monthly backup
(3, 'HOURLY', 13500000.00, 75000.00, 1.50, 500000.00, 1.00, NULL, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL,
 'Thu ngân ca sáng - Lương theo giờ (Giờ thường: 75k/h, OT: 112.5k/h)', NOW(), NOW()),

-- Cashier 2: Hourly rate (different from cashier 1 for flexible configuration)
(4, 'HOURLY', 13200000.00, 72000.00, 1.50, 500000.00, 1.00, NULL, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL,
 'Thu ngân ca chiều - Lương theo giờ (Giờ thường: 72k/h, OT: 108k/h)', NOW(), NOW()),

-- Inventory: Monthly salary
(5, 'MONTHLY', 13000000.00, NULL, 1.50, 400000.00, 1.00, NULL, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL,
 'Quản lý kho hàng - Lương cố định hàng tháng', NOW(), NOW()),

-- Sales 1: Hourly rate for flexible hours
(6, 'HOURLY', 12600000.00, 70000.00, 1.50, 450000.00, 1.50, NULL, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL,
 'Nhân viên bán hàng - Lương theo giờ (Giờ thường: 70k/h, OT: 105k/h)', NOW(), NOW()),

-- Sales 2: Monthly salary with minimum required shifts
(7, 'MONTHLY_MIN_SHIFTS', 12500000.00, NULL, 1.50, 400000.00, 1.50, 20, TRUE, 208.00, TRUE, '2026-01-01 00:00:00', NULL,
 'Nhân viên bán hàng - Lương tháng, cần tối thiểu 20 ca công/tháng', NOW(), NOW());

-- Mark one historical assignment as soft-deleted sample
UPDATE work_shift_assignments
SET is_deleted = TRUE, updated_at = NOW()
WHERE work_shift_id = 4 AND user_id = 7 AND shift_date = '2026-02-22';

-- Backfill attendance snapshots from assignments + shifts for payroll history safety
UPDATE attendance a
JOIN work_shift_assignments wsa
    ON wsa.user_id = a.user_id
 AND wsa.shift_date = a.date
 AND wsa.is_deleted = FALSE
JOIN work_shifts ws
    ON ws.id = wsa.work_shift_id
SET a.assignment_id_snapshot = wsa.id,
        a.shift_id_snapshot = ws.id,
        a.shift_name_snapshot = ws.shift_name,
        a.shift_start_snapshot = ws.start_time,
        a.shift_end_snapshot = ws.end_time,
        a.shift_working_minutes_snapshot = ws.working_minutes
WHERE a.assignment_id_snapshot IS NULL;

-- 25. PURCHASE ORDERS (Matching JPA PurchaseOrder schema)
INSERT IGNORE INTO purchase_orders (
   po_number, supplier_id, created_by, order_date, status, subtotal, 
   tax_amount, discount_amount, total_amount, notes, created_at, updated_at
) VALUES
('PO-2024-001', 1, 2, '2024-01-10', 'RECEIVED', 5000000.00, 0.00, 0.00, 5000000.00, 'Migrated from legacy purchase_orders', NOW(), NOW()),
('PO-2024-002', 2, 2, '2024-01-15', 'RECEIVED', 3500000.00, 0.00, 0.00, 3500000.00, 'Migrated from legacy purchase_orders', NOW(), NOW()),
('PO-2024-003', 3, 2, '2024-02-01', 'DRAFT', 2400000.00, 0.00, 0.00, 2400000.00, 'Migrated from legacy purchase_orders', NOW(), NOW()),
('PO-2024-004', 4, 4, '2024-02-05', 'RECEIVED', 1800000.00, 0.00, 0.00, 1800000.00, 'Migrated from legacy purchase_orders', NOW(), NOW()),
('PO-2024-005', 3, 4, '2024-02-10', 'CONFIRMED', 2200000.00, 0.00, 0.00, 2200000.00, 'Migrated from legacy purchase_orders', NOW(), NOW()),
('PO-2026-001', 1, 2, '2026-02-10', 'RECEIVED', 47000000.00, 4700000.00, 500000.00, 51200000.00, 'Đơn nhập sữa Vinamilk tháng 2', NOW(), NOW()),
('PO-2026-002', 2, 2, '2026-02-12', 'CONFIRMED', 18000000.00, 1800000.00, 0.00, 19800000.00, 'Đơn nhập đồ gia dụng Unilever', NOW(), NOW()),
('PO-2026-003', 3, 1, '2026-02-15', 'DRAFT', 12000000.00, 1200000.00, 200000.00, 13000000.00, 'Đơn nhập snack Nestle', NOW(), NOW()),
('PO-2026-004', 4, 2, '2026-02-18', 'DRAFT', 24000000.00, 2400000.00, 1000000.00, 25400000.00, 'Đơn nhập nước ngọt Coca-Cola', NOW(), NOW());

-- 26. PURCHASE ORDER ITEMS (Matching JPA PurchaseOrderItem schema)
INSERT IGNORE INTO purchase_order_items (purchase_order_id, variant_id, quantity, unit_price, received_quantity, notes) VALUES
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2024-001'), 1, 250, 20000.00, 250, 'Migrated from legacy purchase_order_items'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2024-002'), 2, 160, 22000.00, 160, 'Migrated from legacy purchase_order_items'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2024-003'), 3, 800, 3500.00, 0, 'Migrated from legacy purchase_order_items'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2024-004'), 4, 200, 9500.00, 200, 'Migrated from legacy purchase_order_items'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2024-005'), 5, 180, 12000.00, 0, 'Migrated from legacy purchase_order_items'),

((SELECT id FROM purchase_orders WHERE po_number = 'PO-2026-001'), 1, 2000, 20000.00, 2000, 'Đã nhận đủ 2000 hộp'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2026-001'), 3, 200, 35000.00, 200, 'Đã nhận đủ 200 gói'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2026-002'), 2, 1500, 12000.00, 0, 'Chưa nhận hàng'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2026-003'), 5, 2000, 6000.00, 0, 'Đang chờ giao'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2026-004'), 4, 3000, 8000.00, 0, 'Đơn nháp chưa gửi');

-- 27. SHIFT HANDOVERS
INSERT INTO shift_handovers (
    handover_code, shift_id, from_user_id, to_user_id, cash_register_id,
    handover_time, cash_amount, expected_cash, actual_cash, variance,
    cash_breakdown, total_transactions, total_sales, total_refunds, total_customers,
    equipment_status, inventory_notes, low_stock_items, issues_reported,
    important_notes, confirmed, confirmed_at, status, dispute_reason,
    attachment_url, created_at, updated_at
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

-- 28. PAYROLL CALCULATIONS
INSERT IGNORE INTO payroll_calculations (
    user_id, pay_period_start, pay_period_end, payment_cycle,
    total_worked_days, regular_minutes, overtime_minutes,
    base_pay, overtime_pay, allowances, bonus_amount,
    total_deductions, gross_pay, net_pay,
    status, calculated_by, approved_by, calculated_at, approved_at,
    notes, created_at, updated_at
) VALUES
(1, '2026-02-01', '2026-02-28', 'MONTHLY', 20, 9600, 0, 30000000.00, 0.00, 1500000.00, 500000.00, 3000000.00, 32000000.00, 29000000.00, 'APPROVED', 2, 2, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Lương admin tháng 2', NOW(), NOW()),
(2, '2026-02-01', '2026-02-28', 'MONTHLY', 20, 9600, 0, 18000000.00, 0.00, 1000000.00, 300000.00, 1800000.00, 19300000.00, 17500000.00, 'APPROVED', 2, 1, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Lương manager tháng 2', NOW(), NOW()),
(3, '2026-02-01', '2026-02-28', 'MONTHLY', 19, 9300, 480, 11625000.00, 900000.00, 500000.00, 135000.00, 1500000.00, 13160000.00, 11660000.00, 'APPROVED', 2, 2, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Thu ngân ca sáng - Giờ công + OT', NOW(), NOW()),
(4, '2026-02-01', '2026-02-28', 'MONTHLY', 19, 9120, 300, 10944000.00, 540000.00, 500000.00, 76800.00, 1400000.00, 12060800.00, 10660800.00, 'APPROVED', 2, 2, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Thu ngân ca chiều - Giờ công + OT', NOW(), NOW()),
(5, '2026-02-01', '2026-02-28', 'MONTHLY', 19, 9120, 0, 13000000.00, 0.00, 400000.00, 130000.00, 1400000.00, 13530000.00, 12130000.00, 'APPROVED', 2, 1, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Quản lý kho tháng 2', NOW(), NOW()),
(6, '2026-02-01', '2026-02-28', 'MONTHLY', 18, 8400, 360, 9800000.00, 630000.00, 450000.00, 147000.00, 1200000.00, 11027000.00, 9827000.00, 'APPROVED', 2, 2, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Nhân viên bán hàng - Giờ công + OT', NOW(), NOW()),
(7, '2026-02-01', '2026-02-28', 'MONTHLY', 20, 9600, 0, 12500000.00, 0.00, 400000.00, 187500.00, 1300000.00, 13087500.00, 11787500.00, 'APPROVED', 2, 1, '2026-02-28 17:00:00', '2026-02-28 18:00:00', 'Nhân viên bán hàng tháng 2', NOW(), NOW()),

-- Current month payroll snapshots
(1, '2026-03-01', '2026-03-31', 'MONTHLY', 2, 960, 0, 3000000.00, 0.00, 150000.00, 50000.00, 300000.00, 3200000.00, 2900000.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Bảng lương tạm tính tháng 3', NOW(), NOW()),
(2, '2026-03-01', '2026-03-31', 'MONTHLY', 1, 540, 0, 900000.00, 0.00, 50000.00, 15000.00, 90000.00, 965000.00, 875000.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Bảng lương tạm tính tháng 3', NOW(), NOW()),
(3, '2026-03-01', '2026-03-31', 'MONTHLY', 2, 1045, 0, 1306250.00, 0.00, 50000.00, 13500.00, 150000.00, 1369750.00, 1219750.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Bảng lương tạm tính tháng 3', NOW(), NOW()),
(4, '2026-03-01', '2026-03-31', 'MONTHLY', 1, 543, 0, 651600.00, 0.00, 25000.00, 7000.00, 70000.00, 683600.00, 613600.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Bảng lương tạm tính tháng 3', NOW(), NOW()),
(5, '2026-03-01', '2026-03-31', 'MONTHLY', 1, 537, 0, 730000.00, 0.00, 25000.00, 8000.00, 75000.00, 763000.00, 688000.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Bảng lương tạm tính tháng 3', NOW(), NOW()),
(6, '2026-03-01', '2026-03-31', 'MONTHLY', 2, 829, 0, 966833.00, 0.00, 30000.00, 12000.00, 90000.00, 1008833.00, 918833.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Bảng lương tạm tính tháng 3', NOW(), NOW()),
(7, '2026-03-01', '2026-03-31', 'MONTHLY', 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 120000.00, 0.00, 0.00, 'CALCULATED', 2, NULL, '2026-03-02 18:00:00', NULL, 'Nghỉ không lương ngày 02/03', NOW(), NOW());

-- 29. SHIFT SWAP REQUESTS
INSERT IGNORE INTO shift_swap_requests (
    request_code, requester_id, original_shift_id, original_shift_date,
    target_user_id, target_shift_id, target_shift_date, swap_type,
    reason, status, approved_by, approved_at,
    rejection_reason, expiry_time, notes, created_at, updated_at
) VALUES
('SWAP-REQ-001', 3, 1, '2026-02-26', 4, 2, '2026-02-26', 'DIRECT_SWAP', 'Có việc gia đình buổi trưa, xin đổi ca sáng sang ca chiều', 'ACCEPTED', 2, '2026-02-21 10:15:00', NULL, '2026-02-26 23:59:59', 'Được phép - hai nhân viên đã thoả thuận', NOW(), NOW()),
('SWAP-REQ-002', 4, 2, '2026-02-28', 3, 1, '2026-02-28', 'DIRECT_SWAP', 'Xin đổi ca để hỗ trợ ca sáng tuần sau', 'PENDING', NULL, NULL, NULL, '2026-02-28 23:59:59', 'Nhờ đồng nghiệp đổi ca chiều thứ 6', NOW(), NOW()),
('SWAP-REQ-003', 6, 4, '2026-02-22', 7, 1, '2026-02-22', 'DIRECT_SWAP', 'Muốn đổi từ ca cuối tuần sang ca sáng', 'REJECTED', 2, '2026-02-19 15:00:00', 'Không đủ nhân sự ca sáng', '2026-02-26 23:59:59', 'Từ chối bởi quản lý', NOW(), NOW()),
('SWAP-REQ-004', 5, 1, '2026-02-25', 6, 4, '2026-02-25', 'DIRECT_SWAP', 'Trao đổi ca làm việc', 'CANCELLED', NULL, NULL, NULL, '2026-02-25 23:59:59', 'Tự huỷ do đã giải quyết việc cá nhân', NOW(), NOW());

-- 30. STOCK MOVEMENTS (Ghi chép chuyển động tồn kho)
INSERT IGNORE INTO stock_movements (
    variant_id, location_id, type, quantity, reference_type,
    reference_id, notes, batch_id, created_at
) VALUES
-- Nhập hàng từ PO
(1, 1, 'IN', 2000, 'PURCHASE_ORDER', 1, 'Nhập sữa Vinamilk từ nhà cung cấp', 1, '2026-02-10 08:00:00'),
(3, 3, 'IN', 200, 'PURCHASE_ORDER', 1, 'Nhập cà phê Nescafe từ nhà cung cấp', 3, '2026-02-10 08:30:00'),

-- Chuyển kho từ vị trí này sang vị trí khác
(1, 5, 'IN', 150, 'TRANSFER', 1, 'Bổ sung sữa lên kệ sale', NULL, '2026-02-15 10:00:00'),
(1, 1, 'OUT', 150, 'TRANSFER', 1, 'Xuất từ kho chính sang display zone', 1, '2026-02-15 10:00:00'),

-- Bán hàng
(4, 4, 'OUT', 4, 'SALE', 1, 'Bán Coca Cola qua POS-001', 4, '2026-02-24 09:31:00'),
(5, 5, 'OUT', 3, 'SALE', 1, 'Bán Oishi snack qua POS-001', 5, '2026-02-24 09:31:00'),
(1, 1, 'OUT', 4, 'SALE', 2, 'Bán sữa qua POS-001', 1, '2026-02-24 19:23:00'),
(3, 3, 'OUT', 1, 'SALE', 2, 'Bán cà phê qua POS-001', 3, '2026-02-24 19:23:00'),
(2, 2, 'OUT', 2, 'SALE', 3, 'Bán Dove soap qua POS-002', 2, '2026-02-25 20:10:00'),

-- Điều chỉnh kho (inventory count — chỉ các phiếu CONFIRMED mới tạo stock movement)
(1, 1, 'ADJUST', -5, 'INVENTORY_COUNT', 1, 'IC-2026-0001: kiểm kho thiếu 5 hộp sữa Fresh Milk 1L', 1, '2026-02-20 15:00:00'),
(3, 3, 'ADJUST', 1, 'INVENTORY_COUNT', 2, 'IC-2026-0002: kiểm kho thặng 1 gói Nescafe 3in1', 3, '2026-02-20 16:00:00');

-- 31. INVENTORY COUNTS (Phiếu kiểm kho — đủ vòng đời: CONFIRMED, PENDING, COUNTING, DRAFT, REJECTED)
-- Code format: IC-{year}-{seq4} — khớp với generateCode() trong InventoryCountService
INSERT IGNORE INTO inventory_counts (
    code, status, location_id, notes,
    total_shortage_value, total_overage_value, total_difference_value,
    created_by, confirmed_by, created_at, confirmed_at
) VALUES
-- Đã xác nhận: kiểm kho tháng 2 tại kho chính A1
('IC-2026-0001', 'CONFIRMED', 1, 'Kiểm kho định kỳ tháng 2 tại kho chính A1', 100000.00, 0.00, -100000.00, 5, 2, '2026-02-20 14:00:00', '2026-02-20 15:00:00'),
-- Đã xác nhận: kiểm kho tháng 2 tại kho lạnh B1
('IC-2026-0002', 'CONFIRMED', 3, 'Kiểm kho định kỳ tháng 2 tại kho lạnh B1', 0.00, 35000.00, 35000.00, 5, 2, '2026-02-20 14:30:00', '2026-02-20 16:00:00'),
-- Chờ duyệt: phiếu đã hoàn tất đếm, đang chờ quản lý phê duyệt
('IC-2026-0003', 'PENDING', 2, 'Kiểm kho khu vực kho B — chờ quản lý duyệt', 45000.00, 0.00, -45000.00, 5, NULL, '2026-02-22 09:00:00', NULL),
-- Đang kiểm: chưa hoàn thành đếm
('IC-2026-0004', 'COUNTING', 4, 'Kiểm kho khu vực kệ trưng bày C1 — đang đếm', NULL, NULL, NULL, 5, NULL, '2026-02-25 10:00:00', NULL),
-- Phiếu tạm (DRAFT): mới tạo, chưa bắt đầu
('IC-2026-0005', 'DRAFT', NULL, 'Phiếu kiểm kho tháng 3 — chưa bắt đầu', NULL, NULL, NULL, 5, NULL, '2026-03-01 08:00:00', NULL),
-- Đã từ chối: quản lý phát hiện lỗi dữ liệu
('IC-2026-0006', 'REJECTED', 5, 'Kiểm kho khu vực POS — bị từ chối do lỗi nhập liệu', 0.00, 0.00, 0.00, 5, NULL, '2026-02-23 11:00:00', NULL);

-- Cập nhật rejection_reason cho phiếu bị từ chối
UPDATE inventory_counts SET rejection_reason = 'Dữ liệu kiểm kê không khớp với biên lai nhập hàng. Cần kiểm tra lại lô hàng trước khi xác nhận.' WHERE code = 'IC-2026-0006';

-- 32. INVENTORY COUNT ITEMS
-- difference_value tính theo cost_price của batch tương ứng
INSERT IGNORE INTO inventory_count_items (
    inventory_count_id, product_id, system_quantity,
    actual_quantity, difference_quantity, difference_value, reason
) VALUES
-- IC-2026-0001 (CONFIRMED, location 1 — Kho A1): sữa thiếu 5, Dove OK
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0001'), 1, 250, 245, -5, -100000.00, 'SHRINKAGE'),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0001'), 2, 180, 180, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0001'), 6, 120, 120, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0001'), 11, 300, 300, 0, 0.00, NULL),
-- IC-2026-0002 (CONFIRMED, location 3 — Kho lạnh B1): cà phê thặng 1
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0002'), 3, 260, 261, 1, 35000.00, 'COUNTING_ERROR'),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0002'), 8, 150, 150, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0002'), 13, 400, 400, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0002'), 18, 280, 280, 0, 0.00, NULL),
-- IC-2026-0003 (PENDING, location 2 — Kho A2): xúc xích thiếu 1
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0003'), 7, 85, 84, -1, -45000.00, 'DAMAGE'),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0003'), 12, 500, 500, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0003'), 17, 320, 320, 0, 0.00, NULL),
-- IC-2026-0004 (COUNTING, location 4 — Kệ C1): chưa đếm hết
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0004'), 4, 510, 510, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0004'), 9, 200, NULL, NULL, NULL, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0004'), 14, 250, NULL, NULL, NULL, NULL),
-- IC-2026-0006 (REJECTED, location 5 — POS C2): đã điền nhưng bị từ chối
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0006'), 5, 390, 390, 0, 0.00, NULL),
((SELECT id FROM inventory_counts WHERE code = 'IC-2026-0006'), 10, 1000, 995, -5, -5000.00, 'OTHER');

-- 33. DISPOSAL VOUCHERS (Phiếu thanh lý hàng hỏng/lỗi)
INSERT IGNORE INTO disposal_vouchers (
    code, location_id, status, reason_type,
    notes, total_items, total_quantity, total_value,
    created_by, created_at, confirmed_by, confirmed_at
) VALUES
('DV-202602-001', 1, 'CONFIRMED', 'DAMAGED', 'Sản phẩm lỗi - vỏ hộp, không lỗi chất lượng nội dung', 1, 12, 180000.00, 5, '2026-02-18 13:30:00', 2, '2026-02-18 14:00:00'),
('DV-202602-002', 3, 'CONFIRMED', 'EXPIRED', 'Sản phẩm hết hạn sử dụng - tìm thấy khi kiểm kho', 1, 8, 96000.00, 5, '2026-02-22 10:00:00', 2, '2026-02-22 10:30:00'),
('DV-202602-003', 2, 'DRAFT', 'DAMAGED', 'Sản phẩm bị vỡ vỏ - hỏng trong quá trình lưu trữ', 1, 5, 75000.00, 5, '2026-02-25 11:00:00', NULL, NULL);

-- 34. DISPOSAL VOUCHER ITEMS
INSERT IGNORE INTO disposal_voucher_items (
    disposal_voucher_id, batch_id, product_id, batch_code,
    quantity, unit_cost, total_cost, expiry_date
) VALUES
((SELECT id FROM disposal_vouchers WHERE code = 'DV-202602-001'), 2, 2, 'DV2026001', 12, 15000.00, 180000.00, '2027-02-01'),
((SELECT id FROM disposal_vouchers WHERE code = 'DV-202602-002'), 3, 3, 'NC2026001', 8, 12000.00, 96000.00, '2026-02-01'),
((SELECT id FROM disposal_vouchers WHERE code = 'DV-202602-003'), 4, 4, 'CC2026001', 5, 15000.00, 75000.00, '2026-08-10');

-- 35. LOYALTY GIFTS (Quà tặng gift/rewards từ loyalty program)
INSERT IGNORE INTO loyalty_gifts (
    variant_id, name, required_points, stock, is_active, created_at
) VALUES
(4, 'Nước uống đặc biệt 500ml', 50, 150, TRUE, NOW()),
(3, 'Bộ cà phê hòa tan 3in1', 150, 80, TRUE, NOW()),
(2, 'Xà phòng Dove 90g', 75, 200, TRUE, NOW()),
(1, 'Sữa tươi Vinamilk 1L', 200, 50, TRUE, NOW()),
(5, 'Combo Snack Oishi', 100, 100, TRUE, NOW());

-- 36. GIFT REDEMPTION HISTORY (Lịch sử sử dụng quà tặng)
INSERT IGNORE INTO gift_redemption_history (
    customer_id, gift_id, points_used, redeemed_at
) VALUES
(1, (SELECT id FROM loyalty_gifts WHERE name = 'Nước uống đặc biệt 500ml' LIMIT 1), 50, '2026-02-15 10:30:00'),
(2, (SELECT id FROM loyalty_gifts WHERE name = 'Bộ cà phê hòa tan 3in1' LIMIT 1), 150, '2026-02-16 14:15:00'),
(3, (SELECT id FROM loyalty_gifts WHERE name = 'Xà phòng Dove 90g' LIMIT 1), 75, '2026-02-18 09:20:00'),
(4, (SELECT id FROM loyalty_gifts WHERE name = 'Sữa tươi Vinamilk 1L' LIMIT 1), 200, '2026-02-20 16:00:00'),
(1, (SELECT id FROM loyalty_gifts WHERE name = 'Combo Snack Oishi' LIMIT 1), 100, '2026-02-22 12:30:00');

-- 37. PURCHASE HISTORY (Phù hợp với legacy purchase history)
INSERT IGNORE INTO purchase_history (
    customer_id, customer_name, product_id, product_name,
    quantity, price, subtotal, payment_method, created_at
) VALUES
(1, 'Nguyen Van A', 4, 'Coca Cola 330ml', 2, 12000.00, 24000.00, 'CASH', '2026-02-24 09:30:00'),
(1, 'Nguyen Van A', 5, 'Oishi Snack', 3, 8000.00, 24000.00, 'CASH', '2026-02-24 09:30:00'),
(2, 'Tran Thi B', 1, 'Fresh Milk 1L', 2, 25000.00, 50000.00, 'CARD', '2026-02-24 19:20:00'),
(2, 'Tran Thi B', 3, 'Nescafe 3in1', 1, 45000.00, 45000.00, 'CARD', '2026-02-24 19:20:00'),
(3, 'Le Van C', 2, 'Dove Soap 90g', 2, 15000.00, 30000.00, 'MOMO', '2026-02-25 20:10:00'),
(1, 'Nguyen Van A', 1, 'Fresh Milk 1L', 1, 25000.00, 25000.00, 'CASH', '2026-02-26 10:15:00'),
(4, 'Pham Thi D', 4, 'Coca Cola 330ml', 5, 12000.00, 60000.00, 'CASH', '2026-02-26 14:30:00'),
(4, 'Pham Thi D', 5, 'Oishi Snack', 4, 8000.00, 32000.00, 'CASH', '2026-02-26 14:30:00'),
(2, 'Tran Thi B', 4, 'Coca Cola 330ml', 3, 12000.00, 36000.00, 'MOMO', '2026-02-27 08:45:00'),
(2, 'Tran Thi B', 2, 'Dove Soap 90g', 1, 15000.00, 15000.00, 'MOMO', '2026-02-27 08:45:00');

-- 28. REPORTS + AUDIT LOGS (from new seed)
INSERT IGNORE INTO reports (type, report_date, data, created_by, status, created_at, completed_at, report_name, format, file_path) VALUES
('Revenue', CURDATE(), '{"summary":"seed"}', 1, 'COMPLETED', NOW(), NOW(), 'Seed Revenue Report', 'PDF', NULL),
('Inventory', CURDATE(), '{"summary":"seed inventory"}', 5, 'COMPLETED', NOW(), NOW(), 'Seed Inventory Report', 'PDF', NULL),
('Attendance', CURDATE(), '{"summary":"seed attendance"}', 1, 'COMPLETED', NOW(), NOW(), 'Seed Attendance Report', 'PDF', NULL);

INSERT IGNORE INTO audit_logs (user_id, action, entity_name, entity_id, changes, created_at, result, source, details) VALUES
(1, 'LOGIN', 'User', 1, '{"event":"seed login"}', NOW(), 'OK', 'SYSTEM', 'Initial seed log'),
(2, 'CREATE', 'Campaign', 1, '{"campaign_code":"CAMP-202602-001"}', NOW(), 'OK', 'SYSTEM', 'Created campaign seed'),
(5, 'CREATE', 'InventoryCount', 1, '{"count_code":"IC-2026-0001"}', NOW(), 'OK', 'SYSTEM', 'Created inventory count seed'),
(5, 'CONFIRM', 'InventoryCount', 1, '{"count_code":"IC-2026-0001","confirmed_by":2}', NOW(), 'OK', 'SYSTEM', 'Confirmed inventory count IC-2026-0001'),
(5, 'CONFIRM', 'InventoryCount', 2, '{"count_code":"IC-2026-0002","confirmed_by":2}', NOW(), 'OK', 'SYSTEM', 'Confirmed inventory count IC-2026-0002'),
(5, 'SUBMIT', 'InventoryCount', 3, '{"count_code":"IC-2026-0003"}', NOW(), 'OK', 'SYSTEM', 'Submitted IC-2026-0003 for approval'),
(2, 'REJECT', 'InventoryCount', 6, '{"count_code":"IC-2026-0006","reason":"Du lieu khong khop"}', NOW(), 'OK', 'SYSTEM', 'Rejected inventory count IC-2026-0006');

-- =============================================================================
-- ADVERTISEMENTS & AD CONTRACTS
-- =============================================================================
INSERT INTO advertisements (
    slot, sponsor_name, title, subtitle, image_url, link_url,
    cta_text, cta_color, bg_color, is_active,
    contract_number, contract_value, contract_start, contract_end,
    payment_terms, contact_person, contact_email, contact_phone, notes,
    created_at, updated_at
) VALUES
(
    'LEFT',
    'SmallTrend Brand',
    'Mega Sale 50% OFF',
    'Ưu đãi cuối tuần cho mọi sản phẩm',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
    '',
    'Mua ngay',
    '#4f46e5',
    '#ffffff',
    TRUE,
    'AD-2026-LEFT-001',
    5000000.00,
    '2026-01-01',
    '2026-12-31',
    'Thanh toán hàng quý, net 30 ngày',
    'Nguyễn Văn Marketing',
    'marketing@smalltrend.vn',
    '0901-234-567',
    'Hợp đồng quảng cáo nội bộ, ưu tiên slot trái toàn năm 2026',
    NOW(), NOW()
),
(
    'RIGHT',
    'Express Delivery Partner',
    'Giao hàng miễn phí',
    'Đơn từ 200.000đ — giao trong 2h',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
    '',
    'Đặt ngay',
    '#059669',
    '#f0fdf4',
    TRUE,
    'AD-2026-RIGHT-001',
    12000000.00,
    '2026-01-01',
    '2026-06-30',
    'Thanh toán hàng tháng vào ngày 15',
    'Trần Thị Logistics',
    'ads@expressdelivery.vn',
    '0912-345-678',
    'Đối tác giao hàng nhanh khu vực HCM & Hà Nội. Hợp đồng gia hạn mỗi 6 tháng.',
    NOW(), NOW()
);

-- =============================================================================
-- End of SmallTrend Combined Sample Data
-- =============================================================================
