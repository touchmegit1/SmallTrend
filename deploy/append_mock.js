const fs = require("fs"); fs.appendFileSync("deploy/fix_seed.sql", `-- ==========================================================
-- DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE inventory_counts;
INSERT INTO `inventory_counts` (`id`, `code`, `status`, `location_id`, `total_shortage_value`, `total_overage_value`, `total_difference_value`, `created_by`, `confirmed_by`, `created_at`, `confirmed_at`) VALUES 
(1, 'IC-202603-001', 'CONFIRMED', 1, 0, 0, 0, 1, 1, '2026-03-28 10:00:00', '2026-03-28 10:00:00');

TRUNCATE TABLE inventory_count_items;
INSERT INTO `inventory_count_items` (`id`, `inventory_count_id`, `system_quantity`, `actual_quantity`, `difference_quantity`, `difference_value`, `reason`) VALUES 
(1, 1, 10, 10, 0, 0, 'Match');

TRUNCATE TABLE product_combo_items;
INSERT INTO `product_combo_items` (`id`, `combo_id`, `product_variant_id`, `min_quantity`, `max_quantity`, `is_optional`, `can_substitute`, `display_order`, `notes`) VALUES 
(1, 1, 1, 1, 1, 0, 0, 1, 'None');

TRUNCATE TABLE price_expiry_alert_logs;
INSERT INTO `price_expiry_alert_logs` (`id`, `variant_price_id`, `alert_date`, `sent_at`) VALUES 
(1, 1, '2026-03-28', '2026-03-28 10:15:00');

SET FOREIGN_KEY_CHECKS = 1;
`, "utf8");