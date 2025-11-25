# Recipe Book API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register User

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

### Login User

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

## Recipes

### Get All Recipes

**Endpoint:** `GET /recipes`

**Query Parameters (Optional):**

- `search`: Search term for recipe name, description, or ingredients.
- `cuisine_id`: Filter by cuisine ID.
- `meal_type_id`: Filter by meal type ID.
- `difficulty_level`: Filter by 'Easy', 'Medium', or 'Hard'.

**Example Request:**
`GET /recipes?search=pasta&difficulty_level=Easy`

**Response (200 OK):**

```json
[
  {
    "recipe_id": 1,
    "user_id": 1,
    "recipe_name": "Spaghetti Carbonara",
    "description": "Classic Italian pasta.",
    "preparation_time": 15,
    "cooking_time": 20,
    "servings": 4,
    "difficulty_level": "Medium",
    "cuisine_id": 1,
    "meal_type_id": 3,
    "image_url": "http://example.com/image.jpg",
    "created_at": "2023-10-27T10:00:00.000Z",
    "username": "johndoe",
    "cuisine_name": "Italian",
    "meal_type_name": "Dinner",
    "average_rating": 4.5
  }
]
```

### Get Recipe Details

**Endpoint:** `GET /recipes/:id`

**Response (200 OK):**

```json
{
  "recipe_id": 1,
  "recipe_name": "Spaghetti Carbonara",
  "description": "Classic Italian pasta.",
  // ... other recipe fields
  "username": "johndoe",
  "cuisine_name": "Italian",
  "meal_type_name": "Dinner",
  "average_rating": 4.5,
  "ingredients": [
    {
      "recipe_ingredient_id": 1,
      "ingredient_id": 5,
      "quantity": 400,
      "unit": "g",
      "notes": null,
      "ingredient_name": "Spaghetti",
      "category": "Pasta"
    }
  ],
  "instructions": [
    {
      "instruction_id": 1,
      "step_number": 1,
      "instruction_text": "Boil water in a large pot."
    }
  ],
  "comments": [
    {
      "comment_id": 1,
      "user_id": 2,
      "comment_text": "Delicious!",
      "created_at": "2023-10-28T12:00:00.000Z",
      "username": "janedoe"
    }
  ]
}
```

### Create Recipe

**Endpoint:** `POST /recipes`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "recipe_name": "Avocado Toast",
  "description": "Simple and healthy breakfast.",
  "preparation_time": 5,
  "cooking_time": 5,
  "servings": 1,
  "difficulty_level": "Easy",
  "cuisine_id": 5,
  "meal_type_id": 1,
  "image_url": "http://example.com/toast.jpg",
  "ingredients": [
    {
      "ingredient_name": "Bread",
      "category": "Bakery",
      "quantity": 2,
      "unit": "slices",
      "notes": "Toasted"
    },
    {
      "ingredient_name": "Avocado",
      "category": "Produce",
      "quantity": 1,
      "unit": "whole",
      "notes": "Mashed"
    }
  ],
  "instructions": [
    {
      "step_number": 1,
      "instruction_text": "Toast the bread."
    },
    {
      "step_number": 2,
      "instruction_text": "Mash avocado and spread on toast."
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "message": "Recipe created successfully",
  "recipeId": 15
}
```

### Update Recipe

**Endpoint:** `PUT /recipes/:id`
**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same structure as Create Recipe. Note: This will replace all existing ingredients and instructions for the recipe.

**Response (200 OK):**

```json
{
  "message": "Recipe updated successfully"
}
```

### Delete Recipe

**Endpoint:** `DELETE /recipes/:id`
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "message": "Recipe deleted successfully"
}
```

---

## Interactions

### Rate Recipe

**Endpoint:** `POST /recipes/:recipeId/rate`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "rating": 5
}
```

**Response (200 OK / 201 Created):**

```json
{
  "message": "Rating added" // or "Rating updated"
}
```

### Comment on Recipe

**Endpoint:** `POST /recipes/:recipeId/comment`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "comment_text": "I tried this and it was amazing!"
}
```

**Response (201 Created):**

```json
{
  "message": "Comment added"
}
```

---

## Categories

### Get Cuisines

**Endpoint:** `GET /categories/cuisines`

**Response (200 OK):**

```json
[
  {
    "cuisine_id": 1,
    "cuisine_name": "Italian",
    "description": "Traditional Italian cuisine"
  },
  {
    "cuisine_id": 2,
    "cuisine_name": "Chinese",
    "description": "Traditional Chinese cuisine"
  }
]
```

### Get Meal Types

**Endpoint:** `GET /categories/meal-types`

**Response (200 OK):**

```json
[
  {
    "meal_type_id": 1,
    "meal_type_name": "Breakfast",
    "description": "Morning meals"
  },
  {
    "meal_type_id": 2,
    "meal_type_name": "Lunch",
    "description": "Midday meals"
  }
]
```
