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
        if (line.match(/^private [A-Z]/)) {
            const prevLines = lines.slice(Math.max(0, i - 3), i).join(' ');
            let colName = '';
            const match = prevLines.match(/@Column\([^)]*name\s*=\s*"([^"]+)"/);
            if (match) {
                colName = match[1];
            } else if (prevLines.includes('@JoinColumn')) {
                const joinMatch = prevLines.match(/@JoinColumn\([^)]*name\s*=\s*"([^"]+)"/);
                if (joinMatch) colName = joinMatch[1];
            } else {
                const words = line.split(/\s+/);
                let fieldName = words[2].replace(';', '');
                colName = fieldName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            }
            if (colName && !colName.includes('mappedBy') && !line.includes('List<') && !line.includes('Set<')) {
                columns.push(colName);
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

const addMock = (table, clazz, values) => {
    sql += `TRUNCATE TABLE ${table};\n`;
    sql += `INSERT INTO \`${table}\` (${extractColumns(entityDir + clazz).map(c => `\`${c}\``).join(', ')}) VALUES \n(${values});\n\n`;
}

// 1. Sale Orders
addMock('sale_orders', 'Order.java', "1, 'ORD-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('sale_order_items', 'OrderItem.java', "1, 1, 1, 'Mock Product', 'SKU-001', 2, 25000, 0, 0, 50000, ''");

// 2. Purchase Orders
addMock('purchase_orders', 'PurchaseOrder.java', "1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', '2026-03-29', 'COMPLETED', 100000, 0, 0, 0, 0, 100000, 100000, 'Mock', null, null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00'");
addMock('purchase_order_items', 'PurchaseOrderItem.java', "1, 1, 1, 10, 10000, 100000, 10, 'Mock item', '2030-01-01'");

// 3. Inventory Counts
addMock('inventory_counts', 'InventoryCount.java', "1, 'IC-202603-001', 1, 'CONFIRMED', 'MONTHLY', 'Mock Count', 10, 10, 500000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:10:00', null, 1, 0, 0, 0");
addMock('inventory_count_items', 'InventoryCountItem.java', "1, 1, 1, 1, 15, 15, 0, 0, 0, 'Match', 'BATCH-1'");

// 4. Disposal Vouchers
addMock('disposal_vouchers', 'DisposalVoucher.java', "1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 'Mock disposal', 1, 5, 50000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:00:00', null, 1");
addMock('disposal_voucher_items', 'DisposalVoucherItem.java', "1, 1, 1, 1, 'BATCH-1', 5, 10000, 50000, '2030-01-01'");

// 5. Product Combos
addMock('product_combos', 'ProductCombo.java', "1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock combo', null, 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, '2026-03-28 10:00:00', '2026-03-28 10:00:00', 1, 1");
addMock('product_combo_items', 'ProductComboItem.java', "1, 1, 1, 2, 75000, 150000, 0, 0, 15000, 120000, 10000, 75000, 150000, null");

// 6. Price Expiry Alert Logs
addMock('price_expiry_alert_logs', 'PriceExpiryAlertLog.java', "1, '2026-03-28', 1, 'admin@smalltrend.me', '2026-03-28 10:15:00'");

sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

fs.writeFileSync('deploy/gen_final_mock.js', 'const fs = require("fs"); fs.appendFileSync("deploy/fix_seed.sql", `' + sql + '`, "utf8");');
console.log('Done!');
