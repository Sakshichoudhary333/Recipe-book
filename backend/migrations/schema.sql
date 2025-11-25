-- Recipe Book Application Database Schema

-- Users table to manage application users
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Cuisine types table for categorization
CREATE TABLE cuisines (
    cuisine_id INT PRIMARY KEY AUTO_INCREMENT,
    cuisine_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal types table for categorization
CREATE TABLE meal_types (
    meal_type_id INT PRIMARY KEY AUTO_INCREMENT,
    meal_type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main recipes table
CREATE TABLE recipes (
    recipe_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_name VARCHAR(200) NOT NULL,
    description TEXT,
    preparation_time INT COMMENT 'Time in minutes',
    cooking_time INT COMMENT 'Time in minutes',
    servings INT,
    difficulty_level ENUM('Easy', 'Medium', 'Hard'),
    cuisine_id INT,
    meal_type_id INT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cuisine_id) REFERENCES cuisines(cuisine_id) ON DELETE SET NULL,
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(meal_type_id) ON DELETE SET NULL,
    INDEX idx_recipe_name (recipe_name),
    INDEX idx_user_id (user_id),
    INDEX idx_cuisine_id (cuisine_id),
    INDEX idx_meal_type_id (meal_type_id),
    FULLTEXT idx_recipe_search (recipe_name, description)
);

-- Ingredients master table
CREATE TABLE ingredients (
    ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) COMMENT 'e.g., Vegetable, Spice, Dairy, Meat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ingredient_name (ingredient_name),
    FULLTEXT idx_ingredient_search (ingredient_name)
);

-- Recipe ingredients junction table (many-to-many relationship)
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10, 2),
    unit VARCHAR(50) COMMENT 'e.g., cups, grams, tablespoons',
    notes TEXT COMMENT 'e.g., chopped, diced, optional',
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_ingredient_id (ingredient_id),
    UNIQUE KEY unique_recipe_ingredient (recipe_id, ingredient_id)
);

-- Recipe instructions table
CREATE TABLE recipe_instructions (
    instruction_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    step_number INT NOT NULL,
    instruction_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    UNIQUE KEY unique_recipe_step (recipe_id, step_number)
);

-- Recipe ratings table
CREATE TABLE recipe_ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_recipe_rating (recipe_id, user_id)
);

-- Recipe comments table
CREATE TABLE recipe_comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_user_id (user_id)
);

-- Additional categories table (for flexible categorization)
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_type VARCHAR(50) COMMENT 'e.g., Dietary, Occasion, Season',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe categories junction table (many-to-many)
CREATE TABLE recipe_categories (
    recipe_category_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_category_id (category_id),
    UNIQUE KEY unique_recipe_category (recipe_id, category_id)
);

-- View for recipe with average ratings
CREATE VIEW recipe_ratings_summary AS
SELECT 
    r.recipe_id,
    r.recipe_name,
    r.user_id,
    COUNT(rt.rating_id) AS total_ratings,
    COALESCE(AVG(rt.rating), 0) AS average_rating
FROM recipes r
LEFT JOIN recipe_ratings rt ON r.recipe_id = rt.recipe_id
GROUP BY r.recipe_id, r.recipe_name, r.user_id;

-- Sample data insertion for cuisines
INSERT INTO cuisines (cuisine_name, description) VALUES
('Italian', 'Traditional Italian cuisine'),
('Chinese', 'Traditional Chinese cuisine'),
('Mexican', 'Traditional Mexican cuisine'),
('Indian', 'Traditional Indian cuisine'),
('American', 'Traditional American cuisine'),
('French', 'Traditional French cuisine'),
('Japanese', 'Traditional Japanese cuisine'),
('Thai', 'Traditional Thai cuisine');

-- Sample data insertion for meal types
INSERT INTO meal_types (meal_type_name, description) VALUES
('Breakfast', 'Morning meals'),
('Lunch', 'Midday meals'),
('Dinner', 'Evening meals'),
('Snack', 'Light snacks and appetizers'),
('Dessert', 'Sweet dishes and desserts'),
('Beverage', 'Drinks and beverages');