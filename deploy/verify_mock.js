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
        console.log(`ERROR: ${table} (${clazz}) cols: ${cols.length}, values: ${parts.length}`);
        return;
    }
    sql += `TRUNCATE TABLE ${table};\n`;
    sql += `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES \n(${valuesStr});\n\n`;
}

addMock('sale_orders', 'Order.java', "1, 'ORD-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('sale_order_items', 'OrderItem.java', "1, 1, 1, 'Mock Product', 'SKU-001', 2, 25000, 0, 0, 50000, ''");

// purchase_orders -> 24 columns
addMock('purchase_orders', 'PurchaseOrder.java', "1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', '2026-03-29', 'COMPLETED', 100000, 0, 0, 0, 0, 100000, 100000, 'Mock', null, null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00'");

addMock('purchase_order_items', 'PurchaseOrderItem.java', "1, 1, 1, 10000, 100000, 10, 'Mock item', '2030-01-01'");

addMock('inventory_counts', 'InventoryCount.java', "1, 'IC-202603-001', 1, 'CONFIRMED', 'MONTHLY', 'Mock Count', 10, 0, '2026-03-28 10:00:00', 1, null, null");
// Wait, inventory_counts was fixed earlier, but verify_mock.js reported:
// ERROR: inventory_counts (InventoryCount.java) columns: 11, values: 10
// Columns: id, code, status, location_id, total_shortage_value, total_overage_value, total_difference_value, created_by, confirmed_by, created_at, confirmed_at
addMock('inventory_counts', 'InventoryCount.java', "1, 'IC-202603-001', 'CONFIRMED', 1, 0, 0, 0, 1, 1, '2026-03-28 10:00:00', '2026-03-28 10:00:00'");

// ERROR: inventory_count_items (InventoryCountItem.java) columns: 7, values: 9
// Columns: id, inventory_count_id, system_quantity, actual_quantity, difference_quantity, difference_value, reason
addMock('inventory_count_items', 'InventoryCountItem.java', "1, 1, 10, 10, 0, 0, 'Match'");

addMock('disposal_vouchers', 'DisposalVoucher.java', "1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 'Mock disposal', 1, 5, 50000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:00:00', null, 1");
addMock('disposal_voucher_items', 'DisposalVoucherItem.java', "1, 1, 1, 1, 'BATCH-001', 5, 10000, 50000, '2030-01-01'");

addMock('product_combos', 'ProductCombo.java', "1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock combo', null, 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, 0, 0, 'VIP', 0, 1, 'New', 'ACTIVE', 1, '2026-03-28 10:00:00', 1");

// ERROR: product_combo_items (ProductComboItem.java) columns: 9, values: 14
// Columns: id, combo_id, product_variant_id, min_quantity, max_quantity, is_optional, can_substitute, display_order, notes
addMock('product_combo_items', 'ProductComboItem.java', "1, 1, 1, 1, 1, 0, 0, 1, 'None'");

addMock('price_expiry_alert_logs', 'PriceExpiryAlertLog.java', "1, 1, '2026-03-28', '2026-03-28 10:15:00'");

sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

fs.writeFileSync('deploy/append_mock.js', 'const fs = require("fs"); fs.appendFileSync("deploy/fix_seed.sql", `' + sql + '`, "utf8");');
console.log('Script written to append_mock.js!');
