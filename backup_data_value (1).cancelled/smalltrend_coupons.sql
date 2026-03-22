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
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `allowed_categories` longtext COLLATE utf8mb4_unicode_ci,
  `buy_quantity` int DEFAULT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coupon_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coupon_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `current_usage_count` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_amount` decimal(15,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `end_date` date NOT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `get_quantity` int DEFAULT NULL,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `max_discount_amount` decimal(15,2) DEFAULT NULL,
  `min_purchase_amount` decimal(15,2) DEFAULT NULL,
  `min_quantity` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_usage_limit` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `usage_per_customer` int DEFAULT NULL,
  `campaign_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_f1u99ssbdsqass9ntq968codg` (`coupon_code`),
  KEY `FKj9h2qsbp2c4vnjeak6umm8y1u` (`campaign_id`),
  KEY `FK5ta2iuowjf2sx01vtu35oi2an` (`created_by`),
  CONSTRAINT `FK5ta2iuowjf2sx01vtu35oi2an` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKj9h2qsbp2c4vnjeak6umm8y1u` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,NULL,NULL,'WELCOME10','Giảm 10% Đơn Đầu','PERCENTAGE','2026-03-18 01:40:09.000000',1,'Mã giảm 10% cho đơn hàng đầu tiên',NULL,10.00,'2026-03-31',NULL,NULL,NULL,50000.00,100000.00,NULL,'2026-02-01',NULL,'ACTIVE',1000,'2026-03-19 13:16:19.205862',1,1,2),(2,NULL,NULL,'FLASH50K','Giảm 50K Flash Sale','FIXED_AMOUNT','2026-03-18 01:40:09.000000',NULL,'Giảm ngay 50k cho đơn từ 300k',50000.00,NULL,'2026-02-15',NULL,NULL,NULL,NULL,300000.00,NULL,'2026-02-14',NULL,'ACTIVE',500,'2026-03-18 01:40:09.000000',2,2,2),(3,NULL,NULL,'SUMMER2026','SUMMER26','PERCENTAGE','2026-03-19 14:08:12.613974',0,'',NULL,10.00,'2026-03-28',NULL,NULL,NULL,200000.00,NULL,NULL,'2026-03-19',NULL,'ACTIVE',NULL,'2026-03-19 15:36:44.695509',NULL,8,NULL);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
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
