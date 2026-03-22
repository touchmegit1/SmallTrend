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
-- Table structure for table `inventory_counts`
--

DROP TABLE IF EXISTS `inventory_counts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_counts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `confirmed_by` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_difference_value` decimal(38,2) DEFAULT NULL,
  `total_overage_value` decimal(38,2) DEFAULT NULL,
  `total_shortage_value` decimal(38,2) DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_5gv3kgp0sc2836l9ysfatovso` (`code`),
  KEY `FKsxj6ctlb0t55kfrf02dlanja6` (`location_id`),
  CONSTRAINT `FKsxj6ctlb0t55kfrf02dlanja6` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_counts`
--

LOCK TABLES `inventory_counts` WRITE;
/*!40000 ALTER TABLE `inventory_counts` DISABLE KEYS */;
INSERT INTO `inventory_counts` VALUES (1,'IC-2026-0001','2026-02-20 15:00:00.000000',2,'2026-02-20 14:00:00.000000',5,'Kiểm kho định kỳ tháng 2 tại kho chính A1',NULL,'CONFIRMED',-100000.00,0.00,100000.00,1),(2,'IC-2026-0002','2026-02-20 16:00:00.000000',2,'2026-02-20 14:30:00.000000',5,'Kiểm kho định kỳ tháng 2 tại kho lạnh B1',NULL,'CONFIRMED',35000.00,35000.00,0.00,3),(3,'IC-2026-0003',NULL,NULL,'2026-02-22 09:00:00.000000',5,'Kiểm kho khu vực kho B — chờ quản lý duyệt',NULL,'PENDING',-45000.00,0.00,45000.00,2),(4,'IC-2026-0004',NULL,NULL,'2026-02-25 10:00:00.000000',5,'Kiểm kho khu vực kệ trưng bày C1 — đang đếm',NULL,'COUNTING',NULL,NULL,NULL,4),(5,'IC-2026-0006',NULL,NULL,'2026-02-23 11:00:00.000000',5,'Kiểm kho khu vực POS — bị từ chối do lỗi nhập liệu','Dữ liệu kiểm kê không khớp với biên lai nhập hàng. Cần kiểm tra lại lô hàng trước khi xác nhận.','REJECTED',0.00,0.00,0.00,5),(6,'IC-2026-0007',NULL,NULL,'2026-03-18 08:11:04.252375',1,'',NULL,'PENDING',0.00,0.00,0.00,1);
/*!40000 ALTER TABLE `inventory_counts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:10:33
