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
-- Table structure for table `sale_order_items`
--

DROP TABLE IF EXISTS `sale_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `line_discount_amount` decimal(15,2) DEFAULT NULL,
  `line_tax_amount` decimal(15,2) DEFAULT NULL,
  `line_total_amount` decimal(15,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `sale_order_id` int NOT NULL,
  `product_variant_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5lb9ncmjl17g2h5jl5o6pej48` (`sale_order_id`),
  KEY `FKddseiq7nhb6espw9bw5tf64wp` (`product_variant_id`),
  CONSTRAINT `FK5lb9ncmjl17g2h5jl5o6pej48` FOREIGN KEY (`sale_order_id`) REFERENCES `sale_orders` (`id`),
  CONSTRAINT `FKddseiq7nhb6espw9bw5tf64wp` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_order_items`
--

LOCK TABLES `sale_order_items` WRITE;
/*!40000 ALTER TABLE `sale_order_items` DISABLE KEYS */;
INSERT INTO `sale_order_items` VALUES (1,0.00,2400.00,26400.00,NULL,'Coca Cola 330ml',2,'COCA-330ML',12000.00,1,4),(2,0.00,2400.00,26400.00,NULL,'Oishi Snack',3,'OISHI-50G',8000.00,1,5),(3,2000.00,4800.00,52800.00,NULL,'Fresh Milk 1L',2,'VMILK-1L',25000.00,2,1),(4,3000.00,4500.00,46500.00,NULL,'Nescafe 3in1',1,'NESCAFE-200G',45000.00,2,3),(5,0.00,3000.00,33000.00,'1 sản phẩm bị lỗi vỏ hộp','Dove Soap 90g',2,'DOVE-90G',15000.00,3,2),(6,0.00,0.00,175000.00,'Migrated from legacy sales_order_items','Fresh Milk 1L',7,'VMILK-1L',25000.00,4,1),(7,0.00,0.00,95000.00,'Migrated from legacy sales_order_items','Dove Soap 90g',4,'DOVE-90G',23750.00,5,2),(8,0.00,0.00,57999.96,'Migrated from legacy sales_order_items','Nescafe 3in1',12,'NESCAFE-200G',4833.33,6,3),(9,0.00,0.00,120000.00,'Migrated from legacy sales_order_items','Coca Cola 330ml',10,'COCA-330ML',12000.00,7,4),(10,0.00,0.00,67000.00,'Migrated from legacy sales_order_items','Oishi Snack',5,'OISHI-50G',13400.00,8,5),(11,0.00,0.00,24000.00,NULL,'Coca Cola 330ml',2,'COCA-330ML',12000.00,9,4),(12,0.00,0.00,24000.00,NULL,'Oishi Snack',3,'OISHI-50G',8000.00,9,5),(13,0.00,0.00,50000.00,NULL,'Fresh Milk 1L',2,'VMILK-1L',25000.00,10,1),(14,0.00,0.00,45000.00,NULL,'Nescafe 3in1',1,'NESCAFE-200G',45000.00,10,3),(15,0.00,0.00,30000.00,NULL,'Dove Soap 90g',2,'DOVE-90G',15000.00,11,2),(16,0.00,0.00,25000.00,NULL,'Fresh Milk 1L',1,'VMILK-1L',25000.00,12,1),(17,0.00,0.00,60000.00,NULL,'Coca Cola 330ml',5,'COCA-330ML',12000.00,13,4),(18,0.00,0.00,32000.00,NULL,'Oishi Snack',4,'OISHI-50G',8000.00,13,5),(19,0.00,0.00,36000.00,NULL,'Coca Cola 330ml',3,'COCA-330ML',12000.00,14,4),(20,0.00,0.00,15000.00,NULL,'Dove Soap 90g',1,'DOVE-90G',15000.00,14,2),(21,0.00,0.00,75000.00,NULL,'Fresh Milk 1L',3,'VMILK-1L',25000.00,15,1),(22,0.00,0.00,90000.00,NULL,'Nescafe 3in1',2,'NESCAFE-200G',45000.00,15,3),(23,0.00,0.00,40000.00,NULL,'Oishi Snack',5,'OISHI-50G',8000.00,16,5),(24,0.00,0.00,50000.00,NULL,'Fresh Milk 1L',2,'VMILK-1L',25000.00,17,1),(25,0.00,0.00,45000.00,NULL,'Dove Soap 90g',3,'DOVE-90G',15000.00,17,2),(26,0.00,0.00,72000.00,NULL,'Coca Cola 330ml',6,'COCA-330ML',12000.00,18,4);
/*!40000 ALTER TABLE `sale_order_items` ENABLE KEYS */;
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
