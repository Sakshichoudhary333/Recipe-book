# Categories vs Collections - Explained

## 🏷️ Categories

### What are Categories?

**Categories** are **system-defined** classification tags for recipes, managed by admins.

### Database Schema

```sql
CREATE TABLE `CATEGORY` (
  `CID` INT NOT NULL AUTO_INCREMENT,
  `CName` VARCHAR(100) NOT NULL,           -- e.g., "Italian", "Breakfast"
  `Meal_Type` VARCHAR(50) DEFAULT NULL,    -- e.g., "Breakfast", "Lunch", "Dinner"
  `cuisine_type` VARCHAR(50) DEFAULT NULL, -- e.g., "Italian", "Mexican", "Chinese"
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`CID`)
);

-- Many-to-many relationship: One recipe can have multiple categories
CREATE TABLE `RECIPECATEGORY` (
  `RID` INT NOT NULL,
  `CID` INT NOT NULL,
  PRIMARY KEY (`RID`, `CID`)
);
```

### Examples of Categories

From the sample data in schema.sql:

- **Meal Type**: Breakfast, Lunch, Dinner, Desserts
- **Cuisine**: Italian, Mexican, Chinese, Indian
- **Dietary**: Vegetarian, Vegan
- **Special**: Quick & Easy, Healthy

### Use Cases

1. **Browse by Category**: "Show me all Italian recipes"
2. **Filter Recipes**: "Show me Vegetarian Breakfast recipes"
3. **Recipe Discovery**: Users explore recipes by type
4. **Recipe Classification**: Recipes are tagged with relevant categories

### Who Manages Categories?

- **Admins** create/edit/delete categories
- **Users** assign existing categories to their recipes
- Categories are **global** - same for all users

### Frontend Pages

- `/categories` - Browse all categories (grid/list view)
- `/categories/:id` - View all recipes in a specific category

---

## 📚 Collections

### What are Collections?

**Collections** are **user-created** recipe cookbooks/playlists, like Pinterest boards for recipes.

### Database Schema

```sql
CREATE TABLE `collections` (
  `collection_id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,                      -- Owner of the collection
  `collection_name` VARCHAR(100) NOT NULL, -- e.g., "My Favorite Desserts"
  `description` TEXT DEFAULT NULL,
  `is_public` BOOLEAN DEFAULT FALSE,       -- Can others see it?
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`)
);

-- Many-to-many relationship: One collection has many recipes
CREATE TABLE `collection_recipes` (
  `collection_id` INT NOT NULL,
  `RID` INT NOT NULL,
  `added_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `display_order` INT DEFAULT 0,           -- User can order recipes
  PRIMARY KEY (`collection_id`, `RID`)
);
```

### Examples of Collections

User-created examples:

- "Weekly Meal Prep"
- "Holiday Recipes"
- "My Favorite Desserts"
- "Quick Weeknight Dinners"
- "Recipes to Try"
- "Mom's Recipes"

### Use Cases

1. **Personal Organization**: Save favorite recipes in custom groups
2. **Meal Planning**: Create collections for weekly meal plans
3. **Sharing**: Make collections public to share with others
4. **Inspiration**: Browse other users' public collections
5. **Custom Ordering**: Arrange recipes in preferred order

### Who Manages Collections?

- **Any authenticated user** can create collections
- **Collection owner** can add/remove recipes, edit details, delete
- **Public collections** can be viewed by anyone
- **Private collections** only visible to owner

### Frontend Pages

- `/collections` - Browse public collections
- `/collections/my` - View own collections (protected)
- `/collections/:id` - View collection details and recipes
- `/collections/create` - Create new collection (protected)
- `/profile/collections` - Manage own collections (protected)

---

## 🔄 Key Differences

| Feature                 | Categories             | Collections                 |
| ----------------------- | ---------------------- | --------------------------- |
| **Created By**          | Admins                 | Any user                    |
| **Purpose**             | Recipe classification  | Personal organization       |
| **Scope**               | Global (system-wide)   | Personal (user-specific)    |
| **Visibility**          | Always public          | Public or private           |
| **Examples**            | "Italian", "Breakfast" | "My Meal Prep", "Favorites" |
| **Quantity**            | Limited, curated       | Unlimited per user          |
| **Management**          | Admin only             | Owner only                  |
| **Recipe Relationship** | Tagged to recipe       | Added to collection         |
| **Ordering**            | No specific order      | User-defined order          |

---

## 🎯 Real-World Analogy

### Categories = Netflix Genres

- System-defined: "Action", "Comedy", "Drama"
- Used for browsing and filtering
- Managed by platform (admins)
- Same for all users

### Collections = Netflix "My List"

- User-created: "Watch Later", "Family Movies"
- Personal organization
- Each user has their own
- Can be shared or private

---

## 💡 Why Both Are Needed

### Categories Enable:

✅ **Discovery**: "I want Italian food tonight"
✅ **Filtering**: "Show me only Vegetarian recipes"
✅ **Consistency**: All users see same categories
✅ **SEO**: Better search engine optimization
✅ **Organization**: Structured recipe taxonomy

### Collections Enable:

✅ **Personalization**: "My go-to recipes"
✅ **Planning**: "This week's meal plan"
✅ **Curation**: "Best recipes I've tried"
✅ **Sharing**: "Share my collection with friends"
✅ **Flexibility**: Create any grouping you want

---

## 📱 User Experience Examples

### Scenario 1: Finding Recipes

**User**: "I want to make Italian food for dinner"

- Goes to `/categories`
- Clicks "Italian" category
- Browses Italian recipes
- Saves favorite to "Dinner Ideas" collection

### Scenario 2: Meal Planning

**User**: "I need to plan next week's meals"

- Goes to `/collections/create`
- Creates "Week of Jan 15" collection
- Searches for recipes
- Adds 7 recipes to collection
- Orders them by day of week

### Scenario 3: Sharing Favorites

**User**: "I want to share my favorite desserts"

- Goes to `/profile/collections`
- Creates "Amazing Desserts" collection
- Adds favorite dessert recipes
- Sets `is_public = true`
- Shares link with friends

---

## 🔗 API Endpoints

### Categories

```
GET  /api/categories              - List all categories
GET  /api/categories/:id          - Get category details
GET  /api/categories/:id/recipes  - Get recipes in category
POST /api/categories              - Create category (admin)
PUT  /api/categories/:id          - Update category (admin)
DEL  /api/categories/:id          - Delete category (admin)
```

### Collections

```
GET  /api/collections             - Get user's collections
GET  /api/collections/public      - Get public collections
GET  /api/collections/:id         - Get collection details
GET  /api/collections/:id/recipes - Get recipes in collection
POST /api/collections             - Create collection
PUT  /api/collections/:id         - Update collection
DEL  /api/collections/:id         - Delete collection
POST /api/collections/:id/recipes - Add recipe to collection
DEL  /api/collections/:id/recipes/:recipeId - Remove recipe
```

---

## ✅ Summary

**Keep Categories?** ✅ **YES**

- Essential for recipe discovery and filtering
- Provides structured organization
- Industry standard (all recipe sites have categories)

**Keep Collections?** ✅ **YES**

- Adds personalization and user engagement
- Allows meal planning and organization
- Enables social sharing features
- Increases user retention (users return to their collections)

Both features serve different but complementary purposes!
