const fs = require('fs');
const fixFile = 'deploy/fix_seed.sql';

// MOCK DATA ĐỂ TRÁNH LỖI SCHEMA (CHỈ TẠO 1-2 BẢN GHI DEMO CHO MỖI BẢNG)
const MOCK_DATA = `

-- ==========================================================
-- DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. purchase_orders & items
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE purchase_order_items;
INSERT INTO \`purchase_orders\` (\`id\`, \`order_number\`, \`supplier_id\`, \`created_by\`, \`location_id\`, \`order_date\`, \`status\`, \`subtotal\`, \`total_amount\`, \`paid_amount\`)
VALUES 
(1, 'PO-202603-001', 1, 1, 1, '2026-03-28', 'DRAFT', 100000.00, 100000.00, 0.00);

INSERT INTO \`purchase_order_items\` (\`id\`, \`purchase_order_id\`, \`product_id\`, \`expected_quantity\`, \`actual_quantity\`, \`unit_price\`, \`total_price\`)
VALUES 
(1, 1, 1, 10, 0, 10000.00, 100000.00);


-- 2. sale_orders & items
TRUNCATE TABLE sale_orders;
TRUNCATE TABLE sale_order_items;
INSERT INTO \`sale_orders\` (\`id\`, \`order_number\`, \`customer_id\`, \`cashier_id\`, \`location_id\`, \`order_time\`, \`status\`, \`total_amount\`, \`discount_amount\`, \`final_amount\`, \`payment_method\`, \`payment_status\`)
VALUES 
(1, 'SO-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 'COMPLETED', 50000.00, 0, 50000.00, 'CASH', 'PAID');

INSERT INTO \`sale_order_items\` (\`id\`, \`order_id\`, \`product_id\`, \`quantity\`, \`unit_price\`, \`subtotal\`)
VALUES 
(1, 1, 1, 2, 25000.00, 50000.00);


-- 3. inventory_counts & items
TRUNCATE TABLE inventory_counts;
TRUNCATE TABLE inventory_count_items;
INSERT INTO \`inventory_counts\` (\`id\`, \`code\`, \`location_id\`, \`created_by\`, \`created_at\`, \`status\`, \`total_difference_value\`, \`total_overage_value\`, \`total_shortage_value\`, \`notes\`)
VALUES 
(1, 'IC-202603-001', 1, 1, '2026-03-28 10:00:00', 'CONFIRMED', 0.00, 0.00, 0.00, 'Kiểm kho cuối tháng');

INSERT INTO \`inventory_count_items\` (\`id\`, \`inventory_count_id\`, \`product_id\`, \`system_quantity\`, \`actual_quantity\`, \`difference_quantity\`, \`difference_value\`)
VALUES 
(1, 1, 1, 50, 50, 0, 0.00);


-- 4. disposal_vouchers & items
TRUNCATE TABLE disposal_vouchers;
TRUNCATE TABLE disposal_voucher_items;
INSERT INTO \`disposal_vouchers\` (\`id\`, \`code\`, \`location_id\`, \`reason_type\`, \`status\`, \`total_items\`, \`total_quantity\`, \`total_value\`, \`created_by\`, \`created_at\`)
VALUES 
(1, 'DV-202603-001', 1, 'DAMAGED', 'CONFIRMED', 1, 5, 50000.00, 1, '2026-03-28 10:00:00');

INSERT INTO \`disposal_voucher_items\` (\`id\`, \`disposal_voucher_id\`, \`product_id\`, \`quantity\`, \`unit_cost\`, \`total_cost\`)
VALUES 
(1, 1, 1, 5, 10000.00, 50000.00);


-- 5. product_combos & items
TRUNCATE TABLE product_combos;
TRUNCATE TABLE product_combo_items;
INSERT INTO \`product_combos\` (\`id\`, \`combo_code\`, \`combo_name\`, \`original_price\`, \`combo_price\`, \`is_active\`)
VALUES 
(1, 'CB-SNACK-VIP', 'Combo Snack VIP', 150000.00, 120000.00, 1);

INSERT INTO \`product_combo_items\` (\`id\`, \`combo_id\`, \`product_id\`, \`quantity\`, \`unit_price\`, \`total_price\`)
VALUES 
(1, 1, 1, 2, 75000.00, 150000.00);


-- 6. price_expiry_alert_logs
TRUNCATE TABLE price_expiry_alert_logs;
INSERT INTO \`price_expiry_alert_logs\` (\`id\`, \`alert_date\`, \`batch_id\`, \`recipient_email\`, \`sent_at\`)
VALUES
(1, '2026-03-28', 1, 'admin@smalltrend.me', '2026-03-28 10:15:00');

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.appendFileSync(fixFile, MOCK_DATA, 'utf8');
console.log('Successfully injected explicit MOCK_DATA for skipped inventory tables!');
