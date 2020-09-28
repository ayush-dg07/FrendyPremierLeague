-- MySQL dump 10.13  Distrib 5.7.29, for Linux (x86_64)
--
-- Host: localhost    Database: frendyBasic
-- ------------------------------------------------------
-- Server version	5.7.29-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `oid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `umobile` varchar(15) DEFAULT NULL,
  `amt` int(11) DEFAULT NULL,
  `odate` date DEFAULT NULL,
  `is_proc` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`oid`,`pid`),
  KEY `pid` (`pid`),
  KEY `umobile` (`umobile`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`pid`) REFERENCES `product` (`pid`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`umobile`) REFERENCES `user` (`umobile`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'9999999991',1000,'2020-09-27',1),(2,2,'9999999991',1000,'2020-09-27',1),(3,1,'9999999992',2000,'2020-09-27',1),(3,2,'9999999992',3500,'2020-09-27',1),(4,1,'9999999993',1000,'2020-09-27',1),(4,2,'9999999993',500,'2020-09-27',1),(5,1,'9999999991',2000,'2020-09-28',1),(6,2,'9999999991',1000,'2020-09-28',1),(7,1,'9999999992',4000,'2020-09-28',1),(8,2,'9999999992',2000,'2020-09-28',1),(9,1,'9999999993',3000,'2020-09-28',1),(9,2,'9999999993',1000,'2020-09-28',1),(10,1,'9999999991',1000,'2020-09-29',1),(10,2,'9999999991',2000,'2020-09-29',1),(11,1,'9999999992',3000,'2020-09-29',1),(12,2,'9999999992',2000,'2020-09-29',1),(13,1,'9999999993',7000,'2020-09-29',1),(13,2,'9999999993',3000,'2020-09-29',1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `pid` int(11) NOT NULL,
  `pname` text,
  `is_combo` tinyint(1) DEFAULT NULL,
  `is_hnk` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'XYZ',0,0),(2,'ABC',0,0);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `umobile` varchar(15) NOT NULL,
  `uname` varchar(100) DEFAULT NULL,
  `runs` decimal(12,2) DEFAULT NULL,
  `fours` int(11) DEFAULT NULL,
  `sixes` int(11) DEFAULT NULL,
  `combos` int(11) DEFAULT NULL,
  `hnks` int(11) DEFAULT NULL,
  PRIMARY KEY (`umobile`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('9999999991','A',90.00,1,0,0,0),('9999999992','B',193.00,1,4,0,0),('9999999993','C',169.00,0,2,0,0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userLogin`
--

DROP TABLE IF EXISTS `userLogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userLogin` (
  `gid` varchar(50) NOT NULL,
  `umobile` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userLogin`
--

LOCK TABLES `userLogin` WRITE;
/*!40000 ALTER TABLE `userLogin` DISABLE KEYS */;
/*!40000 ALTER TABLE `userLogin` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-09-27 15:25:38
