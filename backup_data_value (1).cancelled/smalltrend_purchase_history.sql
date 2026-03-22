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
-- Table structure for table `purchase_history`
--

DROP TABLE IF EXISTS `purchase_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `product_id` bigint NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_history`
--

LOCK TABLES `purchase_history` WRITE;
/*!40000 ALTER TABLE `purchase_history` DISABLE KEYS */;
INSERT INTO `purchase_history` VALUES (1,'2026-02-24 09:30:00.000000',1,'Nguyen Van A','CASH',12000.00,4,'Coca Cola 330ml',2,24000.00),(2,'2026-02-24 09:30:00.000000',1,'Nguyen Van A','CASH',8000.00,5,'Oishi Snack',3,24000.00),(3,'2026-02-24 19:20:00.000000',2,'Tran Thi B','CARD',25000.00,1,'Fresh Milk 1L',2,50000.00),(4,'2026-02-24 19:20:00.000000',2,'Tran Thi B','CARD',45000.00,3,'Nescafe 3in1',1,45000.00),(5,'2026-02-25 20:10:00.000000',3,'Le Van C','MOMO',15000.00,2,'Dove Soap 90g',2,30000.00),(6,'2026-02-26 10:15:00.000000',1,'Nguyen Van A','CASH',25000.00,1,'Fresh Milk 1L',1,25000.00),(7,'2026-02-26 14:30:00.000000',4,'Pham Thi D','CASH',12000.00,4,'Coca Cola 330ml',5,60000.00),(8,'2026-02-26 14:30:00.000000',4,'Pham Thi D','CASH',8000.00,5,'Oishi Snack',4,32000.00),(9,'2026-02-27 08:45:00.000000',2,'Tran Thi B','MOMO',12000.00,4,'Coca Cola 330ml',3,36000.00),(10,'2026-02-27 08:45:00.000000',2,'Tran Thi B','MOMO',15000.00,2,'Dove Soap 90g',1,15000.00),(17,'2026-03-19 13:03:41.894956',4,'Pham Thi D','Tiền mặt',23000.00,1,'Sữa dinh dưỡng Vinamilk Bịch - Ít đường - 220ml',14,322000.00),(18,'2026-03-19 13:03:50.691817',4,'Pham Thi D','Tiền mặt',23000.00,1,'Sữa dinh dưỡng Vinamilk Bịch - Ít đường - 220ml',14,322000.00),(19,'2026-03-19 13:03:50.692822',4,'Pham Thi D','Tiền mặt',23000.00,1,'Sữa dinh dưỡng Vinamilk Bịch - Ít đường - 220ml',14,322000.00),(20,'2026-03-19 13:16:19.149215',4,'Pham Thi D','Tiền mặt',8000.00,5,'Bánh snack Oishi Gói - Phô mai - 40G',2,16000.00),(21,'2026-03-19 13:16:19.150222',4,'Pham Thi D','Tiền mặt',12000.00,17,'Snack Lays Gói - Bò Nướng Texas - 30g',1,12000.00),(22,'2026-03-19 13:16:19.152825',4,'Pham Thi D','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',7,350000.00),(23,'2026-03-19 13:18:03.070233',7,'Huy','Chuyển khoản',25000.00,24,'Sữa đặc Ông Thọ Lon - 380g',1,25000.00),(24,'2026-03-19 13:18:43.758182',7,'Huy','Chuyển khoản',25000.00,24,'Sữa đặc Ông Thọ Lon - 380g',1,25000.00),(25,'2026-03-19 13:18:43.758182',7,'Huy','Chuyển khoản',25000.00,24,'Sữa đặc Ông Thọ Lon - 380g',1,25000.00),(26,'2026-03-19 13:18:43.790292',4,'Pham Thi D','Tiền mặt',8000.00,5,'Bánh snack Oishi Gói - Phô mai - 40G',2,16000.00),(27,'2026-03-19 13:18:43.791306',4,'Pham Thi D','Tiền mặt',12000.00,17,'Snack Lays Gói - Bò Nướng Texas - 30g',1,12000.00),(28,'2026-03-19 13:18:43.792666',4,'Pham Thi D','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',7,350000.00),(29,'2026-03-19 13:18:43.793744',4,'Pham Thi D','Tiền mặt',8000.00,5,'Bánh snack Oishi Gói - Phô mai - 40G',2,16000.00),(30,'2026-03-19 13:18:43.794741',4,'Pham Thi D','Tiền mặt',12000.00,17,'Snack Lays Gói - Bò Nướng Texas - 30g',1,12000.00),(31,'2026-03-19 13:18:43.796286',4,'Pham Thi D','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',7,350000.00),(32,'2026-03-19 13:42:21.415373',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(33,'2026-03-19 13:42:37.773516',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(34,'2026-03-19 13:43:21.689677',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(35,'2026-03-19 13:43:21.689677',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(36,'2026-03-19 13:43:21.719661',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(37,'2026-03-19 13:43:21.721780',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(38,'2026-03-19 13:43:46.416431',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(39,'2026-03-19 13:43:51.831524',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(40,'2026-03-19 13:43:51.831524',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',1,50000.00),(41,'2026-03-19 14:14:49.896848',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',10,500000.00),(42,'2026-03-19 14:15:03.135723',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',10,500000.00),(43,'2026-03-19 14:15:03.135723',0,'Khách lẻ','Tiền mặt',50000.00,10,'Kẹo mút Chupa Chups Gói - 30 cái',10,500000.00),(44,'2026-03-19 15:05:40.199015',7,'Huy','Tiền mặt',23000.00,1,'Sữa dinh dưỡng Vinamilk Bịch - Ít đường - 220ml',1,23000.00),(45,'2026-03-19 15:07:34.306415',0,'Khách lẻ','Tiền mặt',23000.00,1,'Sữa dinh dưỡng Vinamilk Bịch - Ít đường - 220ml',1,23000.00),(46,'2026-03-19 15:08:36.855694',0,'Khách lẻ','Tiền mặt',23000.00,1,'Sữa dinh dưỡng Vinamilk Bịch - Ít đường - 220ml',1,23000.00);
/*!40000 ALTER TABLE `purchase_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:10:31
