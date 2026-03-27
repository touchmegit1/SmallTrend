const fs = require('fs');
const data = fs.readFileSync('backend/src/main/resources/data.sql', 'utf8');
const tables = [
    'tickets', 'shift_handovers', 'shift_swap_requests', 'payroll_calculations',
    'disposal_vouchers', 'disposal_voucher_items', 'inventory_counts', 'inventory_count_items',
    'gift_redemption_history', 'loyalty_transactions', 'coupon_usage', 'audit_logs',
    'cash_transactions', 'sale_order_histories', 'purchase_order_items', 'purchase_orders',
    'sale_order_items', 'sale_orders', 'stock_movements', 'price_expiry_alert_logs',
    'loyalty_gifts', 'product_combos', 'product_combo_items', 'purchase_history',
    'salary_configs', 'attendance', 'reports'
];

for (let table of tables) {
    const match = data.match(new RegExp(`INSERT INTO \\\`${table}\\\`([^\n]*)`));
    if (match) {
        console.log(`${table}: ${match[1].length > 10 ? match[1].substring(0, 100) : 'NO EXPLICIT COLUMNS'}`);
    } else {
        const match2 = data.match(new RegExp(`INSERT INTO ${table}([^\n]*)`));
        console.log(`${table}: ${match2 ? 'YES without backticks' : 'NOT FOUND'}`);
    }
}
