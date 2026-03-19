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
-- Dumping data for table `supplier_contracts`
--

LOCK TABLES `supplier_contracts` WRITE;
/*!40000 ALTER TABLE `supplier_contracts` DISABLE KEYS */;
INSERT INTO `supplier_contracts` VALUES (1,'SC-VM-2026-001','2026-03-18 01:40:08.000000','VND','Giao hàng theo lịch tuần','Hợp đồng cung ứng sữa và chế phẩm sữa cho toàn hệ thống cửa hàng','2026-12-31','Ưu tiên giao hàng dịp cao điểm lễ tết','Thanh toán 30 ngày kể từ ngày nhận hóa đơn','Tran Thi Manager','Nguyen Van A','2025-12-20','2026-01-01','ACTIVE','Hợp đồng phân phối sữa Vinamilk 2026',1200000000.00,'2026-03-18 01:40:08.000000',1),(2,'SC-UL-2026-001','2026-03-18 01:40:08.000000','VND','Giao hàng trong 48h sau PO','Hợp đồng cung ứng nhóm sản phẩm chăm sóc cá nhân và gia dụng','2026-12-31','Cam kết đổi trả lô lỗi trong 7 ngày','Thanh toán theo từng lô, tối đa 21 ngày','Tran Thi Manager','Tran Thi B','2026-01-10','2026-01-15','ACTIVE','Hợp đồng đồ gia dụng Unilever 2026',800000000.00,'2026-03-18 01:40:08.000000',2);
/*!40000 ALTER TABLE `supplier_contracts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  1:12:06
