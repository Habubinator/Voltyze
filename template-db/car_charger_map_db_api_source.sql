CREATE DATABASE  IF NOT EXISTS `car_charger_map_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `car_charger_map_db`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: car_charger_map_db
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `api_source`
--

DROP TABLE IF EXISTS `api_source`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_source` (
  `api_id` smallint NOT NULL AUTO_INCREMENT,
  `link` varchar(512) NOT NULL,
  `detailed_link` varchar(512) NOT NULL,
  `last_update` bigint DEFAULT NULL,
  `next_update` bigint DEFAULT NULL,
  `update_interval_ms` bigint DEFAULT NULL,
  `comments_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`api_id`),
  UNIQUE KEY `link` (`link`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_source`
--

LOCK TABLES `api_source` WRITE;
/*!40000 ALTER TABLE `api_source` DISABLE KEYS */;
INSERT INTO `api_source` VALUES (1,'ws://91.200.2.37/api1-ws','http://91.200.2.37/api1/v3.1/get_location/{id}?language=uk&timeZone=GMT%2B0200/',1707561933890,1707648333890,86400000,'http://91.200.2.37/api1/v2.2/get_comments/{id}?limit=10&offset=0&show_ratings=true'),(2,'http://91.200.2.37/api2/chargers-all','http://91.200.2.37/api2/v1/stations/{id}',0,0,86400000,NULL),(3,'http://91.200.2.37/api3/v2/app/locations','null',1707566678457,1707653078457,86400000,NULL),(4,'http://91.200.2.37/api4/chargers-all','null',1707567182332,1707653582332,86400000,NULL),(5,'http://91.200.2.37/api7/chargers-all','http://91.200.2.37/api7/charge-box-by-pk/{id}',0,0,86400000,NULL),(6,'http://91.200.2.37/api8/chargers-all','http://91.200.2.37/api8/stations/{id}?l=uk',1707566625304,1707653025304,86400000,NULL),(7,'http://91.200.2.37/api9/chargers-all','http://91.200.2.37/api9/charger/{id}',1707562680089,1707649080089,86400000,NULL),(8,'http://91.200.2.37/api11/chargers-all?latitude=48.7697&longitude=16.95621&spanLat=12.939622&spanLng=10.117456','http://91.200.2.37/api11/location/{id}',1707562831199,1707649231199,86400000,NULL),(9,'http://91.200.2.37/api12/chargers-all','',1707566982689,1707653382689,86400000,NULL),(10,'http://91.200.2.37/api26/chargers-all','http://91.200.2.37/api26/charger/{id}',1707566810562,1707653210562,86400000,NULL);
/*!40000 ALTER TABLE `api_source` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-20 11:32:19
