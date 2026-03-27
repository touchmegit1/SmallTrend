const fs = require('fs');

const inFile = 'backend/src/main/resources/data.sql';
const outFile = 'deploy/fix_seed.sql';

const data = fs.readFileSync(inFile, 'utf8');

// The transactional or buggy tables to completely skip
// This will clean out the old historical data that has incompatible schemas
const skipTables = [
    'tickets', 'shift_handovers', 'shift_swap_requests', 'payroll_calculations',
    'disposal_vouchers', 'disposal_voucher_items', 'inventory_counts', 'inventory_count_items',
    'gift_redemption_history', 'loyalty_transactions', 'coupon_usage', 'audit_logs',
    'cash_transactions', 'sale_order_histories', 'purchase_order_items', 'purchase_orders',
    'sale_order_items', 'sale_orders', 'stock_movements', 'price_expiry_alert_logs',
    'loyalty_gifts', 'product_combos', 'product_combo_items'
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

for (let line of lines) {
    let skip = false;

    // Skip explicitly bad tables to ensure clean seed
    for (let table of skipTables) {
        if (line.includes(`INSERT INTO \`${table}\``)) {
            skip = true;
            break;
        }
    }

    if (skip) continue;

    // Apply mapping if it's one of our target tables
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
