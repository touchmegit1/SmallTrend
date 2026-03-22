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
-- Table structure for table `cash_transactions`
--

DROP TABLE IF EXISTS `cash_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `balance_after` decimal(15,2) DEFAULT NULL,
  `balance_before` decimal(15,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `reason` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_time` datetime(6) DEFAULT NULL,
  `transaction_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `register_id` int NOT NULL,
  `performed_by` int NOT NULL,
  `order_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_9e1u11474i5vs94im42y3m3er` (`transaction_code`),
  KEY `FKf9ok6yo60pbck5d7itq3ogyym` (`approved_by`),
  KEY `FKjpseljilqiu0ho8fktnkyjcbq` (`register_id`),
  KEY `FK6infsyqx551bnkuqlgpalyuik` (`performed_by`),
  KEY `FKqy31mouii3qdvp3n4a2bf8y79` (`order_id`),
  CONSTRAINT `FK6infsyqx551bnkuqlgpalyuik` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKf9ok6yo60pbck5d7itq3ogyym` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKjpseljilqiu0ho8fktnkyjcbq` FOREIGN KEY (`register_id`) REFERENCES `cash_registers` (`id`),
  CONSTRAINT `FKqy31mouii3qdvp3n4a2bf8y79` FOREIGN KEY (`order_id`) REFERENCES `sale_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_transactions`
--

LOCK TABLES `cash_transactions` WRITE;
/*!40000 ALTER TABLE `cash_transactions` DISABLE KEYS */;
INSERT INTO `cash_transactions` VALUES (1,53900.00,'2026-02-24 09:35:00.000000',5053900.00,5000000.00,'2026-03-18 01:40:09.000000','Thu tiền mặt từ đơn SO-20260224-001','Đã đối soát cuối ca','SALE',NULL,'COMPLETED','CT-20260224-001','2026-02-24 09:31:00.000000','CASH_IN','2026-03-18 01:40:09.000000',2,1,3,1),(2,15000.00,'2026-02-25 21:05:00.000000',2985000.00,3000000.00,'2026-03-18 01:40:09.000000','Hoàn tiền mặt 1 phần cho đơn SO-20260225-001','Refund do sản phẩm lỗi','REFUND',NULL,'COMPLETED','CT-20260225-001','2026-02-25 21:00:00.000000','CASH_OUT','2026-03-18 01:40:09.000000',2,2,3,3);
/*!40000 ALTER TABLE `cash_transactions` ENABLE KEYS */;
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
