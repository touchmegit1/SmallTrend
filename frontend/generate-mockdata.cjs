const fs = require('fs');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const formatDate = (date) => date.toISOString().split('T')[0];
const formatDateTime = (date) => date.toISOString();

const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNames = ['Văn', 'Thị', 'Minh', 'Hữu', 'Đức', 'Anh', 'Thanh', 'Quốc', 'Công', 'Bảo', 'Hồng', 'Kim', 'Phương', 'Thu'];
const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Tuấn', 'Vinh', 'Hà', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Oanh', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Vy'];
const streets = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Võ Văn Kiệt', 'Cách Mạng Tháng 8', 'Đinh Tiên Hoàng', 'Lý Thường Kiệt', 'Hai Bà Trưng', 'Phan Đình Phùng', 'Quang Trung'];
const cities = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

const productNames = ['Coca Cola', 'Pepsi', 'Sprite', '7Up', 'Sting', 'Revive', 'Aquafina', 'Lavie', 'Number 1', 'Redbull', 'Bánh mì', 'Bánh bao', 'Xôi', 'Cơm hộp', 'Mì tôm', 'Phở khô', 'Bún', 'Sữa tươi', 'Sữa chua', 'Yaourt', 'Kem que', 'Kem ốc quế', 'Kem ly', 'Bánh quy', 'Bánh snack', 'Kẹo', 'Chocolate', 'Kẹo cao su', 'Thuốc lá', 'Bia', 'Rượu', 'Nước suối', 'Trà xanh', 'Cà phê', 'Sữa đậu nành'];
const brands = ['Coca Cola', 'Pepsi', 'Vinamilk', 'TH True Milk', 'Dutch Lady', 'Mondelez', 'Orion', 'Kinh Đô', 'Bibica', 'Trident', 'Nestlé', 'Unilever', 'P&G'];
const categories = ['Nước uống', 'Bánh kẹo', 'Sữa & Sản phẩm từ sữa', 'Kem', 'Đồ ăn nhanh', 'Mì & Phở ăn liền', 'Đồ uống có cồn', 'Đồ dùng cá nhân', 'Gia vị'];
const units = ['Chai', 'Lon', 'Hộp', 'Gói', 'Cái', 'Kg', 'Lít', 'Thùng'];

const generateName = () => `${firstNames[randomInt(0, firstNames.length - 1)]} ${middleNames[randomInt(0, middleNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}`;
const generatePhone = () => `09${randomInt(10000000, 99999999)}`;
const generateAddress = () => `${randomInt(1, 999)} Đường ${streets[randomInt(0, streets.length - 1)]}, ${cities[randomInt(0, cities.length - 1)]}`;

const data = {
  roles: [
    { id: 1, name: "Admin", description: "Quản trị viên hệ thống - Quản lý người dùng và phân quyền" },
    { id: 2, name: "Manager", description: "Quản lý cửa hàng - Quản lý toàn bộ hoạt động kinh doanh" },
    { id: 3, name: "Cashier Staff", description: "Nhân viên thu ngân - Xử lý bán hàng và thanh toán" },
    { id: 4, name: "Inventory Staff", description: "Nhân viên kho - Quản lý nhập xuất tồn kho" }
  ],
  users: [],
  user_credentials: [],
  shifts: [
    { id: 1, name: "Ca sáng", shift_type: "morning", start_time: "06:00", end_time: "14:00" },
    { id: 2, name: "Ca chiều", shift_type: "afternoon", start_time: "14:00", end_time: "22:00" }
  ],
  shift_assignments: [],
  attendance: [],
  salary_configs: [
    { id: 1, role_id: 3, base_salary: 5000000, hourly_rate: 50000, description: "Lương Cashier Staff" },
    { id: 2, role_id: 4, base_salary: 5500000, hourly_rate: 55000, description: "Lương Inventory Staff" },
    { id: 3, role_id: 2, base_salary: 10000000, hourly_rate: 100000, description: "Lương Manager" }
  ],
  salary_payouts: [],
  products: [],
  products_variants: [],
  price_history: [],
  suppliers: [],
  stock_imports: [],
  stock_exports: [],
  inventory_batches: [],
  inventory_stock: [],
  customers: [],
  loyalty_points: [],
  promotions: [],
  promotion_products: [],
  orders: [],
  order_items: [],
  payments: [],
  reports: [],
  audit_logs: []
};

console.log('Generating users...');
// 1 Admin
data.users.push({
  id: 1,
  full_name: "Nguyễn Văn Admin",
  email: "admin@smalltrend.com",
  phone: "0901234567",
  address: generateAddress(),
  status: "active",
  role_id: 1,
  created_at: "2023-01-01T00:00:00Z"
});
data.user_credentials.push({ id: 1, user_id: 1, username: "admin", password_hash: "$2b$10$AdminHashedPassword" });

// 1 Manager
data.users.push({
  id: 2,
  full_name: "Trần Thị Manager",
  email: "manager@smalltrend.com",
  phone: "0912345678",
  address: generateAddress(),
  status: "active",
  role_id: 2,
  created_at: "2023-01-01T00:00:00Z"
});
data.user_credentials.push({ id: 2, user_id: 2, username: "manager", password_hash: "$2b$10$ManagerHashedPassword" });

// 50 Cashier Staff
for (let i = 3; i <= 52; i++) {
  const name = generateName();
  data.users.push({
    id: i,
    full_name: name,
    email: `cashier${i}@smalltrend.com`,
    phone: generatePhone(),
    address: generateAddress(),
    status: randomInt(1, 100) > 10 ? 'active' : 'inactive',
    role_id: 3,
    created_at: formatDateTime(randomDate(new Date('2023-01-01'), new Date('2024-01-01')))
  });
  data.user_credentials.push({ id: i, user_id: i, username: `cashier${i}`, password_hash: `$2b$10$CashierHash${i}` });
}

// 50 Inventory Staff
for (let i = 53; i <= 102; i++) {
  const name = generateName();
  data.users.push({
    id: i,
    full_name: name,
    email: `inventory${i}@smalltrend.com`,
    phone: generatePhone(),
    address: generateAddress(),
    status: randomInt(1, 100) > 10 ? 'active' : 'inactive',
    role_id: 4,
    created_at: formatDateTime(randomDate(new Date('2023-01-01'), new Date('2024-01-01')))
  });
  data.user_credentials.push({ id: i, user_id: i, username: `inventory${i}`, password_hash: `$2b$10$InventoryHash${i}` });
}

console.log('Generating suppliers...');
for (let i = 1; i <= 150; i++) {
  data.suppliers.push({
    id: i,
    name: `Nhà cung cấp ${brands[randomInt(0, brands.length - 1)]} ${i}`,
    contact_person: generateName(),
    email: `supplier${i}@company.com`,
    phone: generatePhone(),
    address: generateAddress(),
    tax_code: `${randomInt(1000000000, 9999999999)}`,
    status: 'active'
  });
}

console.log('Generating products...');
for (let i = 1; i <= 3000; i++) {
  const productName = productNames[randomInt(0, productNames.length - 1)];
  const size = ['330ml', '500ml', '1L', '1.5L', '250g', '500g', '1kg', '2kg'][randomInt(0, 7)];
  data.products.push({
    id: i,
    name: `${productName} ${size}`,
    brand: brands[randomInt(0, brands.length - 1)],
    category: categories[randomInt(0, categories.length - 1)],
    unit: units[randomInt(0, units.length - 1)],
    description: `Sản phẩm ${productName} ${size} chất lượng cao`,
    status: randomInt(1, 100) > 5 ? 'available' : 'unavailable',
    created_at: formatDateTime(randomDate(new Date('2023-01-01'), new Date('2024-01-01')))
  });
}

console.log('Generating product variants with barcode...');
for (let i = 1; i <= 8000; i++) {
  const productId = randomInt(1, 3000);
  data.products_variants.push({
    id: i,
    product_id: productId,
    sku: `SKU-${String(i).padStart(8, '0')}`,
    barcode: `893458${String(i).padStart(7, '0')}`,
    price: randomInt(5, 200) * 1000,
    is_active: randomInt(1, 100) > 5
  });
}

console.log('Generating inventory batches with expiry dates...');
const startDate = new Date('2023-01-01');
for (let i = 1; i <= 15000; i++) {
  const mfgDate = randomDate(startDate, new Date('2024-06-01'));
  const expiryDate = new Date(mfgDate);
  expiryDate.setMonth(expiryDate.getMonth() + randomInt(3, 24));
  
  data.inventory_batches.push({
    id: i,
    variant_id: randomInt(1, 8000),
    batch_number: `BATCH-${String(i).padStart(8, '0')}`,
    supplier_id: randomInt(1, 150),
    mfg_date: formatDate(mfgDate),
    expiry_date: formatDate(expiryDate),
    cost_price: randomInt(3, 150) * 1000,
    import_date: formatDateTime(mfgDate)
  });
}

console.log('Generating stock imports...');
for (let i = 1; i <= 10000; i++) {
  const importDate = randomDate(new Date('2023-01-01'), new Date());
  data.stock_imports.push({
    id: i,
    batch_id: randomInt(1, 15000),
    supplier_id: randomInt(1, 150),
    quantity: randomInt(50, 1000),
    cost_price: randomInt(5, 150) * 1000,
    total_cost: randomInt(500, 150000) * 1000,
    import_date: formatDateTime(importDate),
    imported_by: randomInt(53, 102),
    notes: `Nhập kho lần ${i}`
  });
}

console.log('Generating stock exports...');
for (let i = 1; i <= 8000; i++) {
  const exportDate = randomDate(new Date('2023-01-01'), new Date());
  data.stock_exports.push({
    id: i,
    batch_id: randomInt(1, 15000),
    quantity: randomInt(1, 100),
    reason: ['sold', 'damaged', 'expired', 'returned'][randomInt(0, 3)],
    export_date: formatDateTime(exportDate),
    exported_by: randomInt(53, 102),
    notes: `Xuất kho lần ${i}`
  });
}

console.log('Generating inventory stock...');
for (let i = 1; i <= 20000; i++) {
  data.inventory_stock.push({
    id: i,
    variant_id: randomInt(1, 8000),
    batch_id: randomInt(1, 15000),
    quantity: randomInt(0, 500),
    location: ['Kho chính', 'Quầy bán hàng', 'Tủ lạnh', 'Kệ trưng bày'][randomInt(0, 3)]
  });
}

console.log('Generating customers with loyalty points...');
for (let i = 1; i <= 5000; i++) {
  const name = generateName();
  const joinDate = randomDate(new Date('2023-01-01'), new Date());
  data.customers.push({
    id: i,
    full_name: name,
    phone: generatePhone(),
    email: `customer${i}@gmail.com`,
    address: generateAddress(),
    total_spent: randomInt(0, 50000) * 1000,
    visit_count: randomInt(1, 200),
    created_at: formatDateTime(joinDate)
  });
}

console.log('Generating loyalty points...');
for (let i = 1; i <= 5000; i++) {
  data.loyalty_points.push({
    id: i,
    customer_id: i,
    points: randomInt(0, 10000),
    total_earned: randomInt(0, 50000),
    total_redeemed: randomInt(0, 20000),
    last_updated: formatDateTime(randomDate(new Date('2023-01-01'), new Date()))
  });
}

console.log('Generating promotions...');
for (let i = 1; i <= 800; i++) {
  const startDate = randomDate(new Date('2023-01-01'), new Date('2024-06-01'));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + randomInt(7, 90));
  
  data.promotions.push({
    id: i,
    name: `Khuyến mãi ${i}`,
    description: `Giảm giá đặc biệt cho chương trình ${i}`,
    discount_type: ['percentage', 'fixed_amount'][randomInt(0, 1)],
    discount_value: randomInt(5, 50),
    min_purchase: randomInt(50, 500) * 1000,
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    is_active: randomInt(1, 100) > 30,
    created_by: 2
  });
}

console.log('Generating promotion products...');
for (let i = 1; i <= 3000; i++) {
  data.promotion_products.push({
    id: i,
    promotion_id: randomInt(1, 800),
    product_id: randomInt(1, 3000)
  });
}

console.log('Generating orders (sales transactions)...');
for (let i = 1; i <= 30000; i++) {
  const orderDate = randomDate(new Date('2023-01-01'), new Date());
  const subtotal = randomInt(20, 2000) * 1000;
  const discount = randomInt(0, 20);
  const discountAmount = Math.floor(subtotal * discount / 100);
  const total = subtotal - discountAmount;
  
  data.orders.push({
    id: i,
    customer_id: randomInt(1, 100) > 30 ? randomInt(1, 5000) : null,
    cashier_id: randomInt(3, 52),
    order_date: formatDateTime(orderDate),
    subtotal: subtotal,
    discount_percent: discount,
    discount_amount: discountAmount,
    total_amount: total,
    payment_method: ['cash', 'card', 'transfer', 'momo', 'zalopay'][randomInt(0, 4)],
    status: ['completed', 'cancelled'][randomInt(0, 1)],
    promotion_id: randomInt(1, 100) > 70 ? randomInt(1, 800) : null
  });
}

console.log('Generating order items...');
let orderItemId = 1;
for (let orderId = 1; orderId <= 30000; orderId++) {
  const itemCount = randomInt(1, 8);
  for (let j = 0; j < itemCount; j++) {
    const unitPrice = randomInt(5, 200) * 1000;
    const quantity = randomInt(1, 10);
    const discount = randomInt(0, 20);
    const subtotal = unitPrice * quantity;
    const discountAmount = Math.floor(subtotal * discount / 100);
    
    data.order_items.push({
      id: orderItemId++,
      order_id: orderId,
      variant_id: randomInt(1, 8000),
      quantity: quantity,
      unit_price: unitPrice,
      discount_percent: discount,
      discount_amount: discountAmount,
      subtotal: subtotal - discountAmount
    });
  }
}

console.log('Generating payments...');
for (let i = 1; i <= 30000; i++) {
  data.payments.push({
    id: i,
    order_id: i,
    amount: randomInt(20, 2000) * 1000,
    payment_method: ['cash', 'card', 'transfer', 'momo', 'zalopay'][randomInt(0, 4)],
    payment_date: formatDateTime(randomDate(new Date('2023-01-01'), new Date())),
    status: 'completed',
    reference_number: `PAY-${String(i).padStart(10, '0')}`
  });
}

console.log('Generating shift assignments...');
for (let i = 1; i <= 8000; i++) {
  const assignDate = randomDate(new Date('2023-01-01'), new Date('2024-12-31'));
  const userId = randomInt(3, 102);
  data.shift_assignments.push({
    id: i,
    user_id: userId,
    shift_id: randomInt(1, 2),
    assigned_date: formatDate(assignDate),
    status: ['assigned', 'completed', 'cancelled'][randomInt(0, 2)]
  });
}

console.log('Generating attendance...');
for (let i = 1; i <= 8000; i++) {
  const checkIn = randomDate(new Date('2023-01-01'), new Date());
  const checkOut = new Date(checkIn);
  checkOut.setHours(checkOut.getHours() + randomInt(6, 9));
  
  data.attendance.push({
    id: i,
    assignment_id: randomInt(1, 8000),
    check_in: formatDateTime(checkIn),
    check_out: formatDateTime(checkOut),
    total_hours: randomInt(6, 9)
  });
}

console.log('Generating salary payouts...');
for (let i = 1; i <= 3000; i++) {
  data.salary_payouts.push({
    id: i,
    user_id: randomInt(3, 102),
    config_id: randomInt(1, 3),
    month: randomInt(1, 12),
    year: randomInt(2023, 2024),
    base_salary: randomInt(5000, 10000) * 1000,
    bonus: randomInt(0, 2000) * 1000,
    deduction: randomInt(0, 500) * 1000,
    total_payout: randomInt(5000, 12000) * 1000,
    payment_date: formatDate(randomDate(new Date('2023-01-01'), new Date()))
  });
}

console.log('Generating price history...');
for (let i = 1; i <= 12000; i++) {
  const oldPrice = randomInt(5, 200) * 1000;
  const newPrice = oldPrice + randomInt(-20, 50) * 1000;
  data.price_history.push({
    id: i,
    variant_id: randomInt(1, 8000),
    old_price: oldPrice,
    new_price: newPrice,
    changed_by: 2,
    applied_at: formatDateTime(randomDate(new Date('2023-01-01'), new Date()))
  });
}

console.log('Generating reports...');
const reportTypes = ['daily_sales', 'monthly_sales', 'inventory_summary', 'customer_statistics', 'loyal_customers', 'expiring_products', 'low_stock'];
for (let i = 1; i <= 2000; i++) {
  data.reports.push({
    id: i,
    report_type: reportTypes[randomInt(0, reportTypes.length - 1)],
    report_date: formatDate(randomDate(new Date('2023-01-01'), new Date())),
    generated_by: 2,
    data: JSON.stringify({ total_revenue: randomInt(10000, 100000) * 1000, total_orders: randomInt(100, 1000) }),
    created_at: formatDateTime(randomDate(new Date('2023-01-01'), new Date()))
  });
}

console.log('Generating audit logs...');
const actions = ['LOGIN', 'LOGOUT', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'CREATE_ORDER', 'CANCEL_ORDER', 'IMPORT_STOCK', 'EXPORT_STOCK', 'CREATE_PROMOTION', 'UPDATE_CUSTOMER', 'VIEW_REPORT'];
for (let i = 1; i <= 15000; i++) {
  const action = actions[randomInt(0, actions.length - 1)];
  data.audit_logs.push({
    id: i,
    user_id: randomInt(1, 102),
    action: action,
    entity_type: ['product', 'order', 'customer', 'inventory', 'promotion', 'user'][randomInt(0, 5)],
    entity_id: randomInt(1, 1000),
    changes: JSON.stringify({ action: action, timestamp: new Date().toISOString() }),
    ip_address: `192.168.1.${randomInt(1, 255)}`,
    created_at: formatDateTime(randomDate(new Date('2023-01-01'), new Date()))
  });
}

console.log('Writing to file...');
fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

console.log('\n✅ DONE! Generated SmallTrend POS Mockup Data\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('👥 USERS & ROLES:');
console.log('   • Roles: 4 (Admin, Manager, Cashier Staff, Inventory Staff)');
console.log('   • Users: 102 total');
console.log('     - 1 Admin');
console.log('     - 1 Manager');
console.log('     - 50 Cashier Staff');
console.log('     - 50 Inventory Staff');
console.log('   • User Credentials: 102');
console.log('\n📦 PRODUCTS & INVENTORY:');
console.log('   • Products: 3,000');
console.log('   • Product Variants (with barcode): 8,000');
console.log('   • Suppliers: 150');
console.log('   • Inventory Batches (with expiry): 15,000');
console.log('   • Inventory Stock: 20,000');
console.log('   • Stock Imports: 10,000');
console.log('   • Stock Exports: 8,000');
console.log('   • Price History: 12,000');
console.log('\n🛒 SALES & POS:');
console.log('   • Orders: 30,000');
console.log('   • Order Items: ' + data.order_items.length.toLocaleString());
console.log('   • Payments: 30,000');
console.log('\n👨‍👩‍👧‍👦 CRM & PROMOTIONS:');
console.log('   • Customers: 5,000');
console.log('   • Loyalty Points: 5,000');
console.log('   • Promotions: 800');
console.log('   • Promotion Products: 3,000');
console.log('\n👔 HR & SHIFTS:');
console.log('   • Shifts: 2 (Morning, Afternoon)');
console.log('   • Shift Assignments: 8,000');
console.log('   • Attendance: 8,000');
console.log('   • Salary Configs: 3');
console.log('   • Salary Payouts: 3,000');
console.log('\n📊 REPORTS & LOGS:');
console.log('   • Reports: 2,000');
console.log('   • Audit Logs: 15,000');
console.log('\n═══════════════════════════════════════════════════════════');
const totalRecords = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
console.log(`📈 TOTAL RECORDS: ${totalRecords.toLocaleString()}`);
console.log('═══════════════════════════════════════════════════════════\n');
