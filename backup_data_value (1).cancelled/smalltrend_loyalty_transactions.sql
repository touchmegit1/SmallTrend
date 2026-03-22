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
-- Table structure for table `loyalty_transactions`
--

DROP TABLE IF EXISTS `loyalty_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `balance_after` int DEFAULT NULL,
  `balance_before` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `order_amount` decimal(15,2) DEFAULT NULL,
  `points` int NOT NULL,
  `points_multiplier` decimal(10,2) DEFAULT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_time` datetime(6) DEFAULT NULL,
  `transaction_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `customer_id` int NOT NULL,
  `performed_by` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_hrc9mj0nfwmyx9rbx8fej5hgu` (`transaction_code`),
  KEY `FKgjaecj4l1n9mkh4k0r2q15v0k` (`customer_id`),
  KEY `FKjqb7dg3abb957aumwpohhm2ui` (`performed_by`),
  KEY `FK8tq936uuyvf6hn726y3asaadl` (`order_id`),
  CONSTRAINT `FK8tq936uuyvf6hn726y3asaadl` FOREIGN KEY (`order_id`) REFERENCES `sale_orders` (`id`),
  CONSTRAINT `FKgjaecj4l1n9mkh4k0r2q15v0k` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FKjqb7dg3abb957aumwpohhm2ui` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_transactions`
--

LOCK TABLES `loyalty_transactions` WRITE;
/*!40000 ALTER TABLE `loyalty_transactions` DISABLE KEYS */;
INSERT INTO `loyalty_transactions` VALUES (1,800,746,'2026-03-18 01:40:09.000000','Tích điểm từ đơn SO-20260224-001','2027-02-24 23:59:59.000000',53900.00,54,1.00,'PURCHASE','COMPLETED','LT-20260224-001','2026-02-24 09:32:00.000000','EARN','2026-03-18 01:40:09.000000',2,3,1),(2,150,53,'2026-03-18 01:40:09.000000','Tích điểm từ đơn SO-20260224-002','2027-02-24 23:59:59.000000',97300.00,97,1.00,'PURCHASE','COMPLETED','LT-20260224-002','2026-02-24 19:24:00.000000','EARN','2026-03-18 01:40:09.000000',1,3,2),(3,18,0,'2026-03-18 01:40:09.000000','Migrated from legacy loyalty_history','2025-02-20 23:59:59.000000',175000.00,18,1.00,'PURCHASE','COMPLETED','LT-LEG-001','2024-02-20 10:31:00.000000','EARN','2026-03-18 01:40:09.000000',1,3,4),(4,10,0,'2026-03-18 01:40:09.000000','Migrated from legacy loyalty_history','2025-02-21 23:59:59.000000',95000.00,10,1.00,'PURCHASE','COMPLETED','LT-LEG-002','2024-02-21 14:16:00.000000','EARN','2026-03-18 01:40:09.000000',2,3,5),(5,6,0,'2026-03-18 01:40:09.000000','Migrated from legacy loyalty_history','2025-02-22 23:59:59.000000',58000.00,6,1.00,'PURCHASE','COMPLETED','LT-LEG-003','2024-02-22 09:46:00.000000','EARN','2026-03-18 01:40:09.000000',3,5,6),(6,12,0,'2026-03-18 01:40:09.000000','Migrated from legacy loyalty_history','2025-02-23 23:59:59.000000',120000.00,12,1.00,'PURCHASE','COMPLETED','LT-LEG-004','2024-02-23 16:21:00.000000','EARN','2026-03-18 01:40:09.000000',4,3,7),(7,7,0,'2026-03-18 01:40:09.000000','Migrated from legacy loyalty_history','2025-02-24 23:59:59.000000',67000.00,7,1.00,'PURCHASE','COMPLETED','LT-LEG-005','2024-02-24 11:11:00.000000','EARN','2026-03-18 01:40:09.000000',4,5,8);
/*!40000 ALTER TABLE `loyalty_transactions` ENABLE KEYS */;
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
