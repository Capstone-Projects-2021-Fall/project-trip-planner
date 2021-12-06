CREATE DATABASE  IF NOT EXISTS `database` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `database`;
-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com    Database: database
-- ------------------------------------------------------
-- Server version	8.0.23

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `Activity`
--

DROP TABLE IF EXISTS `Activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Activity` (
  `ActivityID` int NOT NULL AUTO_INCREMENT,
  `ActivityName` varchar(45) NOT NULL,
  `Latitude` decimal(6,4) NOT NULL,
  `Longitude` decimal(7,4) NOT NULL,
  `Address` varchar(256) DEFAULT NULL COMMENT 'modified to allow things like Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Wales, UK.\n',
  PRIMARY KEY (`ActivityID`),
  UNIQUE KEY `ActivityName` (`ActivityName`,`Latitude`,`Longitude`),
  CONSTRAINT `Activity_Latitude` CHECK (((`Latitude` >= -(90)) and (`Latitude` <= 90))),
  CONSTRAINT `Activity_Longitude` CHECK (((`Longitude` >= -(180)) and (`Longitude` <= 180))),
  CONSTRAINT `Activity_Name_No_WhiteSpace` CHECK ((not((trim(`ActivityName`) like _utf8mb4''))))
) ENGINE=InnoDB AUTO_INCREMENT=216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ActivityPhotos`
--

DROP TABLE IF EXISTS `ActivityPhotos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ActivityPhotos` (
  `PhotoID` int NOT NULL AUTO_INCREMENT,
  `ItineraryItemID` int DEFAULT NULL,
  `URL` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`PhotoID`),
  KEY `FK_Photo_ItineraryItem_idx` (`ItineraryItemID`),
  CONSTRAINT `FK_Photo_ItineraryItem` FOREIGN KEY (`ItineraryItemID`) REFERENCES `ItineraryItem` (`ItineraryItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `FullItineraryData`
--

DROP TABLE IF EXISTS `FullItineraryData`;
/*!50001 DROP VIEW IF EXISTS `FullItineraryData`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `FullItineraryData` AS SELECT 
 1 AS `CreatorID`,
 1 AS `ScreenName`,
 1 AS `ItineraryID`,
 1 AS `ItineraryName`,
 1 AS `StartDate`,
 1 AS `EndDate`,
 1 AS `Description`,
 1 AS `ItineraryItemID`,
 1 AS `ActivityID`,
 1 AS `ActivityName`,
 1 AS `Latitude`,
 1 AS `Longitude`,
 1 AS `Address`,
 1 AS `StartTime`,
 1 AS `EndTime`,
 1 AS `AdditionalInformation`,
 1 AS `PhotoID`,
 1 AS `PhotoURL`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `GoogleLogin`
--

DROP TABLE IF EXISTS `GoogleLogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GoogleLogin` (
  `idGoogleLogin` int NOT NULL AUTO_INCREMENT,
  `GoogleLoginToken` varchar(45) DEFAULT NULL COMMENT 'some way to verify identity via google system. likely not a varchar.',
  PRIMARY KEY (`idGoogleLogin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Temporary Table for Google login info, not useful yet because i have no idea what the format is or whatever, but it''s in as a placeholder';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Itinerary`
--

DROP TABLE IF EXISTS `Itinerary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Itinerary` (
  `ItineraryID` int NOT NULL AUTO_INCREMENT,
  `ItineraryName` varchar(45) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `CreatorID` int NOT NULL,
  `Description` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`ItineraryID`),
  UNIQUE KEY `Unique_NoDupes` (`ItineraryName`,`StartDate`,`EndDate`,`CreatorID`),
  KEY `FK_ITINERARY_CREATOR_USER_ID_idx` (`CreatorID`),
  CONSTRAINT `FK_ITINERARY_CREATOR_USER_ID` FOREIGN KEY (`CreatorID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `EndDateGreaterThanStartDate` CHECK ((`StartDate` < `EndDate`)),
  CONSTRAINT `Itinerary_Bad_Name` CHECK ((not((trim(`ItineraryName`) like _utf8mb4''))))
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='	';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ItineraryItem`
--

DROP TABLE IF EXISTS `ItineraryItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ItineraryItem` (
  `ItineraryItemID` int NOT NULL AUTO_INCREMENT,
  `ItineraryID` int NOT NULL,
  `ActivityID` int NOT NULL,
  `StartTime` datetime NOT NULL,
  `EndTime` datetime NOT NULL,
  `AdditionalInformation` varchar(256) DEFAULT '',
  PRIMARY KEY (`ItineraryItemID`),
  UNIQUE KEY `ActionID` (`ItineraryItemID`,`ItineraryID`,`ActivityID`),
  KEY `ActivityID` (`ActivityID`),
  KEY `ItineraryItem_ibfk_1` (`ItineraryID`),
  CONSTRAINT `ItineraryItem_ibfk_1` FOREIGN KEY (`ItineraryID`) REFERENCES `Itinerary` (`ItineraryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ItineraryItem_ibfk_2` FOREIGN KEY (`ActivityID`) REFERENCES `Activity` (`ActivityID`),
  CONSTRAINT `Action_StartBeforeEnd` CHECK ((`StartTime` < `EndTime`))
) ENGINE=InnoDB AUTO_INCREMENT=344 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `Action_BEFORE_INSERT` BEFORE INSERT ON `ItineraryItem` FOR EACH ROW BEGIN
	DECLARE msg Varchar(128);
    
    IF (EXISTS(
		SELECT Q.ItineraryItemID
        FROM ItineraryItem AS Q 
		WHERE (new.StartTime between Q.StartTime AND Q.EndTime 
			OR new.EndTime between Q.StartTime AND Q.EndTime) AND new.ItineraryID = Q.ItineraryID))
	THEN 
		SET MSG = concat('Error: Times overlap', new.StartTime, new.EndTime);
		SIGNAL sqlstate '45000' SET message_text = MSG;
	ELSEIF (EXISTS(
		SELECT I.ItineraryID 
        FROM Itinerary AS I
        WHERE I.ItineraryID = new.ItineraryID AND (new.EndTime < I.StartDate OR new.StartTime < I.StartDate OR new.StartTime > I.EndDate OR new.EndTime > I.EndDate)))
	THEN 
		SET MSG = concat('Error: Not within itinerary range', new.StartTime, new.EndTime);
        SIGNAL sqlstate '45000' SET message_text = MSG;
	END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `NormalLogin`
--

DROP TABLE IF EXISTS `NormalLogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NormalLogin` (
  `UserID` int NOT NULL,
  `HashedPassword` varchar(64) NOT NULL COMMENT 'It''s not hashed. that''s a lie. fix that pls?\n\nShould be stored in encrypted format with private key (symmetric cypher or Private/Public Key, if the DB is doing the decrypting and the API is encrypting. But for now plaintext. security isn''t important anyway.\\n',
  `Email` varchar(45) NOT NULL COMMENT 'needs validation for email',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  KEY `UserID_idx` (`UserID`),
  CONSTRAINT `FK_USER_ID` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `MIN_PW_LENGTH` CHECK ((length(`HashedPassword`) >= 8))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `NormalUserView`
--

DROP TABLE IF EXISTS `NormalUserView`;
/*!50001 DROP VIEW IF EXISTS `NormalUserView`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `NormalUserView` AS SELECT 
 1 AS `UserID`,
 1 AS `ScreenName`,
 1 AS `FirstName`,
 1 AS `LastName`,
 1 AS `DateOfBirth`,
 1 AS `HashedPassword`,
 1 AS `Email`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `ScreenName` varchar(45) NOT NULL,
  `FirstName` varchar(45) DEFAULT NULL,
  `LastName` varchar(45) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `ScreenName_UNIQUE` (`ScreenName`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'database'
--

--
-- Dumping routines for database 'database'
--
/*!50003 DROP FUNCTION IF EXISTS `FN_count_overlaps` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `FN_count_overlaps`(s DATE, e DATE) RETURNS int
    DETERMINISTIC
BEGIN
DECLARE ct INT;

SELECT COUNT (Q.PlannedActivityID) INTO ct
	FROM PlannedActivity AS Q 
    WHERE StartTime BETWEEN Q.StartTime AND Q.EndTime OR EndTime BETWEEN Q.StartTime AND Q.EndTime;
RETURN ct;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetCheckConstraintBrokenBy3819` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `GetCheckConstraintBrokenBy3819`(errorMessage varchar(16381)) RETURNS varchar(128) CHARSET utf8mb4
BEGIN
	Declare returnValue varchar(128);
    -- "Check constraint 'Itinerary_Bad_Name' is violated."
	-- search from the left for this text. should be at column 1 (1 indexed).
	SET @intro = "Check constraint '";
    -- search from the right for this text. 
    set @outro = "' is violated.";

    set @len = char_length(@intro);
	-- the text in between is the column
    set @startIndex = Locate(@intro, errorMessage) + @len;
    IF (@startIndex > @len)
    THEN
		-- RETURN "valid";
		set @endText = substring_index(errorMessage, @outro, -1);
        set @len = LEAST(128, (length(errorMessage) - length(@outro) -  length(@endText) - length(@intro)));
		set returnValue = Substring(errorMessage, @startIndex, @len);
    END IF;
    -- RETURN "Invalid";
	RETURN returnValue;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetColumnNameViolating1264` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `GetColumnNameViolating1264`(errorMessage varchar(256)) RETURNS varchar(128) CHARSET utf8mb4
BEGIN
	-- Assumes all columns we create are less than 128 characters. Error message is guarenteed to therefore be < 256 total
    
	Declare returnValue varchar(128);
	-- search from the left for this text. should be at column 1 (1 indexed).
	SET @intro = "Error Code: 1264. Out of range value for column '";
    -- search from the right for this text. 
    set @outro = "'at%";
    set @len = char_length(@intro);
	-- the text in between is the column
    set @startIndex = Locate(@intro, errorMessage) + @len;
    IF (@startIndex > @len)
    THEN
		set @endIndex = substring_index(errorMessage, @outro, -1);
		set @len = LEAST(@endIndex - @startIndex, 128);
		set returnValue = Substring(errorMessage, @startIndex, @len);
    END IF;
    
	RETURN returnValue;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetUniqueKeyConstraintBrokenBy1062` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `GetUniqueKeyConstraintBrokenBy1062`(errorMessage varchar(16381)) RETURNS varchar(128) CHARSET utf8mb4
BEGIN
	-- 16381 is the largest size a utf8mb4 can be in mysql (roughly, anyway). I hate magic numbers as much as the rest of you, but i've got no choice here.
	Declare returnValue varchar(128);
	-- search from the end, because the data itself might be all full of shit like SQL injection.
    -- we can assume our constraints won't have invalid shit.
    -- last character is a single quote
    set @intro = "'for key '";
    -- set @outro = "'";
    set @len = char_length(@intro);
	-- the text in between is the column
    set @startIndex = substring_index(errorMessage, @intro, -1);
    IF (@startIndex > @len)
    THEN
		set @count = LEAST(char_length(errorMessage) - startLength - 1, 128);
		set returnValue = Substring(errorMessage, @startIndex, @count);
    END IF;
    
	RETURN returnValue;
RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CreateItineraryItemWithActivity` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `CreateItineraryItemWithActivity`(IN title VARCHAR(45), IN lat decimal(6,4), IN lon decimal(7,4), 
IN addr varchar(256), IN ItineraryIdentifier int, IN startTime DateTime, IN endTime DateTime, IN descript varchar(256),
out errorCode int, out errorMessage varchar(128))
BEGIN
	-- About: adds an itinerary item to the database. we retrieve an activity with the same data if one exists, 
    -- or insert one if not. then we use that id when adding the itinerary item.
    -- Error Codes:
    -- NOTE: 2-4 are inherited from Activity. There is no error 1, as error 1 is actually legal here.
        -- 2: Invalid coordinate - latitude.
        -- 3: Invalid coordinate - longitude.
        -- 4: Invalid activity name/title. It must not be whitespace, empty, or null.
	-- The remainder deal with itinerary items.
        -- 5: Start occurs after end.
        -- 6: start or end Overlaps with items already on the itinerary.
        -- 7: Invalid ItineraryID. This is an API error.
    START TRANSACTION;
	SET errorCode = 0;
	set errorMessage = '';
        
	CALL CreateStandaloneActivity(title, lat, lon, addr, errorCode, errorMessage);
	-- a duplicate is ok, we'll simply reference it instead of adding. 
	IF (errorCode = 1)
	THEN 
		set errorCode = 0;
	END IF;
	
	IF (errorCode = 0)
	THEN
	BEGIN
		DECLARE exit handler for SQLEXCEPTION
		BEGIN
			GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
			-- ItineraryID invalid
			IF (@errno = 1452)
			THEN
				SET errorCode = 7;
				SET errorMessage = "ItineraryID provided is invalid. this is an API error.";
			-- Check constraint. 
			ELSEIF (@errno = 3819 OR @errno = 1644)
			THEN 
				Set errorCode = 5;
				SET errorMessage = "Start Time occurs after End Time";
			-- Before Trigger Error.
			ELSEIF (@errno = 45000)
			THEN 
				Set errorCode = 6;
				SET ErrorMessage = "This item overlaps items already on the itinerary";
			-- Unhandled error.
			ELSE 
				SET errorCode = @errNo;
				SET errorMessage = @text;
			END IF;
		END;
            
		SELECT A.ActivityID INTO @activityID FROM Activity AS A
		where A.Latitude = lat AND A.Longitude = lon AND A.ActivityName = title LIMIT 1;
            
		Insert Into `ItineraryItem` (ItineraryID, ActivityID, StartTime, EndTime, AdditionalInformation)
		VALUE (itineraryIdentifier, @activityID, startTime, endTime, descript);
	END;
	END IF;
    
    IF (errorCode != 0)
    THEN ROLLBACK;
    ELSE COMMIT;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CreateOrEditItinerary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `CreateOrEditItinerary`(IN userID int, INOUT itineraryID int, IN itineraryTitle varchar(45), IN itineraryStart DATE, 
	IN itineraryEnd DATE, IN descript varchar(256), IN activityData JSON, OUT errorCode int, OUT errorMessage varchar(128))
BEGIN
-- Hoo boy, this is a huge clusterfuck. This is now designed as a pure edit. if itinerary id is null or one does not exist with that number,
    -- it will fail outright.
    
	/* Error Codes:
     * 1: Invalid User: UserID is null or not part of database.
     * 2: Forbidden. The userID is not the same as the creator id
     * 3: Not Unique: This user already has an itinerary with this name, starting and ending at this point.
	 * 4: Invalid Itinerary Name. It's null or whitespace
     * 5: Invalid Start/End Days - the start is after the end.
     */
	DECLARE itinerID int;
    Start Transaction;
	
    SET errorCode = 0;
    SET errorMessage = '';
    
	SELECT `I`.`ItineraryID`, `I`.`CreatorID` INTO itinerID, @creator 
	FROM `Itinerary` `I` WHERE `I`.`ItineraryID` = itineraryID; 
    
    # error checking. First case: user not in database. 
	IF (userID is null OR NOT EXISTS(Select `U`.`UserID` FROM `User` `U` WHERE `U`.`UserID` = userID))
    THEN 
		SET errorCode = 1;
        SET errorMessage = "The user is invalid or does not exist";
        SET itineraryID = null;
	ELSEIF (NOT(itinerID is null) AND NOT (@creator is null) AND @creator != userID)
    THEN 
		SET errorCode = 2;
        SET errorMessage = "The user does not have permission to edit this itinerary";
        SET itineraryID = null;
	# if here, the user exists and has permission to edit this itinerary (if it exists) or create one (if it does not). These use the same error logic so
    # a nested set of ifs is more efficient than two ElseIfs here.
	ELSE
		# set up the error checking first
		BEGIN #begin insert or update itinerary.
			DECLARE exit handler for SQLEXCEPTION
			BEGIN
				GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
				-- Duplicate Key fails.
				IF (@errno = 1062)
				THEN 
                
					SET errorCode = 3;
					SET errorMessage = "The user already has an itinerary with this name, start date, and end date.";
                    SET itineraryID = null;
				-- Generic check constraint fails. We have multiple check constraints that can fail so we need to parse this.
				ELSEIF (@errno = 3819)
				THEN 
					SET @src = GetCheckConstraintBrokenBy3819(@text);
                    -- Itinerary Name is bad.
					IF (@src = 'Itinerary_Bad_Name')
					THEN 
						SET errorCode = 4;
						SET errorMessage = 'Itinerary must have a valid name';
                        SET itineraryID = null;
					-- Times are bad.
					ELSEIF (@src = 'EndDateGreaterThanStartDate')
					THEN
						SET errorCode = 5;
						SET errorMessage = CONCAT("StartDate '", firstDay, "', is after the EndDate '", lastDay, "'");
                        SET itineraryID = null;
					-- Unknown Check constraint.
					ELSE 
						SET errorCode = @errno;
						SET errorMessage = @text;
                        SET itineraryID = null;
					END IF; #end 3819 check
				-- Fallback. uncaught error.
				ELSE
					SET errorCode = @errno;
					SET errorMessage = @text;
                    SET itineraryID = null;
				END IF; #end error checking if
			END; #end error checking block
            
            #not in database, but we have an id. This is an insert with id.
            IF (itinerID is null && NOT(itineraryID is null)) 
            THEN
				INSERT INTO `database`.`Itinerary` (`ItineraryID`, `ItineraryName`, `StartDate`, `EndDate`, `CreatorID`, `Description`)
				VALUE (itineraryID, itineraryTitle, itineraryStart, itineraryEnd, userID, descript);
                SET itinerID = itineraryID;
			#not in the database, id is null. This is an insert (use autoincrement id value)
			ELSEIF (itinerID is null)
			THEN 
				INSERT INTO `database`.`Itinerary` (`ItineraryName`, `StartDate`, `EndDate`, `CreatorID`, `Description`)
				VALUE (itineraryTitle, itineraryStart, itineraryEnd, userID, descript);
                SELECT `I`.`ItineraryID` INTO itinerID FROM `Itinerary` `I` WHERE `I`.`ItineraryName` = itineraryTitle AND 
                `I`.`StartDate` = itineraryStart AND `I`.`EndDate` = itineraryEnd AND `I`.`CreatorID` = userID;
			#in the database. This is an update
			ELSE 
				UPDATE `database`.`Itinerary` SET `ItineraryName` = itineraryTitle, `StartDate` = itineraryStart,
					`EndDate` = itineraryEnd, `Description` = descript WHERE `Itinerary`.`ItineraryID` = itinerID;
            END IF;
		END; #end insert or update itinerary block
	END IF; #end select/insert/update if statement. 
    # at this point, we should have a valid itinerID or an errorCode
	
    IF (errorCode = 0)
    THEN
        -- now dump all the json into a temporary table. if the activity already exists, retrieve the id, otherwise leave it null.
		DROP TEMPORARY TABLE IF EXISTS UI_Data;
        CREATE TEMPORARY TABLE UI_Data 
		SELECT itinerID AS `ItineraryID`, A.`ActivityID`, RAW.`ActivityName`, RAW.`Latitude`, RAW.`Longitude`, RAW.`Address`, 
			RAW.`StartTime`, RAW.`EndTime`, RAW.`AdditionalInformation`, RAW.`Photo`
		FROM JSON_TABLE(
			activityData, '$[*]' COLUMNS(
			`ActivityName` varchar(45) PATH "$.ActivityName", 
			`Latitude` decimal(6,4) PATH "$.Latitude",
			`Longitude` decimal(7,4) PATH "$.Longitude",
			`Address` varchar(256) PATH "$.Address",
			`StartTime` DATETIME PATH "$.StartTime",
			`EndTime` DATETIME PATH "$.EndTime",
			`AdditionalInformation` varchar(256) PATH "$.AdditionalInformation",
            `Photo` VARCHAR(1024) PATH "$.Photo")) AS RAW
        
		LEFT JOIN Activity AS A ON RAW.`ActivityName` = A.`ActivityName` 
			AND RAW.`Latitude` = A.`Latitude` AND RAW.`Longitude` = A.`Longitude`;
		
        DROP TEMPORARY TABLE IF EXISTS UI_Data_2;
        DROP TEMPORARY TABLE IF EXISTS UI_Data_3;
        DROP TEMPORARY TABLE IF EXISTS UI_Data_4;
        CREATE TEMPORARY TABLE UI_Data_2 SELECT * FROM UI_Data;
        CREATE TEMPORARY TABLE UI_Data_3 SELECT * FROM UI_Data;
        CREATE TEMPORARY TABLE UI_Data_4 SELECT * FROM UI_Data;
        
		-- now, insert all the ones we couldn't match. distinct prevents us from trying to add a new activity multiple times
		INSERT IGNORE INTO Activity (`ActivityName`, `Latitude`, `Longitude`, `Address`)
		SELECT DISTINCT U.`ActivityName`, U.`Latitude`, U.`Longitude`, U.`Address` 
		FROM UI_Data AS U WHERE U.`ActivityID` IS NULL;
        
        DELETE `I` FROM `database`.`ItineraryItem` AS `I` WHERE `I`.`ItineraryID` = itinerID;
        
        -- now, another doozy. we're gonna add all the itinerary items, but we may not have the id. SO, a union
        INSERT IGNORE INTO ItineraryItem(ItineraryID, ActivityID, StartTime, EndTime, AdditionalInformation)
        -- the first select gets the items where the Activity was known when we made that temp table.
        SELECT distinct itinerID, U2.ActivityID, U2.`StartTime`, U2.`EndTime`, U2.AdditionalInformation FROM UI_Data_2 AS U2 WHERE U2.ActivityID IS NOT NULL
        UNION 
        -- the second select is the ones we just added. we can get the ID via a join and all the equal checks. 
        SELECT distinct itinerID, A2.`ActivityID`, U3.`StartTime`, U3.`EndTime`, U3.`AdditionalInformation` FROM UI_Data_3 AS U3 
        INNER JOIN Activity AS A2 ON U3.`ActivityName` = A2.`ActivityName` 
			AND U3.`Latitude` = A2.`Latitude` AND U3.`Longitude` = A2.`Longitude`
			WHERE U3.ActivityID IS NULL;
        
        INSERT IGNORE INTO `database`.`ActivityPhotos` (`ItineraryItemID`, `URL`)
			SELECT DISTINCT `Q`.`ItineraryItemID`, `U4`.`Photo` FROM UI_Data_4 AS `U4` INNER JOIN ItineraryItem `Q` ON 
            (`U4`.`ItineraryID` = `Q`.`ItineraryID` AND `U4`.`StartTime` = `Q`.`StartTime` AND `U4`.`EndTime` = `Q`.`EndTime`)
            WHERE `Q`.`ItineraryID` = itinerID AND `U4`.`ItineraryID` = itinerID AND `U4`.`Photo` IS NOT NULL;
    END IF;
    
    IF (errorCode != 0)
    THEN 
		ROLLBACK;
    ELSE 
		COMMIT;
        SET itineraryID = itinerID;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CreateStandaloneActivity` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `CreateStandaloneActivity`(IN title VARCHAR(45), IN lat decimal(6,4), IN lon decimal(7,4), IN addr varchar(256),
out errorCode int, out errorMessage varchar(128))
BEGIN
	-- Error Codes:
		-- 1: Duplicate - theres already an activity with the given title, lat, and long in the database
        -- 2: Invalid coordinate - latitude.
        -- 3: Invalid coordinate - longitude.
        -- 4: Invalid activity name/title. It must not be whitespace, empty, or null.
    -- Note that address is not validated in any way. we use coordinates, and expect the google api to give us a valid address.
    -- It's essentially a hint so you don't need to go to the Google API all the time.
    DECLARE exit handler for SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        -- Duplicate Unqiue key
		IF (@errno = 1062)
        THEN
			SET errorCode = 1;
            SET errorMessage = "An activity with this name and latitude/longitude coordinate pair already exists";
        -- lat or long fails from out or range error
        ELSEIF (@errno = 1264)
        THEN 
			SET @src = GetColumnNameViolating1264(@text);
            IF (@src LIKE `Latitude`)
            THEN 
				SET errorCode = 2;
                Set errorMessage = "Latitude is out of range";
            ELSEIF (@src LIKE `Longitude`)
            THEN
				SET errorCode = 3;
                Set errorMessage = "Longitude is out of range";
            -- something else out of range. unexpected.
            ELSE
				SET errorCode = @errNo;
				SET errorMessage = @text;
            END IF;
        -- Check constraint fails - in numeric range but out of our range
        ELSEIF (@errno = 3819)
		THEN 
			SET @src = GetCheckConstraintBrokenBy3819(@text);
             IF (@src LIKE `Activity_Latitude`)
            THEN 
				SET errorCode = 2;
                Set errorMessage = "Latitude is out of range";
            ELSEIF (@src LIKE `Activity_Longitude`)
            THEN
				SET errorCode = 3;
                Set errorMessage = "Longitude is out of range";
			ELSEIF (@src LIKE `Activity_Name_No_WhiteSpace`)
            THEN
				SET errorCode = 4;
                Set errorMessage = "Activity name must be a valid string";
            -- something else broke a constraint. unexpected.
            ELSE
				SET errorCode = @errNo;
				SET errorMessage = @text;
            END IF;
		
		-- Unhandled error.
		ELSE 
			SET errorCode = @errNo;
			SET errorMessage = @text;
		END IF;
	END;
    
    SET errorCode = 0;
    SET errorMessage = '';
	
    INSERT INTO `database`.`Activity` (`ActivityName`, `Latitude`, `Longitude`, `Address`) 
    VALUES (title, lat, lon, addr);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CreateUserNormalLogin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `CreateUserNormalLogin`(screen varchar(45), IN fName varchar(45), IN lName varchar(45), IN DOB DATE, IN emailAddress varchar(45),
IN pass varchar(64), out errorCode int, out errorMessage varchar(128))
BEGIN
	/* ERROR CODES
     * 1: Email already taken.
     * 2: Screen name already taken.
     * 3: Password invalid (too short, needs to be 8+ characters, maxed at 64)
     * 4: Email invalid format NOT IMPLEMENTED YET!
     */
    SET errorCode = 0;
    SET errorMessage = '';
    START TRANSACTION;
    
    If (Exists(Select N.Email From NormalLogin N WHERE N.Email = emailAddress))
    THEN 
		SET errorCode = 1;
        SET errorMessage = CONCAT("A user with the email '", emailAddress, "' is already registered.");
	ELSEIF (Exists(Select U.ScreenName FROM `database`.`User` U WHERE U.ScreenName = screen))
	THEN
		SET errorCode = 2;
		SET errorMessage = CONCAT("The screen name '", screen, "' is already taken.");
	ELSE 
		INSERT INTO User (ScreenName, FirstName, LastName, DateOfBirth)
		VALUE(screen, fName, lName, DOB);
	END IF;
    
    IF (errorCode = 0)
    THEN
		BEGIN
			DECLARE exit handler for SQLEXCEPTION
			BEGIN
				GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
                -- Check constraint fails.
                IF (@errno = 3819)
                THEN 
					SET errorCode = 3;
                    SET errorMessage = CONCAT("Password, '", pass, "' is invalid");
				-- NOTE: email constraint would require parsing the error message to see which constraint failed.
                
                -- User ID is invalid. This means this stored proc is broken.
                ELSEIF (@errno = 1452)
                THEN
					SET errorCode = @errNo;
                    SET errorMessage = "User ID does not exist, the stored proc is broken somehow";
				-- Unhandled error.
				ELSE 
					SET errorCode = @errNo;
                    SET errorMessage = @text;
				END IF;
                
                ROLLBACK;
			END;
            
			SELECT K.UserID INTO @temp FROM User as K WHERE K.ScreenName = screen LIMIT 1;
    
			Insert Into NormalLogin (UserID, Email, HashedPassword)
			VALUE (@temp, emailAddress, pass);
		END;
	END IF;
    
    IF (errorCode = 0)
    THEN 
		COMMIT;
	ELSE
		ROLLBACK;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `DeleteItinerary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `DeleteItinerary`(IN userID int, IN itineraryID int, out errorCode int, out errorMessage varchar(128))
BEGIN
	SET errorCode = 0;
    SET errorMessage = "";
    
    SELECT `I`.`ItineraryID`, `I`.`CreatorID` INTO @itinerID, @creator 
	FROM `Itinerary` `I` WHERE `I`.`ItineraryID` = itineraryID;
    
    
    IF (@itinerID is null)
    THEN 
		SET errorCode = 1;
        SET errorMessage = "No such itinerary exists";
	ELSEIF (@creator != userID)
    THEN
		SET errorCode = 2;
        SET errorMessage = "User does not have permission to delete this itinerary";
    ELSE 
		DELETE FROM `database`.`Itinerary` `I` WHERE `I`.`ItineraryID` = @itinerID;
    END IF;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `EditItineraryBasic` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `EditItineraryBasic`(In itineraryID int, IN activityData JSON, OUT errorCode int, OUT errorMessage varchar(128))
BEGIN
	-- Hoo boy, this is a huge clusterfuck.
    
    # This is a stripped-down version of what we should use but for now that's all we need.
    
	/* Error Codes:
    -- Note: From The create itinerary.
     * 1: Not Unique: This user already has an itinerary with this name, starting and ending at this point.
     * 2: Invalid Start/End Days - the start is after the end.
     * 3: Invalid Creator ID. This is an error caused by the API, and should never happen.
     * 4: Invalid Itinerary Name. It's null or whitespace
     */
	DECLARE itinerID int;
    Start Transaction;
	
    SET errorCode = 0;
    SET errorMessage = '';
    
    SET itinerID = itineraryID; 
    IF (errorCode = 0)
    THEN 
        -- now dump all the json into a temporary table. if the activity already exists, retrieve the id, otherwise leave it null.
		DROP TEMPORARY TABLE IF EXISTS UI_Data;
        CREATE TEMPORARY TABLE UI_Data 
		SELECT A.`ActivityID`, RAW.`ActivityName`, RAW.`Latitude`, RAW.`Longitude`, RAW.`Address`, 
			RAW.`StartTime`, RAW.`EndTime`, RAW.`AdditionalInformation`, RAW.`Photo`
		FROM JSON_TABLE(
			activityData, '$[*]' COLUMNS(
			`ActivityName` varchar(45) PATH "$.ActivityName", 
			`Latitude` decimal(6,4) PATH "$.Latitude",
			`Longitude` decimal(7,4) PATH "$.Longitude",
			`Address` varchar(256) PATH "$.Address",
			`StartTime` DATETIME PATH "$.StartTime",
			`EndTime` DATETIME PATH "$.EndTime",
			`AdditionalInformation` varchar(256) PATH "$.AdditionalInformation",
            `Photo` VARCHAR(1024) PATH "$.Photo")) AS RAW
        
		LEFT JOIN Activity AS A ON RAW.`ActivityName` = A.`ActivityName` 
			AND RAW.`Latitude` = A.`Latitude` AND RAW.`Longitude` = A.`Longitude`;
		
        DROP TEMPORARY TABLE IF EXISTS UI_Data_2;
        DROP TEMPORARY TABLE IF EXISTS UI_Data_3;
        DROP TEMPORARY TABLE IF EXISTS UI_Data_4;
        CREATE TEMPORARY TABLE UI_Data_2 SELECT * FROM UI_Data;
        CREATE TEMPORARY TABLE UI_Data_3 SELECT * FROM UI_Data;
        CREATE TEMPORARY TABLE UI_Data_4 SELECT * FROM UI_Data;
        
		-- now, insert all the ones we couldn't match. distinct prevents us from trying to add a new activity multiple times
		INSERT INTO Activity (`ActivityName`, `Latitude`, `Longitude`, `Address`)
		SELECT DISTINCT U.`ActivityName`, U.`Latitude`, U.`Longitude`, U.`Address` 
		FROM UI_Data AS U WHERE U.`ActivityID` IS NULL;
        
        DELETE `I` FROM `database`.`ItineraryItem` AS `I` WHERE `I`.`ItineraryID` = itinerID;
        
        -- now, another doozy. we're gonna add all the itinerary items, but we may not have the id. SO, a union
        INSERT INTO ItineraryItem(ItineraryID, ActivityID, StartTime, EndTime, AdditionalInformation)
        -- the first select gets the items where the Activity was known when we made that temp table.
        SELECT distinct itinerID, U3.ActivityID, U3.`StartTime`, U3.`EndTime`, U3.AdditionalInformation FROM UI_Data_2 AS U3 WHERE U3.ActivityID IS NOT NULL
        UNION 
        -- the second select is the ones we just added. we can get the ID via a join and all the equal checks. 
        SELECT distinct itinerID, A2.`ActivityID`, U2.`StartTime`, U2.`EndTime`, U2.AdditionalInformation FROM UI_Data_3 AS U2 
        INNER JOIN Activity AS A2 ON U2.`ActivityName` = A2.`ActivityName` 
			AND U2.`Latitude` = A2.`Latitude` AND U2.`Longitude` = A2.`Longitude`
			WHERE U2.ActivityID IS NULL;
        
        INSERT INTO `database`.`ActivityPhotos` (`ItineraryItemID`, `URL`)
			SELECT DISTINCT `Q`.`ItineraryItemID`, `U4`.`Photo` FROM UI_Data_4 AS U4 INNER JOIN ItineraryItem Q ON 
            (`U4`.`StartTime` = `Q`.`StartTime` AND `U4`.`EndTime` = `Q`.`EndTime`)
            WHERE Q.ItineraryID = itinerID AND `U4`.`Photo` IS NOT NULL;
    END IF;
    
    IF (errorCode != 0)
    THEN ROLLBACK;
    ELSE COMMIT;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindActivitiesWithinACertainDistanceOf` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindActivitiesWithinACertainDistanceOf`(IN LatCoordinate Decimal(6,4), IN LongCoordinate Decimal(7,4), IN MaxDistanceAwayInMiles DOUBLE)
BEGIN
	SELECT
		`A`.`ActivityID` AS `ActivityID`,
        `A`.`ActivityName` AS `ActivityName`,
		`A`.`Latitude` AS `Latitude`,
		`A`.`Longitude` AS `Longitude`,
        `A`.`Address` AS `Address`,
        -- Taken from stack overflow, which in turn took it from the Google Maps API. Distance formula, coordingates to miles.
        (
			3959 * acos (
			cos ( radians(LatCoordinate) )
			* cos( radians(  `A`.`ActivityLatitudeCoordinate` ) )
			* cos( radians( `A`.`ActivityLongitudeCoordinate` ) - radians(LongCoordinate) )
			+ sin ( radians(LatCoordinate) )
			* sin( radians( `A`.`ActivityLatitudeCoordinate`) )
		)) AS `DistanceAway`
    FROM `Activity`
	Having  `DistanceAway` <= MaxDistanceAwayInMiles
    ORDER BY `DistanceAway` ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindActivitiesWithNamesLike` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindActivitiesWithNamesLike`(searchTitle varchar(45))
BEGIN
	SELECT 
		`A`.`ActivityID` AS `ActivityID`,
		`A`.`ActivityName` AS `ActivityName`,
		`A`.`Latitude` AS `Latitude`,
		`A`.`Longitude` AS `Longitude`,
        `A`.`Address` AS `Address`,
        `Q`.`ItineraryID` AS `ItineraryID`,
		`I`.`ItineraryName` AS `ItineraryName`,
        `I`.`StartDate` AS `StartDate`,
        `I`.`EndDate` AS `EndDate`,
		`I`.`CreatorID` AS `CreatorID`,
        (BINARY `ActivityName` LIKE searchTitle) AS IsExactMatch
        FROM 
			Activity AS `A` 
				INNER JOIN
			`ItineraryItem` AS `Q` 
            ON `Q`.`ActivityID` = `A`.`ActivityID` 
				INNER JOIN 
			`Itinerary` AS `I` 
			ON `I`.`ItineraryID` = `Q`.`ItineraryID`
        WHERE `A`.`ActivityName` LIKE CONCAT("%", searchTitle, "%")
        ORDER BY IsExactMatch DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindActivitiesWithNamesLikeBasic` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindActivitiesWithNamesLikeBasic`(searchTitle varchar(45))
BEGIN
	SELECT 
		`A`.`ActivityID` AS `ActivityID`,
		`A`.`ActivityName` AS `ActivityName`,
		`A`.`Latitude` AS `Latitude`,
		`A`.`Longitude` AS `Longitude`,
        `A`.`Address` AS `Address`,
        `Q`.`ItineraryID` AS `ItineraryID`,
		`I`.`ItineraryName` AS `ItineraryName`,
        `I`.`StartDate` AS `StartDate`,
        `I`.`EndDate` AS `EndDate`,
		`I`.`CreatorID` AS `CreatorID`
        FROM 
			Activity AS `A` 
				INNER JOIN
			`ItineraryItem` AS `Q` 
            ON `Q`.`ActivityID` = `A`.`ActivityID` 
				INNER JOIN 
			`Itinerary` AS `I` 
			ON `I`.`ItineraryID` = `Q`.`ItineraryID`
        WHERE searchTitle = `A`.`ActivityName`;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindItinerariesAdvanced` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindItinerariesAdvanced`(IN ItinerarySearchStr varchar(45), IN ActivitySearchStr varchar(45), IN LatCoordinate Decimal(6,4), 
IN LongCoordinate Decimal(7,4), IN MaxDistanceAwayInMiles DOUBLE)
BEGIN
	SET @coordsValid = LatCoordinate IS NOT null AND LatCoordinate >= -90 AND LatCoordinate <= 90 AND 
		LongCoordinate IS NOT null AND LongCoordinate >= -180 AND LongCoordinate <= 180 AND
        MaxDistanceAwayInMiles IS NOT null AND MaxDistanceAwayInMiles >= 0;
        
	SET @activityValid = ActivitySearchStr IS NOT NULL AND ActivitySearchStr != "";
    SET @itineraryValid = ItinerarySearchStr IS NOT NULL AND ItinerarySearchStr != "";
    
    #now that we know if they are null or empty, make sure they are not null. concat with null may break, but empty with null will not.
    IF (ItinerarySearchStr is null)
    THEN 
		SET ItinerarySearchStr = "";
    END IF;
    
    IF (ActivitySearchStr is null)
    THEN 
		SET ActivitySearchStr = "";
    END IF;
    #concat ('%', '', '%') => '%%'. LIKE '%%' matches everything. so this won't affect our searches.

    #ok, now our options. 
    #Option 1: nothing provided. We could return everything or nothing. i'm choosing nothing.
    IF (NOT @coordsValid AND NOT @activityValid AND NOT @itineraryValid)
    THEN 
		SELECT 1 FROM DUAL WHERE FALSE;
	#option 2: itinerary name only. The easy search. We could just combine this with the next search, but this is a little more efficient because 
    #we don't need to join the itinerary item and activity tables into our result set before selecting the columns. 
	ELSEIF (NOT @coordsValid AND NOT @activityValid)
    THEN
		SELECT 
			`I`.`ItineraryID` AS `ItineraryID`,
			`I`.`ItineraryName` AS `ItineraryName`,
			`I`.`StartDate` AS `StartDate`,
			`I`.`EndDate` AS `EndDate`,
			`I`.`CreatorID` AS `CreatorID`,
			`U`.`ScreenName` AS `CreatorName`,
            null AS `DistanceAway`
        FROM 
			`Itinerary` AS `I` INNER JOIN `User` AS `U` ON (`I`.`CreatorID` = `U`.`UserID`)
        WHERE `I`.`ItineraryName` LIKE CONCAT("%", ItinerarySearchStr, "%");
	#Option 3: activity + itinerary search. itinerary may be empty, but this won't change our search.
	ELSEIF (NOT @coordsValid)
    THEN
		# if an itinerary item has two or more activities that match the search string, it will show up twice. DISTINCT handles this.
		SELECT DISTINCT
			`I`.`ItineraryID` AS `ItineraryID`,
			`I`.`ItineraryName` AS `ItineraryName`,
			`I`.`StartDate` AS `StartDate`,
			`I`.`EndDate` AS `EndDate`,
			`I`.`CreatorID` AS `CreatorID`,
			`U`.`ScreenName` AS `CreatorName`,
            null AS `DistanceAway`
        FROM 
			`Itinerary` AS `I` INNER JOIN `User` AS `U` ON (`I`.`CreatorID` = `U`.`UserID`)
            INNER JOIN (`ItineraryItem` AS `Q` INNER JOIN `Activity` AS `A` ON (`Q`.`ActivityID` = `A`.`ActivityID`)) 
            ON (`I`.`ItineraryID` = `Q`.`ItineraryID`)
			WHERE `A`.`ActivityName` LIKE CONCAT("%", ActivitySearchStr, "%") AND `I`.`ItineraryName` LIKE CONCAT("%", ItinerarySearchStr, "%");
    #the big kahuna. Pull everything. note the activity and itinerary searches can both be empty, this will still work.
    ELSE
		SELECT DISTINCT
			`I`.`ItineraryID` AS `ItineraryID`,
			`I`.`ItineraryName` AS `ItineraryName`,
			`I`.`StartDate` AS `StartDate`,
			`I`.`EndDate` AS `EndDate`,
			`I`.`CreatorID` AS `CreatorID`,
			`U`.`ScreenName` AS `CreatorName`,
			(
				3959 * acos (
				cos ( radians(LatCoordinate) )
				* cos( radians(  `A`.`Latitude` ) )
				* cos( radians( `A`.`Longitude` ) - radians(LongCoordinate) )
				+ sin ( radians(LatCoordinate) )
				* sin( radians( `A`.`Latitude`) )
			)) AS `DistanceAway`
		FROM 
			`Itinerary` AS `I` INNER JOIN `User` AS `U` ON (`I`.`CreatorID` = `U`.`UserID`)
            INNER JOIN (`ItineraryItem` AS `Q` INNER JOIN `Activity` AS `A` ON (`Q`.`ActivityID` = `A`.`ActivityID`)) 
            ON (`I`.`ItineraryID` = `Q`.`ItineraryID`)
		WHERE `A`.`ActivityName` LIKE CONCAT("%", ActivitySearchStr, "%") AND `I`.`ItineraryName` LIKE CONCAT("%", ItinerarySearchStr, "%")
        HAVING `DistanceAway` <= MaxDistanceAwayInMiles 
		ORDER BY `DistanceAway` ASC;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindItinerariesWithinDistanceOf` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindItinerariesWithinDistanceOf`(IN LatCoordinate Decimal(6,4), IN LongCoordinate Decimal(7,4), IN MaxDistanceAwayInMiles DOUBLE)
BEGIN
	SELECT
		`I`.`ItineraryID` AS `ItineraryID`,
		`I`.`ItineraryName` AS `ItineraryName`,
		`I`.`StartDate` AS `StartDate`,
		`I`.`EndDate` AS `EndDate`,
		`A`.`ActivityID` AS `ActivityID`,
        `A`.`ActivityName` AS `ActivityName`,
		`A`.`Latitude` AS `Latitude`,
		`A`.`Longitude` AS `Longitude`,
        `A`.`Address` AS `Address`,
		`Q`.`StartTime` AS `StartTime`,
		`Q`.`EndTime` AS `EndTime`,
        `Q`.`AdditionalInformation` AS `AdditionalInformation`,
        -- Taken from stack overflow, which in turn took it from the Google Maps API. Distance formula, coordingates to miles.
        (
			3959 * acos (
			cos ( radians(LatCoordinate) )
			* cos( radians(  `A`.`Latitude` ) )
			* cos( radians( `A`.`Longitude` ) - radians(LongCoordinate) )
			+ sin ( radians(LatCoordinate) )
			* sin( radians( `A`.`Latitude`) )
		)) AS `DistanceAway`
    FROM
        ((`Itinerary` `I`
        INNER JOIN `ItineraryItem` `Q` ON ((`I`.`ItineraryID` = `Q`.`ItineraryID`)))
        INNER JOIN `Activity` `A` ON ((`Q`.`ActivityID` = `A`.`ActivityID`)))
	 Having 
		`DistanceAway` <= MaxDistanceAwayInMiles
		;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindItinerariesWithNamesLike` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindItinerariesWithNamesLike`(searchTitle varchar(45))
BEGIN
	SELECT 
		`I`.`ItineraryID` AS `ItineraryID`,
		`I`.`ItineraryName` AS `ItineraryName`,
		`I`.`StartDate` AS `StartDate`,
		`I`.`EndDate` AS `EndDate`,
		`I`.`CreatorID` AS `CreatorID`,
        `U`.`ScreenName` AS `CreatorName`,
        (BINARY `I`.`ItineraryName` LIKE searchTitle) AS IsExactMatch
        FROM 
			`Itinerary` AS `I` INNER JOIN `User` AS `U` ON (`I`.`CreatorID` = `U`.`UserID`)
        WHERE `I`.`ItineraryName` LIKE CONCAT("%", searchTitle, "%")
        ORDER BY IsExactMatch DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FindUsersWithNameLike` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `FindUsersWithNameLike`(IN screen VARCHAR(45))
BEGIN
	SELECT  `U`.`UserID`, `U`.`ScreenName`, `U`.`FirstName`, `U`.`LastName`, `U`.`DateOfBirth`, 
    (BINARY `ScreenName` LIKE screen) AS IsExactMatch
    FROM `User` AS `U` WHERE `ScreenName` LIKE CONCAT('%', screen, '%')
    ORDER BY IsExactMatch DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RetrieveActivitiesForGivenItinerary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `RetrieveActivitiesForGivenItinerary`(IN ItineraryIdentifier int, out errorCode int, out errorMessage varchar(128))
BEGIN
	/* Error Codes:
     * 1: Invalid Itinerary ID. This is an API error. As of this writing, this will never occur.
     */
	DECLARE exit handler for SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		-- Itinerary ID is invalid. This means the API is broken.
		IF (@errno = 1452)
		THEN
			SET errorCode = 1;
			SET errorMessage = "Itinerary ID does not exist, the API is broken somehow";
		-- Unhandled error.
		ELSE 
			SET errorCode = @errNo;
			SET errorMessage = @text;
		END IF;
	END;
    
    SET errorCode = 0;
    Set errorMessage = '';
    
	SELECT 
		`A`.`ActivityID` AS `ActivityID`,
        `A`.`ActivityName` AS `ActivityName`,
        `A`.`Latitude` AS `Latitude`,
		`A`.`Longitude` AS `Longitude`,
        `A`.`Address` AS `Address`,
		`Q`.`StartTime` AS `StartTime`,
		`Q`.`EndTime` AS `EndTime`,
        `Q`.`AdditionalInformation` AS `AdditionalInformation`
    FROM
		`ItineraryItem` AS `Q` INNER JOIN `Activity` AS `A` ON `Q`.`ActivityID` = `A`.`ActivityID`
	WHERE Q.ItineraryID = ItineraryIdentifier;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RetrieveAllItinerariesForUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `RetrieveAllItinerariesForUser`(IN UserID int, OUT errorCode int, out errorMessage varchar(128))
BEGIN
	/* Retrieves just the itinerary base information (no activities) for the current user. this is likely going to be used over the other one.
     * 
     * Error Codes:
     * 1: Invalid User ID. This is an API error.
     */
	DECLARE exit handler for SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		-- USER ID is invalid. This means the API is broken. As far as i can tell, as of this writing this will never proc.
		IF (@errno = 1452)
		THEN
			SET errorCode = 1;
			SET errorMessage = "User ID does not exist, the API is broken somehow";
		-- Unhandled error.
		ELSE 
			SET errorCode = @errNo;
			SET errorMessage = @text;
		END IF;
	END;
    
    SET errorCode = 0;
    Set errorMessage = '';
	
    SELECT 
		`I`.`ItineraryID` AS `ItineraryID`,
        `I`.`ItineraryName` AS `ItineraryName`,
        `I`.`StartDate` AS `StartDate`,
        `I`.`EndDate` AS `EndDate`
    FROM
        `Itinerary` AS `I`
	WHERE I.CreatorID = UserID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RetrieverUserInfoAndItineraries` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `RetrieverUserInfoAndItineraries`(IN UserID int, OUT errorCode int, out errorMessage varchar(128))
BEGIN
	/* Retrieves just the itinerary base information (no activities) for the current user, along with all the information about the user
     * 
     * Error Codes:
     * 1: Invalid User ID. This is an API error.
     */
	DECLARE exit handler for SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		-- USER ID is invalid. This means the API is broken. As far as i can tell, as of this writing this will never proc.
		IF (@errno = 1452)
		THEN
			SET errorCode = 1;
			SET errorMessage = "User ID does not exist, the API is broken somehow";
		-- Unhandled error.
		ELSE 
			SET errorCode = @errNo;
			SET errorMessage = @text;
		END IF;
	END;
    
    SET errorCode = 0;
    Set errorMessage = '';
	
    SELECT 
		`U`.`ScreenName`,
		`U`.`FirstName`,
		`U`.`LastName`,
		`U`.`DateOfBirth`,
		`I`.`ItineraryID` AS `ItineraryID`,
        `I`.`ItineraryName` AS `ItineraryName`,
        `I`.`StartDate` AS `StartDate`,
        `I`.`EndDate` AS `EndDate`
    FROM
		`database`.`User` AS `U` LEFT JOIN `Itinerary` AS `I` ON (`U`.`UserID` = `I`.`CreatorID`)
	WHERE `U`.`UserID` = UserID
    ORDER BY `I`.`StartDate` DESC, `I`.`EndDate` ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RetrieveSingleItineraryInformation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `RetrieveSingleItineraryInformation`(IN id int, OUT errorCode int, out errorMessage varchar(128))
BEGIN
	/* Error Codes:
     * 1: No itinerary found with that id. This is treated as an error here when it's not in the find stored procs
     *	because we expect to get one back, and it's an error if we don't whereas getting nothing back from a search is entirely reasonable.
     */
    SET errorCode = 0;
    Set errorMessage = '';
	
    If Not Exists(Select `I`.`ItineraryID` FROM `Itinerary` `I` WHERE `I`.`ItineraryID` = id)
    THEN
		SET errorCode = 1;
		Set errorMessage = 'An Itinerary with that id does not exist';
    END IF;
    
	SELECT 
        `I`.`ItineraryID` AS `ItineraryID`,
		`I`.`ItineraryName` AS `ItineraryName`,
		`I`.`StartDate` AS `StartDate`,
		`I`.`EndDate` AS `EndDate`,
        `I`.`Description` AS `Description`,
        `I`.`CreatorID` AS `CreatorID`,
		`A`.`ActivityID` AS `ActivityID`,
        `A`.`ActivityName` AS `ActivityName`,
		`A`.`Latitude` AS `Latitude`,
		`A`.`Longitude` AS `Longitude`,
        `A`.`Address` AS `Address`,
		`Q`.`ItineraryItemID` AS `ItineraryItemID`,
        `Q`.`StartTime` AS `StartTime`,
		`Q`.`EndTime` AS `EndTime`,
        `Q`.`AdditionalInformation` AS `AdditionalInformation`,
        `P`.`PhotoID` AS `PhotoID`,
        `P`.`URL` AS `URL`
   FROM
        `Itinerary` `I`
        LEFT JOIN `ItineraryItem` `Q` ON (`I`.`ItineraryID` = `Q`.`ItineraryID`)
        LEFT JOIN `Activity` `A` ON (`Q`.`ActivityID` = `A`.`ActivityID`)
        LEFT JOIN `ActivityPhotos` `P` ON (`Q`.`ItineraryItemID` = `P`.`ItineraryItemID`)
	WHERE I.ItineraryID = id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RetrieveUsersSingleItinerary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `RetrieveUsersSingleItinerary`(IN UserID int, IN ItineraryName char(128), errorCode int, out errorMessage varchar(128))
BEGIN
	/* Error Codes:
     * 1: Invalid User ID. This is an API error.
     */
	DECLARE exit handler for SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		-- USER ID is invalid. This means the API is broken. As far as i can tell, as of this writing this will never proc.
		IF (@errno = 1452)
		THEN
			SET errorCode = 1;
			SET errorMessage = "User ID does not exist, the API is broken somehow";
		-- Unhandled error.
		ELSE 
			SET errorCode = @errNo;
			SET errorMessage = @text;
		END IF;
	END;
    
    SET errorCode = 0;
    Set errorMessage = '';
	
    SELECT 
		`I`.`ItineraryID` AS `ItineraryID`,
        `I`.`ItineraryName` AS `ItineraryName`,
        `I`.`StartDate` AS `StartDate`,
        `I`.`EndDate` AS `EndDate`
    FROM
        `Itinerary` AS `I`
	WHERE I.CreatorID = UserID AND I.ItineraryName = ItineraryName;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TryLoginGetID` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `TryLoginGetID`(IN email VARCHAR(45), IN pass VARCHAR(64), OUT id INT, out errorCode int, out errorMessage varChar(128))
BEGIN
	/* Error Codes***:
     * 1: There is no user with this email in the database.
     * 2: Invalid Password.
     *** This is not a true error; the query runs correctly, but as far as the UI is concerned the result is the same. ***
     */
	
    SELECT K.UserID, K.HashedPassword into @tempID, @pass FROM NormalLogin as K WHERE K.Email = email LIMIT 1;

    IF (@tempID IS NULL)
    THEN
		SET errorCode = 1;
        SET errorMessage = "No user with that email exists";
	ELSEIF (NOT BINARY @pass = pass)
    THEN
		SET errorCode = 2;
        SET errorMessage = "Invalid Password";
	ELSE
		SET errorCode = 0;
        SET errorMessage = '';
        Set id = @tempID;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_ALL_TABLES' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateUser`(IN userID int, IN fName varchar(45), IN lName varchar(45), IN dob DATE, OUT errorCode int, OUT errorMessage varchar(128))
BEGIN
	SET errorCode = 0;
    SET errorMessage = "";
    
	IF (NOT EXISTS (select `U`.`UserID` FROM `User` `U` WHERE `U`.`UserID` = userID))
    THEN 
		SET errorCode = 1;
        SET errorMessage = "User ID does not exist, the API is broken somehow";
	ELSE
		UPDATE `database`.`User` SET `FirstName` = fName, `LastName` = lName, `DateOfBirth` = dob WHERE `User`.`UserID` = userID;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `FullItineraryData`
--

/*!50001 DROP VIEW IF EXISTS `FullItineraryData`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `FullItineraryData` AS select `I`.`CreatorID` AS `CreatorID`,`U`.`ScreenName` AS `ScreenName`,`I`.`ItineraryID` AS `ItineraryID`,`I`.`ItineraryName` AS `ItineraryName`,`I`.`StartDate` AS `StartDate`,`I`.`EndDate` AS `EndDate`,`I`.`Description` AS `Description`,`Q`.`ItineraryItemID` AS `ItineraryItemID`,`A`.`ActivityID` AS `ActivityID`,`A`.`ActivityName` AS `ActivityName`,`A`.`Latitude` AS `Latitude`,`A`.`Longitude` AS `Longitude`,`A`.`Address` AS `Address`,`Q`.`StartTime` AS `StartTime`,`Q`.`EndTime` AS `EndTime`,`Q`.`AdditionalInformation` AS `AdditionalInformation`,`P`.`PhotoID` AS `PhotoID`,`P`.`URL` AS `PhotoURL` from ((((`Itinerary` `I` join `User` `U` on((`I`.`CreatorID` = `U`.`UserID`))) left join `ItineraryItem` `Q` on((`I`.`ItineraryID` = `Q`.`ItineraryID`))) left join `Activity` `A` on((`Q`.`ActivityID` = `A`.`ActivityID`))) left join `ActivityPhotos` `P` on((`Q`.`ItineraryItemID` = `P`.`ItineraryItemID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `NormalUserView`
--

/*!50001 DROP VIEW IF EXISTS `NormalUserView`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `NormalUserView` AS select `U`.`UserID` AS `UserID`,`U`.`ScreenName` AS `ScreenName`,`U`.`FirstName` AS `FirstName`,`U`.`LastName` AS `LastName`,`U`.`DateOfBirth` AS `DateOfBirth`,`N`.`HashedPassword` AS `HashedPassword`,`N`.`Email` AS `Email` from (`User` `U` join `NormalLogin` `N` on((`U`.`UserID` = `N`.`UserID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-06  6:59:56
