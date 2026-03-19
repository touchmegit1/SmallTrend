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
-- Table structure for table `work_shifts`
--

DROP TABLE IF EXISTS `work_shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `allow_early_clock_in` bit(1) DEFAULT NULL,
  `allow_late_clock_out` bit(1) DEFAULT NULL,
  `break_end_time` time(6) DEFAULT NULL,
  `break_minutes` int DEFAULT NULL,
  `break_start_time` time(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `early_clock_in_minutes` int DEFAULT NULL,
  `end_time` time(6) NOT NULL,
  `grace_peroid_minutes` int DEFAULT NULL,
  `holiday_bonus` decimal(5,2) DEFAULT NULL,
  `late_clock_out_minutes` int DEFAULT NULL,
  `maximum_staff_allowed` int DEFAULT NULL,
  `minimum_staff_required` int DEFAULT NULL,
  `night_shift_bonus` decimal(5,2) DEFAULT NULL,
  `overtime_multiplier` decimal(5,2) DEFAULT NULL,
  `planned_minutes` int DEFAULT NULL,
  `requires_approval` bit(1) DEFAULT NULL,
  `shift_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` time(6) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `weekend_bonus` decimal(5,2) DEFAULT NULL,
  `working_minutes` int DEFAULT NULL,
  `supervisor_role_id` int DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeij2npo7u2fk4wbvlkn4d46ft` (`supervisor_role_id`),
  CONSTRAINT `FKeij2npo7u2fk4wbvlkn4d46ft` FOREIGN KEY (`supervisor_role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_shifts`
--

LOCK TABLES `work_shifts` WRITE;
/*!40000 ALTER TABLE `work_shifts` DISABLE KEYS */;
INSERT INTO `work_shifts` VALUES (1,_binary '',_binary '','13:00:00.000000',NULL,'12:00:00.000000',NULL,'Ca sáng từ 8h đến 17h, nghỉ trưa 1 tiếng',15,'17:00:00.000000',10,0.00,30,5,2,0.00,1.50,NULL,_binary '\0','SHIFT-MORNING','Ca Sáng','REGULAR','08:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL),(2,_binary '',_binary '','18:30:00.000000',NULL,'18:00:00.000000',NULL,'Ca chiều từ 13h đến 22h, nghỉ 30 phút',15,'22:00:00.000000',10,0.00,30,4,2,10.00,1.50,NULL,_binary '\0','SHIFT-AFTERNOON','Ca Chiều','REGULAR','13:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL),(3,_binary '',_binary '',NULL,NULL,NULL,NULL,'Ca tối từ 18h đến 23h, phụ cấp ca đêm 15%',10,'23:00:00.000000',5,0.00,20,3,2,15.00,1.50,NULL,_binary '\0','SHIFT-EVENING','Ca Tối','NIGHT','18:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL),(4,_binary '',_binary '','13:30:00.000000',NULL,'12:30:00.000000',NULL,'Ca cuối tuần từ 9h đến 18h, phụ cấp 20%',15,'18:00:00.000000',10,0.00,30,6,3,0.00,2.00,NULL,_binary '','SHIFT-WEEKEND','Ca Cuối Tuần','WEEKEND','09:00:00.000000','ACTIVE',NULL,20.00,NULL,NULL,NULL,NULL),(5,_binary '',_binary '','13:00:00.000000',NULL,'12:00:00.000000',NULL,'Ca full-time chuẩn 8 tiếng',15,'17:00:00.000000',10,0.00,30,3,1,0.00,1.50,NULL,_binary '\0','SHIFT-FULLTIME','Ca Full-time','REGULAR','08:00:00.000000','ACTIVE',NULL,0.00,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `work_shifts` ENABLE KEYS */;
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
