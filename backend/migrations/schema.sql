-- ============================================================
-- Recipe Book Application - Complete Database Schema
-- MySQL 8.0+
-- ============================================================

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `RECIPECATEGORY`;
DROP TABLE IF EXISTS `RECIPE_INGREDIENT`;
DROP TABLE IF EXISTS `user_phone`;
DROP TABLE IF EXISTS `recipe`;
DROP TABLE IF EXISTS `INGREDIENT`;
DROP TABLE IF EXISTS `CATEGORY`;
DROP TABLE IF EXISTS `employee`;
DROP TABLE IF EXISTS `customer`;
DROP TABLE IF EXISTS `user`;

-- ============================================================
-- USER MANAGEMENT TABLES
-- ============================================================

-- Main user table with authentication and profile information
CREATE TABLE `user` (
  `uid` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `f_name` VARCHAR(50) NOT NULL,
  `l_name` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) DEFAULT NULL,
  `state` VARCHAR(50) DEFAULT NULL,c
  `street` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_user_active` (`is_active`),
  KEY `idx_user_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User phone numbers (supports multiple phone numbers per user)
CREATE TABLE `user_phone` (
  `uid` INT NOT NULL,
  `phone_no` VARCHAR(20) NOT NULL,
  `phone_type` ENUM('mobile', 'home', 'work') DEFAULT 'mobile',
  `is_primary` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`uid`, `phone_no`),
  CONSTRAINT `fk_user_phone_user` FOREIGN KEY (`uid`) 
    REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Customer table (users who primarily consume recipes)
CREATE TABLE `customer` (
  `UID` INT NOT NULL,
  `dietary_preferences` VARCHAR(255) DEFAULT NULL,
  `favorite_cuisines` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`UID`),
  CONSTRAINT `fk_customer_user` FOREIGN KEY (`UID`) 
    REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Employee table (users with special roles/permissions)
CREATE TABLE `employee` (
  `UID` INT NOT NULL,
  `Role` VARCHAR(50) NOT NULL,
  `hire_date` DATE DEFAULT (CURDATE()),
  `department` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`UID`),
  KEY `idx_employee_role` (`Role`),
  CONSTRAINT `fk_employee_user` FOREIGN KEY (`UID`) 
    REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- RECIPE CORE TABLES
-- ============================================================

-- Category table for recipe classification
CREATE TABLE `CATEGORY` (
  `CID` INT NOT NULL AUTO_INCREMENT,
  `CName` VARCHAR(100) NOT NULL,
  `Meal_Type` VARCHAR(50) DEFAULT NULL,
  `cuisine_type` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`CID`),
  UNIQUE KEY `idx_category_name` (`CName`),
  KEY `idx_category_meal_type` (`Meal_Type`),
  KEY `idx_category_cuisine` (`cuisine_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Ingredient master table
CREATE TABLE `INGREDIENT` (
  `IID` INT NOT NULL AUTO_INCREMENT,
  `I_Name` VARCHAR(100) NOT NULL,
  `Unit` VARCHAR(20) DEFAULT NULL,
  `Quantity` DECIMAL(10,2) DEFAULT NULL,
  `calories_per_unit` DECIMAL(10,2) DEFAULT NULL,
  `allergen_info` VARCHAR(255) DEFAULT NULL,
  `is_vegetarian` BOOLEAN DEFAULT TRUE,
  `is_vegan` BOOLEAN DEFAULT FALSE,
  `is_gluten_free` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`IID`),
  UNIQUE KEY `idx_ingredient_name` (`I_Name`),
  KEY `idx_ingredient_vegetarian` (`is_vegetarian`),
  KEY `idx_ingredient_vegan` (`is_vegan`),
  CONSTRAINT `chk_ingredient_quantity` CHECK (`Quantity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Main recipe table
CREATE TABLE `recipe` (
  `RID` INT NOT NULL AUTO_INCREMENT,
  `uid` INT DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `prep_time` INT DEFAULT NULL COMMENT 'Preparation time in minutes',
  `cook_time` INT DEFAULT NULL COMMENT 'Cooking time in minutes',
  `servings` INT DEFAULT 1,
  `difficulty_level` ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  `instructions` TEXT,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `created_date` DATE DEFAULT (CURDATE()),
  `updated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_published` BOOLEAN DEFAULT TRUE,
  `view_count` INT DEFAULT 0,
  `average_rating` DECIMAL(3,2) DEFAULT 0.00,
  `total_ratings` INT DEFAULT 0,
  PRIMARY KEY (`RID`),
  KEY `idx_recipe_user` (`uid`),
  KEY `idx_recipe_name` (`name`),
  KEY `idx_recipe_published` (`is_published`),
  KEY `idx_recipe_rating` (`average_rating`),
  KEY `idx_recipe_created` (`created_date`),
  FULLTEXT KEY `idx_recipe_fulltext` (`name`, `description`),
  CONSTRAINT `fk_recipe_user` FOREIGN KEY (`uid`) 
    REFERENCES `user` (`uid`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_prep_time` CHECK (`prep_time` >= 0),
  CONSTRAINT `chk_cook_time` CHECK (`cook_time` >= 0),
  CONSTRAINT `chk_servings` CHECK (`servings` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- RELATIONSHIP TABLES
-- ============================================================

-- Recipe-Category many-to-many relationship
CREATE TABLE `RECIPECATEGORY` (
  `RID` INT NOT NULL,
  `CID` INT NOT NULL,
  `added_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RID`, `CID`),
  KEY `idx_recipecategory_cid` (`CID`),
  CONSTRAINT `fk_recipecategory_recipe` FOREIGN KEY (`RID`) 
    REFERENCES `recipe` (`RID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipecategory_category` FOREIGN KEY (`CID`) 
    REFERENCES `CATEGORY` (`CID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Recipe-Ingredient many-to-many relationship with quantity
CREATE TABLE `RECIPE_INGREDIENT` (
  `RID` INT NOT NULL,
  `IID` INT NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL COMMENT 'e.g., "finely chopped", "optional"',
  `display_order` INT DEFAULT 0,
  PRIMARY KEY (`RID`, `IID`),
  KEY `idx_recipe_ingredient_iid` (`IID`),
  KEY `idx_recipe_ingredient_order` (`RID`, `display_order`),
  CONSTRAINT `fk_recipe_ingredient_recipe` FOREIGN KEY (`RID`) 
    REFERENCES `recipe` (`RID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_ingredient_ingredient` FOREIGN KEY (`IID`) 
    REFERENCES `INGREDIENT` (`IID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_recipe_ingredient_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- FEEDBACK AND INTERACTION TABLES
-- ============================================================

-- Feedback table for ratings and comments
CREATE TABLE `feedback` (
  `FID` INT NOT NULL AUTO_INCREMENT,
  `UID` INT DEFAULT NULL,
  `RID` INT DEFAULT NULL,
  `Rating` INT DEFAULT NULL,
  `Comment_Text` TEXT,
  `F_Date` DATE DEFAULT (CURDATE()),
  `helpful_count` INT DEFAULT 0,
  `is_verified_purchase` BOOLEAN DEFAULT FALSE,
  `is_flagged` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`FID`),
  KEY `idx_feedback_user` (`UID`),
  KEY `idx_feedback_recipe` (`RID`),
  KEY `idx_feedback_rating` (`Rating`),
  KEY `idx_feedback_date` (`F_Date`),
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`UID`) 
    REFERENCES `user` (`uid`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_feedback_recipe` FOREIGN KEY (`RID`) 
    REFERENCES `recipe` (`RID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_rating` CHECK (`Rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User favorites/bookmarks
CREATE TABLE `user_favorites` (
  `uid` INT NOT NULL,
  `RID` INT NOT NULL,
  `added_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`uid`, `RID`),
  KEY `idx_favorites_recipe` (`RID`),
  KEY `idx_favorites_date` (`added_date`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`uid`) 
    REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_recipe` FOREIGN KEY (`RID`) 
    REFERENCES `recipe` (`RID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User recipe collections/cookbooks
CREATE TABLE `collections` (
  `collection_id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `collection_name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_public` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`),
  KEY `idx_collection_user` (`uid`),
  KEY `idx_collection_public` (`is_public`),
  CONSTRAINT `fk_collection_user` FOREIGN KEY (`uid`) 
    REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Collection recipes (many-to-many)
CREATE TABLE `collection_recipes` (
  `collection_id` INT NOT NULL,
  `RID` INT NOT NULL,
  `added_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `display_order` INT DEFAULT 0,
  PRIMARY KEY (`collection_id`, `RID`),
  KEY `idx_collection_recipes_recipe` (`RID`),
  CONSTRAINT `fk_collection_recipes_collection` FOREIGN KEY (`collection_id`) 
    REFERENCES `collections` (`collection_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_collection_recipes_recipe` FOREIGN KEY (`RID`) 
    REFERENCES `recipe` (`RID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger to update recipe average rating when feedback is added
DELIMITER //
CREATE TRIGGER trg_update_recipe_rating_after_insert
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    UPDATE recipe
    SET 
        average_rating = (
            SELECT AVG(Rating) 
            FROM feedback 
            WHERE RID = NEW.RID AND Rating IS NOT NULL
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM feedback 
            WHERE RID = NEW.RID AND Rating IS NOT NULL
        )
    WHERE RID = NEW.RID;
END//

-- Trigger to update recipe average rating when feedback is updated
CREATE TRIGGER trg_update_recipe_rating_after_update
AFTER UPDATE ON feedback
FOR EACH ROW
BEGIN
    IF OLD.Rating != NEW.Rating OR (OLD.Rating IS NULL AND NEW.Rating IS NOT NULL) OR (OLD.Rating IS NOT NULL AND NEW.Rating IS NULL) THEN
        UPDATE recipe
        SET 
            average_rating = (
                SELECT COALESCE(AVG(Rating), 0) 
                FROM feedback 
                WHERE RID = NEW.RID AND Rating IS NOT NULL
            ),
            total_ratings = (
                SELECT COUNT(*) 
                FROM feedback 
                WHERE RID = NEW.RID AND Rating IS NOT NULL
            )
        WHERE RID = NEW.RID;
    END IF;
END//

-- Trigger to update recipe average rating when feedback is deleted
CREATE TRIGGER trg_update_recipe_rating_after_delete
AFTER DELETE ON feedback
FOR EACH ROW
BEGIN
    UPDATE recipe
    SET 
        average_rating = (
            SELECT COALESCE(AVG(Rating), 0) 
            FROM feedback 
            WHERE RID = OLD.RID AND Rating IS NOT NULL
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM feedback 
            WHERE RID = OLD.RID AND Rating IS NOT NULL
        )
    WHERE RID = OLD.RID;
END//

DELIMITER ;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Procedure to search recipes by name or ingredients
DELIMITER //
CREATE PROCEDURE sp_search_recipes(
    IN search_term VARCHAR(255),
    IN search_type ENUM('name', 'ingredient', 'both')
)
BEGIN
    IF search_type = 'name' THEN
        SELECT DISTINCT r.*
        FROM recipe r
        WHERE r.name LIKE CONCAT('%', search_term, '%')
          AND r.is_published = TRUE
        ORDER BY r.average_rating DESC, r.created_date DESC;
        
    ELSEIF search_type = 'ingredient' THEN
        SELECT DISTINCT r.*
        FROM recipe r
        INNER JOIN RECIPE_INGREDIENT ri ON r.RID = ri.RID
        INNER JOIN INGREDIENT i ON ri.IID = i.IID
        WHERE i.I_Name LIKE CONCAT('%', search_term, '%')
          AND r.is_published = TRUE
        ORDER BY r.average_rating DESC, r.created_date DESC;
        
    ELSE -- search_type = 'both'
        SELECT DISTINCT r.*
        FROM recipe r
        LEFT JOIN RECIPE_INGREDIENT ri ON r.RID = ri.RID
        LEFT JOIN INGREDIENT i ON ri.IID = i.IID
        WHERE (r.name LIKE CONCAT('%', search_term, '%')
           OR i.I_Name LIKE CONCAT('%', search_term, '%'))
          AND r.is_published = TRUE
        ORDER BY r.average_rating DESC, r.created_date DESC;
    END IF;
END//

-- Procedure to get recipes by category
CREATE PROCEDURE sp_get_recipes_by_category(
    IN category_id INT
)
BEGIN
    SELECT r.*, c.CName, c.Meal_Type
    FROM recipe r
    INNER JOIN RECIPECATEGORY rc ON r.RID = rc.RID
    INNER JOIN CATEGORY c ON rc.CID = c.CID
    WHERE c.CID = category_id
      AND r.is_published = TRUE
    ORDER BY r.average_rating DESC, r.created_date DESC;
END//

-- Procedure to get recipe with full details
CREATE PROCEDURE sp_get_recipe_details(
    IN recipe_id INT
)
BEGIN
    -- Get recipe basic info
    SELECT * FROM recipe WHERE RID = recipe_id;
    
    -- Get categories
    SELECT c.* 
    FROM CATEGORY c
    INNER JOIN RECIPECATEGORY rc ON c.CID = rc.CID
    WHERE rc.RID = recipe_id;
    
    -- Get ingredients
    SELECT i.*, ri.quantity, ri.unit, ri.notes
    FROM INGREDIENT i
    INNER JOIN RECIPE_INGREDIENT ri ON i.IID = ri.IID
    WHERE ri.RID = recipe_id
    ORDER BY ri.display_order;
    
    -- Get feedback
    SELECT f.*, u.f_name, u.l_name
    FROM feedback f
    LEFT JOIN user u ON f.UID = u.uid
    WHERE f.RID = recipe_id
    ORDER BY f.F_Date DESC;
    
    -- Update view count
    UPDATE recipe SET view_count = view_count + 1 WHERE RID = recipe_id;
END//

-- Procedure to get user's recipe statistics
CREATE PROCEDURE sp_get_user_recipe_stats(
    IN user_id INT
)
BEGIN
    SELECT 
        COUNT(DISTINCT r.RID) as total_recipes,
        AVG(r.average_rating) as avg_rating_received,
        SUM(r.view_count) as total_views,
        SUM(r.total_ratings) as total_ratings_received,
        COUNT(DISTINCT f.FID) as total_comments_given,
        COUNT(DISTINCT uf.RID) as total_favorites
    FROM user u
    LEFT JOIN recipe r ON u.uid = r.uid
    LEFT JOIN feedback f ON u.uid = f.UID
    LEFT JOIN user_favorites uf ON u.uid = uf.uid
    WHERE u.uid = user_id;
END//

DELIMITER ;

-- ============================================================
-- VIEWS
-- ============================================================

-- View for popular recipes
CREATE VIEW vw_popular_recipes AS
SELECT 
    r.RID,
    r.name,
    r.description,
    r.image_url,
    r.prep_time,
    r.cook_time,
    r.difficulty_level,
    r.average_rating,
    r.total_ratings,
    r.view_count,
    r.created_date,
    u.f_name,
    u.l_name,
    GROUP_CONCAT(DISTINCT c.CName SEPARATOR ', ') as categories
FROM recipe r
LEFT JOIN user u ON r.uid = u.uid
LEFT JOIN RECIPECATEGORY rc ON r.RID = rc.RID
LEFT JOIN CATEGORY c ON rc.CID = c.CID
WHERE r.is_published = TRUE
GROUP BY r.RID, r.name, r.description, r.image_url, r.prep_time, r.cook_time, 
         r.difficulty_level, r.average_rating, r.total_ratings, r.view_count, 
         r.created_date, u.f_name, u.l_name
ORDER BY r.view_count DESC, r.average_rating DESC;

-- View for recent recipes
CREATE VIEW vw_recent_recipes AS
SELECT 
    r.*,
    u.f_name,
    u.l_name,
    GROUP_CONCAT(DISTINCT c.CName SEPARATOR ', ') as categories
FROM recipe r
LEFT JOIN user u ON r.uid = u.uid
LEFT JOIN RECIPECATEGORY rc ON r.RID = rc.RID
LEFT JOIN CATEGORY c ON rc.CID = c.CID
WHERE r.is_published = TRUE
GROUP BY r.RID
ORDER BY r.created_date DESC
LIMIT 50;

-- ============================================================
-- SAMPLE DATA INSERTION (Optional)
-- ============================================================

-- Insert sample categories
INSERT INTO CATEGORY (CName, Meal_Type, cuisine_type, description) VALUES
('Breakfast', 'Breakfast', 'General', 'Morning meals and brunch items'),
('Lunch', 'Lunch', 'General', 'Midday meals'),
('Dinner', 'Dinner', 'General', 'Evening meals'),
('Desserts', 'Dessert', 'General', 'Sweet treats and desserts'),
('Italian', 'Any', 'Italian', 'Italian cuisine recipes'),
('Mexican', 'Any', 'Mexican', 'Mexican cuisine recipes'),
('Chinese', 'Any', 'Chinese', 'Chinese cuisine recipes'),
('Indian', 'Any', 'Indian', 'Indian cuisine recipes'),
('Vegetarian', 'Any', 'General', 'Vegetarian recipes'),
('Vegan', 'Any', 'General', 'Vegan recipes'),
('Quick & Easy', 'Any', 'General', 'Recipes under 30 minutes'),
('Healthy', 'Any', 'General', 'Nutritious and healthy recipes');

-- ============================================================
-- END OF SCHEMA
-- ============================================================
