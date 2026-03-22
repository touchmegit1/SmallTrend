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
-- Table structure for table `disposal_voucher_items`
--

DROP TABLE IF EXISTS `disposal_voucher_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disposal_voucher_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `quantity` int NOT NULL,
  `total_cost` decimal(15,2) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `batch_id` int NOT NULL,
  `disposal_voucher_id` bigint NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKglr8fufguratbv5xipeujc986` (`batch_id`),
  KEY `FKeivnv6flu7k4ejibyvqadm1qu` (`disposal_voucher_id`),
  KEY `FKffky5187clklsm09o3k5jrqi4` (`product_id`),
  CONSTRAINT `FKeivnv6flu7k4ejibyvqadm1qu` FOREIGN KEY (`disposal_voucher_id`) REFERENCES `disposal_vouchers` (`id`),
  CONSTRAINT `FKffky5187clklsm09o3k5jrqi4` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKglr8fufguratbv5xipeujc986` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disposal_voucher_items`
--

LOCK TABLES `disposal_voucher_items` WRITE;
/*!40000 ALTER TABLE `disposal_voucher_items` DISABLE KEYS */;
INSERT INTO `disposal_voucher_items` VALUES (1,'DV2026001','2027-02-01',12,180000.00,15000.00,2,1,2),(2,'NC2026001','2026-02-01',8,96000.00,12000.00,3,2,3);
/*!40000 ALTER TABLE `disposal_voucher_items` ENABLE KEYS */;
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
