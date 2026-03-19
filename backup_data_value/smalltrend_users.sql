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
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '','123 Nguyen Hue, HCMC','2026-03-18 01:40:08.000000','admin@smalltrend.com','Nguyen Van Admin','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0901234567','ACTIVE','2026-03-18 01:40:08.000000','admin',1,'https://i.pravatar.cc/150?img=12',30000000.00,_binary '',NULL,NULL,'MONTHLY',208.00),(2,_binary '','456 Le Loi, HCMC','2026-03-18 01:40:08.000000','manager@smalltrend.com','Tran Thi Manager','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0912345678','ACTIVE','2026-03-19 17:52:22.933689','manager',2,'https://res.cloudinary.com/didvvefmu/image/upload/v1773942746/smalltrend/avatars/pqsiai7remow3cpxfx3d.jpg',18000000.00,_binary '',NULL,NULL,'MONTHLY',208.00),(3,_binary '','789 Dien Bien Phu, HCMC','2026-03-18 01:40:08.000000','cashier1@smalltrend.com','Le Van Cashier','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0923456789','ACTIVE','2026-03-18 01:40:08.000000','cashier1',3,'https://i.pravatar.cc/150?img=15',13500000.00,_binary '',75000.00,NULL,'HOURLY',208.00),(4,_binary '','321 Ba Trieu, HCMC','2026-03-18 01:40:08.000000','cashier2@smalltrend.com','Vo Thi Cashier 2','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0968765432','ACTIVE','2026-03-18 01:40:08.000000','cashier2',3,'https://i.pravatar.cc/150?img=47',13200000.00,_binary '',72000.00,NULL,'HOURLY',208.00),(5,_binary '','12 Nguyen Trai, HCMC','2026-03-18 01:40:08.000000','inventory@smalltrend.com','Pham Van Inventory','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0934567890','ACTIVE','2026-03-18 01:40:08.000000','inventory1',4,'https://i.pravatar.cc/150?img=25',13000000.00,_binary '',NULL,NULL,'MONTHLY',208.00),(6,_binary '','90 Pasteur, HCMC','2026-03-18 01:40:08.000000','sales@smalltrend.com','Hoang Thi Sales','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0945678901','ACTIVE','2026-03-18 01:40:08.000000','sales1',5,'https://i.pravatar.cc/150?img=41',12600000.00,_binary '',70000.00,NULL,'HOURLY',208.00),(7,_binary '','45 Hai Ba Trung, HCMC','2026-03-18 01:40:08.000000','sales2@smalltrend.com','Nguyen Van Sales 2','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','0987654012','ACTIVE','2026-03-18 01:40:08.000000','sales2',5,'https://i.pravatar.cc/150?img=6',12500000.00,_binary '',NULL,20,'MONTHLY_MIN_SHIFTS',208.00),(8,_binary '','120 Yên Lãng, Đống Đa, Hà Nội','2026-03-19 14:24:14.936732','kiennguyen21005@gmail.com','Nguyễn Xuân Kiên','$2a$10$4eO2jrzTRQmOTW/iSlECv.99/YUjwzsVWIeIViQdjQw0YwEp7ZKNi','0842561752','ACTIVE','2026-03-19 14:24:14.936732','kien',2,NULL,NULL,_binary '',NULL,NULL,'MONTHLY',208.00),(9,_binary '','Lào Cai','2026-03-19 14:25:32.081856','hung@gmail.com','Nguyễn Quốc Hưng','$2a$10$KT2Gw8KbGyljHUIo18ebeebchc8PjJyjfnJNRf2PnDXtV3rqFXjv2','0977869300','ACTIVE','2026-03-19 14:25:32.081856','hung',2,NULL,NULL,_binary '',NULL,NULL,'MONTHLY',208.00);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:12:05
