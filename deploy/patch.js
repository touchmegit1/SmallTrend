const fs = require('fs');
let cleanSource = fs.readFileSync('deploy/clean_localseed.js', 'utf8');

const targetStr = `addMock('sale_orders', 
    '\`id\`, \`order_code\`, \`customer_id\`, \`cashier_id\`, \`cash_register_id\`, \`order_date\`, \`subtotal\`, \`tax_amount\`, \`discount_amount\`, \`total_amount\`, \`payment_method\`, \`status\`, \`notes\`, \`created_at\`, \`updated_at\`', 
    "1, 'ORD-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('sale_order_items', 
    '\`id\`, \`sale_order_id\`, \`product_variant_id\`, \`product_name\`, \`sku\`, \`quantity\`, \`unit_price\`, \`line_discount_amount\`, \`line_tax_amount\`, \`line_total_amount\`, \`notes\`', 
    "1, 1, 1, 'Mock Product', 'SKU-001', 2, 25000, 0, 0, 50000, ''");

// 2. Purchase Orders
addMock('purchase_orders', 
    '\`id\`, \`po_number\`, \`supplier_id\`, \`contract_id\`, \`created_by\`, \`location_id\`, \`order_date\`, \`expected_delivery_date\`, \`actual_delivery_date\`, \`status\`, \`subtotal\`, \`tax_amount\`, \`tax_percent\`, \`discount_amount\`, \`shipping_fee\`, \`paid_amount\`, \`total_amount\`, \`notes\`, \`rejection_reason\`, \`shortage_reason\`, \`shortage_submitted_at\`, \`manager_decision\`, \`manager_decision_note\`, \`manager_decided_at\`, \`created_at\`, \`updated_at\`', 
    "1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', '2026-03-29', 'COMPLETED', 100000, 0, 0, 0, 0, 100000, 100000, 'Mock', null, null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('purchase_order_items', 
    '\`id\`, \`purchase_order_id\`, \`variant_id\`, \`quantity\`, \`unit_cost\`, \`total_cost\`, \`received_quantity\`, \`notes\`, \`expiry_date\`', 
    "1, 1, 1, 10, 10000, 100000, 10, 'Mock', '2030-01-01'");

// 3. Inventory Counts
addMock('inventory_counts', 
    '\`id\`, \`code\`, \`status\`, \`location_id\`, \`total_shortage_value\`, \`total_overage_value\`, \`total_difference_value\`, \`created_by\`, \`confirmed_by\`, \`created_at\`, \`confirmed_at\`', 
    "1, 'IC-202603-001', 'CONFIRMED', 1, 0, 0, 0, 1, 1, '2026-03-28 10:00:00', '2026-03-28 10:05:00'");
addMock('inventory_count_items', 
    '\`id\`, \`inventory_count_id\`, \`batch_id\`, \`system_quantity\`, \`actual_quantity\`, \`difference_quantity\`, \`difference_value\`, \`reason\`', 
    "1, 1, 1, 10, 10, 0, 0, 'Match'");

// 4. Disposal Vouchers
addMock('disposal_vouchers', 
    '\`id\`, \`code\`, \`location_id\`, \`status\`, \`reason_type\`, \`notes\`, \`total_items\`, \`total_quantity\`, \`total_value\`, \`created_by\`, \`created_at\`, \`confirmed_by\`, \`confirmed_at\`, \`rejection_reason\`, \`version\`', 
    "1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 'Mock Notes', 1, 5, 50000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:05:00', null, 1");
addMock('disposal_voucher_items', 
    '\`id\`, \`disposal_voucher_id\`, \`batch_id\`, \`product_id\`, \`batch_code\`, \`quantity\`, \`unit_cost\`, \`total_cost\`, \`expiry_date\`', 
    "1, 1, 1, 1, 'BATCH-001', 5, 10000, 50000, '2030-01-01'");

// 5. Product Combos
addMock('product_combos', 
    '\`id\`, \`combo_code\`, \`combo_name\`, \`description\`, \`image_url\`, \`original_price\`, \`combo_price\`, \`saved_amount\`, \`discount_percent\`, \`valid_from\`, \`valid_to\`, \`is_active\`, \`max_quantity_per_order\`, \`total_sold\`, \`stock_limit\`, \`combo_type\`, \`is_featured\`, \`display_order\`, \`tags\`, \`status\`, \`created_by_id\`, \`updated_at\`, \`category_id\`', 
    "1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock', '', 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, 0, 0, 'VIP', 0, 1, 'New', 'ACTIVE', 1, '2026-03-28 10:00:00', 1");
addMock('product_combo_items', 
    '\`id\`, \`combo_id\`, \`product_variant_id\`, \`min_quantity\`, \`max_quantity\`, \`is_optional\`, \`can_substitute\`, \`display_order\`, \`notes\`', 
    "1, 1, 1, 1, 1, 0, 0, 1, 'None'");

// 6. Price Expiry Alert Logs
addMock('price_expiry_alert_logs', 
    '\`id\`, \`variant_price_id\`, \`alert_date\`, \`sent_at\`', 
    "1, 1, '2026-03-28', '2026-03-28 10:15:00'");
`;

let contentStr = fs.readFileSync('deploy/clean_localseed.js', 'utf8');

const cutoffIdx = contentStr.indexOf('addMock(\'sale_orders\',');
if (cutoffIdx !== -1) {
    contentStr = contentStr.substring(0, cutoffIdx);
}

fs.writeFileSync('deploy/clean_localseed.js', contentStr + targetStr + "\nsql += 'SET FOREIGN_KEY_CHECKS = 1;\\n';\nfs.appendFileSync(outFile, sql, 'utf8');\nconsole.log('Appended fully parsed Mock data to deploy/fix_seed.sql');\n", 'utf8');
