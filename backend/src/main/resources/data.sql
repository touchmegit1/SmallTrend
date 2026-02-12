-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE - Essential Basic Data
-- =============================================================================

-- Insert Essential Reference Data
INSERT INTO brands (name) VALUES
('Vinamilk'), ('Nestle'), ('Coca-Cola'), ('Unilever'), ('P&G');

INSERT INTO categories (name) VALUES
('Food & Beverage'), ('Personal Care'), ('Household Items'), ('Health & Medicine'), ('Snacks & Confectionery');

INSERT INTO suppliers (name, contact_info) VALUES
('Vinamilk Distribution', 'sales@vinamilk.com.vn | 1800 1199'),
('Unilever Vietnam', 'contact@unilever.com.vn | 1800 5588'),
('Nestle Vietnam', 'info@nestle.com.vn | 1900 6011');

INSERT INTO tax_rates (name, rate, is_active) VALUES
('VAT Standard', 10.00, 1), 
('VAT Reduced', 5.00, 1), 
('No Tax', 0.00, 1);

INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator'), 
('MANAGER', 'Store Manager'), 
('CASHIER', 'Cashier Staff'), 
('INVENTORY_STAFF', 'Inventory Staff'), 
('SALES_STAFF', 'Sales Staff');

INSERT INTO permissions (name, description) VALUES
('USER_MANAGEMENT', 'User Management'), 
('PRODUCT_MANAGEMENT', 'Product Management'),
('INVENTORY_MANAGEMENT', 'Inventory Management'), 
('SALES_PROCESSING', 'Sales Processing'), 
('REPORT_VIEWING', 'Report Viewing'),
('ADMIN_ACCESS', 'Admin Access'),
('CUSTOMER_MANAGEMENT', 'Customer Management'),
('SUPPLIER_MANAGEMENT', 'Supplier Management'),
('FINANCIAL_MANAGEMENT', 'Financial Management');

INSERT INTO role_permissions (role_id, permission_id) VALUES
-- ADMIN - all permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
-- MANAGER - most permissions except admin
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 7), (2, 8), (2, 9),
-- CASHIER - sales only
(3, 4), (3, 7),
-- INVENTORY - inventory and products  
(4, 2), (4, 3),
-- SALES - sales and customers
(5, 4), (5, 7);

-- Insert Essential Users (password: "password123" for all users - hashed with BCrypt)
INSERT INTO users (full_name, email, phone, address, status, role_id, salary_type, base_salary, hourly_rate, created_at, updated_at) VALUES
('Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, Ho Chi Minh City', 'ACTIVE', 1, 'MONTHLY', 25000000.00, NULL, NOW(), NOW()),
('Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, Ho Chi Minh City', 'ACTIVE', 2, 'MONTHLY', 20000000.00, NULL, NOW(), NOW()),
('Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, Ho Chi Minh City', 'ACTIVE', 3, 'HOURLY', 12000000.00, 50000.00, NOW(), NOW()),
('Pham Thi Inventory', 'inventory@smalltrend.com', '0934567890', '101 Tran Hung Dao, Ho Chi Minh City', 'ACTIVE', 4, 'MONTHLY', 15000000.00, NULL, NOW(), NOW()),
('Hoang Van Sales', 'sales@smalltrend.com', '0945678901', '202 Vo Van Tan, Ho Chi Minh City', 'ACTIVE', 5, 'HOURLY', 10000000.00, 45000.00, NOW(), NOW());

-- Insert User Credentials (password: "password123" - BCryptPasswordEncoder with strength 12)
INSERT INTO user_credentials (user_id, username, password_hash) VALUES
(1, 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW'),
(2, 'manager', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW'),
(3, 'cashier', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW'),
(4, 'inventory', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW'),
(5, 'sales', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfuC.eRwNJ5gXvAIEe4iCW');

-- Insert Basic Customers
INSERT INTO customers (name, phone, loyalty_points) VALUES
('Nguyen Van A', '0987654321', 150), 
('Tran Thi B', '0976543210', 250),
('Le Van C', '0965432109', 100),
('Pham Thi D', '0954321098', 300);

-- Insert Basic Products
INSERT INTO products (name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
('Fresh Milk 1L', 'Vinamilk Fresh Milk 1 Liter Pack', 'https://example.com/vinamilk1l.jpg', 1, 1, 2),
('Dove Soap Bar', 'Unilever Dove Beauty Bar 90g', 'https://example.com/dove.jpg', 4, 2, 1),
('Nescafe Instant Coffee', 'Nestle Nescafe 3-in-1 Coffee 20g x 10 sachets', 'https://example.com/nescafe.jpg', 2, 1, 1),
('Coca Cola 330ml', 'Coca Cola Classic 330ml Can', 'https://example.com/cocacola.jpg', 3, 1, 1);

-- Insert Basic Product Variants
INSERT INTO product_variants (product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(1, 'VMILK-1L-001', '8901234567890', 25000.00, 1, 'https://example.com/vinamilk1l.jpg'),
(2, 'DOVE-90G-001', '8901234567891', 15000.00, 1, 'https://example.com/dove90.jpg'),
(3, 'NESCAFE-200G-001', '8901234567892', 45000.00, 1, 'https://example.com/nescafe200.jpg'),
(4, 'COCA-330ML-001', '8901234567893', 12000.00, 1, 'https://example.com/coca330.jpg');

-- Insert Basic Locations
INSERT INTO locations (name, type) VALUES
('Main Warehouse', 'WAREHOUSE'), 
('Showroom A1', 'SHOWROOM'),
('Storage Room B1', 'STORAGE');

-- Insert Basic Shelf Bins
INSERT INTO shelves_bins (location_id, bin_code) VALUES
(1, 'A-01-001'), (1, 'A-01-002'), (1, 'A-01-003'),
(2, 'B-02-001'), (2, 'B-02-002'),
(3, 'C-03-001');

-- Insert Basic Product Batches
INSERT INTO product_batches (variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(1, 'VM2024001', 20000.00, '2024-01-15', '2024-04-15'),
(2, 'DV2024001', 12000.00, '2024-02-15', '2025-02-15'),
(3, 'NC2024001', 35000.00, '2024-01-20', '2025-01-20'),
(4, 'CC2024001', 8000.00, '2024-02-10', '2024-08-10');

-- Insert Basic Inventory Stock
INSERT INTO inventory_stock (variant_id, batch_id, bin_id, quantity) VALUES
(1, 1, 1, 250), 
(2, 2, 2, 220),
(3, 3, 3, 180),
(4, 4, 4, 300);

-- Insert Basic Shifts
INSERT INTO shifts (name, date, start_time, end_time) VALUES
('Morning Shift', CURDATE(), '08:00:00', '16:00:00'),
('Evening Shift', CURDATE(), '16:00:00', '00:00:00'),
('Night Shift', CURDATE(), '00:00:00', '08:00:00');

-- Insert Basic Salary Configs
INSERT INTO salary_configs (user_id, base_salary, hourly_rate, overtime_rate_multiplier, allowances, bonus_percentage, is_active, effective_from, created_at, updated_at) VALUES
(1, 25000000.00, NULL, 1.5, 2000000.00, 10.00, 1, NOW(), NOW(), NOW()),
(2, 20000000.00, NULL, 1.5, 1500000.00, 8.00, 1, NOW(), NOW(), NOW()),
(3, 12000000.00, 50000.00, 1.5, 500000.00, 5.00, 1, NOW(), NOW(), NOW()),
(4, 15000000.00, NULL, 1.5, 800000.00, 6.00, 1, NOW(), NOW(), NOW()),
(5, 10000000.00, 45000.00, 1.5, 300000.00, 4.00, 1, NOW(), NOW(), NOW());

-- Insert Tax Classes
INSERT INTO tax_classes (code, name, description) VALUES
('STANDARD', 'Standard Tax', 'Standard tax rate for most products'),
('REDUCED', 'Reduced Tax', 'Reduced tax rate for essential goods'),
('EXEMPT', 'Tax Exempt', 'No tax applied');

-- Insert Tax Zones
INSERT INTO tax_zones (name, country_code, state_region, city, postal_code_from, postal_code_to, is_active) VALUES
('Ho Chi Minh City', 'VN', 'Ho Chi Minh', 'Ho Chi Minh City', '700000', '799999', 1),
('Hanoi', 'VN', 'Hanoi', 'Hanoi', '100000', '199999', 1),
('Da Nang', 'VN', 'Da Nang', 'Da Nang', '550000', '559999', 1);

-- Create default tax rules
INSERT INTO tax_rules (class_id, tax_rate_id, zone_id, priority, start_date, end_date, compound, is_active) VALUES
(1, 1, 1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 0, 1),
(2, 2, 1, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 0, 1),
(3, 3, 1, 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 0, 1);