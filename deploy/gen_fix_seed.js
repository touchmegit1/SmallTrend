const fs = require('fs');

const COLUMN_MAPS = {
    // Correct locations, inventory_stock, cash_transactions, tickets, purchase_orders, etc.
    "inventory_stock": "id,quantity,batch_id,location_id,variant_id",
    "cash_transactions": "id,amount,transaction_time,balance_after,balance_before,created_at,description,notes,reason,receipt_image_url,status,transaction_code,approved_at,transaction_type,updated_at,register_id,approved_by,performed_by,order_id",
    "tickets": "id,updated_at,description,priority,related_entity_id,related_entity_type,resolution,resolved_at,status,ticket_code,ticket_type,title,created_at,created_by_user_id,resolved_by_user_id,assigned_to_user_id",
    "purchase_orders": "id,po_number,supplier_id,contract_id,location_id,created_by,order_date,expected_delivery_date,actual_delivery_date,status,subtotal,discount_amount,tax_percent,tax_amount,total_amount,shipping_fee,paid_amount,notes,manager_decision,manager_decision_note,manager_decided_at,rejection_reason,shortage_reason,shortage_submitted_at,created_at,updated_at",
    "shift_handovers": "id,cash_amount,attachment_url,expected_cash,cash_breakdown,confirmed,confirmed_at,created_at,dispute_reason,equipment_status,actual_cash,handover_code,handover_time,important_notes,inventory_notes,issues_reported,low_stock_items,status,total_customers,total_refunds,total_sales,total_transactions,updated_at,variance,cash_register_id,from_user_id,to_user_id,shift_id",
    // Ignore payroll_calculations mapping to keep original positional insert for now.
    "inventory_counts": "id,code,confirmed_at,created_by,created_at,location_id,notes,rejection_reason,status,total_difference_value,total_overage_value,total_shortage_value,confirmed_by",
    // Values in data.sql follow legacy export order; keep this mapping aligned to avoid column/value mismatch.
    "disposal_vouchers": "id,code,confirmed_at,created_at,notes,reason_type,rejection_reason,status,confirmed_by,total_items,total_value,version,total_quantity,created_by,location_id",
    "disposal_voucher_items": "id,batch_code,expiry_date,quantity,total_cost,unit_cost,batch_id,disposal_voucher_id,product_id",

    // Other known good ones
    "supplier_contracts": "id,contract_number,created_at,currency,delivery_terms,description,end_date,notes,payment_terms,signed_by_company,signed_by_supplier,signed_date,start_date,status,title,total_value,updated_at,supplier_id",
    "tax_rates": "id,is_active,name,rate",
    "price_expiry_alert_logs": "id,alert_date,recipient_email,sent_at,variant_price_id",
    "product_combos": "id,combo_code,combo_name,combo_price,combo_type,created_at,description,discount_percent,display_order,image_url,is_active,is_featured,max_quantity_per_order,original_price,saved_amount,status,stock_limit,tags,total_sold,updated_at,valid_from,valid_to,created_by",
    "product_combo_items": "id,can_substitute,display_order,is_optional,max_quantity,min_quantity,notes,quantity,combo_id,product_variant_id",
    "products": "id,created_at,name,image_url,is_active,description,updated_at,brand_id,category_id,tax_rate_id",
    "units": "id,code,default_cost_price,default_sell_price,material_type,name,symbol",
    "unit_conversions": "id,conversion_factor,description,is_active,sell_price,to_unit_id,variant_id",
    "locations": "id,address,capacity,created_at,description,grid_col,grid_level,grid_row,location_code,name,status,type,zone",
    "product_batches": "id,batch_number,cost_price,expiry_date,mfg_date,variant_id",
    "coupons": "id,allowed_categories,internal_notes,coupon_code,coupon_name,coupon_type,created_at,current_usage_count,description,discount_amount,discount_percent,end_date,end_time,get_quantity,min_quantity,max_discount_amount,min_purchase_amount,buy_quantity,start_date,start_time,status,total_usage_limit,updated_at,usage_per_customer,campaign_id,created_by",
    "cash_registers": "id,created_at,max_cash_limit,device_id,current_cash,notes,location,total_card_today,total_cash_today,opening_balance,register_code,register_name,register_type,session_start_time,status,store_name,total_sales_today,total_transactions_today,variance,expected_balance,updated_at,last_transaction_time,current_operator_id",
    "sale_orders": "id,created_at,discount_amount,notes,order_code,order_date,payment_method,status,subtotal,tax_amount,total_amount,updated_at,cash_register_id,cashier_id,customer_id",
    "sale_order_items": "id,line_discount_amount,line_tax_amount,line_total_amount,notes,product_name,quantity,sku,unit_price,sale_order_id,product_variant_id",
    "sale_order_histories": "id,action_type,change_notes,changed_at,from_status,to_status,changed_by_user_id,sale_order_id",
    "user_credentials": "id,password_hash,username,user_id",
    "purchase_order_items": "id,expiry_date,notes,quantity,received_quantity,total_cost,unit_price,variant_id,purchase_order_id"
};

const src = fs.readFileSync('backend/src/main/resources/data.sql', 'utf8').replace(/^\uFEFF/, '');
let out = "SET FOREIGN_KEY_CHECKS = 0;\n" + src;

let fixed = 0;
for (const [table, cols] of Object.entries(COLUMN_MAPS)) {
    const re = new RegExp(`(INSERT INTO \`${table}\`) VALUES `, 'g');
    const before = out;
    out = out.replace(re, `$1 (${cols}) VALUES `);
    if (out !== before) fixed++;
}

fs.writeFileSync('deploy/fix_seed.sql', out, 'utf8');
console.log(`Done! Fixed ${fixed} tables with FOREIGN_KEY_CHECKS = 0.`);
