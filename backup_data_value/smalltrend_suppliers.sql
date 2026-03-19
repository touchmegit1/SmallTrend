-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: smalltrend
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,_binary '','10 Tan Trao, District 7, Ho Chi Minh City, Vietnam','Nguyen Van A','2025-01-15',NULL,'2023-01-15',NULL,'sales@vinamilk.com.vn','Vinamilk Distribution','Main dairy supplier','1800-1199','0100170098',NULL),(2,_binary '','15 Le Duan Blvd, District 1, Ho Chi Minh City, Vietnam','Tran Thi B','2025-03-01',NULL,'2023-03-01',NULL,'contact@unilever.com.vn','Unilever Vietnam','Personal care and household products','1800-5588','0300491828',NULL),(3,_binary '','The Vista Building, Hanoi Highway, Ho Chi Minh City, Vietnam','Le Van C','2025-06-01',NULL,'2023-06-01',NULL,'info@nestle.com.vn','Nestle Vietnam','Food and beverage supplier','1900-6011','0302127854',NULL),(4,_binary '','124 Kim Ma Street, Ba Dinh, Hanoi, Vietnam','Pham Thi D','2025-07-01',NULL,'2023-07-01',NULL,'vietnam@cocacola.com','Coca-Cola Vietnam','Soft drinks supplier','1900-0180','0300693409',NULL),(5,_binary '','39 Le Duan, District 1, Ho Chi Minh City, Vietnam','Le Van M','2025-08-01',NULL,'2023-08-01',NULL,'contact@masan.com.vn','Masan Consumer','Consumer goods supplier','1800-9090','0302017440',NULL),(6,_binary '','1 Bach Dang, Tan Binh District, Ho Chi Minh City, Vietnam','Tran Van H','2025-10-01',NULL,'2023-10-01',NULL,'sales@heineken.com.vn','Heineken Vietnam','Beer and beverages supplier','1900-1111','0300847056',NULL),(7,_binary '','138 Hai Ba Trung, District 1, Ho Chi Minh City, Vietnam','Bui Van K','2025-05-01',NULL,'2023-05-01',NULL,'info@kido.vn','KIDO Group (Tuong An)','Edible oils and foods','1800-6688','0302266881',NULL),(8,_binary '','182 Le Dai Hanh, District 11, Ho Chi Minh City, Vietnam','Nguyen Van P','2025-04-01',NULL,'2023-04-01',NULL,'contact@pepsico.com.vn','PepsiCo Vietnam','Soft drinks and snacks','1900-1220','0300811445',NULL),(9,_binary '','Thai Hoa Town, Nghe An Province, Vietnam','Tran Thi T','2025-02-01',NULL,'2023-02-01',NULL,'sales@thmilk.vn','TH Milk Distribution','Dairy supplier','1800-545440','2900326335',NULL),(10,_binary '','Tan Binh Industrial Park, Ho Chi Minh City, Vietnam','Le Van AC','2025-05-01',NULL,'2023-05-01',NULL,'info@acecookvietnam.vn','Acecook Vietnam','Instant noodle supplier','1900-0120','0300808680',NULL),(11,_binary '','Tan Binh District, Ho Chi Minh City, Vietnam','Pham Van V','2025-05-10',NULL,'2023-05-10',NULL,'info@vifon.com.vn','Vifon Vietnam','Instant noodles and pho','028-3815-4364','0300391837',NULL),(12,_binary '','My Phuoc Industrial Park, Binh Duong, Vietnam','Kim Orion','2025-04-01',NULL,'2023-04-01',NULL,'contact@orion.vn','Orion Food Vina','Snack supplier','0274-355-0166','3700381324',NULL),(13,_binary '','VSIP Industrial Park, Binh Duong, Vietnam','Nguyen Van O','2025-04-15',NULL,'2023-04-15',NULL,'sales@oishi.vn','Oishi Vietnam','Snack foods','0274-378-4088','0302752277',NULL),(14,_binary '','Vinh Loc Industrial Park, Binh Chanh, Ho Chi Minh City, Vietnam','Tran Thi C','2025-03-15',NULL,'2023-03-15',NULL,'info@cholimexfood.com.vn','Cholimex Food','Sauces and condiments','028-3765-2101','0304475742',NULL),(15,_binary '','Bien Hoa Industrial Zone, Dong Nai, Vietnam','Somchai CP','2025-06-01',NULL,'2023-06-01',NULL,'info@cp.com.vn','CP Vietnam Corporation','Meat and food products','0251-3836-501','3600235308',NULL),(16,_binary '','VSIP Industrial Park, Binh Duong, Vietnam','Marco Perfetti','2025-06-10',NULL,'2023-06-10',NULL,'info.vn@perfettivanmelle.com','Perfetti Van Melle Vietnam Co., Ltd','Confectionery supplier (Chupa Chups, Alpenliebe, Mentos)','0274-376-8586','0300588569',NULL),(17,_binary '','913 Truong Chinh Street, Tan Phu District, Ho Chi Minh City, Vietnam','Nguyen Bich Lam','2025-06-10',NULL,'2023-06-10',NULL,'info@vifon.com.vn','Vifon Joint Stock Company','Instant food supplier (Pho, noodles, vermicelli)','028-3815-4368','0300391836',NULL);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:12:04
