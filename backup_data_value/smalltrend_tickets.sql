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
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,NULL,'Nhân viên A muốn đổi ca sáng sang ca chiều với nhân viên B do có lịch cá nhân','NORMAL',1,'WorkShift',NULL,NULL,'OPEN','TCK-SWAP-001','SWAP_SHIFT','Swap shift ngày 15/02 - Ca sáng <-> Ca chiều',NULL,3,2,NULL),(2,NULL,'Bàn giao ca tối: Quầy 1 có 2,500,000 VND trong két, 15 giao dịch hoàn tất, cần kiểm kê lại kệ đồ uống','HIGH',1,'CashRegister','Đã bàn giao thành công. Nhân viên ca tối xác nhận đã nhận đầy đủ tiền mặt và ghi chú','2026-02-21 22:00:00.000000','RESOLVED','TCK-HAND-001','HANDOVER','Bàn giao ca tối 14/02/2026',NULL,3,2,2),(3,NULL,'Khách hàng mua nhầm sản phẩm, yêu cầu hoàn tiền. Sản phẩm còn nguyên seal, trong thời hạn đổi trả','URGENT',1,'Order',NULL,NULL,'IN_PROGRESS','TCK-REF-001','REFUND','Hoàn tiền đơn hàng ORD-2026-001',NULL,1,2,NULL),(4,NULL,'Khách hàng phàn nàn sữa hết hạn sử dụng. Cần kiểm tra lại quy trình kiểm kê','HIGH',1,'Product',NULL,NULL,'OPEN','TCK-COMP-001','COMPLAINT','Khiếu nại về chất lượng sản phẩm',NULL,1,3,NULL),(5,'2026-03-19 13:39:45.436969','[Khách hàng: Huy - SĐT: 0961390488]\nBị rỉ nước','HIGH',1,'Order',NULL,NULL,'IN_PROGRESS','TCK-REF-002','REFUND','Coca bị lỗi','2026-03-19 13:39:45.436969',3,3,NULL),(6,'2026-03-19 13:40:58.065490','[Khách hàng: Huy - SĐT: 09613690486]\ns','HIGH',1,'Order','','2026-03-19 13:48:02.457219','RESOLVED','TCK-REF-003','REFUND','CoCa','2026-03-19 13:48:02.460728',3,3,NULL),(7,'2026-03-19 14:16:12.031860','[Khách hàng: Huy - SĐT: 0961390486]\nKeo het han\n[REFUND_SKU=SNACK-CHUP-KEOMUT-GOI30C]\n[REFUND_QTY=10]','NORMAL',1,'Product',NULL,NULL,'IN_PROGRESS','TCK-REF-004','REFUND','San pham loi','2026-03-19 14:16:12.031860',3,3,NULL),(8,'2026-03-19 14:17:09.302517','[Khách hàng: Huy - SĐT: 0961390486]\nddd\n[REFUND_SKU=SNACK-CHUP-KEOMUT-GOI30C]\n[REFUND_QTY=10]','HIGH',1,'Product','','2026-03-19 14:17:18.444081','RESOLVED','TCK-REF-005','REFUND','Sanr pham loi','2026-03-19 14:17:18.461675',3,3,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
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
