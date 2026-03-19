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
-- Table structure for table `inventory_stock`
--

DROP TABLE IF EXISTS `inventory_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int DEFAULT NULL,
  `batch_id` int NOT NULL,
  `location_id` int DEFAULT NULL,
  `variant_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKrubwde56f959bub1rtfsh9rk1` (`batch_id`),
  KEY `FK78acy8wbfo4lgld4uaura4ope` (`location_id`),
  KEY `FKd1cguwqs4dwkb228hcx3aji9c` (`variant_id`),
  CONSTRAINT `FK78acy8wbfo4lgld4uaura4ope` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  CONSTRAINT `FKd1cguwqs4dwkb228hcx3aji9c` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `FKrubwde56f959bub1rtfsh9rk1` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_stock`
--

LOCK TABLES `inventory_stock` WRITE;
/*!40000 ALTER TABLE `inventory_stock` DISABLE KEYS */;
INSERT INTO `inventory_stock` VALUES (1,214,1,1,1),(2,178,2,2,2),(3,260,3,3,3),(4,502,4,4,4),(5,383,5,5,5),(6,120,6,1,6),(7,85,7,2,7),(8,150,8,3,8),(9,200,9,4,9),(10,973,10,5,10),(11,300,11,1,11),(12,500,12,2,12),(13,400,13,3,13),(14,250,14,4,14),(15,180,15,5,15),(16,210,16,1,16),(17,318,17,2,17),(18,280,18,3,18),(19,140,19,4,19),(20,190,20,5,20),(21,300,21,1,21),(22,250,22,2,22),(23,100,23,3,23),(24,148,24,4,24),(25,200,25,5,25),(26,80,26,1,26),(27,480,27,1,34),(28,16,28,4,35),(29,300,29,1,35),(30,480,30,1,27),(31,480,31,2,27),(32,1,32,1,28),(33,10,33,3,30),(34,96,34,1,27),(38,384,38,1,27),(39,240,39,1,27);
/*!40000 ALTER TABLE `inventory_stock` ENABLE KEYS */;
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
