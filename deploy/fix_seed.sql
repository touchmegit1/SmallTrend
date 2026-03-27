-- ============================================================
-- FIX SEED: Correct column-order mismatch for all failing tables
-- Run AFTER Hibernate creates schema (backend already running)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

-- tax_rates (old: id, is_active, name, rate)
TRUNCATE TABLE tax_rates;
INSERT INTO `tax_rates` (`id`,`is_active`,`name`,`rate`) VALUES (1,0,'VAT Standard',10.00),(2,0,'VAT Reduced',5.00),(3,0,'No Tax',0.00);

-- user_credentials (old: id, password_hash, username, user_id)
TRUNCATE TABLE user_credentials;
INSERT INTO `user_credentials` (`id`,`password_hash`,`username`,`user_id`) VALUES
(1,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','admin',1),
(2,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','manager',2),
(3,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','cashier1',3),
(4,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','cashier2',4),
(5,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','inventory1',5),
(6,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','sales1',6),
(7,'$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','sales2',7),
(8,'$2a$10$4eO2jrzTRQmOTW/iSlECv.99/YUjwzsVWIeIViQdjQw0YwEp7ZKNi','kien',8),
(9,'$2a$10$KT2Gw8KbGyljHUIo18ebeebchc8PjJyjfnJNRf2PnDXtV3rqFXjv2','hung',9);

-- units (old: id, code, default_cost_price, default_sell_price, material_type, name, symbol)
TRUNCATE TABLE units;
INSERT INTO `units` (`id`,`code`,`default_cost_price`,`default_sell_price`,`material_type`,`name`,`symbol`) VALUES
(1,'HOP',NULL,NULL,'SOLID','Hộp','hộp'),
(2,'LOC',NULL,NULL,'SOLID','Lốc','lốc'),
(3,'THUNG',NULL,NULL,'SOLID','Thùng','thùng'),
(4,'GOI',NULL,NULL,'SOLID','Gói','gói'),
(5,'CAI',NULL,NULL,'SOLID','Cái','cái'),
(6,'LON',NULL,NULL,'SOLID','Lon','lon'),
(7,'CHAI',NULL,NULL,'SOLID','Chai','chai'),
(8,'BICH',NULL,NULL,'SOLID','Bịch','bich');

-- products (old: id, created_at, name, image_url, is_active, description, updated_at, brand_id, category_id, tax_rate_id)
TRUNCATE TABLE products;
INSERT INTO `products` (`id`,`created_at`,`name`,`image_url`,`is_active`,`description`,`updated_at`,`brand_id`,`category_id`,`tax_rate_id`) VALUES
(1,'2026-03-18 01:40:08.905784','Vinamilk Fresh Milk','https://res.cloudinary.com/didvvefmu/image/upload/v1773772847/smalltrend/user-avatars/kk2k6wrcth9zjgpywmqa.png',1,'Sữa dinh dưỡng Vinamilk','2026-03-19 16:12:45.102749',1,2,2),
(2,'2026-03-18 01:40:08.905784','Dove Beauty Bar','https://res.cloudinary.com/didvvefmu/image/upload/v1773772999/smalltrend/user-avatars/tftx9cld5vsqwbnz6fjc.jpg',1,'Xà Phòng Dove','2026-03-17 18:43:17.100845',4,3,1),
(3,'2026-03-18 01:40:08.905784','Instant Coffee 20g x 10','https://res.cloudinary.com/didvvefmu/image/upload/v1773773536/smalltrend/user-avatars/wfg6djw0jvx1yyfep3jy.webp',1,'Cà phê Nescafe 3in1','2026-03-17 18:52:14.891507',2,1,1),
(4,'2026-03-18 01:40:08.905784','Coca Cola Classic','https://res.cloudinary.com/didvvefmu/image/upload/v1773778429/smalltrend/user-avatars/c0bmdhxmorkjytxyaupj.jpg',1,'Nước ngọt Coca Cola','2026-03-17 20:13:47.164098',3,1,1),
(5,'2026-03-18 01:40:08.905784','Potato Chips','https://res.cloudinary.com/didvvefmu/image/upload/v1773776096/smalltrend/user-avatars/zodjdb1zjfyv5adn5sku.webp',1,'Bánh snack Oishi','2026-03-17 19:34:59.859986',6,5,1),
(6,'2026-03-18 01:40:08.905784','Tương ớt chua cay','https://res.cloudinary.com/didvvefmu/image/upload/v1773776784/smalltrend/user-avatars/e23icn5gbhnp8m0jmfur.jpg',1,'Tương ớt Cholimex','2026-03-17 19:46:22.345976',7,10,1),
(7,'2026-03-18 01:40:08.905784','Xúc xích Vườn Hồng','https://res.cloudinary.com/didvvefmu/image/upload/v1773777092/smalltrend/user-avatars/g7hw4axoeegxq8hp0plp.jpg',1,'Xúc xích CP','2026-03-17 19:52:43.982585',8,9,1),
(8,'2026-03-18 01:40:08.905784','Thịt heo hầm','https://res.cloudinary.com/didvvefmu/image/upload/v1773777262/smalltrend/user-avatars/h2jmpqvfiwqjvxtmnx1k.webp',1,'Đồ hộp Vissan','2026-03-17 19:54:20.346698',9,7,1),
(9,'2026-03-18 01:40:08.905784','Bánh chocopie Orion hộp 12 cái','https://res.cloudinary.com/didvvefmu/image/upload/v1773777545/smalltrend/user-avatars/wcgojffzprveex1dx0tn.png',1,'Bánh Chocopie','2026-03-17 19:59:03.273214',10,8,1),
(10,'2026-03-18 01:40:08.905784','Kẹo mút hương trái cây','https://res.cloudinary.com/didvvefmu/image/upload/v1773909949/smalltrend/user-avatars/nfuimxb1hzqxjgabqswt.webp',1,'Kẹo mút Chupa Chups','2026-03-19 08:45:46.881999',11,5,1),
(11,'2026-03-18 01:40:08.905784','Phở các loại','https://res.cloudinary.com/didvvefmu/image/upload/v1773910263/smalltrend/user-avatars/inttsrqtpwgdo4pxdsdf.webp',1,'Phở gói Vifon','2026-03-19 08:50:59.612510',14,11,1),
(12,'2026-03-18 01:40:08.905784','Mì tôm chua cay','https://res.cloudinary.com/didvvefmu/image/upload/v1773910371/smalltrend/user-avatars/gzfznjse9r1ew2vozgrm.jpg',1,'Mì Hảo Hảo','2026-03-19 08:52:48.747456',13,11,1),
(13,'2026-03-18 01:40:08.905784','Mì khoai tây sườn hầm','https://res.cloudinary.com/didvvefmu/image/upload/v1773911223/smalltrend/user-avatars/aya3hodi8cjxt0hj0bhd.webp',1,'Mì Omachi','2026-03-19 09:07:00.486156',14,11,1),
(14,'2026-03-18 01:40:08.905784','Nước tương tỏi ớt','https://res.cloudinary.com/didvvefmu/image/upload/v1773911355/smalltrend/user-avatars/fdqcfjy84csx9eazmvmn.webp',1,'Nước tương Chin-su','2026-03-19 09:09:12.272199',14,10,1),
(15,'2026-03-18 01:40:08.905784','Sữa chua nha đam','https://res.cloudinary.com/didvvefmu/image/upload/v1773911512/smalltrend/user-avatars/hsaspcpfl2lfzcvkvnat.webp',1,'Sữa chua TH True Milk','2026-03-19 09:11:48.821013',15,2,2),
(16,'2026-03-18 01:40:08.905784','Sữa tươi ít đường','https://res.cloudinary.com/didvvefmu/image/upload/v1773911825/smalltrend/user-avatars/hrtum3zrjb6rifilyqz4.png',1,'Sữa tươi TH True Milk','2026-03-19 09:17:02.904303',15,2,2),
(17,'2026-03-18 01:40:08.905784','Snack khoai tây tự nhiên','https://res.cloudinary.com/didvvefmu/image/upload/v1773911989/smalltrend/user-avatars/yhfdrccc0brzy9zxske0.png',1,'Snack Lays','2026-03-19 09:19:45.977722',17,5,1),
(18,'2026-03-18 01:40:08.905784','Trà Ô Long giảm béo','https://res.cloudinary.com/didvvefmu/image/upload/v1773912183/smalltrend/user-avatars/cxskvciux7syhbch9o4j.jpg',1,'Trà Ô Long TEA+ Plus','2026-03-19 09:23:00.694221',17,1,1),
(19,'2026-03-18 01:40:08.905784','Hạt nêm thịt thăn xương ống','https://res.cloudinary.com/didvvefmu/image/upload/v1773912417/smalltrend/user-avatars/qlnrrvcapjfn068ujuxu.png',1,'Hạt nêm Knorr','2026-03-19 09:26:53.805754',19,10,1),
(20,'2026-03-18 01:40:08.905784','Dầu hào tự nhiên nấm hương','https://res.cloudinary.com/didvvefmu/image/upload/v1773912775/smalltrend/user-avatars/z4rxm2iecy2e4ol6qy2j.webp',1,'Dầu hào Maggi','2026-03-19 09:32:51.526885',19,10,1),
(21,'2026-03-18 01:40:08.905784','Bia Heineken Silver lon','https://res.cloudinary.com/didvvefmu/image/upload/v1773912972/smalltrend/user-avatars/ryqebth5xfpn7vvyjt5c.webp',1,'Bia Heineken Silver','2026-03-19 09:36:09.165091',23,1,1),
(22,'2026-03-18 01:40:08.905784','Bia Tiger Crystal lon','https://res.cloudinary.com/didvvefmu/image/upload/v1773913094/smalltrend/user-avatars/csy3ylvsmjvyxiguwre4.jpg',1,'Bia Tiger Bạc','2026-03-19 09:38:11.944943',24,1,1),
(23,'2026-03-18 01:40:08.905784','Nước mắm Nam Ngư chai',NULL,1,'Nước mắm Nam Ngư','2026-03-18 01:40:08.905784',14,10,1),
(24,'2026-03-18 01:40:08.905784','Sữa đặc có đường Ông Thọ đỏ lon','https://res.cloudinary.com/didvvefmu/image/upload/v1773913190/smalltrend/user-avatars/ouu72al6cipvjlrdnxfv.png',1,'Sữa đặc Ông Thọ','2026-03-19 09:39:46.628476',1,2,2),
(25,'2026-03-18 01:40:08.905784','Dầu ăn thực vật Tường An chai',NULL,1,'Dầu ăn Tường An','2026-03-18 01:40:08.905784',25,10,1),
(26,'2026-03-18 01:40:08.905784','Bột giặt OMO hệ bọt thông minh','https://res.cloudinary.com/didvvefmu/image/upload/v1773913287/smalltrend/user-avatars/eo6hjpnfxm6ayqe5xmx2.jpg',1,'Bột giặt OMO','2026-03-19 09:41:24.379170',21,4,1);

-- locations (old: id, address, capacity, created_at, description, grid_col, grid_level, grid_row, location_code, name, status, type, zone)
TRUNCATE TABLE locations;
INSERT INTO `locations` (`id`,`address`,`capacity`,`created_at`,`description`,`grid_col`,`grid_level`,`grid_row`,`location_code`,`name`,`status`,`type`,`zone`) VALUES
(1,'Kho chính, Dãy A, Hàng 1',5000,'2026-03-18 01:40:08.000000',NULL,1,1,1,'WH-A1','Kho lưu trữ A1','ACTIVE','STORAGE','A'),
(2,'Kệ hàng, Dãy C, Vị trí 3',2000,'2026-03-18 01:40:08.000000',NULL,3,1,1,'DF-C3','Kệ hàng C3','ACTIVE','DISPLAY','C'),
(3,'Kho lạnh, Dãy B, Tầng 1',2000,'2026-03-18 01:40:08.000000',NULL,1,1,1,'CS-B1','Kho lạnh B1','ACTIVE','COLD_STORAGE','B'),
(4,'Kệ hàng, Dãy C, Vị trí 1',2000,'2026-03-18 01:40:08.000000',NULL,1,1,1,'DF-C1','Kệ hàng C1','ACTIVE','DISPLAY','C'),
(5,'Kệ hàng, Dãy C, Vị trí 2',2000,'2026-03-18 01:40:08.000000',NULL,2,1,1,'DF-C2','Kệ hàng C2','ACTIVE','DISPLAY','C');

-- product_batches (old: id, batch_number, cost_price, expiry_date, mfg_date, variant_id)
TRUNCATE TABLE product_batches;
INSERT INTO `product_batches` (`id`,`batch_number`,`cost_price`,`expiry_date`,`mfg_date`,`variant_id`) VALUES
(1,'VM2026001',20000.00,'2026-04-15','2026-01-15',1),(2,'DV2026001',12000.00,'2027-02-01','2026-02-01',2),
(3,'NC2026001',35000.00,'2027-01-20','2026-01-20',3),(4,'CC2026001',8000.00,'2026-08-10','2026-02-10',4),
(5,'OI2026001',6000.00,'2026-06-01','2026-02-01',5),(6,'CH2026001',10000.00,'2026-10-15','2026-01-15',6),
(7,'CP2026001',45000.00,'2026-04-01','2026-02-01',7),(8,'VS2026001',18000.00,'2027-01-20','2026-01-20',8),
(9,'OR2026001',32000.00,'2026-12-10','2026-02-10',9),(10,'CU2026001',1000.00,'2027-06-01','2026-02-01',10),
(11,'VF2026001',6000.00,'2026-07-15','2026-01-15',11),(12,'HH2026001',3000.00,'2026-08-01','2026-02-01',12),
(13,'OM2026001',7000.00,'2026-07-20','2026-01-20',13),(14,'CS2026001',11000.00,'2027-02-10','2026-02-10',14),
(15,'THY2026001',4000.00,'2026-04-01','2026-03-01',15),(16,'THM2026001',25000.00,'2026-09-01','2026-03-01',16),
(17,'LA2026001',8000.00,'2026-11-10','2026-02-10',17),(18,'TP2026001',7000.00,'2026-10-15','2026-02-15',18),
(19,'KN2026001',24000.00,'2027-01-20','2026-01-20',19),(20,'MG2026001',20000.00,'2027-02-10','2026-02-10',20),
(21,'HEI2026001',16000.00,'2027-02-15','2026-02-15',21),(22,'TIG2026001',14000.00,'2027-02-15','2026-02-15',22),
(23,'NN2026001',28000.00,'2027-02-15','2026-02-15',23),(24,'OT2026001',20000.00,'2027-02-15','2026-02-15',24),
(25,'TA2026001',40000.00,'2027-02-15','2026-02-15',25),(26,'OMO2026001',32000.00,'2027-02-15','2026-02-15',26),
(27,'DA2026027',20000.00,'2026-10-31','2026-03-18',34),(28,'CC2026001',8000.00,'2026-08-10','2026-02-10',35),
(29,'BE2026029',12000.00,'2026-11-30','2026-03-18',35),(30,'DA2026030',25000.00,'2026-11-30','2026-03-18',27),
(31,'DA2026031',23000.00,'2027-03-18','2026-03-18',27),(32,'PE2026032',10000.00,'2027-12-31','2026-03-18',28),
(33,'SN2026033',10000.00,'2027-03-13','2026-03-18',30),(34,'DAIRYV-000034',500000.00,'2027-03-19','2026-03-19',27),
(38,'DAIRYV-000035',520000.00,'2026-12-30','2026-03-19',27),(39,'DAIRYV-000036',580000.00,'2026-12-30','2026-03-19',27),
(40,'EX2026040',12000.00,'2026-02-10','2026-01-10',4),(41,'EX2026041',16000.00,'2026-01-25','2025-12-25',21),
(42,'EX2026042',7000.00,'2026-03-05','2026-01-05',18);

-- inventory_stock (old: id, quantity, location_id, batch_id, variant_id)
TRUNCATE TABLE inventory_stock;
INSERT INTO `inventory_stock` (`id`,`quantity`,`location_id`,`batch_id`,`variant_id`) VALUES
(1,245,1,1,1),(2,178,2,2,2),(3,260,3,3,3),(4,502,4,4,4),(5,387,5,5,5),
(6,120,6,1,6),(7,85,7,2,7),(8,150,8,3,8),(9,200,9,4,9),(10,973,10,5,10),
(11,300,11,1,11),(12,500,12,2,12),(13,400,13,3,13),(14,250,14,4,14),(15,180,15,5,15),
(16,210,16,1,16),(17,318,17,2,17),(18,280,18,3,18),(19,140,19,4,19),(20,190,20,5,20),
(21,300,21,1,21),(22,250,22,2,22),(23,100,23,3,23),(24,148,24,4,24),(25,200,25,5,25),
(26,80,26,1,26),(27,480,27,1,34),(28,16,28,4,35),(29,300,29,1,35),(30,480,30,1,27),
(31,480,31,2,27),(32,1,32,1,28),(33,10,33,3,30),(34,96,34,1,27),(38,384,38,1,27),
(39,240,39,1,27),(40,24,40,2,4),(41,15,41,3,21),(42,30,42,4,18);

-- unit_conversions (old: id, conversion_factor, description, is_active, sell_price, to_unit_id, variant_id)
TRUNCATE TABLE unit_conversions;
INSERT INTO `unit_conversions` (`id`,`conversion_factor`,`description`,`is_active`,`sell_price`,`to_unit_id`,`variant_id`) VALUES
(15,48.0000,'',1,0.00,3,27),(16,30.0000,'',1,360000.00,3,4);

-- cash_registers (old: id, created_at, max_cash_limit, device_id, current_cash, notes, location, total_card_today, total_cash_today, opening_balance, register_code, register_name, register_type, session_start_time, status, store_name, total_sales_today, total_transactions_today, variance, expected_balance, updated_at, last_transaction_time, current_operator_id)
TRUNCATE TABLE cash_registers;
INSERT INTO `cash_registers` (`id`,`created_at`,`max_cash_limit`,`device_id`,`current_cash`,`notes`,`location`,`total_card_today`,`total_cash_today`,`opening_balance`,`register_code`,`register_name`,`register_type`,`session_start_time`,`status`,`store_name`,`total_sales_today`,`total_transactions_today`,`variance`,`expected_balance`,`updated_at`,`last_transaction_time`,`current_operator_id`) VALUES
(1,'2026-03-18 01:40:09.000000',5000000.00,'DEV-POS-001',NULL,NULL,'Front Counter',NULL,NULL,2000000.00,'POS-001','Quầy 1','MAIN','2026-03-18 01:40:09.000000','ACTIVE','SmallTrend Store',NULL,NULL,NULL,0,'2026-03-18 01:40:09.000000',NULL,3),
(2,'2026-03-18 01:40:09.000000',3000000.00,'DEV-POS-002',NULL,NULL,'Express Counter',NULL,NULL,1000000.00,'POS-002','Quầy 2','EXPRESS',NULL,'ACTIVE','SmallTrend Store',NULL,NULL,NULL,0,'2026-03-18 01:40:09.000000',NULL,NULL);

-- advertisements (old: id, bg_color, contact_email, contact_person, contact_phone, contract_end, contract_number, contract_start, contract_value, created_at, cta_color, cta_text, image_url, is_active, link_url, notes, payment_terms, slot, sponsor_name, subtitle, title, updated_at)
TRUNCATE TABLE advertisements;
INSERT INTO `advertisements` (`id`,`bg_color`,`contact_email`,`contact_person`,`contact_phone`,`contract_end`,`contract_number`,`contract_start`,`contract_value`,`created_at`,`cta_color`,`cta_text`,`image_url`,`is_active`,`link_url`,`notes`,`payment_terms`,`slot`,`sponsor_name`,`subtitle`,`title`,`updated_at`) VALUES
(1,'#ffffff','marketing@smalltrend.vn','Nguyễn Văn Marketing','0901-234-567','2026-12-31','AD-2026-LEFT-001','2026-01-01',5000000.00,'2026-03-18 01:40:09.000000','#4f46e5','Mua ngay','https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',0,'','Hợp đồng quảng cáo nội bộ','Thanh toán hàng quý, net 30 ngày','LEFT','SmallTrend Brand','Ưu đãi cuối tuần cho mọi sản phẩm','Mega Sale 50% OFF','2026-03-19 15:39:05.966119'),
(2,'#f0fdf4','ads@expressdelivery.vn','Trần Thị Logistics','0912-345-678','2026-06-30','AD-2026-RIGHT-001','2026-01-01',12000000.00,'2026-03-18 01:40:09.000000','#059669','Đặt ngay','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',0,'','Đối tác giao hàng nhanh','Thanh toán hàng tháng vào ngày 15','RIGHT','Express Delivery Partner','Đơn từ 200.000đ — giao trong 2h','Giao hàng miễn phí','2026-03-19 14:04:19.055381'),
(3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-19 14:03:25.455314',NULL,NULL,'https://res.cloudinary.com/didvvefmu/image/upload/v1773928997/smalltrend/crm/ads/ymypqgpfxq3wvajk8ycq.jpg',0,NULL,NULL,NULL,'LEFT','KitKat',NULL,'KitKat- đn là mê','2026-03-19 14:03:25.455314'),
(4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-19 14:04:02.978638',NULL,NULL,'https://res.cloudinary.com/didvvefmu/image/upload/v1773929027/smalltrend/crm/ads/dhabu2yyxvfnse54t4ds.jpg',0,NULL,NULL,NULL,'RIGHT','HuyHandSome',NULL,'HotDog-Bữa sáng tốt lành cho mọi người','2026-03-19 14:04:02.978638');

-- loyalty_gifts (old: id, created_at, is_active, name, required_points, stock, variant_id)
TRUNCATE TABLE loyalty_gifts;
INSERT INTO `loyalty_gifts` (`id`,`created_at`,`is_active`,`name`,`required_points`,`stock`,`variant_id`) VALUES
(1,'2026-03-18 01:40:09.000000',0,'Nước uống đặc biệt 500ml',50,150,4),
(2,'2026-03-18 01:40:09.000000',0,'Bộ cà phê hòa tan 3in1',150,80,3),
(3,'2026-03-18 01:40:09.000000',0,'Xà phòng Dove 90g',75,200,2),
(4,'2026-03-18 01:40:09.000000',0,'Sữa tươi Vinamilk 1L',200,50,1),
(5,'2026-03-18 01:40:09.000000',0,'Combo Snack Oishi',100,100,5),
(6,'2026-03-19 15:38:12.253398',0,'Nước ngọt Coca Cola (Đổi điểm)',5,10,4);

-- coupons (old: id, allowed_categories, internal_notes, coupon_code, coupon_name, coupon_type, created_at, current_usage_count, description, discount_amount, discount_percent, end_date, end_time, get_quantity, min_quantity, max_discount_amount, min_purchase_amount, buy_quantity, start_date, start_time, status, total_usage_limit, updated_at, usage_per_customer, campaign_id, created_by)
TRUNCATE TABLE coupons;
INSERT INTO `coupons` (`id`,`allowed_categories`,`internal_notes`,`coupon_code`,`coupon_name`,`coupon_type`,`created_at`,`current_usage_count`,`description`,`discount_amount`,`discount_percent`,`end_date`,`end_time`,`get_quantity`,`min_quantity`,`max_discount_amount`,`min_purchase_amount`,`buy_quantity`,`start_date`,`start_time`,`status`,`total_usage_limit`,`updated_at`,`usage_per_customer`,`campaign_id`,`created_by`) VALUES
(1,NULL,NULL,'WELCOME10','Giảm 10% Đơn Đầu','PERCENTAGE','2026-03-18 01:40:09.000000',1,'Mã giảm 10% cho đơn hàng đầu tiên',NULL,10.00,'2026-03-31',NULL,NULL,NULL,50000.00,100000.00,NULL,'2026-02-01',NULL,'ACTIVE',1000,'2026-03-19 13:16:19.205862',1,1,2),
(2,NULL,NULL,'FLASH50K','Giảm 50K Flash Sale','FIXED_AMOUNT','2026-03-18 01:40:09.000000',NULL,'Giảm ngay 50k cho đơn từ 300k',50000.00,NULL,'2026-02-15',NULL,NULL,NULL,NULL,300000.00,NULL,'2026-02-14',NULL,'ACTIVE',500,'2026-03-18 01:40:09.000000',2,2,2),
(3,NULL,NULL,'SUMMER2026','SUMMER26','PERCENTAGE','2026-03-19 14:08:12.613974',0,'',NULL,10.00,'2026-03-28',NULL,NULL,NULL,200000.00,NULL,NULL,'2026-03-19',NULL,'ACTIVE',NULL,'2026-03-19 15:36:44.695509',NULL,8,NULL);

-- price_expiry_alert_logs (old: id, alert_date, recipient_email, sent_at, variant_price_id)
TRUNCATE TABLE price_expiry_alert_logs;
INSERT INTO `price_expiry_alert_logs` (`id`,`alert_date`,`recipient_email`,`sent_at`,`variant_price_id`) VALUES
(1,'2026-03-15','admin.smalltrend.swp@gmail.com','2026-03-15 02:53:16.595705',27),
(2,'2026-03-15','admin.smalltrend.swp@gmail.com','2026-03-15 02:53:16.640614',28),
(3,'2026-03-15','admin.smalltrend.swp@gmail.com','2026-03-15 02:53:16.651063',29),
(14,'2026-03-17','dambautv2005@gmail.com','2026-03-17 09:03:00.184541',27),
(15,'2026-03-17','admin.smalltrend.swp@gmail.com','2026-03-17 09:03:03.636309',27);

SET FOREIGN_KEY_CHECKS = 1;

-- Verify critical tables
SELECT 'tax_rates' AS tbl, COUNT(*) AS cnt FROM tax_rates
UNION ALL SELECT 'user_credentials', COUNT(*) FROM user_credentials
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'units', COUNT(*) FROM units
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'product_batches', COUNT(*) FROM product_batches
UNION ALL SELECT 'inventory_stock', COUNT(*) FROM inventory_stock
UNION ALL SELECT 'cash_registers', COUNT(*) FROM cash_registers
UNION ALL SELECT 'advertisements', COUNT(*) FROM advertisements
UNION ALL SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL SELECT 'loyalty_gifts', COUNT(*) FROM loyalty_gifts;
