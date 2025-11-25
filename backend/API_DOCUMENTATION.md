# Recipe Book API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Frontend Pages Structure](#frontend-pages-structure)
4. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [Users](#users)
   - [Recipes](#recipes)
   - [Categories](#categories)
   - [Ingredients](#ingredients)
   - [Feedback](#feedback)
   - [Collections](#collections)
   - [Search](#search)
5. [Common Patterns](#common-patterns)
6. [Error Handling](#error-handling)

---

## Overview

This is a comprehensive Recipe Book API built with Node.js, Express, and MySQL. The API supports user authentication, recipe management, collections, feedback/ratings, and advanced search functionality.

**Base API Path**: `/api`

---

## Base URL & Authentication

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

**Token Storage**: Store both `token` (access token) and `refreshToken` in localStorage or httpOnly cookies.

---

## Frontend Pages Structure

### Recommended Page Structure

```
/
├── / (Home)
│   ├── Hero section
│   ├── Popular recipes
│   └── Recent recipes
│
├── /auth
│   ├── /login
│   └── /register
│
├── /recipes
│   ├── / (Recipe list with filters)
│   ├── /[id] (Recipe detail)
│   ├── /create (Create new recipe - Protected)
│   └── /[id]/edit (Edit recipe - Protected)
│
├── /categories
│   ├── / (Category list)
│   └── /[id] (Recipes by category)
│
├── /search
│   └── / (Advanced search with filters)
│
├── /profile
│   ├── / (Current user profile - Protected)
│   ├── /edit (Edit profile - Protected)
│   ├── /recipes (My recipes - Protected)
│   ├── /favorites (My favorites - Protected)
│   └── /collections (My collections - Protected)
│
├── /users/[id]
│   ├── / (Public user profile)
│   ├── /recipes (User's recipes)
│   └── /stats (User statistics)
│
├── /collections
│   ├── / (Public collections)
│   ├── /my (My collections - Protected)
│   ├── /[id] (Collection detail)
│   └── /create (Create collection - Protected)
│
└── /admin (Admin dashboard - Admin only)
    ├── /users
    ├── /categories
    └── /ingredients
```

---

## API Endpoints

### Authentication

#### 1. Register User

**POST** `/api/auth/register`

**Access**: Public

**Request Body**:

```typescript
{
  email: string;           // Required
  password: string;        // Required
  f_name: string;          // Required
  l_name: string;          // Required
  city?: string;           // Optional
  state?: string;          // Optional
  street?: string;         // Optional
  phone_no?: string;       // Optional
  phone_type?: "mobile" | "home" | "work"; // Optional, default: "mobile"
}
```

**Response** (201):

```typescript
{
  success: true;
  message: "User registered successfully";
  data: {
    user: {
      uid: number;
      email: string;
      f_name: string;
      l_name: string;
      city?: string;
      state?: string;
      street?: string;
      profile_image?: string;
      bio?: string;
      created_at: Date;
    };
    token: string;
    refreshToken: string;
  }
}
```

---

#### 2. Login

**POST** `/api/auth/login`

**Access**: Public

**Request Body**:

```typescript
{
  email: string; // Required
  password: string; // Required
}
```

**Response** (200):

```typescript
{
  success: true;
  message: "Login successful";
  data: {
    user: {
      uid: number;
      email: string;
      f_name: string;
      l_name: string;
      // ... other user fields
    }
    token: string;
    refreshToken: string;
    role: string; // "customer", "admin", "chef", "moderator"
  }
}
```

---

#### 3. Logout

**POST** `/api/auth/logout`

**Access**: Private (requires authentication)

**Response** (200):

```typescript
{
  success: true;
  message: "Logout successful";
  data: null;
}
```

**Frontend Action**: Clear stored tokens from localStorage/cookies.

---

#### 4. Change Password

**POST** `/api/auth/change-password`

**Access**: Private

**Request Body**:

```typescript
{
  currentPassword: string; // Required
  newPassword: string; // Required
}
```

**Response** (200):

```typescript
{
  success: true;
  message: "Password changed successfully";
  data: null;
}
```

---

### Users

#### 1. Get Current User Profile

**GET** `/api/users/profile`

**Access**: Private

**Response** (200):

```typescript
{
  success: true;
  message: "Profile retrieved successfully";
  data: {
    uid: number;
    email: string;
    f_name: string;
    l_name: string;
    city?: string;
    state?: string;
    street?: string;
    profile_image?: string;
    bio?: string;
    created_at: Date;
    last_login?: Date;
    Role?: string; // If employee
    dietary_preferences?: string;
    favorite_cuisines?: string;
    phones: Array<{
      phone_no: string;
      phone_type: "mobile" | "home" | "work";
      is_primary: boolean;
    }>;
  }
}
```

---

#### 2. Update Profile

**PUT** `/api/users/profile`

**Access**: Private

**Request Body**:

```typescript
{
  f_name?: string;
  l_name?: string;
  city?: string;
  state?: string;
  street?: string;
  bio?: string;
  dietary_preferences?: string;
  favorite_cuisines?: string;
}
```

**Response** (200):

```typescript
{
  success: true;
  message: "Profile updated successfully";
  data: {
    // Updated user object
  }
}
```

---

#### 3. Upload Profile Image

**POST** `/api/users/profile/image`

**Access**: Private

**Content-Type**: `multipart/form-data`

**Request Body**:

```
profile_image: File
```

**Response** (200):

```typescript
{
  success: true;
  message: "Profile image uploaded successfully";
  data: {
    profile_image: string; // URL path
  }
}
```

---

#### 4. Get User by ID

**GET** `/api/users/:id`

**Access**: Public

**Response** (200):

```typescript
{
  success: true;
  message: "User retrieved successfully";
  data: {
    uid: number;
    f_name: string;
    l_name: string;
    profile_image?: string;
    bio?: string;
    created_at: Date;
    Role?: string;
  }
}
```

---

#### 5. Get User's Recipes

**GET** `/api/users/:id/recipes`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "User recipes retrieved successfully";
  data: Array<Recipe>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

---

#### 6. Get User's Favorites

**GET** `/api/users/:id/favorites`

**Access**: Private (own favorites only)

**Response** (200):

```typescript
{
  success: true;
  message: "Favorites retrieved successfully";
  data: Array<{
    RID: number;
    name: string;
    description?: string;
    image_url?: string;
    prep_time?: number;
    cook_time?: number;
    difficulty_level: "Easy" | "Medium" | "Hard";
    average_rating: number;
    total_ratings: number;
    added_date: Date;
  }>;
}
```

---

#### 7. Get User Statistics

**GET** `/api/users/:id/stats`

**Access**: Public

**Response** (200):

```typescript
{
  success: true;
  message: "User statistics retrieved successfully";
  data: {
    total_recipes: number;
    avg_rating_received: number;
    total_views: number;
    total_ratings_received: number;
    total_comments_given: number;
    total_favorites: number;
  }
}
```

---

#### 8. Get All Users (Admin Only)

**GET** `/api/users`

**Access**: Private (Admin only)

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Users retrieved successfully";
  data: Array<User>;
  meta: PaginationMeta;
}
```

---

### Recipes

#### 1. Create Recipe

**POST** `/api/recipes`

**Access**: Private

**Request Body**:

```typescript
{
  name: string;                    // Required
  description?: string;
  prep_time?: number;              // in minutes
  cook_time?: number;              // in minutes
  servings?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  instructions?: string;
  image_url?: string;
  video_url?: string;
  is_published?: boolean;          // default: false
  categories?: number[];           // Array of category IDs
  ingredients?: Array<{
    IID: number;                   // Ingredient ID
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}
```

**Response** (201):

```typescript
{
  success: true;
  message: "Recipe created successfully";
  data: {
    RID: number;
    // ... recipe fields
  }
}
```

---

#### 2. Get All Recipes

**GET** `/api/recipes`

**Access**: Public (optionally authenticated for favorites)

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category_id`: number (optional)
- `difficulty_level`: "Easy" | "Medium" | "Hard" (optional)
- `min_rating`: number (optional)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipes retrieved successfully";
  data: Array<{
    RID: number;
    name: string;
    description?: string;
    image_url?: string;
    prep_time?: number;
    cook_time?: number;
    difficulty_level: "Easy" | "Medium" | "Hard";
    average_rating: number;
    total_ratings: number;
    view_count: number;
    created_date: Date;
    f_name?: string;
    l_name?: string;
    is_favorited?: boolean; // Only if authenticated
  }>;
  meta: PaginationMeta;
}
```

---

#### 3. Get Popular Recipes

**GET** `/api/recipes/popular`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response**: Same as Get All Recipes

---

#### 4. Get Recent Recipes

**GET** `/api/recipes/recent`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response**: Same as Get All Recipes

---

#### 5. Get Recipe by ID

**GET** `/api/recipes/:id`

**Access**: Public (optionally authenticated)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe retrieved successfully";
  data: {
    RID: number;
    uid?: number;
    name: string;
    description?: string;
    prep_time?: number;
    cook_time?: number;
    servings: number;
    difficulty_level: "Easy" | "Medium" | "Hard";
    instructions?: string;
    image_url?: string;
    video_url?: string;
    created_date: Date;
    updated_date: Date;
    is_published: boolean;
    view_count: number;
    average_rating: number;
    total_ratings: number;
    author?: {
      uid: number;
      f_name: string;
      l_name: string;
      profile_image?: string;
    };
    categories?: Array<Category>;
    ingredients?: Array<{
      IID: number;
      I_Name: string;
      quantity: number;
      unit: string;
      notes?: string;
      display_order: number;
    }>;
    is_favorited?: boolean; // Only if authenticated
    user_rating?: number;   // Only if authenticated
  }
}
```

---

#### 6. Update Recipe

**PUT** `/api/recipes/:id`

**Access**: Private (owner or admin)

**Request Body**: Same as Create Recipe (all fields optional)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe updated successfully";
  data: Recipe;
}
```

---

#### 7. Delete Recipe

**DELETE** `/api/recipes/:id`

**Access**: Private (owner or admin)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe deleted successfully";
  data: null;
}
```

---

#### 8. Upload Recipe Image

**POST** `/api/recipes/:id/image`

**Access**: Private (owner)

**Content-Type**: `multipart/form-data`

**Request Body**:

```
recipe_image: File
```

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe image uploaded successfully";
  data: {
    image_url: string;
  }
}
```

---

#### 9. Add to Favorites

**POST** `/api/recipes/:id/favorite`

**Access**: Private

**Request Body**:

```typescript
{
  notes?: string; // Optional notes about why you favorited
}
```

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe added to favorites";
  data: null;
}
```

---

#### 10. Remove from Favorites

**DELETE** `/api/recipes/:id/favorite`

**Access**: Private

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe removed from favorites";
  data: null;
}
```

---

#### 11. Toggle Publish Status

**POST** `/api/recipes/:id/publish`

**Access**: Private (owner)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe published" | "Recipe unpublished";
  data: {
    is_published: boolean;
  }
}
```

---

### Categories

#### 1. Create Category (Admin Only)

**POST** `/api/categories`

**Access**: Private (Admin only)

**Request Body**:

```typescript
{
  CName: string;        // Required
  Meal_Type?: string;   // e.g., "Breakfast", "Lunch", "Dinner"
  cuisine_type?: string; // e.g., "Italian", "Chinese"
  description?: string;
  image_url?: string;
}
```

**Response** (201):

```typescript
{
  success: true;
  message: "Category created successfully";
  data: {
    CID: number;
    // ... category fields
  }
}
```

---

#### 2. Get All Categories

**GET** `/api/categories`

**Access**: Public

**Response** (200):

```typescript
{
  success: true;
  message: "Categories retrieved successfully";
  data: Array<{
    CID: number;
    CName: string;
    Meal_Type?: string;
    cuisine_type?: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
  }>;
}
```

---

#### 3. Get Category by ID

**GET** `/api/categories/:id`

**Access**: Public

**Response** (200):

```typescript
{
  success: true;
  message: "Category retrieved successfully";
  data: Category;
}
```

---

#### 4. Get Recipes by Category

**GET** `/api/categories/:id/recipes`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipes retrieved successfully";
  data: Array<Recipe>;
  meta: PaginationMeta;
}
```

---

#### 5. Update Category (Admin Only)

**PUT** `/api/categories/:id`

**Access**: Private (Admin only)

**Request Body**: Same as Create Category (all fields optional)

---

#### 6. Delete Category (Admin Only)

**DELETE** `/api/categories/:id`

**Access**: Private (Admin only)

---

### Ingredients

#### 1. Create Ingredient

**POST** `/api/ingredients`

**Access**: Private (Any authenticated user)

**Note**: Previously restricted to Admin/Chef only, but changed to allow all users to create ingredients when making recipes.

**Request Body**:

```typescript
{
  I_Name: string;           // Required
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
}
```

**Response** (201):

```typescript
{
  success: true;
  message: "Ingredient created successfully";
  data: {
    IID: number;
    // ... ingredient fields
  }
}
```

---

#### 2. Get All Ingredients

**GET** `/api/ingredients`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Ingredients retrieved successfully";
  data: Array<Ingredient>;
  meta: PaginationMeta;
}
```

---

#### 3. Search Ingredients

**GET** `/api/ingredients/search`

**Access**: Public

**Query Parameters**:

- `query`: string (required)

**Response** (200):

```typescript
{
  success: true;
  message: "Ingredients retrieved successfully";
  data: Array<Ingredient>; // Max 20 results
}
```

---

#### 4. Get Ingredient by ID

**GET** `/api/ingredients/:id`

**Access**: Public

---

#### 5. Update Ingredient

**PUT** `/api/ingredients/:id`

**Access**: Private (Admin or Chef)

---

#### 6. Delete Ingredient

**DELETE** `/api/ingredients/:id`

**Access**: Private (Admin only)

---

### Feedback (Reviews/Ratings)

#### 1. Create Feedback

**POST** `/api/feedback`

**Access**: Private

**Request Body**:

```typescript
{
  RID: number;          // Required - Recipe ID
  Rating?: number;      // 1-5
  Comment_Text?: string;
}
```

**Response** (201):

```typescript
{
  success: true;
  message: "Feedback created successfully";
  data: {
    FID: number;
    // ... feedback fields
  }
}
```

---

#### 2. Get Recipe Feedback

**GET** `/api/feedback/recipe/:id`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Feedback retrieved successfully";
  data: Array<{
    FID: number;
    UID?: number;
    RID?: number;
    Rating?: number;
    Comment_Text?: string;
    F_Date: Date;
    helpful_count: number;
    is_verified_purchase: boolean;
    is_flagged: boolean;
    f_name?: string;
    l_name?: string;
    profile_image?: string;
  }>;
  meta: PaginationMeta;
}
```

---

#### 3. Get User Feedback

**GET** `/api/feedback/user/:id`

**Access**: Public

**Query Parameters**: Same as Get Recipe Feedback

---

#### 4. Get Feedback by ID

**GET** `/api/feedback/:id`

**Access**: Public

---

#### 5. Update Feedback

**PUT** `/api/feedback/:id`

**Access**: Private (owner only)

**Request Body**:

```typescript
{
  Rating?: number;
  Comment_Text?: string;
}
```

---

#### 6. Delete Feedback

**DELETE** `/api/feedback/:id`

**Access**: Private (owner or admin)

---

#### 7. Mark Feedback as Helpful

**POST** `/api/feedback/:id/helpful`

**Access**: Private

**Response** (200):

```typescript
{
  success: true;
  message: "Feedback marked as helpful";
  data: null;
}
```

---

#### 8. Flag Feedback

**POST** `/api/feedback/:id/flag`

**Access**: Private

**Response** (200):

```typescript
{
  success: true;
  message: "Feedback flagged for review";
  data: null;
}
```

---

### Collections

#### 1. Create Collection

**POST** `/api/collections`

**Access**: Private

**Request Body**:

```typescript
{
  collection_name: string; // Required
  description?: string;
  is_public?: boolean;     // default: false
}
```

**Response** (201):

```typescript
{
  success: true;
  message: "Collection created successfully";
  data: {
    collection_id: number;
    // ... collection fields
  }
}
```

---

#### 2. Get User Collections

**GET** `/api/collections`

**Access**: Private

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Collections retrieved successfully";
  data: Array<{
    collection_id: number;
    uid: number;
    collection_name: string;
    description?: string;
    is_public: boolean;
    created_at: Date;
    updated_at: Date;
    recipe_count: number;
  }>;
  meta: PaginationMeta;
}
```

---

#### 3. Get Public Collections

**GET** `/api/collections/public`

**Access**: Public

**Query Parameters**: Same as Get User Collections

---

#### 4. Get Collection by ID

**GET** `/api/collections/:id`

**Access**: Public (if public) or Private (owner)

**Response** (200):

```typescript
{
  success: true;
  message: "Collection retrieved successfully";
  data: {
    collection_id: number;
    uid: number;
    collection_name: string;
    description?: string;
    is_public: boolean;
    created_at: Date;
    updated_at: Date;
    f_name: string;
    l_name: string;
    profile_image?: string;
  }
}
```

---

#### 5. Update Collection

**PUT** `/api/collections/:id`

**Access**: Private (owner only)

**Request Body**:

```typescript
{
  collection_name?: string;
  description?: string;
  is_public?: boolean;
}
```

---

#### 6. Delete Collection

**DELETE** `/api/collections/:id`

**Access**: Private (owner only)

---

#### 7. Add Recipe to Collection

**POST** `/api/collections/:id/recipes`

**Access**: Private (owner only)

**Request Body**:

```typescript
{
  RID: number;          // Required - Recipe ID
  display_order?: number;
}
```

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe added to collection";
  data: null;
}
```

---

#### 8. Remove Recipe from Collection

**DELETE** `/api/collections/:id/recipes/:recipeId`

**Access**: Private (owner only)

**Response** (200):

```typescript
{
  success: true;
  message: "Recipe removed from collection";
  data: null;
}
```

---

#### 9. Get Collection Recipes

**GET** `/api/collections/:id/recipes`

**Access**: Public (if collection is public)

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Collection recipes retrieved successfully";
  data: Array<Recipe>;
  meta: PaginationMeta;
}
```

---

### Search

#### 1. Search Recipes

**GET** `/api/search/recipes`

**Access**: Public

**Query Parameters**:

- `query`: string (optional)
- `search_type`: "name" | "ingredient" | "both" (default: "both")
- `category_id`: number (optional)
- `difficulty_level`: "Easy" | "Medium" | "Hard" (optional)
- `max_prep_time`: number (optional)
- `max_cook_time`: number (optional)
- `min_rating`: number (optional)
- `sort_by`: "rating" | "date" | "views" | "name" (default: "rating")
- `sort_order`: "asc" | "desc" (default: "desc")
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response** (200):

```typescript
{
  success: true;
  message: "Search results retrieved successfully";
  data: Array<Recipe>;
  meta: PaginationMeta;
}
```

---

#### 2. Search Ingredients

**GET** `/api/search/ingredients`

**Access**: Public

**Query Parameters**:

- `query`: string (required)

**Response** (200):

```typescript
{
  success: true;
  message: "Ingredients retrieved successfully";
  data: Array<Ingredient>; // Max 20 results
}
```

---

#### 3. Search Categories

**GET** `/api/search/categories`

**Access**: Public

**Query Parameters**:

- `query`: string (required)

**Response** (200):

```typescript
{
  success: true;
  message: "Categories retrieved successfully";
  data: Array<Category>; // Max 20 results
}
```

---

#### 4. Search Users

**GET** `/api/search/users`

**Access**: Public

**Query Parameters**:

- `query`: string (required)

**Response** (200):

```typescript
{
  success: true;
  message: "Users retrieved successfully";
  data: Array<{
    uid: number;
    f_name: string;
    l_name: string;
    profile_image?: string;
    bio?: string;
  }>; // Max 20 results
}
```

---

#### 5. Advanced Search

**POST** `/api/search/advanced`

**Access**: Public

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Request Body**: Complex search criteria (implementation pending)

---

## Common Patterns

### Pagination

Most list endpoints support pagination via query parameters:

```typescript
?page=1&limit=10
```

**Response includes meta object**:

```typescript
{
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

**Frontend Implementation**:

```typescript
const fetchRecipes = async (page: number = 1, limit: number = 10) => {
  const response = await fetch(`/api/recipes?page=${page}&limit=${limit}`);
  const data = await response.json();

  return {
    recipes: data.data,
    pagination: data.meta,
  };
};
```

---

### File Uploads

Endpoints that accept file uploads use `multipart/form-data`:

```typescript
const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("profile_image", file);

  const response = await fetch("/api/users/profile/image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

**Note**: Do NOT set `Content-Type` header manually for FormData - browser sets it automatically with boundary.

---

### Authentication Flow

```typescript
// 1. Login
const login = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    // Store tokens
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    localStorage.setItem("role", data.data.role);
  }

  return data;
};

// 2. Make authenticated requests
const getProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

// 3. Logout
const logout = async () => {
  const token = localStorage.getItem("token");

  await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};
```

---

### Role-Based Access

Some endpoints require specific roles:

- **Admin**: Full access to all resources
- **Chef**: Can create/edit ingredients
- **Moderator**: Can moderate content
- **Customer**: Standard user access

**Frontend Role Checking**:

```typescript
const userRole = localStorage.getItem("role");

const canAccessAdminPanel = userRole === "admin";
const canCreateIngredient = ["admin", "chef"].includes(userRole);
```

---

## Error Handling

### Standard Error Response

```typescript
{
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Frontend Error Handling

```typescript
const handleApiCall = async (apiFunction: () => Promise<Response>) => {
  try {
    const response = await apiFunction();
    const data = await response.json();

    if (!response.ok) {
      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Redirect to login
          window.location.href = "/login";
          break;
        case 403:
          // Show forbidden message
          alert("You do not have permission to perform this action");
          break;
        case 404:
          // Show not found message
          alert("Resource not found");
          break;
        case 400:
          // Show validation errors
          if (data.errors) {
            data.errors.forEach((err) => {
              console.error(`${err.field}: ${err.message}`);
            });
          }
          break;
        default:
          alert(data.message || "An error occurred");
      }

      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

---

## Important Notes

### Rate Limiting

The API implements rate limiting. Excessive requests may result in `429 Too Many Requests` responses.

### CORS

Configure CORS origins in your backend configuration to allow frontend requests.

### Image URLs

Image URLs returned by the API are relative paths (e.g., `/uploads/image.jpg`). Prepend your backend base URL:

```typescript
const fullImageUrl = `http://localhost:3000${imageUrl}`;
```

### Pagination Best Practices

- Default limit is 10 items per page
- Maximum limit is typically 100 items
- Always check `hasNextPage` before loading more

### Search Optimization

- Use debouncing for search inputs (300-500ms delay)
- Implement client-side caching for frequently accessed data
- Use the `search_type` parameter to optimize searches

### Date Handling

All dates are returned in ISO 8601 format. Convert to local timezone in frontend:

```typescript
const localDate = new Date(apiDate).toLocaleDateString();
```

---

## TypeScript Types

For TypeScript projects, create type definitions based on the response schemas above. Example:

```typescript
// types/api.ts
export interface User {
  uid: number;
  email: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  is_active: boolean;
}

export interface Recipe {
  RID: number;
  uid?: number;
  name: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  difficulty_level: "Easy" | "Medium" | "Hard";
  instructions?: string;
  image_url?: string;
  video_url?: string;
  created_date: string;
  updated_date: string;
  is_published: boolean;
  view_count: number;
  average_rating: number;
  total_ratings: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
}
```

---

## Support

For issues or questions, refer to the backend source code or contact the development team.
