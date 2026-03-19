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
-- Table structure for table `sale_order_histories`
--

DROP TABLE IF EXISTS `sale_order_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_order_histories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `change_notes` text COLLATE utf8mb4_unicode_ci,
  `changed_at` datetime(6) NOT NULL,
  `from_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by_user_id` int DEFAULT NULL,
  `sale_order_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtal8e1170l5ejadw880yje0b5` (`changed_by_user_id`),
  KEY `FKlb9tv3yifbaoyfv06n6mxqsu5` (`sale_order_id`),
  CONSTRAINT `FKlb9tv3yifbaoyfv06n6mxqsu5` FOREIGN KEY (`sale_order_id`) REFERENCES `sale_orders` (`id`),
  CONSTRAINT `FKtal8e1170l5ejadw880yje0b5` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_order_histories`
--

LOCK TABLES `sale_order_histories` WRITE;
/*!40000 ALTER TABLE `sale_order_histories` DISABLE KEYS */;
INSERT INTO `sale_order_histories` VALUES (1,'CREATED','Khởi tạo đơn tại POS-001','2026-02-24 09:30:00.000000',NULL,'PENDING',3,1),(2,'PAYMENT_SUCCESS','Thanh toán tiền mặt thành công','2026-02-24 09:31:00.000000','PENDING','COMPLETED',3,1),(3,'CREATED','Khởi tạo đơn tại POS-001','2026-02-24 19:20:00.000000',NULL,'PENDING',3,2),(4,'PAYMENT_SUCCESS','Thanh toán thẻ thành công','2026-02-24 19:23:00.000000','PENDING','COMPLETED',3,2),(5,'CREATED','Khởi tạo đơn tại POS-002','2026-02-25 20:10:00.000000',NULL,'PENDING',3,3),(6,'PAYMENT_SUCCESS','Thanh toán ví điện tử thành công','2026-02-25 20:15:00.000000','PENDING','COMPLETED',3,3),(7,'REFUND_PARTIAL','Khách trả lại sản phẩm lỗi','2026-02-25 21:00:00.000000','COMPLETED','REFUNDED',2,3);
/*!40000 ALTER TABLE `sale_order_histories` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:10:32
