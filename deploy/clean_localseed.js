const fs = require('fs');

const inFile = 'backend/src/main/resources/data.sql';
const outFile = 'deploy/fix_seed.sql';

const data = fs.readFileSync(inFile, 'utf8');

// Các bảng lỗi sẽ bị xóa khỏi output
const skipTables = [
    'tickets', 'shift_handovers', 'shift_swap_requests', 'payroll_calculations',
    'disposal_vouchers', 'disposal_voucher_items', 'inventory_counts', 'inventory_count_items',
    'gift_redemption_history', 'loyalty_transactions', 'coupon_usage', 'audit_logs',
    'cash_transactions', 'sale_order_histories', 'purchase_order_items', 'purchase_orders',
    'sale_order_items', 'sale_orders', 'stock_movements', 'price_expiry_alert_logs',
    'loyalty_gifts', 'product_combos', 'product_combo_items', 'purchase_history',
    'salary_configs', 'attendance', 'reports', 'advertisements'
];

const COLUMN_MAPS = {
    "supplier_contracts": "id,contract_number,created_at,currency,delivery_terms,description,end_date,notes,payment_terms,signed_by_company,signed_by_supplier,signed_date,start_date,status,title,total_value,updated_at,supplier_id",
    "tax_rates": "id,is_active,name,rate",
    "products": "id,created_at,name,image_url,is_active,description,updated_at,brand_id,category_id,tax_rate_id",
    "units": "id,code,default_cost_price,default_sell_price,material_type,name,symbol",
    "unit_conversions": "id,conversion_factor,description,is_active,sell_price,to_unit_id,variant_id",
    "locations": "id,address,capacity,created_at,description,grid_col,grid_level,grid_row,location_code,name,status,type,zone",
    "product_batches": "id,batch_number,cost_price,expiry_date,mfg_date,variant_id",
    "inventory_stock": "id,quantity,batch_id,location_id,variant_id",
    "coupons": "id,allowed_categories,internal_notes,coupon_code,coupon_name,coupon_type,created_at,current_usage_count,description,discount_amount,discount_percent,end_date,end_time,get_quantity,min_quantity,max_discount_amount,min_purchase_amount,buy_quantity,start_date,start_time,status,total_usage_limit,updated_at,usage_per_customer,campaign_id,created_by",
    "cash_registers": "id,created_at,max_cash_limit,device_id,current_cash,notes,location,total_card_today,total_cash_today,opening_balance,register_code,register_name,register_type,session_start_time,status,store_name,total_sales_today,total_transactions_today,variance,expected_balance,updated_at,last_transaction_time,current_operator_id",
    "user_credentials": "id,password_hash,username,user_id",
    "advertisements": "id,bg_color,contact_email,contact_person,contact_phone,contract_end,contract_number,contract_start,contract_value,created_at,cta_color,cta_text,image_url,is_active,link_url,notes,payment_terms,slot,sponsor_name,subtitle,title,updated_at",
    "categories": "id,code,name,description,created_at,updated_at",
    "brands": "id,name,description,country,created_at,updated_at,category_id,supplier_id",
    "suppliers": "id,active,address,contact_person,contract_expiry,contract_files,contract_signed_date,created_at,email,name,notes,phone,tax_code,updated_at"
};

let lines = data.split('\n');
let out = ["SET FOREIGN_KEY_CHECKS = 0;"];
let isSkipping = false;

for (let line of lines) {
    if (!isSkipping) {
        let shouldSkip = false;
        for (let table of skipTables) {
            if (line.includes(`INSERT INTO \`${table}\``)) {
                shouldSkip = true;
                break;
            }
        }

        if (shouldSkip) {
            isSkipping = true;
            if (line.includes(';')) {
                isSkipping = false;
            }
            continue;
        }
    } else {
        // Đang trong mode skip nội dung statement đa dòng
        if (line.includes(';')) {
            isSkipping = false; // Kết thúc statement
        }
        continue;
    }

    let processedLine = line;
    for (const [table, cols] of Object.entries(COLUMN_MAPS)) {
        const re = new RegExp(`(INSERT INTO \`${table}\`)(?: \\\([^)]+\\\))? VALUES `, 'g');
        if (processedLine.match(re)) {
            processedLine = processedLine.replace(re, `$1 (${cols}) VALUES `);
        }
    }

    out.push(processedLine);
}

fs.writeFileSync(outFile, out.join('\n'), 'utf8');
console.log(`Lọc & Xử lý xong! Đã xuất ra file ${outFile}`);
let sql = '-- ==========================================================\n';
sql += '-- DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS\n';
sql += '-- ==========================================================\n\n';
sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

const addMock = (table, cols, values) => {
    sql += `TRUNCATE TABLE ${table};\n`;
    sql += `INSERT INTO \`${table}\` (${cols}) VALUES \n(${values});\n\n`;
}

// 1. Sale Orders
addMock('sale_orders', 
    '`id`, `order_code`, `customer_id`, `cashier_id`, `cash_register_id`, `order_date`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `payment_method`, `status`, `notes`, `created_at`, `updated_at`', 
    "1, 'ORD-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('sale_order_items', 
    '`id`, `sale_order_id`, `product_variant_id`, `product_name`, `sku`, `quantity`, `unit_price`, `line_discount_amount`, `line_tax_amount`, `line_total_amount`, `notes`', 
    "1, 1, 1, 'Mock Product', 'SKU-001', 2, 25000, 0, 0, 50000, ''");

// 2. Purchase Orders
addMock('purchase_orders', 
    '`id`, `po_number`, `supplier_id`, `contract_id`, `created_by`, `location_id`, `order_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `subtotal`, `tax_amount`, `tax_percent`, `discount_amount`, `shipping_fee`, `paid_amount`, `total_amount`, `notes`, `rejection_reason`, `shortage_reason`, `shortage_submitted_at`, `manager_decision`, `manager_decision_note`, `manager_decided_at`, `created_at`, `updated_at`', 
    "1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', '2026-03-29', 'RECEIVED', 100000, 0, 0, 0, 0, 100000, 100000, 'Mock', null, null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('purchase_order_items', 
    '`id`, `purchase_order_id`, `variant_id`, `quantity`, `unit_cost`, `total_cost`, `received_quantity`, `notes`, `expiry_date`', 
    "1, 1, 1, 10, 10000, 100000, 10, 'Mock', '2030-01-01'");

// 3. Inventory Counts
addMock('inventory_counts', 
    '`id`, `code`, `status`, `location_id`, `total_shortage_value`, `total_overage_value`, `total_difference_value`, `created_by`, `confirmed_by`, `created_at`, `confirmed_at`', 
    "1, 'IC-202603-001', 'CONFIRMED', 1, 0, 0, 0, 1, 1, '2026-03-28 10:00:00', '2026-03-28 10:05:00'");
addMock('inventory_count_items', 
    '`id`, `inventory_count_id`, `batch_id`, `system_quantity`, `actual_quantity`, `difference_quantity`, `difference_value`, `reason`', 
    "1, 1, 1, 10, 10, 0, 0, 'Match'");

// 4. Disposal Vouchers
addMock('disposal_vouchers', 
    '`id`, `code`, `location_id`, `status`, `reason_type`, `notes`, `total_items`, `total_quantity`, `total_value`, `created_by`, `created_at`, `confirmed_by`, `confirmed_at`, `rejection_reason`, `version`', 
    "1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 'Mock Notes', 1, 5, 50000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:05:00', null, 1");
addMock('disposal_voucher_items', 
    '`id`, `disposal_voucher_id`, `batch_id`, `product_id`, `batch_code`, `quantity`, `unit_cost`, `total_cost`, `expiry_date`', 
    "1, 1, 1, 1, 'BATCH-001', 5, 10000, 50000, '2030-01-01'");

// 5. Product Combos
addMock('product_combos', 
    '`id`, `combo_code`, `combo_name`, `description`, `image_url`, `original_price`, `combo_price`, `saved_amount`, `discount_percent`, `valid_from`, `valid_to`, `is_active`, `max_quantity_per_order`, `total_sold`, `stock_limit`, `combo_type`, `is_featured`, `display_order`, `tags`, `status`, `created_by_id`, `updated_at`, `category_id`', 
    "1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock', '', 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, 0, 0, 'VIP', 0, 1, 'New', 'ACTIVE', 1, '2026-03-28 10:00:00', 1");
addMock('product_combo_items', 
    '`id`, `combo_id`, `product_variant_id`, `min_quantity`, `max_quantity`, `is_optional`, `can_substitute`, `display_order`, `notes`', 
    "1, 1, 1, 1, 1, 0, 0, 1, 'None'");

// 6. Price Expiry Alert Logs
addMock('price_expiry_alert_logs', 
    '`id`, `variant_price_id`, `alert_date`, `sent_at`', 
    "1, 1, '2026-03-28', '2026-03-28 10:15:00'");

sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';
fs.appendFileSync(outFile, sql, 'utf8');
console.log('Appended fully parsed Mock data to deploy/fix_seed.sql');
