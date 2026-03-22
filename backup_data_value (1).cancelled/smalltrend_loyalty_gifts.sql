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
-- Table structure for table `loyalty_gifts`
--

DROP TABLE IF EXISTS `loyalty_gifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_gifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `required_points` int NOT NULL,
  `stock` int NOT NULL,
  `variant_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcgtodc2lsxpl6kypk8qoagnpr` (`variant_id`),
  CONSTRAINT `FKcgtodc2lsxpl6kypk8qoagnpr` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_gifts`
--

LOCK TABLES `loyalty_gifts` WRITE;
/*!40000 ALTER TABLE `loyalty_gifts` DISABLE KEYS */;
INSERT INTO `loyalty_gifts` VALUES (1,'2026-03-18 01:40:09.000000',_binary '','Nước uống đặc biệt 500ml',50,150,4),(2,'2026-03-18 01:40:09.000000',_binary '','Bộ cà phê hòa tan 3in1',150,80,3),(3,'2026-03-18 01:40:09.000000',_binary '','Xà phòng Dove 90g',75,200,2),(4,'2026-03-18 01:40:09.000000',_binary '','Sữa tươi Vinamilk 1L',200,50,1),(5,'2026-03-18 01:40:09.000000',_binary '','Combo Snack Oishi',100,100,5),(6,'2026-03-19 15:38:12.253398',_binary '','Nước ngọt Coca Cola (Đổi điểm)',5,10,4);
/*!40000 ALTER TABLE `loyalty_gifts` ENABLE KEYS */;
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
