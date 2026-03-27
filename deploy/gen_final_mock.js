const fs = require("fs"); fs.appendFileSync("deploy/fix_seed.sql", `-- ==========================================================
-- DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sale_orders;
INSERT INTO `sale_orders` (`id`, `order_code`, `customer_id`, `cashier_id`, `cash_register_id`, `order_date`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `payment_method`, `status`, `notes`, `created_at`, `updated_at`) VALUES 
(1, 'ORD-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00');

TRUNCATE TABLE sale_order_items;
INSERT INTO `sale_order_items` (`id`, `sale_order_id`, `product_variant_id`, `product_name`, `sku`, `quantity`, `unit_price`, `line_discount_amount`, `line_tax_amount`, `line_total_amount`, `notes`) VALUES 
(1, 1, 1, 'Mock Product', 'SKU-001', 2, 25000, 0, 0, 50000, '');

TRUNCATE TABLE purchase_orders;
INSERT INTO `purchase_orders` (`id`, `po_number`, `supplier_id`, `contract_id`, `created_by`, `location_id`, `order_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `subtotal`, `tax_amount`, `tax_percent`, `discount_amount`, `shipping_fee`, `paid_amount`, `total_amount`, `notes`, `rejection_reason`, `shortage_reason`, `shortage_submitted_at`, `manager_decision`, `manager_decision_note`, `manager_decided_at`, `created_at`, `updated_at`) VALUES 
(1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', '2026-03-29', 'COMPLETED', 100000, 0, 0, 0, 0, 100000, 100000, 'Mock', null, null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00');

TRUNCATE TABLE purchase_order_items;
INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `variant_id`, `quantity`, `unit_price`, `total_cost`, `received_quantity`, `notes`) VALUES 
(1, 1, 1, 10, 10000, 100000, 10, 'Mock item', '2030-01-01');

TRUNCATE TABLE inventory_counts;
INSERT INTO `inventory_counts` (`id`, `code`, `status`, `location_id`, `location_id`, `rejection_reason`, `total_shortage_value`, `total_overage_value`, `total_difference_value`, `created_by`, `confirmed_by`, `created_at`, `confirmed_at`) VALUES 
(1, 'IC-202603-001', 1, 'CONFIRMED', 'MONTHLY', 'Mock Count', 10, 10, 500000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:10:00', null, 1, 0, 0, 0);

TRUNCATE TABLE inventory_count_items;
INSERT INTO `inventory_count_items` (`id`, `inventory_count_id`, `inventory_count_id`, `variant_id`, `system_quantity`, `actual_quantity`, `difference_quantity`, `difference_value`, `reason`) VALUES 
(1, 1, 1, 1, 15, 15, 0, 0, 0, 'Match', 'BATCH-1');

TRUNCATE TABLE disposal_vouchers;
INSERT INTO `disposal_vouchers` (`id`, `code`, `location_id`, `status`, `reason_type`, `notes`, `total_items`, `total_quantity`, `total_value`, `created_by`, `created_at`, `confirmed_by`, `confirmed_at`, `rejection_reason`, `version`) VALUES 
(1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 'Mock disposal', 1, 5, 50000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:00:00', null, 1);

TRUNCATE TABLE disposal_voucher_items;
INSERT INTO `disposal_voucher_items` (`id`, `disposal_voucher_id`, `batch_id`, `product_id`, `batch_code`, `quantity`, `unit_cost`, `total_cost`, `expiry_date`) VALUES 
(1, 1, 1, 1, 'BATCH-1', 5, 10000, 50000, '2030-01-01');

TRUNCATE TABLE product_combos;
INSERT INTO `product_combos` (`id`, `combo_code`, `combo_name`, `description`, `image_url`, `original_price`, `combo_price`, `saved_amount`, `discount_percent`, `valid_from`, `valid_to`, `is_active`, `max_quantity_per_order`, `total_sold`, `stock_limit`, `combo_type`, `is_featured`, `display_order`, `tags`, `status`, `created_by`, `created_at`, `updated_at`) VALUES 
(1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock combo', null, 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, '2026-03-28 10:00:00', '2026-03-28 10:00:00', 1, 1);

TRUNCATE TABLE product_combo_items;
INSERT INTO `product_combo_items` (`id`, `combo_id`, `product_variant_id`, `quantity`, `min_quantity`, `max_quantity`, `is_optional`, `can_substitute`, `display_order`, `notes`) VALUES 
(1, 1, 1, 2, 75000, 150000, 0, 0, 15000, 120000, 10000, 75000, 150000, null);

TRUNCATE TABLE price_expiry_alert_logs;
INSERT INTO `price_expiry_alert_logs` (`id`, `variant_price_id`, `alert_date`, `recipient_email`, `sent_at`) VALUES 
(1, '2026-03-28', 1, 'admin@smalltrend.me', '2026-03-28 10:15:00');

SET FOREIGN_KEY_CHECKS = 1;
`, "utf8");