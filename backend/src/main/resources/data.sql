-- ==============================================================
-- SmallTrend - Simple seed data (no Flyway)
-- Used by run-seed.cmd with JPA create-drop + spring.sql.init.mode=always
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sale_order_items;
TRUNCATE TABLE sale_orders;
TRUNCATE TABLE inventory_stock;
TRUNCATE TABLE product_batches;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE locations;
TRUNCATE TABLE units;
TRUNCATE TABLE reports;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE user_credentials;
TRUNCATE TABLE customers;
TRUNCATE TABLE customer_tiers;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE tax_rates;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
TRUNCATE TABLE cash_registers;

SET FOREIGN_KEY_CHECKS = 1;

-- 1) Master data
INSERT IGNORE INTO brands (name) VALUES
('Vinamilk'), ('Nestle'), ('Coca-Cola'), ('Unilever');

INSERT IGNORE INTO categories (name) VALUES
('Beverages'), ('Dairy Products'), ('Personal Care'), ('Snacks');

INSERT IGNORE INTO tax_rates (name, rate, is_active) VALUES
('VAT Standard', 10.00, 1),
('VAT Reduced', 5.00, 1),
('No Tax', 0.00, 1);

INSERT IGNORE INTO suppliers (name, tax_code, address, email, phone, contact_person, active, notes) VALUES
('Vinamilk Distribution', '0100170098', 'District 7, HCMC', 'sales@vinamilk.com.vn', '1800-1199', 'Nguyen Van A', TRUE, 'Core supplier'),
('Nestle Vietnam', '0302127854', 'Thu Duc, HCMC', 'info@nestle.com.vn', '1900-6011', 'Le Van C', TRUE, 'Core supplier');

-- 2) Security data
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
('REPORT_VIEWING', 'Report Viewing');

INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),
(2,2),(2,3),(2,4),(2,5),
(3,4),(4,2),(4,3),(5,4);

-- Password: password
INSERT INTO users (username, password, active, full_name, email, phone, address, status, role_id) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', 'HCMC', 'ACTIVE', 1),
('manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', 'HCMC', 'ACTIVE', 2),
('cashier', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', TRUE, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', 'HCMC', 'ACTIVE', 3)
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

INSERT IGNORE INTO user_credentials (user_id, username, password_hash) VALUES
(1, 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(2, 'manager', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
(3, 'cashier', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG');

-- 3) Customers
INSERT IGNORE INTO customer_tiers (tier_code, tier_name, min_points, max_points, min_spending, points_multiplier, discount_rate, color, is_active, priority) VALUES
('BRONZE', 'Dong', 0, 499, 0.00, 1.0, 0.00, '#CD7F32', TRUE, 1),
('SILVER', 'Bac', 500, 1499, 5000000.00, 1.5, 2.00, '#C0C0C0', TRUE, 2);

INSERT IGNORE INTO customers (name, phone, loyalty_points) VALUES
('Nguyen Van A', '0987654321', 150),
('Tran Thi B', '0976543210', 800);

-- 4) Product + Inventory
INSERT IGNORE INTO units (code, name, material_type, symbol, default_sell_price, default_cost_price) VALUES
('L', 'Lit', 'LIQUID', 'L', 25000.00, 20000.00),
('ML', 'Milliliter', 'LIQUID', 'ml', 12000.00, 8000.00),
('EA', 'Each', 'SOLID', 'ea', 8000.00, 6000.00);

INSERT IGNORE INTO products (name, description, brand_id, category_id, tax_rate_id, is_active, created_at, updated_at) VALUES
('Fresh Milk 1L', 'Vinamilk Fresh Milk', 1, 2, 2, TRUE, NOW(6), NOW(6)),
('Coca Cola 330ml', 'Coca Cola Classic', 3, 1, 1, TRUE, NOW(6), NOW(6)),
('Oishi Snack', 'Potato Chips 50g', 2, 4, 1, TRUE, NOW(6), NOW(6));

INSERT IGNORE INTO product_variants (product_id, sku, barcode, unit_id, sell_price, is_active, created_at, updated_at) VALUES
(1, 'VMILK-1L', '8901234567890', 1, 25000.00, TRUE, NOW(6), NOW(6)),
(2, 'COCA-330ML', '8901234567893', 2, 12000.00, TRUE, NOW(6), NOW(6)),
(3, 'OISHI-50G', '8901234567894', 3, 8000.00, TRUE, NOW(6), NOW(6));

INSERT IGNORE INTO locations (name, type, zone, grid_row, grid_col, grid_level) VALUES
('Main Warehouse A1', 'STORAGE', 'A', 1, 1, 1),
('POS Display C1', 'DISPLAY', 'C', 1, 1, 1);

INSERT IGNORE INTO product_batches (variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(1, 'VM2026001', 20000.00, '2026-01-15', '2026-04-15'),
(2, 'CC2026001', 8000.00, '2026-02-10', '2026-08-10'),
(3, 'OI2026001', 6000.00, '2026-02-01', '2026-06-01');

INSERT IGNORE INTO inventory_stock (variant_id, location_id, batch_id, quantity) VALUES
(1, 1, 1, 120),
(2, 2, 2, 220),
(3, 2, 3, 180);

-- 5) POS + Sales (for dashboard/AI stats)
INSERT IGNORE INTO cash_registers (
    register_code, register_name, store_name, location, register_type, status,
    current_cash, opening_balance, total_transactions_today, created_at, updated_at
) VALUES
('POS-001', 'Quay 1', 'SmallTrend Store', 'Front Counter', 'MAIN', 'ACTIVE', 5000000.00, 2000000.00, 0, NOW(), NOW());

INSERT IGNORE INTO sale_orders (
    order_code, customer_id, cashier_id, cash_register_id, order_date,
    subtotal, tax_amount, discount_amount, total_amount, payment_method, status, notes,
    created_at, updated_at
) VALUES
('SO-20260227-001', 1, 3, 1, NOW() - INTERVAL 2 HOUR, 49000.00, 4900.00, 0.00, 53900.00, 'CASH', 'COMPLETED', 'Sample order 1', NOW(), NOW()),
('SO-20260227-002', 2, 3, 1, NOW() - INTERVAL 1 HOUR, 36000.00, 3600.00, 0.00, 39600.00, 'CARD', 'COMPLETED', 'Sample order 2', NOW(), NOW());

INSERT IGNORE INTO sale_order_items (
    sale_order_id, product_variant_id, product_name, sku, quantity,
    unit_price, line_discount_amount, line_tax_amount, line_total_amount, notes
) VALUES
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260227-001'), 1, 'Fresh Milk 1L', 'VMILK-1L', 1, 25000.00, 0.00, 2500.00, 27500.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260227-001'), 2, 'Coca Cola 330ml', 'COCA-330ML', 2, 12000.00, 0.00, 2400.00, 26400.00, NULL),
((SELECT id FROM sale_orders WHERE order_code = 'SO-20260227-002'), 3, 'Oishi Snack', 'OISHI-50G', 3, 8000.00, 0.00, 2400.00, 26400.00, NULL);

-- 6) Minimal report/audit records
INSERT IGNORE INTO reports (type, report_date, data, created_by, status, created_at, completed_at, report_name, format, file_path) VALUES
('Revenue', CURDATE(), '{"summary":"seed"}', 1, 'COMPLETED', NOW(), NOW(), 'Seed Revenue Report', 'PDF', NULL);

INSERT IGNORE INTO audit_logs (user_id, action, entity_name, entity_id, changes, created_at, result, source, details) VALUES
(1, 'LOGIN', 'User', 1, '{"event":"seed login"}', NOW(), 'OK', 'SYSTEM', 'Initial seed log');
