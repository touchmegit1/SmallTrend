
-- =============================================================================
-- V2__seed_basic_data.sql
-- SmallTrend Grocery Store Basic Master Data
-- =============================================================================

-- Insert Brands
INSERT IGNORE
INTO brands
(id, name) VALUES
(1, 'Vinamilk'),
(2, 'Nestle'),
(3, 'Coca-Cola'),
(4, 'Unilever'),
(5, 'P&G');

-- Insert Categories  
INSERT IGNORE
INTO categories
(id, name) VALUES
(1, 'Food & Beverage'),
(2, 'Personal Care'),
(3, 'Household Items'),
(4, 'Health & Medicine'),
(5, 'Snacks & Confectionery');

-- Insert Suppliers
INSERT IGNORE
INTO suppliers
(id, name, contact_info) VALUES
(1, 'Vinamilk Distribution', 'sales@vinamilk.com.vn | 1800 1199'),
(2, 'Unilever Vietnam', 'contact@unilever.com.vn | 1800 5588'),
(3, 'Nestle Vietnam', 'info@nestle.com.vn | 1800 6793'),
(4, 'FMCG Distributor Co', 'order@fmcgdist.com.vn | 1900 2468'),
(5, 'Local Wholesale Market', 'wholesale@localmarket.vn | 0909123456');

-- Insert Tax Rates
INSERT IGNORE
INTO tax_rates
(id, name, rate, is_active) VALUES
(1, 'VAT Standard', 10.00, 1),
(2, 'VAT Reduced', 5.00, 1),
(3, 'Import Tax', 15.00, 1),
(4, 'Luxury Tax', 20.00, 1),
(5, 'No Tax', 0.00, 1);

-- Insert Roles
INSERT IGNORE
INTO roles
(id, name, description) VALUES
(1, 'ADMIN', 'System Administrator'),
(2, 'MANAGER', 'Store Manager'),
(3, 'CASHIER', 'Cashier Staff'),
(4, 'INVENTORY_STAFF', 'Inventory Staff'),
(5, 'SALES_STAFF', 'Sales Staff');

-- Insert Permissions
INSERT IGNORE
INTO permissions
(id, name, description) VALUES
(1, 'USER_MANAGEMENT', 'User Management'),
(2, 'PRODUCT_MANAGEMENT', 'Product Management'),
(3, 'INVENTORY_MANAGEMENT', 'Inventory Management'),
(4, 'SALES_PROCESSING', 'Sales Processing'),
(5, 'REPORT_VIEWING', 'Report Viewing');

-- Insert Role Permissions
INSERT IGNORE
INTO role_permissions
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

-- Insert Locations
INSERT IGNORE
INTO locations
(id, name, type, location_code, address, capacity, description, status, created_at) VALUES
(1, 'Kệ hàng chính', 'SHELF', 'KE-001', 'Tầng 1, dãy A', 150, 'Kệ trưng bày hàng hóa chính trong cửa hàng', 'ACTIVE', '2024-01-01 00:00:00'),
(2, 'Kho phía sau', 'STORAGE', 'KHO-001', 'Phòng kho phía sau', 300, 'Kho lưu trữ hàng tồn, hàng nhập mới', 'ACTIVE', '2024-01-01 00:00:00'),
(3, 'Khu trưng bày cửa', 'DISPLAY_AREA', 'TB-001', 'Khu vực cửa ra vào', 50, 'Khu vực trưng bày sản phẩm khuyến mãi', 'ACTIVE', '2024-01-01 00:00:00'),
(4, 'Tủ lạnh / Kho lạnh', 'COLD_STORAGE', 'TL-001', 'Góc phải cửa hàng', 80, 'Tủ lạnh bảo quản đồ tươi sống, sữa, nước giải khát', 'ACTIVE', '2024-01-01 00:00:00'),
(5, 'Quầy thu ngân', 'CASHIER', 'QTN-001', 'Khu vực cửa ra', 30, 'Khu vực quầy thanh toán, bày kẹo bánh nhỏ', 'ACTIVE', '2024-01-01 00:00:00');

-- Insert Shelf Bins
INSERT IGNORE
INTO shelves_bins
(id, location_id, bin_code) VALUES
(1, 1, 'A-01-001'),
(2, 1, 'A-01-002'),
(3, 2, 'B-02-001'),
(4, 3, 'C-03-001'),
(5, 4, 'D-04-001');

-- Insert Promotions
INSERT IGNORE
INTO promotions
(id, name, start_date, end_date, is_active) VALUES
(1, 'Tet Sale 2024', '2024-02-01', '2024-02-29', 1),
(2, 'Back to School', '2024-08-01', '2024-08-31', 0),
(3, 'Black Friday', '2024-11-24', '2024-11-30', 0),
(4, 'Christmas Sale', '2024-12-20', '2024-12-31', 0),
(5, 'New Year Deal', '2025-01-01', '2025-01-15', 0);

-- Insert Promotion Conditions
INSERT IGNORE
INTO promotion_conditions
(id, promotion_id, min_order_value, discount_percent) VALUES
(1, 1, 100000.00, 5.00),
(2, 1, 200000.00, 8.00),
(3, 2, 150000.00, 10.00),
(4, 3, 50000.00, 15.00),
(5, 4, 300000.00, 12.00);

-- Insert Shifts
INSERT IGNORE
INTO shifts
(id, name, date, start_time, end_time) VALUES
(1, 'Morning Shift', '2024-02-26', '08:00:00', '12:00:00'),
(2, 'Afternoon Shift', '2024-02-26', '13:00:00', '17:00:00'),
(3, 'Evening Shift', '2024-02-26', '18:00:00', '22:00:00'),
(4, 'Morning Shift', '2024-02-27', '08:00:00', '12:00:00'),
(5, 'Afternoon Shift', '2024-02-27', '13:00:00', '17:00:00');