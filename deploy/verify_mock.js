const fs = require('fs');

const extractColumns = (filePath) => {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch { return []; }
    const columns = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^private [A-Z]/) || line.match(/^private int /) || line.match(/^private String /)) {
            const prevLines = lines.slice(Math.max(0, i - 4), i + 1).join(' ');
            let colName = '';
            const match = prevLines.match(/@Column\([^)]*name\s*=\s*"([^"]+)"/);
            if (match) {
                colName = match[1];
            } else if (prevLines.includes('@JoinColumn')) {
                const joinMatch = prevLines.match(/@JoinColumn\([^)]*name\s*=\s*"([^"]+)"/);
                if (joinMatch) colName = joinMatch[1];
            } else {
                const words = line.split(/\s+/);
                if (words.length < 3) continue;
                let fieldName = words[2].replace(';', '').replace(/=.*$/, '').trim();
                colName = fieldName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            }
            if (colName && !colName.includes('mappedBy') && !line.includes('List<') && !line.includes('Set<')) {
                if (!columns.includes(colName)) columns.push(colName);
            }
        }
    }
    return columns;
};

const entityDir = 'backend/src/main/java/com/smalltrend/entity/';

let sql = '-- ==========================================================\n';
sql += '-- DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS\n';
sql += '-- ==========================================================\n\n';
sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

const addMock = (table, clazz, valuesStr) => {
    const cols = extractColumns(entityDir + clazz);
    const parts = valuesStr.split(/(?:,)(?=(?:[^']*'[^']*')*[^']*$)/).map(s => s.trim());

    if (cols.length !== parts.length) {
        console.log(`ERROR: ${table} (${clazz}) columns: ${cols.length}, values: ${parts.length}`);
        console.log(`Columns: ${cols.join(', ')}`);
        return;
    }
    console.log(`OK: ${table}`);
    sql += `TRUNCATE TABLE ${table};\n`;
    sql += `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES \n(${valuesStr});\n\n`;
}

addMock('sale_orders', 'Order.java', "1, 'ORD-202603-001', 1, 1, 1, 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('sale_order_items', 'OrderItem.java', "1, 1, 1, 'Mock Product', 'SKU-001', 25000, 0, 0, 50000");

// purchase_orders -> 24 columns
addMock('purchase_orders', 'PurchaseOrder.java', "1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', 'COMPLETED', 100000, 0, 0, 0, 0, 0, 100000, 'Mock', null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00'");

// purchase_order_items -> 8 columns
// id, purchase_order_id, product_variant_id, unit_cost, total_cost, received_quantity, notes, expiry_date
addMock('purchase_order_items', 'PurchaseOrderItem.java', "1, 1, 1, 10000, 100000, 10, 'Mock item', '2030-01-01'");

// inventory_counts -> 10 columns
// id, code, location_id, count_type, notes, system_quantity, difference_quantity, status, created_at, created_by
addMock('inventory_counts', 'InventoryCount.java', "1, 'IC-202603-001', 1, 'MONTHLY', 'Mock Count', 10, 0, 'CONFIRMED', '2026-03-28 10:00:00', 1");

// inventory_count_items -> 9 columns
// id, inventory_count_id, batch_id, product_id, batch_code, system_quantity, difference_quantity, difference_value, reason
addMock('inventory_count_items', 'InventoryCountItem.java', "1, 1, 1, 1, 'BATCH-001', 10, 0, 0, 'Match'");

// disposal_vouchers -> 12 columns
// id, code, location_id, status, reason_type, total_items, total_quantity, created_by, created_at, confirmed_by, confirmed_at, rejection_reason
addMock('disposal_vouchers', 'DisposalVoucher.java', "1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 1, 5, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:00:00', null");

// disposal_voucher_items -> 7 columns
// id, disposal_voucher_id, batch_id, product_id, batch_code, unit_cost, total_cost
addMock('disposal_voucher_items', 'DisposalVoucherItem.java', "1, 1, 1, 1, 'BATCH-001', 10000, 50000");

addMock('product_combos', 'ProductCombo.java', "1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock combo', null, 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, 0, 0, 'VIP', 0, 1, 'New', 'ACTIVE', 1, '2026-03-28 10:00:00'");
addMock('product_combo_items', 'ProductComboItem.java', "1, 1, 1, 2, 2, 0, 0, 1, 'None'");

// price_expiry_alert_logs -> 4 columns: id, variant_price_id, alert_date, sent_at
addMock('price_expiry_alert_logs', 'PriceExpiryAlertLog.java', "1, 1, '2026-03-28', '2026-03-28 10:15:00'");

sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

fs.writeFileSync('deploy/gen_final_mock.js', 'const fs = require("fs"); fs.appendFileSync("deploy/fix_seed.sql", `' + sql + '`, "utf8");');
console.log('Script written to gen_final_mock.js!');
