SET FOREIGN_KEY_CHECKS = 0;
-- =============================================================================
-- SMALLTREND GROCERY STORE DATABASE - Comprehensive Combined Sample Data
-- =============================================================================
-- Password for all users: password
-- Hashed: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- =============================================================================

-- JPA/Hibernate là nguồn chân lý schema.
-- File này chỉ dùng để seed dữ liệu mẫu (idempotent).

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sale_order_histories;
TRUNCATE TABLE sale_order_items;
TRUNCATE TABLE sale_orders;
TRUNCATE TABLE loyalty_transactions;
TRUNCATE TABLE coupon_usage;
TRUNCATE TABLE cash_transactions;
TRUNCATE TABLE shift_handovers;
TRUNCATE TABLE shift_swap_requests;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE payroll_calculations;
TRUNCATE TABLE salary_configs;
TRUNCATE TABLE attendance;
TRUNCATE TABLE user_credentials;
TRUNCATE TABLE tickets;
TRUNCATE TABLE reports;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE cash_registers;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE product_combo_items;
TRUNCATE TABLE product_combos;
TRUNCATE TABLE coupons;
TRUNCATE TABLE campaigns;
TRUNCATE TABLE work_shift_assignments;
TRUNCATE TABLE work_shifts;
TRUNCATE TABLE inventory_count_items;
TRUNCATE TABLE inventory_counts;
TRUNCATE TABLE disposal_voucher_items;
TRUNCATE TABLE disposal_vouchers;
TRUNCATE TABLE inventory_stock;
TRUNCATE TABLE product_batches;
TRUNCATE TABLE locations;
TRUNCATE TABLE variant_prices;
TRUNCATE TABLE price_expiry_alert_logs;
TRUNCATE TABLE variant_attributes;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE gift_redemption_history;
TRUNCATE TABLE loyalty_gifts;
TRUNCATE TABLE purchase_history;
TRUNCATE TABLE unit_conversions;
TRUNCATE TABLE units;
TRUNCATE TABLE products;
TRUNCATE TABLE customers;
TRUNCATE TABLE customer_tiers;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE tax_rates;
TRUNCATE TABLE supplier_contracts;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
TRUNCATE TABLE advertisements;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. SUPPLIERS
INSERT INTO `suppliers` (id,active,address,contact_person,contract_expiry,contract_files,contract_signed_date,created_at,email,name,notes,phone,tax_code,updated_at) VALUES (1,0,'10 Tan Trao, District 7, Ho Chi Minh City, Vietnam','Nguyen Van A','2025-01-15',NULL,'2023-01-15',NULL,'sales@vinamilk.com.vn','Vinamilk Distribution','Main dairy supplier','1800-1199','0100170098',NULL),(2,0,'15 Le Duan Blvd, District 1, Ho Chi Minh City, Vietnam','Tran Thi B','2025-03-01',NULL,'2023-03-01',NULL,'contact@unilever.com.vn','Unilever Vietnam','Personal care and household products','1800-5588','0300491828',NULL),(3,0,'The Vista Building, Hanoi Highway, Ho Chi Minh City, Vietnam','Le Van C','2025-06-01',NULL,'2023-06-01',NULL,'info@nestle.com.vn','Nestle Vietnam','Food and beverage supplier','1900-6011','0302127854',NULL),(4,0,'124 Kim Ma Street, Ba Dinh, Hanoi, Vietnam','Pham Thi D','2025-07-01',NULL,'2023-07-01',NULL,'vietnam@cocacola.com','Coca-Cola Vietnam','Soft drinks supplier','1900-0180','0300693409',NULL),(5,0,'39 Le Duan, District 1, Ho Chi Minh City, Vietnam','Le Van M','2025-08-01',NULL,'2023-08-01',NULL,'contact@masan.com.vn','Masan Consumer','Consumer goods supplier','1800-9090','0302017440',NULL),(6,0,'1 Bach Dang, Tan Binh District, Ho Chi Minh City, Vietnam','Tran Van H','2025-10-01',NULL,'2023-10-01',NULL,'sales@heineken.com.vn','Heineken Vietnam','Beer and beverages supplier','1900-1111','0300847056',NULL),(7,0,'138 Hai Ba Trung, District 1, Ho Chi Minh City, Vietnam','Bui Van K','2025-05-01',NULL,'2023-05-01',NULL,'info@kido.vn','KIDO Group (Tuong An)','Edible oils and foods','1800-6688','0302266881',NULL),(8,0,'182 Le Dai Hanh, District 11, Ho Chi Minh City, Vietnam','Nguyen Van P','2025-04-01',NULL,'2023-04-01',NULL,'contact@pepsico.com.vn','PepsiCo Vietnam','Soft drinks and snacks','1900-1220','0300811445',NULL),(9,0,'Thai Hoa Town, Nghe An Province, Vietnam','Tran Thi T','2025-02-01',NULL,'2023-02-01',NULL,'sales@thmilk.vn','TH Milk Distribution','Dairy supplier','1800-545440','2900326335',NULL),(10,0,'Tan Binh Industrial Park, Ho Chi Minh City, Vietnam','Le Van AC','2025-05-01',NULL,'2023-05-01',NULL,'info@acecookvietnam.vn','Acecook Vietnam','Instant noodle supplier','1900-0120','0300808680',NULL),(11,0,'Tan Binh District, Ho Chi Minh City, Vietnam','Pham Van V','2025-05-10',NULL,'2023-05-10',NULL,'info@vifon.com.vn','Vifon Vietnam','Instant noodles and pho','028-3815-4364','0300391837',NULL),(12,0,'My Phuoc Industrial Park, Binh Duong, Vietnam','Kim Orion','2025-04-01',NULL,'2023-04-01',NULL,'contact@orion.vn','Orion Food Vina','Snack supplier','0274-355-0166','3700381324',NULL),(13,0,'VSIP Industrial Park, Binh Duong, Vietnam','Nguyen Van O','2025-04-15',NULL,'2023-04-15',NULL,'sales@oishi.vn','Oishi Vietnam','Snack foods','0274-378-4088','0302752277',NULL),(14,0,'Vinh Loc Industrial Park, Binh Chanh, Ho Chi Minh City, Vietnam','Tran Thi C','2025-03-15',NULL,'2023-03-15',NULL,'info@cholimexfood.com.vn','Cholimex Food','Sauces and condiments','028-3765-2101','0304475742',NULL),(15,0,'Bien Hoa Industrial Zone, Dong Nai, Vietnam','Somchai CP','2025-06-01',NULL,'2023-06-01',NULL,'info@cp.com.vn','CP Vietnam Corporation','Meat and food products','0251-3836-501','3600235308',NULL),(16,0,'VSIP Industrial Park, Binh Duong, Vietnam','Marco Perfetti','2025-06-10',NULL,'2023-06-10',NULL,'info.vn@perfettivanmelle.com','Perfetti Van Melle Vietnam Co., Ltd','Confectionery supplier (Chupa Chups, Alpenliebe, Mentos)','0274-376-8586','0300588569',NULL),(17,0,'913 Truong Chinh Street, Tan Phu District, Ho Chi Minh City, Vietnam','Nguyen Bich Lam','2025-06-10',NULL,'2023-06-10',NULL,'info@vifon.com.vn','Vifon Joint Stock Company','Instant food supplier (Pho, noodles, vermicelli)','028-3815-4368','0300391836',NULL);

-- 2. BRANDS & CATEGORIES
INSERT INTO `categories` (id,code,name,description,created_at,updated_at) VALUES (1,'BEVERAGE','Đồ uống','Các loại nước uống, giải khát','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(2,'DAIRY','Sữa & Sản phẩm từ sữa','Sữa, sữa chua, sữa đặc','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(3,'PERSONAL_CARE','Chăm sóc cá nhân','Sản phẩm vệ sinh cá nhân','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(4,'HOUSEHOLD','Đồ dùng gia đình','Sản phẩm dùng trong gia đình','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(5,'SNACK','Bánh kẹo ăn vặt','Snack, bánh kẹo','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(6,'HEALTHCARE','Chăm sóc sức khỏe','Sản phẩm chăm sóc sức khỏe','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(7,'CANNED_FOOD','Đồ hộp','Thực phẩm đóng hộp','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(8,'BAKERY','Bánh ngọt','Bánh ngọt, bánh mì','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(9,'MEAT_SEAFOOD','Thịt & Hải sản','Thịt, cá, hải sản','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(10,'CONDIMENT','Gia vị & Nước chấm','Gia vị, nước mắm, nước tương','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126'),(11,'INSTANT_FOOD','Mì ăn liền','Mì, phở, hủ tiếu ăn liền','2026-03-18 01:40:08.835126','2026-03-18 01:40:08.835126');


INSERT INTO `brands` (id,name,description,country,created_at,updated_at,category_id,supplier_id) VALUES (1,'Vinamilk','Sản phẩm sữa','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',2,1),(2,'Nestle','Thực phẩm và đồ uống','Thuỵ Sĩ','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',NULL,3),(3,'Coca-Cola','Nước giải khát','Hoa Kỳ','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',1,4),(4,'P&G','Hàng tiêu dùng','Hoa Kỳ','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',NULL,2),(5,'Kinh Do','Bánh kẹo','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',5,7),(6,'Oishi','Snack ăn vặt','Philippines','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',5,13),(7,'Cholimex','Gia vị và nước chấm','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',10,14),(8,'CP','Thực phẩm thịt','Thái Lan','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',9,15),(9,'Vissan','Thịt chế biến','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',9,15),(10,'Orion','Bánh kẹo','Hàn Quốc','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',5,12),(11,'Chupa Chups','Kẹo','Tây Ban Nha','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',5,16),(12,'Vifon','Mì/phở ăn liền','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',11,11),(13,'Acecook','Mì ăn liền','Nhật Bản','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',11,10),(14,'Masan','Hàng tiêu dùng','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',10,5),(15,'TH True Milk','Sữa','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',2,9),(16,'Pepsico','Nước uống & snack','Hoa Kỳ','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',1,8),(17,'Maggi','Gia vị','Thụy Sĩ','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',10,3),(18,'Dove','Chăm sóc cá nhân','Vương Quốc Anh','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',3,2),(19,'Knorr','Gia vị','Đức','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',10,2),(20,'Lifebuoy','Chăm sóc cá nhân','Vương Quốc Anh','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',3,2),(21,'OMO','Giặt tẩy','Vương Quốc Anh','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',4,2),(22,'Sunsilk','Chăm sóc tóc','Vương Quốc Anh','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',3,2),(23,'Heineken','Bia','Hà Lan','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',1,6),(24,'Tiger','Bia','Singapore','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',1,6),(25,'Tường An','Dầu ăn','Việt Nam','2026-03-18 01:40:08.841821','2026-03-18 01:40:08.841821',10,7);

-- 2.1 SUPPLIER CONTRACTS
INSERT INTO `supplier_contracts` (id,contract_number,created_at,currency,delivery_terms,description,end_date,notes,payment_terms,signed_by_company,signed_by_supplier,signed_date,start_date,status,title,total_value,updated_at,supplier_id) VALUES (1,'SC-VM-2026-001','2026-03-18 01:40:08.000000','VND','Giao hàng theo lịch tuần','Hợp đồng cung ứng sữa và chế phẩm sữa cho toàn hệ thống cửa hàng','2026-12-31','Ưu tiên giao hàng dịp cao điểm lá»… tết','Thanh toán 30 ngày kể từ ngày nhận hóa đơn','Tran Thi Manager','Nguyen Van A','2025-12-20','2026-01-01','ACTIVE','Hợp đồng phân phối sữa Vinamilk 2026',1200000000.00,'2026-03-18 01:40:08.000000',1),(2,'SC-UL-2026-001','2026-03-18 01:40:08.000000','VND','Giao hàng trong 48h sau PO','Hợp đồng cung ứng nhóm sản phẩm chăm sóc cá nhân và gia dụng','2026-12-31','Cam kết đổi trả lô lỗi trong 7 ngày','Thanh toán theo từng lô, tối đa 21 ngày','Tran Thi Manager','Tran Thi B','2026-01-10','2026-01-15','ACTIVE','Hợp đồng đồ gia dụng Unilever 2026',800000000.00,'2026-03-18 01:40:08.000000',2);

-- 3. TAX RATES
INSERT INTO `tax_rates` (id,is_active,name,rate) VALUES (1,0,'VAT Standard',10.00),(2,0,'VAT Reduced',5.00),(3,0,'No Tax',0.00);

-- 4. ROLES & PERMISSIONS
INSERT INTO `roles` VALUES (1,'System Administrator','ADMIN'),(2,'Store Manager','MANAGER'),(3,'Cashier Staff','CASHIER'),(4,'Inventory Staff','INVENTORY_STAFF'),(5,'Sales Staff','SALES_STAFF');

INSERT INTO `permissions` VALUES (1,'User Management','USER_MANAGEMENT'),(2,'Product Management','PRODUCT_MANAGEMENT'),(3,'Inventory Management','INVENTORY_MANAGEMENT'),(4,'Sales Processing','SALES_PROCESSING'),(5,'Report Viewing','REPORT_VIEWING'),(6,'Admin Access','ADMIN_ACCESS');

INSERT INTO `role_permissions` VALUES (1,1,1),(2,2,1),(3,3,1),(4,4,1),(5,5,1),(6,6,1),(7,1,2),(8,2,2),(9,3,2),(10,4,2),(11,5,2),(12,4,3),(13,2,4),(14,3,4),(15,2,5),(16,4,5);

-- 5. USERS (Employee list with diverse roles and work patterns)
INSERT INTO `users` (`id`,`active`,`address`,`created_at`,`email`,`full_name`,`password`,`phone`,`status`,`updated_at`,`username`,`role_id`,`avatar_url`,`base_salary`,`count_late_as_present`,`hourly_rate`,`min_required_shifts`,`salary_type`,`working_hours_per_month`) VALUES (1,1,'123 Nguyen Hue, HCMC','2026-03-18 01:40:08.000000','admin@smalltrend.com','Nguyen Van Admin','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0901234567','ACTIVE','2026-03-18 01:40:08.000000','admin',1,'https://i.pravatar.cc/150?img=12',30000000.00,0,NULL,NULL,'MONTHLY',208.00),(2,1,'456 Le Loi, HCMC','2026-03-18 01:40:08.000000','manager@smalltrend.com','Tran Thi Manager','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0912345678','ACTIVE','2026-03-19 17:52:22.933689','manager',2,'https://res.cloudinary.com/didvvefmu/image/upload/v1773942746/smalltrend/avatars/pqsiai7remow3cpxfx3d.jpg',18000000.00,0,NULL,NULL,'MONTHLY',208.00),(3,1,'789 Dien Bien Phu, HCMC','2026-03-18 01:40:08.000000','cashier1@smalltrend.com','Le Van Cashier','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0923456789','ACTIVE','2026-03-18 01:40:08.000000','cashier1',3,'https://i.pravatar.cc/150?img=15',13500000.00,0,75000.00,NULL,'HOURLY',208.00),(4,1,'321 Ba Trieu, HCMC','2026-03-18 01:40:08.000000','cashier2@smalltrend.com','Vo Thi Cashier 2','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0968765432','ACTIVE','2026-03-18 01:40:08.000000','cashier2',3,'https://i.pravatar.cc/150?img=47',13200000.00,0,72000.00,NULL,'HOURLY',208.00),(5,1,'12 Nguyen Trai, HCMC','2026-03-18 01:40:08.000000','inventory@smalltrend.com','Pham Van Inventory','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0934567890','ACTIVE','2026-03-18 01:40:08.000000','inventory1',4,'https://i.pravatar.cc/150?img=25',13000000.00,0,NULL,NULL,'MONTHLY',208.00),(6,1,'90 Pasteur, HCMC','2026-03-18 01:40:08.000000','sales@smalltrend.com','Hoang Thi Sales','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0945678901','ACTIVE','2026-03-18 01:40:08.000000','sales1',5,'https://i.pravatar.cc/150?img=41',12600000.00,0,70000.00,NULL,'HOURLY',208.00),(7,1,'45 Hai Ba Trung, HCMC','2026-03-18 01:40:08.000000','sales2@smalltrend.com','Nguyen Van Sales 2','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0987654012','ACTIVE','2026-03-18 01:40:08.000000','sales2',5,'https://i.pravatar.cc/150?img=6',12500000.00,0,NULL,20,'MONTHLY_MIN_SHIFTS',208.00),(8,1,'120 Yên Lãng, Đống Đa, Hà Nội','2026-03-19 14:24:14.936732','kiennguyen21005@gmail.com','Nguyễn Xuân Kiên','$2a$10$4eO2jrzTRQmOTW/iSlECv.99/YUjwzsVWIeIViQdjQw0YwEp7ZKNi','0842561752','ACTIVE','2026-03-19 14:24:14.936732','kien',2,NULL,NULL,0,NULL,NULL,'MONTHLY',208.00),(9,1,'Lào Cai','2026-03-19 14:25:32.081856','hung@gmail.com','Nguyễn Quốc Hưng','$2a$10$KT2Gw8KbGyljHUIo18ebeebchc8PjJyjfnJNRf2PnDXtV3rqFXjv2','0977869300','ACTIVE','2026-03-19 14:25:32.081856','hung',2,NULL,NULL,0,NULL,NULL,'MONTHLY',208.00);

-- 6. CUSTOMER TIERS
INSERT INTO `customer_tiers` (`id`,`tier_code`,`tier_name`,`min_spending`,`points_multiplier`,`bonus_points`,`color`,`icon_url`,`free_shipping`,`priority_support`,`early_access`,`birthday_bonus`,`birthday_bonus_points`,`expiry_months`,`benefits`,`priority`,`is_active`,`description`,`created_at`,`updated_at`) VALUES
(1,'BRONZE','Đồng',0.00,1.00,NULL,'#CD7F32',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,NULL,NULL),
(2,'SILVER','Bạc',5000000.00,1.50,NULL,'#C0C0C0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,0,NULL,NULL,'2026-03-19 15:33:09.341890'),
(3,'GOLD','Vàng',15000000.00,2.00,NULL,'#FFD700',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,0,NULL,NULL,NULL),
(4,'PLATINUM','Bạch Kim',50000000.00,3.00,NULL,'#E5E4E2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,0,NULL,NULL,NULL);

-- 7. CUSTOMERS
INSERT INTO `customers` (`id`,`loyalty_points`,`name`,`phone`,`spent_amount`) VALUES (1,150,'Nguyen Van A','0987654321',1200000),(2,800,'Tran Thi B','0976543210',6200000),(3,2000,'Le Van C','0965432109',18000000),(4,3382,'Pham Thi D','0954321098',56340200),(7,4,'Huy','0961390486',48000),(9,0,'s','09999999999',0),(10,0,'Ko','0961390487',0),(11,0,'Huy','0961390488',0),(12,0,'Huy','0123456789',0),(13,0,'Tú','09612345688',0);

-- 8. PRODUCTS
INSERT INTO `products` (id,created_at,name,image_url,is_active,description,updated_at,brand_id,category_id,tax_rate_id) VALUES (1,'2026-03-18 01:40:08.905784','Vinamilk Fresh Milk','https://res.cloudinary.com/didvvefmu/image/upload/v1773772847/smalltrend/user-avatars/kk2k6wrcth9zjgpywmqa.png',1,'Sữa dinh dưỡng Vinamilk','2026-03-19 16:12:45.102749',1,2,2),(2,'2026-03-18 01:40:08.905784','Dove Beauty Bar','https://res.cloudinary.com/didvvefmu/image/upload/v1773772999/smalltrend/user-avatars/tftx9cld5vsqwbnz6fjc.jpg',1,'Xà Phòng Dove','2026-03-17 18:43:17.100845',4,3,1),(3,'2026-03-18 01:40:08.905784','Instant Coffee 20g x 10','https://res.cloudinary.com/didvvefmu/image/upload/v1773773536/smalltrend/user-avatars/wfg6djw0jvx1yyfep3jy.webp',1,'Cà phê Nescafe 3in1','2026-03-17 18:52:14.891507',2,1,1),(4,'2026-03-18 01:40:08.905784','Coca Cola Classic','https://res.cloudinary.com/didvvefmu/image/upload/v1773778429/smalltrend/user-avatars/c0bmdhxmorkjytxyaupj.jpg',1,'Nước ngọt Coca Cola','2026-03-17 20:13:47.164098',3,1,1),(5,'2026-03-18 01:40:08.905784','Potato Chips ','https://res.cloudinary.com/didvvefmu/image/upload/v1773776096/smalltrend/user-avatars/zodjdb1zjfyv5adn5sku.webp',1,'Bánh snack Oishi','2026-03-17 19:34:59.859986',6,5,1),(6,'2026-03-18 01:40:08.905784','Tương ớt chua cay ','https://res.cloudinary.com/didvvefmu/image/upload/v1773776784/smalltrend/user-avatars/e23icn5gbhnp8m0jmfur.jpg',1,'Tương ớt Cholimex','2026-03-17 19:46:22.345976',7,10,1),(7,'2026-03-18 01:40:08.905784','Xúc xích Vườn Hồng ','https://res.cloudinary.com/didvvefmu/image/upload/v1773777092/smalltrend/user-avatars/g7hw4axoeegxq8hp0plp.jpg',1,'Xúc xích CP','2026-03-17 19:52:43.982585',8,9,1),(8,'2026-03-18 01:40:08.905784','Thịt heo hầm ','https://res.cloudinary.com/didvvefmu/image/upload/v1773777262/smalltrend/user-avatars/h2jmpqvfiwqjvxtmnx1k.webp',1,'Đồ hộp Vissan','2026-03-17 19:54:20.346698',9,7,1),(9,'2026-03-18 01:40:08.905784','Bánh chocopie Orion hộp 12 cái','https://res.cloudinary.com/didvvefmu/image/upload/v1773777545/smalltrend/user-avatars/wcgojffzprveex1dx0tn.png',1,'Bánh Chocopie','2026-03-17 19:59:03.273214',10,8,1),(10,'2026-03-18 01:40:08.905784','Kẹo mút hương trái cây','https://res.cloudinary.com/didvvefmu/image/upload/v1773909949/smalltrend/user-avatars/nfuimxb1hzqxjgabqswt.webp',1,'Kẹo mút Chupa Chups','2026-03-19 08:45:46.881999',11,5,1),(11,'2026-03-18 01:40:08.905784','Phở các loại ','https://res.cloudinary.com/didvvefmu/image/upload/v1773910263/smalltrend/user-avatars/inttsrqtpwgdo4pxdsdf.webp',1,'Phở gói Vifon','2026-03-19 08:50:59.612510',14,11,1),(12,'2026-03-18 01:40:08.905784','Mì tôm chua cay ','https://res.cloudinary.com/didvvefmu/image/upload/v1773910371/smalltrend/user-avatars/gzfznjse9r1ew2vozgrm.jpg',1,'Mì Hảo Hảo','2026-03-19 08:52:48.747456',13,11,1),(13,'2026-03-18 01:40:08.905784','Mì khoai tây sườn hầm ','https://res.cloudinary.com/didvvefmu/image/upload/v1773911223/smalltrend/user-avatars/aya3hodi8cjxt0hj0bhd.webp',1,'Mì Omachi','2026-03-19 09:07:00.486156',14,11,1),(14,'2026-03-18 01:40:08.905784','Nước tương tỏi ớt ','https://res.cloudinary.com/didvvefmu/image/upload/v1773911355/smalltrend/user-avatars/fdqcfjy84csx9eazmvmn.webp',1,'Nước tương Chin-su','2026-03-19 09:09:12.272199',14,10,1),(15,'2026-03-18 01:40:08.905784','Sữa chua nha đam ','https://res.cloudinary.com/didvvefmu/image/upload/v1773911512/smalltrend/user-avatars/hsaspcpfl2lfzcvkvnat.webp',1,'Sữa chua TH True Milk','2026-03-19 09:11:48.821013',15,2,2),(16,'2026-03-18 01:40:08.905784','Sữa tươi ít đường ','https://res.cloudinary.com/didvvefmu/image/upload/v1773911825/smalltrend/user-avatars/hrtum3zrjb6rifilyqz4.png',1,'Sữa tươi TH True Milk','2026-03-19 09:17:02.904303',15,2,2),(17,'2026-03-18 01:40:08.905784','Snack khoai tây tự nhiên ','https://res.cloudinary.com/didvvefmu/image/upload/v1773911989/smalltrend/user-avatars/yhfdrccc0brzy9zxske0.png',1,'Snack Lays','2026-03-19 09:19:45.977722',17,5,1),(18,'2026-03-18 01:40:08.905784','Trà Ô Long giảm béo ','https://res.cloudinary.com/didvvefmu/image/upload/v1773912183/smalltrend/user-avatars/cxskvciux7syhbch9o4j.jpg',1,'Trà Ô Long TEA+ Plus','2026-03-19 09:23:00.694221',17,1,1),(19,'2026-03-18 01:40:08.905784','Hạt nêm thịt thăn xương ống ','https://res.cloudinary.com/didvvefmu/image/upload/v1773912417/smalltrend/user-avatars/qlnrrvcapjfn068ujuxu.png',1,'Hạt nêm Knorr','2026-03-19 09:26:53.805754',19,10,1),(20,'2026-03-18 01:40:08.905784','Dầu hào tự nhiên nấm hương ','https://res.cloudinary.com/didvvefmu/image/upload/v1773912775/smalltrend/user-avatars/z4rxm2iecy2e4ol6qy2j.webp',1,'Dầu hào Maggi','2026-03-19 09:32:51.526885',19,10,1),(21,'2026-03-18 01:40:08.905784','Bia Heineken Silver lon ','https://res.cloudinary.com/didvvefmu/image/upload/v1773912972/smalltrend/user-avatars/ryqebth5xfpn7vvyjt5c.webp',1,'Bia Heineken Silver','2026-03-19 09:36:09.165091',23,1,1),(22,'2026-03-18 01:40:08.905784','Bia Tiger Crystal lon ','https://res.cloudinary.com/didvvefmu/image/upload/v1773913094/smalltrend/user-avatars/csy3ylvsmjvyxiguwre4.jpg',1,'Bia Tiger Bạc','2026-03-19 09:38:11.944943',24,1,1),(23,'2026-03-18 01:40:08.905784','Nước mắm Nam Ngư chai ','https://res.cloudinary.com/didvvefmu/image/upload/v1773913155/smalltrend/user-avatars/xheglrtrqj4ckymxilex.png',1,'Nước mắm Nam Ngư','2026-03-19 09:39:11.885935',14,10,1),(24,'2026-03-18 01:40:08.905784','Sữa đặc có đường Ông Thọ đỏ lon ','https://res.cloudinary.com/didvvefmu/image/upload/v1773913190/smalltrend/user-avatars/ouu72al6cipvjlrdnxfv.png',1,'Sữa đặc Ông Thọ','2026-03-19 09:39:46.628476',1,2,2),(25,'2026-03-18 01:40:08.905784','Dầu ăn thực vật Tường An chai','https://res.cloudinary.com/didvvefmu/image/upload/v1773913261/smalltrend/user-avatars/k09c80gyjlchnftkcr26.png',1,'Dầu ăn Tường An','2026-03-19 09:40:57.807293',25,10,1),(26,'2026-03-18 01:40:08.905784','Bột giặt OMO hệ bọt thông minh ','https://res.cloudinary.com/didvvefmu/image/upload/v1773913287/smalltrend/user-avatars/eo6hjpnfxm6ayqe5xmx2.jpg',1,'Bột giặt OMO','2026-03-19 09:41:24.379170',21,4,1);

-- 8.1 UNITS
INSERT INTO `units` (id,code,default_cost_price,default_sell_price,material_type,name,symbol) VALUES (1,'HOP',NULL,NULL,'SOLID','Hộp','hộp'),(2,'LOC',NULL,NULL,'SOLID','Lốc','lốc'),(3,'THUNG',NULL,NULL,'SOLID','Thùng','thùng'),(4,'GOI',NULL,NULL,'SOLID','Gói','gói'),(5,'CAI',NULL,NULL,'SOLID','Cái','cái'),(6,'LON',NULL,NULL,'SOLID','Lon','lon'),(7,'CHAI',NULL,NULL,'SOLID','Chai','chai'),(8,'BICH',NULL,NULL,'SOLID','Bịch','bich');

-- 9. PRODUCT VARIANTS
INSERT INTO `product_variants` (`id`,`barcode`,`created_at`,`image_url`,`is_active`,`is_base_unit`,`plu_code`,`sell_price`,`sku`,`updated_at`,`coupon_id`,`product_id`,`unit_id`) VALUES (1,'8930000193995','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773772910/smalltrend/user-avatars/o33bylqob6pxjc8tukfu.png',1,1,NULL,23000.00,'DAIRY-VINA-SUADIN-BICH22OML-ITDUONG','2026-03-19 16:12:45.104746',NULL,1,8),(2,'8930000122551','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773773072/smalltrend/user-avatars/dhudvv2ujf5e5co6ootg.jpg',1,1,NULL,15000.00,'PERSONAL_CARE-PG-XAPHON-HOP90G-NGUYEN','2026-03-17 18:44:30.721805',NULL,2,1),(3,'8930000161246','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773774242/smalltrend/user-avatars/nxldrdvkm1o2fljoq0dn.webp',1,1,NULL,45000.00,'BEVERAGE-NEST-CAPHEN-HOP255G-NGUYEN','2026-03-17 19:04:00.806758',NULL,3,1),(4,'8901234567893','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773778489/smalltrend/user-avatars/hpowweus5mmsnz0ccx8l.jpg',1,1,NULL,15400.00,'BEVERAGE-COCA-NUOCNG-LON330ML-NGUYEN','2026-03-19 09:03:42.000358',NULL,4,6),(5,'8930000149572','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773776664/smalltrend/user-avatars/icro6udsd93qzizzvd2j.webp',1,1,NULL,8000.00,'SNACK-OISH-BANHSN-GOI40G-PHOMAT','2026-03-17 19:44:22.804058',NULL,5,4),(6,'8930000171863','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773776870/smalltrend/user-avatars/vrand1uqxez5tq73dktk.jpg',1,1,NULL,13000.00,'CONDIMENT-CHOL-TUONGO-CHAI130G','2026-03-17 19:47:48.174277',NULL,6,7),(7,'8930000196125','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773777228/smalltrend/user-avatars/m1jlc0zltitolbl94ja4.jpg',1,1,NULL,55000.00,'MEAT_SEAFOOD-CP-XUCXIC-GOI500G','2026-03-17 19:53:46.365399',NULL,7,4),(8,'8930000169044','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773777363/smalltrend/user-avatars/bd2hgni4twjpr2zwzsan.webp',1,1,NULL,22000.00,'CANNED_FOOD-VISS-DOHOPV-HOP170G-BOKHO','2026-03-17 19:56:01.293126',NULL,8,1),(9,'8930000144416','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773777788/smalltrend/user-avatars/yqhleiczkcxfbgokhm7b.png',1,1,NULL,38500.00,'BAKERY-ORIO-BANHCH-HOP396G-NGUYEN','2026-03-19 12:45:01.209140',NULL,9,1),(10,'8930000113740','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773910052/smalltrend/user-avatars/rxu9ondhpdln92zll0t7.webp',1,1,NULL,50000.00,'SNACK-CHUP-KEOMUT-GOI30C','2026-03-19 08:47:29.365008',NULL,10,4),(11,'8930000125231','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773910333/smalltrend/user-avatars/uv9otcj50xs26gs4qts2.webp',1,1,NULL,8000.00,'INSTANT_FOOD-MASA-PHOGOI-GOI65G-GA','2026-03-19 08:52:09.825864',NULL,11,4),(12,'8930000127303','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773910438/smalltrend/user-avatars/ik1z1wq7tcxxig6bxggq.jpg',1,1,NULL,4500.00,'INSTANT_FOOD-ACEC-MIHAOH-GOI75G-CHUACAY','2026-03-19 08:53:55.700128',NULL,12,4),(13,'8930000171634','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773911290/smalltrend/user-avatars/d70b96npjlercdnhqc6u.webp',1,1,NULL,10000.00,'INSTANT_FOOD-MASA-MIOMAC-GOI80G-BOHAM','2026-03-19 09:08:08.160152',NULL,13,4),(14,'8930000176011','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773911418/smalltrend/user-avatars/nzpiahhjvtoysx5vfoxi.webp',1,1,NULL,15000.00,'CONDIMENT-MASA-NUOCTU-CHAI330ML-TOIOT','2026-03-19 09:10:15.226258',NULL,14,7),(15,'8901234567904','2026-03-18 01:40:08.933285',NULL,1,1,NULL,6000.00,'TH-N-100G','2026-03-18 01:40:08.933285',NULL,15,1),(16,'8930000171153','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773911928/smalltrend/user-avatars/l5ezwmbvpbjsmewe8hmo.png',1,1,NULL,35000.00,'DAIRY-THTR-SUATUO-HOP220ML-NGUYEN','2026-03-19 09:18:45.165700',NULL,16,1),(17,'8930000146663','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773912150/smalltrend/user-avatars/wgvlu99hoyhumcsffge3.png',1,1,NULL,12000.00,'SNACK-MAGG-SNACKL-GOI30G-BO','2026-03-19 09:22:26.744542',NULL,17,4),(18,'8930000109279','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773912264/smalltrend/user-avatars/g3quurw8erpu5rpsw5yj.jpg',1,1,NULL,10000.00,'BEVERAGE-MAGG-TRAOLO-CHAI450ML-NGUYEN','2026-03-19 09:24:44.981697',NULL,18,7),(19,'8930000186157','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773912473/smalltrend/user-avatars/xktud0bg65rjytvw9foq.png',1,1,NULL,30000.00,'CONDIMENT-KNOR-HATNEM-GOI380G-NAMHUONG','2026-03-19 09:27:50.079383',NULL,19,4),(20,'8930000109811','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773912911/smalltrend/user-avatars/lpyqea1uyrfxmacomnz5.webp',1,1,NULL,25000.00,'CONDIMENT-KNOR-DAUHAO-CHAI350G-HAISAN','2026-03-19 09:35:08.042089',NULL,20,7),(21,'8930000139672','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773913028/smalltrend/user-avatars/d9ehbqq301llj6fdbyxs.webp',1,1,NULL,23100.00,'BEVERAGE-HEIN-BIAHEI-LON330ML','2026-03-19 09:37:04.680494',NULL,21,6),(22,'8930000123411','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773913126/smalltrend/user-avatars/psat5m6feqy4dk4bpjdm.webp',1,1,NULL,18000.00,'BEVERAGE-TIGE-BIATIG-LON330ML','2026-03-19 09:38:42.625590',NULL,22,6),(23,'8901234567912','2026-03-18 01:40:08.933285',NULL,1,1,NULL,35000.00,'NN-500ML','2026-03-18 01:40:08.933285',NULL,23,7),(24,'8930000154279','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773913244/smalltrend/user-avatars/vuxvb3qmojdaxvh1ikut.png',1,1,NULL,25000.00,'DAIRY-VINA-SUADAC-LON380G','2026-03-19 09:40:41.594268',NULL,24,6),(25,'8901234567914','2026-03-18 01:40:08.933285',NULL,1,1,NULL,50000.00,'TA-1L','2026-03-18 01:40:08.933285',NULL,25,7),(26,'8930000199911','2026-03-18 01:40:08.933285','https://res.cloudinary.com/didvvefmu/image/upload/v1773913343/smalltrend/user-avatars/x2rsucpqflqznbnerxzb.jpg',1,1,NULL,40000.00,'HOUSEHOLD-OMO-BOTGIA-GOI350G','2026-03-19 09:42:21.876911',NULL,26,4),(27,'8930000133342','2026-03-17 18:42:46.031234','https://res.cloudinary.com/didvvefmu/image/upload/v1773772967/smalltrend/user-avatars/vdu8czpwiu3qet5zsasw.png',1,0,NULL,0.00,'DAIRY-VINA-SUADIN-BICH220ML-DAU','2026-03-19 17:06:51.075335',NULL,1,8),(28,'8930000161734','2026-03-17 18:51:17.975528','https://res.cloudinary.com/didvvefmu/image/upload/v1773773479/smalltrend/user-avatars/bpy5d10ssqg5dnmwvguv.png',1,0,NULL,15400.00,'PERSONAL_CARE-PG-XAPHON-HOP90G-TUOI','2026-03-19 09:04:18.390337',NULL,2,1),(29,'8930000167736','2026-03-17 19:33:48.792449','https://res.cloudinary.com/didvvefmu/image/upload/v1773776030/smalltrend/user-avatars/eins9fd6p4qvhvslj5do.jpg',1,0,NULL,0.00,'BEVERAGE-NEST-CAPHEN-HOP255G-RANG','2026-03-17 19:33:48.792449',NULL,3,1),(30,'8930000149121','2026-03-17 19:45:23.941447','https://res.cloudinary.com/didvvefmu/image/upload/v1773776725/smalltrend/user-avatars/d6dlcsprxbocypnf6cgm.webp',1,0,NULL,12100.00,'SNACK-OISH-BANHSN-GOI40G-TOMCAY','2026-03-19 09:03:09.686273',NULL,5,4),(31,'8930000119278','2026-03-17 19:48:27.446008','https://res.cloudinary.com/didvvefmu/image/upload/v1773776909/smalltrend/user-avatars/j4dj9pjuuhhclkutaxg6.jpg',1,0,NULL,0.00,'CONDIMENT-CHOL-TUONGO-CHAI830G','2026-03-17 19:48:27.446008',NULL,6,7),(32,'8930000121158','2026-03-17 19:58:25.077167','https://res.cloudinary.com/didvvefmu/image/upload/v1773777507/smalltrend/user-avatars/ztpgadh6wdjhqyacr22j.webp',1,0,NULL,0.00,'CANNED_FOOD-VISS-DOHOPV-HOP170G-SUONNAUDAU','2026-03-17 19:58:25.077167',NULL,8,1),(33,'8930000112736','2026-03-17 20:05:18.866189','https://res.cloudinary.com/didvvefmu/image/upload/v1773777920/smalltrend/user-avatars/cup3o2geklrs4pkyco0c.png',1,0,NULL,0.00,'BAKERY-ORIO-BANHCH-HOP360G-MATCHA','2026-03-19 06:06:10.664386',NULL,9,1),(34,'2000010034096','2026-03-17 20:08:13.486592','https://res.cloudinary.com/didvvefmu/image/upload/v1773778115/smalltrend/user-avatars/jmtlotmdvagxrl3gijbl.webp',1,0,NULL,0.00,'DAIRY-VINA-SUADIN-BICH220ML-THUNG48','2026-03-19 17:06:51.075335',NULL,1,3),(35,'2000040035087','2026-03-17 20:15:03.949593','https://res.cloudinary.com/didvvefmu/image/upload/v1773778489/smalltrend/user-avatars/hpowweus5mmsnz0ccx8l.jpg',1,0,NULL,360000.00,'BEVERAGE-COCA-NUOCNG-LON330ML-THUNG30','2026-03-17 20:15:03.966126',NULL,4,3),(36,'8930000112934','2026-03-19 08:32:45.066186','https://res.cloudinary.com/didvvefmu/image/upload/v1773909168/smalltrend/user-avatars/hdothjp2wuqv4u3yobyt.jpg',1,0,NULL,0.00,'BEVERAGE-MAGG-TRAOLO-CHAI450ML-CHANH','2026-03-19 08:32:45.066186',NULL,18,7);

-- 8.2 UNIT CONVERSIONS (Conversion between units for variants)
-- Example: 1 carton (THUNG) = 12 boxes (HOP), 1 pack (LOC) = 4 boxes
INSERT INTO `unit_conversions` (id,conversion_factor,description,is_active,sell_price,to_unit_id,variant_id) VALUES (15,48.0000,'',1,0.00,3,27),(16,30.0000,'',1,360000.00,3,4);

-- 9.0 VARIANT ATTRIBUTES
INSERT INTO `variant_attributes` VALUES (1,'Ít đường','Hương vị'),(1,'220ml','Thể tích'),(2,'Nguyên bản','Hương'),(2,'90G','Trọng lượng'),(3,'Nguyên bản','Hương vị'),(3,'255G','Trọng lượng'),(4,'Nguyên bản','Hương vị'),(4,'330ml','Thể tích'),(5,'Phô mai','Hương vị'),(5,'40G','Trọng lượng'),(6,'130G','Trọng lượng'),(7,'500G','Trọng lượng'),(8,'Bò kho','Hương vị'),(8,'170G','Khối lượng'),(9,'Nguyên bản','Hương vị'),(9,'396G','Khối lương'),(10,'30 cái','Số lượng'),(11,'Gà','Hương vị'),(11,'65g','Trọng lượng'),(12,'Chua cay','Hương vị'),(12,'75g','Khối lượng'),(13,'Bò hầm','Hương vị'),(13,'80g','Khối lượng'),(14,'Tỏi ớt','Hương'),(14,'330ml','Thể tích'),(16,'Nguyên bản','Hương vị'),(16,'220ml','Thể tích'),(17,'Bò Nướng Texas','Hương vị'),(17,'30g','Trọng lượng'),(18,'Nguyên bản','Hương vị'),(18,'450ml','Thể tích'),(19,'Nấm hương','Loại'),(19,'380g','Trọng lượng'),(20,'Hải sản','Loại'),(20,'350g','Thể tích'),(21,'330ml','Thể tích'),(22,'330ml','Thể tích'),(24,'380g','Khối lượng'),(26,'350g','Trọng lượng'),(27,'Dâu tây','Hương vị'),(27,'220ml','Thể tích'),(28,'Tươi mát','Hương'),(28,'90G','Trọng lượng'),(29,'Cà phê rang','Hương vị'),(29,'255G','Trọng lượng'),(30,'Tôm cay','Hương vị'),(30,'40G','Trọng lượng'),(31,'830G','Trọng lượng'),(32,'Sườn nấu đậu','Hương vị'),(32,'170G','Khối lượng'),(33,'Matcha đậu đỏ','Hương vị'),(33,'360G','Khối lương'),(34,'Dâu tây','Hương vị'),(34,'220ml','Thể tích'),(35,'Nguyên bản','Hương vị'),(35,'330ml','Thể tích'),(36,'Chanh','Hương vị'),(36,'450ml','Thể tích');

-- 9.1 VARIANT PRICES (Initial active prices for all variants)
INSERT INTO `variant_prices` (`id`,`created_at`,`effective_date`,`purchase_price`,`selling_price`,`status`,`tax_percent`,`variant_id`,`base_selling_price`,`expiry_date`) VALUES(1,'2026-03-18 01:40:08.947535','2026-01-15',20000.00,23000.00,'ACTIVE',10.00,1,NULL,NULL),(2,'2026-03-18 01:40:08.947535','2026-02-01',12000.00,15000.00,'ACTIVE',10.00,2,NULL,NULL),(3,'2026-03-18 01:40:08.947535','2026-01-20',35000.00,45000.00,'ACTIVE',10.00,3,NULL,NULL),(4,'2026-03-18 01:40:08.947535','2026-02-10',12000.00,12000.00,'INACTIVE',10.00,4,NULL,NULL),(5,'2026-03-18 01:40:08.947535','2026-02-01',6000.00,8000.00,'ACTIVE',10.00,5,NULL,NULL),(6,'2026-03-18 01:40:08.947535','2026-01-15',10000.00,13000.00,'ACTIVE',10.00,6,NULL,NULL),(7,'2026-03-18 01:40:08.947535','2026-02-01',45000.00,55000.00,'ACTIVE',10.00,7,NULL,NULL),(8,'2026-03-18 01:40:08.947535','2026-01-20',18000.00,22000.00,'ACTIVE',10.00,8,NULL,NULL),(9,'2026-03-18 01:40:08.947535','2026-02-10',32000.00,40000.00,'INACTIVE',10.00,9,NULL,NULL),(10,'2026-03-18 01:40:08.947535','2026-02-01',1000.00,2000.00,'ACTIVE',5.00,10,NULL,NULL),(11,'2026-03-18 01:40:08.947535','2026-01-15',6000.00,8000.00,'ACTIVE',10.00,11,NULL,NULL),(12,'2026-03-18 01:40:08.947535','2026-02-01',3000.00,4500.00,'ACTIVE',10.00,12,NULL,NULL),(13,'2026-03-18 01:40:08.947535','2026-01-20',7000.00,10000.00,'ACTIVE',10.00,13,NULL,NULL),(14,'2026-03-18 01:40:08.947535','2026-02-10',11000.00,15000.00,'ACTIVE',10.00,14,NULL,NULL),(15,'2026-03-18 01:40:08.947535','2026-03-01',4000.00,6000.00,'ACTIVE',5.00,15,NULL,NULL),(16,'2026-03-18 01:40:08.947535','2026-03-01',25000.00,35000.00,'ACTIVE',10.00,16,NULL,NULL),(17,'2026-03-18 01:40:08.947535','2026-02-10',8000.00,12000.00,'ACTIVE',10.00,17,NULL,NULL),(18,'2026-03-18 01:40:08.947535','2026-02-15',7000.00,10000.00,'ACTIVE',10.00,18,NULL,NULL),(19,'2026-03-18 01:40:08.947535','2026-01-20',24000.00,30000.00,'ACTIVE',10.00,19,NULL,NULL),(20,'2026-03-18 01:40:08.947535','2026-02-10',20000.00,25000.00,'ACTIVE',10.00,20,NULL,NULL),(21,'2026-03-18 01:40:08.947535','2026-02-15',16000.00,20000.00,'INACTIVE',10.00,21,NULL,NULL),(22,'2026-03-18 01:40:08.947535','2026-02-15',14000.00,18000.00,'ACTIVE',10.00,22,NULL,NULL),(23,'2026-03-18 01:40:08.947535','2026-02-15',28000.00,35000.00,'ACTIVE',10.00,23,NULL,NULL),(24,'2026-03-18 01:40:08.947535','2026-02-15',20000.00,25000.00,'ACTIVE',10.00,24,NULL,NULL),(25,'2026-03-18 01:40:08.947535','2026-02-15',40000.00,50000.00,'ACTIVE',10.00,25,NULL,NULL),(26,'2026-03-18 01:40:08.947535','2026-02-15',32000.00,40000.00,'ACTIVE',10.00,26,NULL,NULL),(27,'2026-03-17 21:53:50.224337','2026-03-17',32000.00,30000.00,'INACTIVE',10.00,9,NULL,NULL),(28,'2026-03-17 21:54:07.038309','2026-03-17',32000.00,35000.00,'INACTIVE',10.00,9,NULL,NULL),(29,'2026-03-18 08:56:14.613425','2026-03-18',0.00,10000.00,'INACTIVE',10.00,33,NULL,'2026-03-19'),(30,'2026-03-18 10:12:59.693522','2026-03-18',32000.00,38500.00,'INACTIVE',10.00,9,NULL,'2026-03-19'),(31,'2026-03-18 16:35:35.389328','2026-03-18',16000.00,23100.00,'ACTIVE',10.00,21,NULL,NULL),(32,'2026-03-19 06:54:18.323113','2026-03-19',500000.00,0.00,'INACTIVE',5.00,34,NULL,NULL),(33,'2026-03-19 06:54:18.331646','2026-03-19',10416.67,0.00,'INACTIVE',5.00,27,NULL,NULL),(34,'2026-03-19 06:55:04.014556','2026-03-19',12083.33,15800.00,'INACTIVE',5.00,27,NULL,'2026-03-20'),(35,'2026-03-19 06:55:19.571183','2026-03-19',580000.00,577500.00,'INACTIVE',5.00,34,NULL,'2026-03-20'),(36,'2026-03-19 09:02:42.165644','2026-03-19',32000.00,38500.00,'ACTIVE',10.00,9,NULL,'2026-08-31'),(37,'2026-03-19 09:03:09.683238','2026-03-19',10000.00,12100.00,'ACTIVE',10.00,30,NULL,'2026-08-31'),(38,'2026-03-19 09:03:41.998133','2026-03-19',12000.00,15400.00,'ACTIVE',10.00,4,NULL,'2026-08-31'),(39,'2026-03-19 09:04:18.388334','2026-03-19',10000.00,15400.00,'ACTIVE',10.00,28,NULL,'2026-08-31');

-- 9.2 PRICE EXPIRY ALERT LOGS
-- 10. LOCATIONS
INSERT INTO `locations` (id,address,capacity,created_at,description,grid_col,grid_level,grid_row,location_code,name,status,type,zone) VALUES (1,'Kho chính, Dãy A, Hàng 1',5000,'2026-03-18 01:40:08.000000',NULL,1,1,1,'WH-A1','Kho lưu trữ A1','ACTIVE','STORAGE','A'),(2,'Kệ hàng, Dãy C, Vị trí 3',2000,'2026-03-18 01:40:08.000000',NULL,3,1,1,'DF-C3','Kệ hàng C3','ACTIVE','DISPLAY','C'),(3,'Kho lạnh, Dãy B, Tầng 1',2000,'2026-03-18 01:40:08.000000',NULL,1,1,1,'CS-B1','Kho lạnh B1','ACTIVE','COLD_STORAGE','B'),(4,'Kệ hàng, Dãy C, Vị trí 1',2000,'2026-03-18 01:40:08.000000',NULL,1,1,1,'DF-C1','Kệ hàng C1','ACTIVE','DISPLAY','C'),(5,'Kệ hàng, Dãy C, Vị trí 2',2000,'2026-03-18 01:40:08.000000',NULL,2,1,1,'DF-C2','Kệ hàng C2','ACTIVE','DISPLAY','C');


-- 11. PRODUCT BATCHES
INSERT INTO `product_batches` (id,batch_number,cost_price,expiry_date,mfg_date,variant_id) VALUES (1,'VM2026001',20000.00,'2026-04-15','2026-01-15',1),(2,'DV2026001',12000.00,'2027-02-01','2026-02-01',2),(3,'NC2026001',35000.00,'2027-01-20','2026-01-20',3),(4,'CC2026001',8000.00,'2026-08-10','2026-02-10',4),(5,'OI2026001',6000.00,'2026-06-01','2026-02-01',5),(6,'CH2026001',10000.00,'2026-10-15','2026-01-15',6),(7,'CP2026001',45000.00,'2026-04-01','2026-02-01',7),(8,'VS2026001',18000.00,'2027-01-20','2026-01-20',8),(9,'OR2026001',32000.00,'2026-12-10','2026-02-10',9),(10,'CU2026001',1000.00,'2027-06-01','2026-02-01',10),(11,'VF2026001',6000.00,'2026-07-15','2026-01-15',11),(12,'HH2026001',3000.00,'2026-08-01','2026-02-01',12),(13,'OM2026001',7000.00,'2026-07-20','2026-01-20',13),(14,'CS2026001',11000.00,'2027-02-10','2026-02-10',14),(15,'THY2026001',4000.00,'2026-04-01','2026-03-01',15),(16,'THM2026001',25000.00,'2026-09-01','2026-03-01',16),(17,'LA2026001',8000.00,'2026-11-10','2026-02-10',17),(18,'TP2026001',7000.00,'2026-10-15','2026-02-15',18),(19,'KN2026001',24000.00,'2027-01-20','2026-01-20',19),(20,'MG2026001',20000.00,'2027-02-10','2026-02-10',20),(21,'HEI2026001',16000.00,'2027-02-15','2026-02-15',21),(22,'TIG2026001',14000.00,'2027-02-15','2026-02-15',22),(23,'NN2026001',28000.00,'2027-02-15','2026-02-15',23),(24,'OT2026001',20000.00,'2027-02-15','2026-02-15',24),(25,'TA2026001',40000.00,'2027-02-15','2026-02-15',25),(26,'OMO2026001',32000.00,'2027-02-15','2026-02-15',26),(27,'DA2026027',20000.00,'2026-10-31','2026-03-18',34),(28,'CC2026001',8000.00,'2026-08-10','2026-02-10',35),(29,'BE2026029',12000.00,'2026-11-30','2026-03-18',35),(30,'DA2026030',25000.00,'2026-11-30','2026-03-18',27),(31,'DA2026031',23000.00,'2027-03-18','2026-03-18',27),(32,'PE2026032',10000.00,'2027-12-31','2026-03-18',28),(33,'SN2026033',10000.00,'2027-03-13','2026-03-18',30),(34,'DAIRYV-000034',500000.00,'2027-03-19','2026-03-19',27),(38,'DAIRYV-000035',520000.00,'2026-12-30','2026-03-19',27),(39,'DAIRYV-000036',580000.00,'2026-12-30','2026-03-19',27),(40,'EX2026040',12000.00,'2026-02-10','2026-01-10',4),(41,'EX2026041',16000.00,'2026-01-25','2025-12-25',21),(42,'EX2026042',7000.00,'2026-03-05','2026-01-05',18);

-- 11.1 INVENTORY STOCK
INSERT INTO `inventory_stock` (id,quantity,batch_id,location_id,variant_id) VALUES (1,214,1,1,1),(2,178,2,2,2),(3,260,3,3,3),(4,502,4,4,4),(5,383,5,5,5),(6,120,6,1,6),(7,85,7,2,7),(8,150,8,3,8),(9,200,9,4,9),(10,973,10,5,10),(11,300,11,1,11),(12,500,12,2,12),(13,400,13,3,13),(14,250,14,4,14),(15,180,15,5,15),(16,210,16,1,16),(17,318,17,2,17),(18,280,18,3,18),(19,140,19,4,19),(20,190,20,5,20),(21,300,21,1,21),(22,250,22,2,22),(23,100,23,3,23),(24,148,24,4,24),(25,200,25,5,25),(26,80,26,1,26),(27,480,27,1,34),(28,16,28,4,35),(29,300,29,1,35),(30,480,30,1,27),(31,480,31,2,27),(32,1,32,1,28),(33,10,33,3,30),(34,96,34,1,27),(38,384,38,1,27),(39,240,39,1,27),(40,24,40,2,4),(41,15,41,3,21),(42,30,42,4,18);

-- Điều chỉnh số lượng tồn kho để phản ánh trạng thái sau khi đã xác nhận phiếu kiểm kho
-- và các giao dịch bán hàng đã ghi nhận trong stock_movements
-- variant 1 (Fresh Milk 1L, loc 1): 250 khởi đầu - 5 (IC-2026-0001) - 4 (bán) - 150 (transfer out) → ~91, giữ 245 như mức đã được audit
UPDATE inventory_stock SET quantity = 245 WHERE variant_id = 1 AND location_id = 1 AND batch_id = 1;
-- variant 2 (Dove Soap, loc 2): OK theo kiểm kho, giảm 2 do bán
UPDATE inventory_stock SET quantity = 178 WHERE variant_id = 2 AND location_id = 2 AND batch_id = 2;
-- variant 3 (Nescafe, loc 3): 260 + 1 (IC-2026-0002) - 1 (bán) = 260
UPDATE inventory_stock SET quantity = 260 WHERE variant_id = 3 AND location_id = 3 AND batch_id = 3;
-- variant 4 (Coca Cola, loc 4): 510 - 4 (sale 1) - 4 (lẻ) = ~502, để ở mức trước kiểm
UPDATE inventory_stock SET quantity = 502 WHERE variant_id = 4 AND location_id = 4 AND batch_id = 4;
-- variant 5 (Oishi, loc 5): 390 - 3 (sale 1) = 387
UPDATE inventory_stock SET quantity = 387 WHERE variant_id = 5 AND location_id = 5 AND batch_id = 5;

-- 12. WORK SHIFTS (Matching JPA Schema)
-- 12. WORK SHIFTS (Matching JPA Schema)
INSERT INTO `work_shifts` (`id`,`allow_early_clock_in`,`allow_late_clock_out`,`break_end_time`,`break_minutes`,`break_start_time`,`created_at`,`description`,`early_clock_in_minutes`,`end_time`,`grace_peroid_minutes`,`holiday_bonus`,`late_clock_out_minutes`,`maximum_staff_allowed`,`minimum_staff_required`,`night_shift_bonus`,`overtime_multiplier`,`planned_minutes`,`requires_approval`,`shift_code`,`shift_name`,`shift_type`,`start_time`,`status`,`updated_at`,`weekend_bonus`,`working_minutes`,`supervisor_role_id`,`effective_from`,`effective_to`) VALUES(1,0,0,'13:00:00.000000',NULL,'12:00:00.000000',NULL,'Ca sáng từ 8h đến 17h, nghỉ trưa 1 tiếng',15,'17:00:00.000000',10,0.00,30,5,2,0.00,1.50,NULL,0,'SHIFT-MORNING','Ca Sáng','REGULAR','08:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL),(2,0,0,'18:30:00.000000',NULL,'18:00:00.000000',NULL,'Ca chiều từ 13h đến 22h, nghỉ 30 phút',15,'22:00:00.000000',10,0.00,30,4,2,10.00,1.50,NULL,0,'SHIFT-AFTERNOON','Ca Chiều','REGULAR','13:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL),(3,0,0,NULL,NULL,NULL,NULL,'Ca tối từ 18h đến 23h, phụ cấp ca đêm 15%',10,'23:00:00.000000',5,0.00,20,3,2,15.00,1.50,NULL,0,'SHIFT-EVENING','Ca Tối','NIGHT','18:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL),(4,0,0,'13:30:00.000000',NULL,'12:30:00.000000',NULL,'Ca cuối tuần từ 9h đến 18h, phụ cấp 20%',15,'18:00:00.000000',10,0.00,30,6,3,0.00,2.00,NULL,0,'SHIFT-WEEKEND','Ca Cuối Tuần','WEEKEND','09:00:00.000000','ACTIVE',NULL,20.00,NULL,NULL,NULL,NULL),(5,0,0,'13:00:00.000000',NULL,'12:00:00.000000',NULL,'Ca full-time chuẩn 8 tiếng',15,'17:00:00.000000',10,0.00,30,3,1,0.00,1.50,NULL,0,'SHIFT-FULLTIME','Ca Full-time','REGULAR','08:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL);

-- 13. WORK SHIFT ASSIGNMENTS (with expanded employee coverage)
INSERT INTO `work_shift_assignments` (`id`,`created_at`,`notes`,`shift_date`,`status`,`updated_at`,`user_id`,`work_shift_id`,`is_deleted`) VALUES (1,'2026-03-18 01:40:09.000000','Giám sát hoạt động cửa hàng','2026-02-24','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(2,'2026-03-18 01:40:09.000000',NULL,'2026-02-25','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(3,'2026-03-18 01:40:09.000000',NULL,'2026-02-26','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(4,'2026-03-18 01:40:09.000000',NULL,'2026-02-27','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(5,'2026-03-18 01:40:09.000000','Thu ngân ca sáng','2026-02-24','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(6,'2026-03-18 01:40:09.000000',NULL,'2026-02-25','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(7,'2026-03-18 01:40:09.000000',NULL,'2026-02-26','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(8,'2026-03-18 01:40:09.000000','Xin nghỉ không lương','2026-02-27','ABSENT','2026-03-18 01:40:09.000000',3,1,0),(9,'2026-03-18 01:40:09.000000','Quản lý kho ca sáng','2026-02-24','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(10,'2026-03-18 01:40:09.000000',NULL,'2026-02-25','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(11,'2026-03-18 01:40:09.000000',NULL,'2026-02-26','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(12,'2026-03-18 01:40:09.000000','Quản lý ca chiều','2026-02-24','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(13,'2026-03-18 01:40:09.000000',NULL,'2026-02-25','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(14,'2026-03-18 01:40:09.000000',NULL,'2026-02-26','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(15,'2026-03-18 01:40:09.000000',NULL,'2026-02-27','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(16,'2026-03-18 01:40:09.000000','Thu ngân ca chiều','2026-02-24','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(17,'2026-03-18 01:40:09.000000',NULL,'2026-02-25','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(18,'2026-03-18 01:40:09.000000',NULL,'2026-02-26','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(19,'2026-03-18 01:40:09.000000',NULL,'2026-02-27','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(20,'2026-03-18 01:40:09.000000','Thu ngân ca tối','2026-02-24','ASSIGNED','2026-03-18 01:40:09.000000',3,3,0),(21,'2026-03-18 01:40:09.000000',NULL,'2026-02-25','ASSIGNED','2026-03-18 01:40:09.000000',3,3,0),(22,'2026-03-18 01:40:09.000000','Bán hàng ca tối','2026-02-26','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(23,'2026-03-18 01:40:09.000000',NULL,'2026-02-27','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(24,'2026-03-18 01:40:09.000000','Ca cuối tuần - Quản lý','2026-02-22','ASSIGNED','2026-03-18 01:40:09.000000',1,4,0),(25,'2026-03-18 01:40:09.000000','Ca cuối tuần - Phó quản lý','2026-02-22','ASSIGNED','2026-03-18 01:40:09.000000',2,4,0),(26,'2026-03-18 01:40:09.000000','Ca cuối tuần - Thu ngân','2026-02-22','ASSIGNED','2026-03-18 01:40:09.000000',3,4,0),(27,'2026-03-18 01:40:09.000000','Ca cuối tuần - Thu ngân','2026-02-23','ASSIGNED','2026-03-18 01:40:09.000000',4,4,0),(28,'2026-03-18 01:40:09.000000','Ca cuối tuần - Bán hàng','2026-02-23','ASSIGNED','2026-03-18 01:40:09.000000',6,4,0),(29,'2026-03-18 01:40:09.000000','Ca cuối tuần - Bán hàng','2026-02-22','ASSIGNED','2026-03-18 01:40:09.000000',7,4,1),(30,'2026-03-18 01:40:09.000000','Giám sát đầu tuần','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(31,'2026-03-18 01:40:09.000000','Quản lý ca chiều đầu tuần','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(32,'2026-03-18 01:40:09.000000','Thu ngân ca sáng','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(33,'2026-03-18 01:40:09.000000','Thu ngân ca chiều','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(34,'2026-03-18 01:40:09.000000','Kiểm kho ca sáng','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(35,'2026-03-18 01:40:09.000000','Bán hàng ca tối','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(36,'2026-03-18 01:40:09.000000','Hỗ trợ bán hàng ca sáng','2026-03-02','ASSIGNED','2026-03-18 01:40:09.000000',7,1,0),(37,'2026-03-18 01:40:09.000000','Ca cuối tuần quản lý','2026-03-01','ASSIGNED','2026-03-18 01:40:09.000000',1,4,0),(38,'2026-03-18 01:40:09.000000','Ca cuối tuần thu ngân','2026-03-01','ASSIGNED','2026-03-18 01:40:09.000000',3,4,0),(39,'2026-03-18 01:40:09.000000','Ca cuối tuần bán hàng','2026-03-01','ASSIGNED','2026-03-18 01:40:09.000000',6,4,0),(40,'2026-03-18 01:40:09.000000','Giám sát ca sáng','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(41,'2026-03-18 01:40:09.000000','Quản lý ca chiều','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(42,'2026-03-18 01:40:09.000000','Thu ngân ca sáng','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(43,'2026-03-18 01:40:09.000000','Thu ngân ca chiều','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(44,'2026-03-18 01:40:09.000000','Kiểm kho ca sáng','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(45,'2026-03-18 01:40:09.000000','Bán hàng ca tối','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(46,'2026-03-18 01:40:09.000000','Hỗ trợ bán hàng ca sáng','2026-03-03','ASSIGNED','2026-03-18 01:40:09.000000',7,1,0),(47,'2026-03-18 01:40:09.000000','Giám sát ca sáng','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(48,'2026-03-18 01:40:09.000000','Quản lý ca chiều','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(49,'2026-03-18 01:40:09.000000','Thu ngân ca sáng','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(50,'2026-03-18 01:40:09.000000','Thu ngân ca chiều','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(51,'2026-03-18 01:40:09.000000','Kiểm kho ca sáng','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(52,'2026-03-18 01:40:09.000000','Bán hàng ca tối','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(53,'2026-03-18 01:40:09.000000','Hỗ trợ bán hàng ca sáng','2026-03-04','ASSIGNED','2026-03-18 01:40:09.000000',7,1,0),(54,'2026-03-18 01:40:09.000000','Giám sát ca sáng','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(55,'2026-03-18 01:40:09.000000','Quản lý ca chiều','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(56,'2026-03-18 01:40:09.000000','Thu ngân ca sáng','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(57,'2026-03-18 01:40:09.000000','Thu ngân ca chiều','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(58,'2026-03-18 01:40:09.000000','Kiểm kho ca sáng','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(59,'2026-03-18 01:40:09.000000','Bán hàng ca tối','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(60,'2026-03-18 01:40:09.000000','Hỗ trợ bán hàng ca sáng','2026-03-05','ASSIGNED','2026-03-18 01:40:09.000000',7,1,0),(61,'2026-03-18 01:40:09.000000','Giám sát ca sáng','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',1,1,0),(62,'2026-03-18 01:40:09.000000','Quản lý ca chiều','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',2,2,0),(63,'2026-03-18 01:40:09.000000','Thu ngân ca sáng','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',3,1,0),(64,'2026-03-18 01:40:09.000000','Thu ngân ca chiều','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',4,2,0),(65,'2026-03-18 01:40:09.000000','Kiểm kho ca sáng','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',5,1,0),(66,'2026-03-18 01:40:09.000000','Bán hàng ca tối','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',6,3,0),(67,'2026-03-18 01:40:09.000000','Hỗ trợ bán hàng ca sáng','2026-03-06','ASSIGNED','2026-03-18 01:40:09.000000',7,1,0),(68,'2026-03-19 14:48:18.788761',NULL,'2026-03-20','ASSIGNED','2026-03-19 14:48:18.788761',2,2,0);


-- Mẫu phân ca bổ sung cho các ca mới (shift_id 6-10)


-- 14. CAMPAIGNS
INSERT INTO `campaigns` (`id`,`campaign_code`,`campaign_name`,`campaign_type`,`description`,`start_date`,`end_date`,`status`,`is_homepage_banner`,`created_at`,`updated_at`,`created_by`,`approved_by`,`budget`,`banner_image_url`,`is_public`) VALUES
(1,'CAMP-202602-001','Tết Sale 2026','SEASONAL','Khuyến mãi Tết Nguyên Đán','2026-02-10','2026-02-20','ACTIVE',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,50000000.00,NULL,NULL),
(2,'CAMP-202602-002','Flash Sale Cuối Tuần','FLASH_SALE','Giảm giá sốc cuối tuần','2026-02-14','2026-02-15','ACTIVE',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,10000000.00,NULL,NULL),
(3,'CAMP-PROMO-2024-001','Tet Sale 2024','SEASONAL','Migrated from legacy promotions','2024-02-01','2024-02-29','COMPLETED',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,NULL,NULL,NULL),
(4,'CAMP-PROMO-2024-002','Back to School','SEASONAL','Migrated from legacy promotions','2024-08-01','2024-08-31','COMPLETED',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,NULL,NULL,NULL),
(5,'CAMP-PROMO-2024-003','Black Friday','FLASH_SALE','Migrated from legacy promotions','2024-11-24','2024-11-30','COMPLETED',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,NULL,NULL,NULL),
(6,'CAMP-PROMO-2024-004','Christmas Sale','SEASONAL','Migrated from legacy promotions','2024-12-20','2024-12-31','COMPLETED',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,NULL,NULL,NULL),
(7,'CAMP-PROMO-2025-001','New Year Deal','SEASONAL','Migrated from legacy promotions','2025-01-01','2025-01-15','COMPLETED',0,'2026-03-18 01:40:09.000000','2026-03-18 01:40:09.000000',2,NULL,NULL,NULL,NULL),
(8,'CAMP-2026-03','Khai Trương','PROMOTION','','2026-03-19','2026-04-05','ACTIVE',0,'2026-03-19 14:02:08.264366','2026-03-19 15:36:09.943682',1,NULL,NULL,'https://res.cloudinary.com/didvvefmu/image/upload/v1773928928/smalltrend/crm/campaigns/qefbmzf1nvfpoojagx1x.jpg',NULL);

-- 15. COUPONS
INSERT INTO `coupons` (id,allowed_categories,internal_notes,coupon_code,coupon_name,coupon_type,created_at,current_usage_count,description,discount_amount,discount_percent,end_date,end_time,get_quantity,min_quantity,max_discount_amount,min_purchase_amount,buy_quantity,start_date,start_time,status,total_usage_limit,updated_at,usage_per_customer,campaign_id,created_by) VALUES (1,NULL,NULL,'WELCOME10','Giảm 10% Đơn Đầu','PERCENTAGE','2026-03-18 01:40:09.000000',1,'Mã giảm 10% cho đơn hàng đầu tiên',NULL,10.00,'2026-03-31',NULL,NULL,NULL,50000.00,100000.00,NULL,'2026-02-01',NULL,'ACTIVE',1000,'2026-03-19 13:16:19.205862',1,1,2),(2,NULL,NULL,'FLASH50K','Giảm 50K Flash Sale','FIXED_AMOUNT','2026-03-18 01:40:09.000000',NULL,'Giảm ngay 50k cho đơn từ 300k',50000.00,NULL,'2026-02-15',NULL,NULL,NULL,NULL,300000.00,NULL,'2026-02-14',NULL,'ACTIVE',500,'2026-03-18 01:40:09.000000',2,2,2),(3,NULL,NULL,'SUMMER2026','SUMMER26','PERCENTAGE','2026-03-19 14:08:12.613974',0,'',NULL,10.00,'2026-03-28',NULL,NULL,NULL,200000.00,NULL,NULL,'2026-03-19',NULL,'ACTIVE',NULL,'2026-03-19 15:36:44.695509',NULL,8,NULL);

-- 16. PRODUCT COMBOS


-- PRODUCT COMBO ITEMS

-- 17. CASH REGISTERS
INSERT INTO `cash_registers` (id,created_at,max_cash_limit,device_id,current_cash,notes,location,total_card_today,total_cash_today,opening_balance,register_code,register_name,register_type,session_start_time,status,store_name,total_sales_today,total_transactions_today,variance,expected_balance,updated_at,last_transaction_time,current_operator_id) VALUES (1,'2026-03-18 01:40:09.000000',5000000.00,'DEV-POS-001',NULL,NULL,'Front Counter',NULL,NULL,2000000.00,'POS-001','Quầy 1','MAIN','2026-03-18 01:40:09.000000','ACTIVE','SmallTrend Store',NULL,NULL,NULL,0,'2026-03-18 01:40:09.000000',NULL,3),(2,'2026-03-18 01:40:09.000000',3000000.00,'DEV-POS-002',NULL,NULL,'Express Counter',NULL,NULL,1000000.00,'POS-002','Quầy 2','EXPRESS',NULL,'ACTIVE','SmallTrend Store',NULL,NULL,NULL,0,'2026-03-18 01:40:09.000000',NULL,NULL);

-- 18. SALE ORDERS (2026)




-- Legacy sales_orders migrated to sale_orders


-- Purchase history migrated to additional sale_orders


-- March 2026 orders (past days + today)


-- 19. SALE ORDER ITEMS

-- 20. SALE ORDER HISTORIES

-- 20.1 CASH TRANSACTIONS

-- 20.2 COUPON USAGE

-- 20.3 LOYALTY TRANSACTIONS

-- 21. TICKETS

-- 22. USER CREDENTIALS
INSERT INTO `user_credentials` (id,password_hash,username,user_id) VALUES (1,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','admin',1),(2,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','manager',2),(3,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','cashier1',3),(4,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','cashier2',4),(5,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','inventory1',5),(6,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','sales1',6),(7,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','sales2',7),(8,'$2a$10$ZqwnXGrEww3EG9iVpCg/E.m55OspUop27kPD2fnl.lFrQ39eE93xa','kien',8),(9,'$2a$10$8EMiqVj9/7I/EdZrI1qw3uRi6tSGs1N2pXtwOqa9YhnwHFvJ2ZmL.','hung',9);

-- 23. ATTENDANCE (Auto-tracked based on employee login/logout)
-- 23. ATTENDANCE (Auto-tracked based on employee login/logout)

-- 24. SALARY CONFIGS (Per-employee base salary configuration with flexible types)
-- Each employee has individual salary setup - Manager can modify base salary for each person
-- Supports both HOURLY and MONTHLY salary types
-- 24. SALARY CONFIGS (Per-employee base salary configuration with flexible types)
-- Each employee has individual salary setup - Manager can modify base salary for each person
-- Supports both HOURLY and MONTHLY salary types

-- Mark one historical assignment as soft-deleted sample
UPDATE work_shift_assignments
SET is_deleted = TRUE, updated_at = NOW()
WHERE work_shift_id = 4 AND user_id = 7 AND shift_date = '2026-02-22';

-- Backfill attendance snapshots from assignments + shifts for payroll history safety
UPDATE attendance a
JOIN work_shift_assignments wsa
    ON wsa.user_id = a.user_id
 AND wsa.shift_date = a.date
 AND wsa.is_deleted = FALSE
JOIN work_shifts ws
    ON ws.id = wsa.work_shift_id
SET a.assignment_id_snapshot = wsa.id,
        a.shift_id_snapshot = ws.id,
        a.shift_name_snapshot = ws.shift_name,
        a.shift_start_snapshot = ws.start_time,
        a.shift_end_snapshot = ws.end_time,
        a.shift_working_minutes_snapshot = ws.working_minutes
WHERE a.assignment_id_snapshot IS NULL;

-- 25. PURCHASE ORDERS (Matching JPA PurchaseOrder schema)
-- Ensure DB enum status stays in sync with PurchaseOrderStatus.java
ALTER TABLE purchase_orders
MODIFY COLUMN status ENUM(
    'DRAFT',
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'CHECKING',
    'SHORTAGE_PENDING_APPROVAL',
    'SUPPLIER_SUPPLEMENT_PENDING',
    'RECEIVED',
    'ORDERED',
    'CANCELLED'
) NOT NULL DEFAULT 'DRAFT';


-- 26. PURCHASE ORDER ITEMS (Matching JPA PurchaseOrderItem schema)

-- 27. SHIFT HANDOVERS

-- 28. PAYROLL CALCULATIONS

-- 29. SHIFT SWAP REQUESTS

-- 30. STOCK MOVEMENTS (Ghi chép chuyển động tồn kho)

-- 31. INVENTORY COUNTS (Phiếu kiểm kho — đủ vòng đời: CONFIRMED, PENDING, COUNTING, DRAFT, REJECTED)
-- Code format: IC-{year}-{seq4} — khớp với generateCode() trong InventoryCountService

-- Cập nhật rejection_reason cho phiếu bị từ chối
UPDATE inventory_counts SET rejection_reason = 'Dữ liệu kiểm kê không khớp với biên lai nhập hàng. Cần kiểm tra lại lô hàng trước khi xác nhận.' WHERE code = 'IC-2026-0006';

-- 32. INVENTORY COUNT ITEMS
-- difference_value tính theo cost_price của batch tương ứng

-- 33. DISPOSAL VOUCHERS (Phiếu thanh lý hàng hỏng/lỗi)

-- 34. DISPOSAL VOUCHER ITEMS

-- 34.1 CLEANUP LEGACY PENDING DISPOSAL VOUCHERS
-- Rule: auto-confirm all historical PENDING vouchers to align with no-approval flow
UPDATE disposal_vouchers
SET status = 'CONFIRMED',
    confirmed_at = COALESCE(confirmed_at, created_at, NOW()),
    confirmed_by = COALESCE(confirmed_by, created_by),
    rejection_reason = NULL
WHERE id > 0
  AND status = 'PENDING';

-- 35. LOYALTY GIFTS (Quà tặng gift/rewards từ loyalty program)

-- 36. GIFT REDEMPTION HISTORY (Lịch sử sử dụng quà tặng)

-- 37. PURCHASE HISTORY (Phù hợp với legacy purchase history)

-- 28. REPORTS + AUDIT LOGS (from new seed)


-- =============================================================================
-- ADVERTISEMENTS & AD CONTRACTS
-- =============================================================================


-- =============================================================================
-- End of SmallTrend Combined Sample Data
-- =============================================================================

-- SYNCED FROM BACKUP: advertisements


-- SYNCED FROM BACKUP: attendance


-- SYNCED FROM BACKUP: audit_logs


-- SYNCED FROM BACKUP: brands


-- SYNCED FROM BACKUP: campaigns


-- SYNCED FROM BACKUP: cash_registers


-- SYNCED FROM BACKUP: cash_transactions


-- SYNCED FROM BACKUP: categories


-- SYNCED FROM BACKUP: coupons


-- SYNCED FROM BACKUP: coupon_usage


-- SYNCED FROM BACKUP: customers


-- SYNCED FROM BACKUP: customer_tiers


-- SYNCED FROM BACKUP: disposal_vouchers


-- SYNCED FROM BACKUP: disposal_voucher_items


-- SYNCED FROM BACKUP: gift_redemption_history


-- SYNCED FROM BACKUP: inventory_counts


-- SYNCED FROM BACKUP: inventory_count_items


-- SYNCED FROM BACKUP: inventory_stock


-- SYNCED FROM BACKUP: locations


-- SYNCED FROM BACKUP: loyalty_gifts


-- SYNCED FROM BACKUP: loyalty_transactions


-- SYNCED FROM BACKUP: payroll_calculations


-- SYNCED FROM BACKUP: permissions


-- SYNCED FROM BACKUP: price_expiry_alert_logs


-- SYNCED FROM BACKUP: products


-- SYNCED FROM BACKUP: product_batches


-- SYNCED FROM BACKUP: product_combos


-- SYNCED FROM BACKUP: product_combo_items


-- SYNCED FROM BACKUP: product_variants


-- SYNCED FROM BACKUP: purchase_history


-- SYNCED FROM BACKUP: purchase_orders


-- SYNCED FROM BACKUP: purchase_order_items


-- SYNCED FROM BACKUP: reports


-- SYNCED FROM BACKUP: roles


-- SYNCED FROM BACKUP: role_permissions


-- SYNCED FROM BACKUP: salary_configs


-- SYNCED FROM BACKUP: sale_orders


-- SYNCED FROM BACKUP: sale_order_histories


-- SYNCED FROM BACKUP: sale_order_items


-- SYNCED FROM BACKUP: shift_handovers


-- SYNCED FROM BACKUP: shift_swap_requests


-- SYNCED FROM BACKUP: stock_movements


-- SYNCED FROM BACKUP: suppliers


-- SYNCED FROM BACKUP: supplier_contracts


-- SYNCED FROM BACKUP: tax_rates


-- SYNCED FROM BACKUP: tickets


-- SYNCED FROM BACKUP: units


-- SYNCED FROM BACKUP: unit_conversions


-- SYNCED FROM BACKUP: users


-- SYNCED FROM BACKUP: user_credentials


-- SYNCED FROM BACKUP: variant_attributes


-- SYNCED FROM BACKUP: variant_prices


-- SYNCED FROM BACKUP: work_shifts


-- SYNCED FROM BACKUP: work_shift_assignments

-- ==========================================================
-- DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sale_orders;
INSERT INTO `sale_orders` (`id`, `order_code`, `customer_id`, `cashier_id`, `cash_register_id`, `order_date`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `payment_method`, `status`, `notes`, `created_at`, `updated_at`) VALUES 
(1, 'ORD-202603-001', 1, 1, 1, '2026-03-28 10:00:00', 50000, 0, 0, 50000, 'CASH', 'COMPLETED', 'Đơn MOCK 1', '2026-03-28 10:00:00', '2026-03-28 10:00:00');

TRUNCATE TABLE sale_order_items;
INSERT INTO `sale_order_items` (`id`, `sale_order_id`, `product_variant_id`, `product_name`, `sku`, `quantity`, `unit_price`, `line_discount_amount`, `line_tax_amount`, `line_total_amount`, `notes`) VALUES 
(1, 1, 1, 'Mock Product', 'SKU-001', 2, 25000, 0, 0, 50000, '');

TRUNCATE TABLE purchase_orders;
INSERT INTO `purchase_orders` (`id`, `po_number`, `supplier_id`, `contract_id`, `created_by`, `location_id`, `order_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `subtotal`, `tax_amount`, `tax_percent`, `discount_amount`, `shipping_fee`, `paid_amount`, `total_amount`, `notes`, `rejection_reason`, `shortage_reason`, `shortage_submitted_at`, `manager_decision`, `manager_decision_note`, `manager_decided_at`, `created_at`, `updated_at`) VALUES 
(1, 'PO-202603-001', 1, null, 1, 1, '2026-03-28', '2026-03-29', '2026-03-29', 'RECEIVED', 100000, 0, 0, 0, 0, 100000, 100000, 'Mock', null, null, null, null, null, null, '2026-03-28 10:00:00', '2026-03-28 10:00:00');

TRUNCATE TABLE purchase_order_items;
INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `variant_id`, `quantity`, `unit_cost`, `total_cost`, `received_quantity`, `notes`, `expiry_date`) VALUES 
(1, 1, 1, 10, 10000, 100000, 10, 'Mock', '2030-01-01');

TRUNCATE TABLE inventory_counts;
INSERT INTO `inventory_counts` (`id`, `code`, `status`, `location_id`, `total_shortage_value`, `total_overage_value`, `total_difference_value`, `created_by`, `confirmed_by`, `created_at`, `confirmed_at`) VALUES 
(1, 'IC-202603-001', 'CONFIRMED', 1, 0, 0, 0, 1, 1, '2026-03-28 10:00:00', '2026-03-28 10:05:00');

TRUNCATE TABLE inventory_count_items;
INSERT INTO `inventory_count_items` (`id`, `inventory_count_id`, `batch_id`, `system_quantity`, `actual_quantity`, `difference_quantity`, `difference_value`, `reason`) VALUES 
(1, 1, 1, 10, 10, 0, 0, 'Match');

TRUNCATE TABLE disposal_vouchers;
INSERT INTO `disposal_vouchers` (`id`, `code`, `location_id`, `status`, `reason_type`, `notes`, `total_items`, `total_quantity`, `total_value`, `created_by`, `created_at`, `confirmed_by`, `confirmed_at`, `rejection_reason`, `version`) VALUES 
(1, 'DV-202603-001', 1, 'CONFIRMED', 'DAMAGED', 'Mock Notes', 1, 5, 50000, 1, '2026-03-28 10:00:00', 1, '2026-03-28 10:05:00', null, 1);

TRUNCATE TABLE disposal_voucher_items;
INSERT INTO `disposal_voucher_items` (`id`, `disposal_voucher_id`, `batch_id`, `product_id`, `batch_code`, `quantity`, `unit_cost`, `total_cost`, `expiry_date`) VALUES 
(1, 1, 1, 1, 'BATCH-001', 5, 10000, 50000, '2030-01-01');

TRUNCATE TABLE product_combos;
INSERT INTO `product_combos` (`id`, `combo_code`, `combo_name`, `description`, `image_url`, `original_price`, `combo_price`, `saved_amount`, `discount_percent`, `valid_from`, `valid_to`, `is_active`, `max_quantity_per_order`, `total_sold`, `stock_limit`, `combo_type`, `is_featured`, `display_order`, `tags`, `status`, `created_by_id`, `updated_at`, `category_id`) VALUES 
(1, 'CB-SNACK-VIP', 'Combo Snack VIP', 'Mock', '', 150000, 120000, 30000, 20, '2026-01-01', '2026-12-31', 1, 5, 0, 0, 'VIP', 0, 1, 'New', 'ACTIVE', 1, '2026-03-28 10:00:00', 1);

TRUNCATE TABLE product_combo_items;
INSERT INTO `product_combo_items` (`id`, `combo_id`, `product_variant_id`, `min_quantity`, `max_quantity`, `is_optional`, `can_substitute`, `display_order`, `notes`) VALUES 
(1, 1, 1, 1, 1, 0, 0, 1, 'None');

TRUNCATE TABLE price_expiry_alert_logs;
INSERT INTO `price_expiry_alert_logs` (`id`, `variant_price_id`, `alert_date`, `sent_at`) VALUES 
(1, 1, '2026-03-28', '2026-03-28 10:15:00');

SET FOREIGN_KEY_CHECKS = 1;
