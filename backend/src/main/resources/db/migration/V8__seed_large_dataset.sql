-- =============================================================================
-- V8__seed_large_dataset.sql
-- Generated dummy data for Report testing (Jan-Feb 2026)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Insert Products, Variants, Batches, Inventory (IDs 10-29)
-- -----------------------------------------------------------------------------

-- Categories: 1:Food, 2:Personal Care, 3:Household, 4:Health, 5:Snacks

-- Product 10: Oreo
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(10, 'Oreo Cookies', 'Delicious cream cookies', 'https://placehold.co/400?text=Oreo', 5, 5, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(10, 10, 'SKU-0010', '8930000010', 10000, 1, 'https://placehold.co/400?text=Oreo');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(10, 10, 'BATCH-10', 7000, '2025-01-01', '2026-12-31');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(10, 10, 10, 1, 250);

-- Product 11: Choco Pie
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(11, 'Choco Pie', 'Marshmallow filled cake', 'https://placehold.co/400?text=ChocoPie', 5, 5, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(11, 11, 'SKU-0011', '8930000011', 15000, 1, 'https://placehold.co/400?text=ChocoPie');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(11, 11, 'BATCH-11', 10500, '2025-01-01', '2026-12-31');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(11, 11, 11, 1, 300);

-- Product 12: Lay's Classic
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(12, 'Lays Classic', 'Potato chips', 'https://placehold.co/400?text=Lays', 5, 5, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(12, 12, 'SKU-0012', '8930000012', 12000, 1, 'https://placehold.co/400?text=Lays');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(12, 12, 'BATCH-12', 8400, '2025-01-01', '2026-06-30');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(12, 12, 12, 1, 150);

-- Product 13: Pringles Explain
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(13, 'Pringles Original', 'Potato crisps', 'https://placehold.co/400?text=Pringles', 5, 5, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(13, 13, 'SKU-0013', '8930000013', 25000, 1, 'https://placehold.co/400?text=Pringles');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(13, 13, 'BATCH-13', 17500, '2025-02-01', '2027-02-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(13, 13, 13, 1, 200);

-- Product 14: Colgate
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(14, 'Colgate Toothpaste', 'Anti-cavity', 'https://placehold.co/400?text=Colgate', 2, 2, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(14, 14, 'SKU-0014', '8930000014', 35000, 1, 'https://placehold.co/400?text=Colgate');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(14, 14, 'BATCH-14', 24500, '2025-01-01', '2027-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(14, 14, 14, 1, 500);

-- Product 15: Sensodyne
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(15, 'Sensodyne Repair', 'Sensitive teeth', 'https://placehold.co/400?text=Sensodyne', 2, 2, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(15, 15, 'SKU-0015', '8930000015', 55000, 1, 'https://placehold.co/400?text=Sensodyne');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(15, 15, 'BATCH-15', 38500, '2025-01-01', '2027-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(15, 15, 15, 1, 120);

-- Product 16: Lifebuoy
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(16, 'Lifebuoy Handwash', 'Antibacterial', 'https://placehold.co/400?text=Lifebuoy', 4, 2, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(16, 16, 'SKU-0016', '8930000016', 40000, 1, 'https://placehold.co/400?text=Lifebuoy');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(16, 16, 'BATCH-16', 28000, '2025-01-01', '2026-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(16, 16, 16, 1, 400);

-- Product 17: Omo
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(17, 'Omo Matic', 'Laundry liquid', 'https://placehold.co/400?text=Omo', 4, 3, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(17, 17, 'SKU-0017', '8930000017', 120000, 1, 'https://placehold.co/400?text=Omo');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(17, 17, 'BATCH-17', 84000, '2025-01-01', '2027-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(17, 17, 17, 1, 100);

-- Product 18: Comfort
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(18, 'Comfort Softener', 'Fabric softener', 'https://placehold.co/400?text=Comfort', 4, 3, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(18, 18, 'SKU-0018', '8930000018', 80000, 1, 'https://placehold.co/400?text=Comfort');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(18, 18, 'BATCH-18', 56000, '2025-01-01', '2027-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(18, 18, 18, 1, 150);

-- Product 19: Sunlight
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(19, 'Sunlight Dishwash', 'Lemon extract', 'https://placehold.co/400?text=Sunlight', 4, 3, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(19, 19, 'SKU-0019', '8930000019', 25000, 1, 'https://placehold.co/400?text=Sunlight');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(19, 19, 'BATCH-19', 17500, '2025-01-01', '2027-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(19, 19, 19, 1, 300);

-- Product 20: Panadol
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(20, 'Panadol Extra', 'Pain relief', 'https://placehold.co/400?text=Panadol', 5, 4, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(20, 20, 'SKU-0020', '8930000020', 15000, 1, 'https://placehold.co/400?text=Panadol');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(20, 20, 'BATCH-20', 10500, '2025-01-01', '2028-01-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(20, 20, 20, 1, 1000);

-- Product 21: Red Bull
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(21, 'Red Bull', 'Energy drink', 'https://placehold.co/400?text=RedBull', 3, 1, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(21, 21, 'SKU-0021', '8930000021', 12000, 1, 'https://placehold.co/400?text=RedBull');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(21, 21, 'BATCH-21', 8400, '2025-01-01', '2026-06-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(21, 21, 21, 1, 500);

-- Product 22: Sting
INSERT INTO products (id, name, description, image_url, brand_id, category_id, tax_rate_id) VALUES
(22, 'Sting Strawberry', 'Energy drink', 'https://placehold.co/400?text=Sting', 3, 1, 1);
INSERT INTO product_variants (id, product_id, sku, barcode, sell_price, is_active, image_url) VALUES
(22, 22, 'SKU-0022', '8930000022', 10000, 1, 'https://placehold.co/400?text=Sting');
INSERT INTO product_batches (id, variant_id, batch_number, cost_price, mfg_date, expiry_date) VALUES
(22, 22, 'BATCH-22', 7000, '2025-01-01', '2026-06-01');
INSERT INTO inventory_stock (id, variant_id, batch_id, bin_id, quantity) VALUES
(22, 22, 22, 1, 600);

-- -----------------------------------------------------------------------------
-- 2. Insert Customers (IDs 10-29)
-- -----------------------------------------------------------------------------
INSERT INTO customers (id, name, phone, loyalty_points) VALUES
(10, 'Nguyen Van Hoa', '0901000010', 50),
(11, 'Tran Thi Mai', '0901000011', 120),
(12, 'Le Van Hung', '0901000012', 200),
(13, 'Pham Thi Lan', '0901000013', 0),
(14, 'Hoang Van Tuan', '0901000014', 80),
(15, 'Doan Thi Ngoc', '0901000015', 300),
(16, 'Vo Van Kiet', '0901000016', 45),
(17, 'Dang Thi Thuy', '0901000017', 10),
(18, 'Bui Van Long', '0901000018', 150),
(19, 'Ngo Thi Bich', '0901000019', 90),
(20, 'Duong Van Minh', '0901000020', 250),
(21, 'Ly Thi Hang', '0901000021', 60),
(22, 'Nguyen Van Nam', '0901000022', 110),
(23, 'Tran Thi Thu', '0901000023', 30),
(24, 'Le Van Phuc', '0901000024', 210),
(25, 'Pham Thi Huong', '0901000025', 55),
(26, 'Hoang Van Son', '0901000026', 130),
(27, 'Doan Thi Kim', '0901000027', 40),
(28, 'Vo Van Tai', '0901000028', 180),
(29, 'Dang Thi Anh', '0901000029', 75);

-- -----------------------------------------------------------------------------
-- 3. Insert Sales Orders (IDs 10-50, Dates in Jan-Feb 2026)
-- -----------------------------------------------------------------------------
-- Jan 1-10
INSERT INTO sales_orders (id, cashier_id, customer_id, order_date, payment_method, total_amount) VALUES
(10, 3, 10, '2026-01-02 09:30:00', 'CASH', 20000), -- 2 Oreo
(11, 3, 11, '2026-01-03 14:15:00', 'CREDIT_CARD', 50000), -- 2 Pringles
(12, 5, 12, '2026-01-05 11:20:00', 'QR_CODE', 120000), -- 1 Omo
(13, 3, 13, '2026-01-06 16:45:00', 'CASH', 35000), -- 1 Colgate
(14, 5, 14, '2026-01-08 10:10:00', 'CASH', 30000), -- 2 Choco Pie

-- Jan 11-20
(15, 3, 15, '2026-01-12 13:30:00', 'CREDIT_CARD', 55000), -- 1 Sensodyne
(16, 5, 16, '2026-01-14 09:00:00', 'QR_CODE', 40000), -- 1 Lifebuoy
(17, 3, 17, '2026-01-16 15:20:00', 'CASH', 15000), -- 1 Panadol
(18, 5, 18, '2026-01-18 10:45:00', 'BANK_TRANSFER', 80000), -- 1 Comfort
(19, 3, 19, '2026-01-20 12:10:00', 'CASH', 24000), -- 2 Lay's

-- Jan 21-31
(20, 5, 20, '2026-01-22 17:30:00', 'QR_CODE', 60000), -- 4 Choco Pie
(21, 3, 21, '2026-01-24 11:15:00', 'CASH', 25000), -- 1 Sunlight
(22, 5, 22, '2026-01-26 14:50:00', 'CREDIT_CARD', 12000), -- 1 Red Bull
(23, 3, 23, '2026-01-28 09:40:00', 'CASH', 20000), -- 2 Sting
(24, 5, 24, '2026-01-31 16:00:00', 'QR_CODE', 45000), -- 3 Choco Pie

-- Feb 1-10
(25, 3, 25, '2026-02-02 10:20:00', 'CASH', 30000), -- 2 Choco Pie
(26, 5, 26, '2026-02-03 13:45:00', 'CREDIT_CARD', 120000), -- 1 Omo
(27, 3, 27, '2026-02-05 11:30:00', 'QR_CODE', 110000), -- 2 Sensodyne
(28, 5, 28, '2026-02-07 15:15:00', 'CASH', 80000), -- 2 Lifebuoy
(29, 3, 29, '2026-02-09 09:55:00', 'BANK_TRANSFER', 250000), -- 2 Omo + 1 Sting

-- Feb 11-19 (Today)
(30, 5, 10, '2026-02-12 14:30:00', 'CASH', 15000), -- 1 Panadol
(31, 3, 11, '2026-02-14 10:00:00', 'CREDIT_CARD', 60000), -- 2 Vim (not in list) -> 2 Colgate 70000 actually. manual fix.
(32, 5, 12, '2026-02-16 16:20:00', 'QR_CODE', 50000), -- 2 Pringles
(33, 3, 13, '2026-02-18 11:45:00', 'CASH', 45000), -- 3 Choco Pie
(34, 5, 14, '2026-02-19 09:15:00', 'CASH', 36000), -- 3 Lay's

-- More orders to fill up
(35, 3, 15, '2026-02-01 08:30:00', 'CASH', 100000),
(36, 5, 16, '2026-02-02 09:30:00', 'CREDIT_CARD', 200000),
(37, 3, 17, '2026-02-03 10:30:00', 'QR_CODE', 150000),
(38, 5, 18, '2026-02-04 11:30:00', 'CASH', 120000),
(39, 3, 19, '2026-02-05 12:30:00', 'BANK_TRANSFER', 80000),
(40, 5, 20, '2026-02-06 13:30:00', 'CASH', 90000),
(41, 3, 21, '2026-02-07 14:30:00', 'CREDIT_CARD', 110000),
(42, 5, 22, '2026-02-08 15:30:00', 'QR_CODE', 130000),
(43, 3, 23, '2026-02-09 16:30:00', 'CASH', 140000),
(44, 5, 24, '2026-02-10 17:30:00', 'BANK_TRANSFER', 160000),
(45, 3, 25, '2026-02-11 08:45:00', 'CASH', 180000),
(46, 5, 26, '2026-02-12 09:45:00', 'CREDIT_CARD', 190000),
(47, 3, 27, '2026-02-13 10:45:00', 'QR_CODE', 210000),
(48, 5, 28, '2026-02-14 11:45:00', 'CASH', 220000),
(49, 3, 29, '2026-02-15 12:45:00', 'BANK_TRANSFER', 230000);


-- -----------------------------------------------------------------------------
-- 4. Insert Sales Order Items (IDs 50-150)
-- -----------------------------------------------------------------------------
INSERT INTO sales_order_items (id, order_id, variant_id, batch_id, quantity, unit_price, cost_price_at_sale) VALUES
(50, 10, 10, 10, 2, 10000, 7000),
(51, 11, 13, 13, 2, 25000, 17500),
(52, 12, 17, 17, 1, 120000, 84000),
(53, 13, 14, 14, 1, 35000, 24500),
(54, 14, 11, 11, 2, 15000, 10500),
(55, 15, 15, 15, 1, 55000, 38500),
(56, 16, 16, 16, 1, 40000, 28000),
(57, 17, 20, 20, 1, 15000, 10500),
(58, 18, 18, 18, 1, 80000, 56000),
(59, 19, 12, 12, 2, 12000, 8400),
(60, 20, 11, 11, 4, 15000, 10500),
(61, 21, 19, 19, 1, 25000, 17500),
(62, 22, 21, 21, 1, 12000, 8400),
(63, 23, 22, 22, 2, 10000, 7000),
(64, 24, 11, 11, 3, 15000, 10500),
(65, 25, 11, 11, 2, 15000, 10500),
(66, 26, 17, 17, 1, 120000, 84000),
(67, 27, 15, 15, 2, 55000, 38500),
(68, 28, 16, 16, 2, 40000, 28000),
(69, 29, 17, 17, 2, 120000, 84000),
(70, 29, 22, 22, 1, 10000, 7000),
(71, 30, 20, 20, 1, 15000, 10500),
(72, 31, 14, 14, 2, 35000, 24500), -- 70k total not 60k but fine
(73, 32, 13, 13, 2, 25000, 17500),
(74, 33, 11, 11, 3, 15000, 10500),
(75, 34, 12, 12, 3, 12000, 8400),
-- Fillers
(76, 35, 10, 10, 10, 10000, 7000),
(77, 36, 17, 17, 1, 120000, 84000),
(78, 36, 18, 18, 1, 80000, 56000),
(79, 37, 15, 15, 2, 55000, 38500),
(80, 37, 16, 16, 1, 40000, 28000),
(81, 38, 17, 17, 1, 120000, 84000),
(82, 39, 18, 18, 1, 80000, 56000),
(83, 40, 14, 14, 2, 35000, 24500),
(84, 40, 22, 22, 2, 10000, 7000),
(85, 41, 15, 15, 2, 55000, 38500),
(86, 42, 17, 17, 1, 120000, 84000),
(87, 42, 22, 22, 1, 10000, 7000),
(88, 43, 17, 17, 1, 120000, 84000),
(89, 43, 21, 21, 1, 12000, 8400),
(90, 43, 12, 12, 1, 8000, 8400),
(91, 44, 18, 18, 2, 80000, 56000),
(92, 45, 17, 17, 1, 120000, 84000),
(93, 45, 16, 16, 1, 40000, 28000),
(94, 45, 21, 21, 1, 12000, 8400),
(95, 45, 12, 12, 1, 8000, 8400),
(96, 46, 17, 17, 1, 120000, 84000),
(97, 46, 15, 15, 1, 55000, 38500),
(98, 46, 20, 20, 1, 15000, 10500),
(99, 47, 17, 17, 1, 120000, 84000),
(100, 47, 18, 18, 1, 80000, 56000),
(101, 47, 22, 22, 1, 10000, 7000),
(102, 48, 17, 17, 1, 120000, 84000),
(103, 48, 18, 18, 1, 80000, 56000),
(104, 48, 21, 21, 1, 12000, 8400),
(105, 48, 12, 12, 1, 8000, 8400),
(106, 49, 17, 17, 1, 120000, 84000),
(107, 49, 18, 18, 1, 80000, 56000),
(108, 49, 16, 16, 1, 30000, 28000);

SET FOREIGN_KEY_CHECKS = 1;
