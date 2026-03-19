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
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'LOGIN','{\"event\":\"seed login\"}','2026-03-18 01:40:09.000000','Initial seed log',1,'User',NULL,'OK','SYSTEM',NULL,1),(2,'CREATE','{\"campaign_code\":\"CAMP-202602-001\"}','2026-03-18 01:40:09.000000','Created campaign seed',1,'Campaign',NULL,'OK','SYSTEM',NULL,2),(3,'CREATE','{\"count_code\":\"IC-2026-0001\"}','2026-03-18 01:40:09.000000','Created inventory count seed',1,'InventoryCount',NULL,'OK','SYSTEM',NULL,5),(4,'CONFIRM','{\"count_code\":\"IC-2026-0001\",\"confirmed_by\":2}','2026-03-18 01:40:09.000000','Confirmed inventory count IC-2026-0001',1,'InventoryCount',NULL,'OK','SYSTEM',NULL,5),(5,'CONFIRM','{\"count_code\":\"IC-2026-0002\",\"confirmed_by\":2}','2026-03-18 01:40:09.000000','Confirmed inventory count IC-2026-0002',2,'InventoryCount',NULL,'OK','SYSTEM',NULL,5),(6,'SUBMIT','{\"count_code\":\"IC-2026-0003\"}','2026-03-18 01:40:09.000000','Submitted IC-2026-0003 for approval',3,'InventoryCount',NULL,'OK','SYSTEM',NULL,5),(7,'REJECT','{\"count_code\":\"IC-2026-0006\",\"reason\":\"Du lieu khong khop\"}','2026-03-18 01:40:09.000000','Rejected inventory count IC-2026-0006',6,'InventoryCount',NULL,'OK','SYSTEM',NULL,2);
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:12:09
