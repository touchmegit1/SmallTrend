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
-- Dumping data for table `product_combos`
--

LOCK TABLES `product_combos` WRITE;
/*!40000 ALTER TABLE `product_combos` DISABLE KEYS */;
INSERT INTO `product_combos` VALUES (1,'CB-SNACK-1','Combo Siêu Ăn Vặt',200000.00,'DISCOUNT','2026-03-18 01:40:09.000000','Gói snack tổng hợp cho cuối tuần',12.28,1,'https://res.cloudinary.com/didvvefmu/image/upload/v1773919231/smalltrend/user-avatars/sbj0qhwxse75lpp3z4r6.jpg',_binary '',_binary '',5,228000.00,28000.00,'ACTIVE',100,'snack,combo,hot',0,'2026-03-19 11:51:12.370454','2026-02-01','2026-12-31',1),(2,'CB-DRINK-1','Combo Nước Giải Khát',30000.00,'BUNDLE','2026-03-18 01:40:09.000000','2 lon Coca và 1 bịch Oishi',22.68,2,'https://res.cloudinary.com/didvvefmu/image/upload/v1773923203/smalltrend/user-avatars/fsfoh612tomv6pii99xz.jpg',_binary '',_binary '\0',10,38800.00,8800.00,'ACTIVE',200,'drink,summer',0,'2026-03-19 12:26:40.038268','2026-02-01','2026-12-31',1),(3,'COMBO-BREAKFAST','Combo Sáng Năng Động',30000.00,'BUNDLE','2026-03-18 01:40:09.000000','Sữa +Mì gói',9.09,3,'https://res.cloudinary.com/didvvefmu/image/upload/v1773923539/smalltrend/user-avatars/asdtvrwzaqjzfvtha0gn.jpg',_binary '',_binary '\0',10,33000.00,3000.00,'ACTIVE',100,'breakfast',0,'2026-03-19 12:32:16.273987','2026-02-01','2026-03-31',2),(4,'COMBO-SNACK','Combo Snack Vui Vẻ',40000.00,'DISCOUNT','2026-03-18 01:40:09.000000','Snack + Nước ngọt',14.53,4,'https://res.cloudinary.com/didvvefmu/image/upload/v1773940913/smalltrend/user-avatars/rcobnefh5bxxnhitbgdm.jpg',_binary '',_binary '\0',10,46800.00,6800.00,'ACTIVE',100,'snack',0,'2026-03-19 17:21:50.415131','2026-02-14','2026-02-28',2),(5,'CB-MILK-1','Combo Nước Tương',84000.00,'BUNDLE','2026-03-18 01:40:09.000000','',4.55,5,'https://res.cloudinary.com/didvvefmu/image/upload/v1773941306/smalltrend/user-avatars/bmbsduhekrndip7f73uu.jpg',_binary '',_binary '\0',10,88000.00,4000.00,'ACTIVE',100,'milk,family',0,'2026-03-19 17:28:22.847343','2026-02-01','2026-12-31',1),(6,'CB-NOODLE-1','Combo Mì Tiết Kiệm',39000.00,'DISCOUNT','2026-03-18 01:40:09.000000','Mì Acecook + Mì Omachi\n',10.34,6,'https://res.cloudinary.com/didvvefmu/image/upload/v1773941731/smalltrend/user-avatars/sjwafuigae05bs83vsyg.jpg',_binary '',_binary '\0',10,43500.00,4500.00,'ACTIVE',150,'noodle,combo',0,'2026-03-19 17:53:31.362532','2026-02-01','2026-12-31',1),(9,'CB-SUMMER-1','Combo Mùa Hè',60000.00,'SUMMER','2026-03-18 01:40:09.000000','Pepsi + Coca + Snack',10.18,9,'https://res.cloudinary.com/didvvefmu/image/upload/v1773942104/smalltrend/user-avatars/xr8eanwle2ctfrites4q.jpg',_binary '',_binary '',10,66800.00,6800.00,'ACTIVE',200,'summer,drink',0,'2026-03-19 17:41:41.199506','2026-04-01','2026-08-31',1);
/*!40000 ALTER TABLE `product_combos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:12:08
