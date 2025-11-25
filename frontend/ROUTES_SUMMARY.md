# Recipe Book Frontend Routes Summary

This document provides an overview of all routes created based on the API documentation.

## Route Structure

### 🔓 Public Routes (No Authentication Required)

#### Auth Pages

- `/login` - User login page
- `/register` - User registration page

#### Home & Discovery

- `/` - Home page with hero, popular recipes, and recent recipes
- `/recipes` - Browse all recipes with filters (category, difficulty, rating)
- `/recipes/:id` - View recipe details, ingredients, instructions, ratings

#### Categories

- `/categories` - Browse all recipe categories
- `/categories/:id` - View recipes in a specific category

#### Search

- `/search` - Advanced search with multiple filters:
  - Query, search type (name/ingredient/both)
  - Category, difficulty level
  - Max prep/cook time, min rating
  - Sort options

#### Public User Profiles

- `/users/:id` - View public user profile
- `/users/:id/recipes` - View user's published recipes
- `/users/:id/stats` - View user statistics (recipes, ratings, views, etc.)

#### Public Collections

- `/collections` - Browse public recipe collections
- `/collections/:id` - View collection details and recipes

---

### 🔒 Protected Routes (Authentication Required)

#### Recipe Management

- `/recipes/create` - Create a new recipe
- `/recipes/:id/edit` - Edit an existing recipe (owner only)

#### Current User Profile

- `/profile` - View own profile
- `/profile/edit` - Edit profile information, upload image, change password
- `/profile/recipes` - Manage own recipes
- `/profile/favorites` - View and manage favorite recipes
- `/profile/collections` - Manage own collections

#### Legacy Routes (Backwards Compatibility)

- `/my-recipes` - Redirects to `/profile/recipes`

#### Collection Management

- `/collections/create` - Create a new collection
- `/collections/my` - View own collections (same as `/profile/collections`)

---

### 👑 Admin Routes (Admin Role Required)

- `/admin` - Admin dashboard overview
- `/admin/users` - Manage users (view, search, filter)
- `/admin/categories` - CRUD operations for categories
- `/admin/ingredients` - CRUD operations for ingredients

---

## API Endpoints Mapping

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/change-password` - Change password

### User Endpoints

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/image` - Upload profile image
- `GET /api/users/:id` - Get user by ID (public)
- `GET /api/users/:id/recipes` - Get user's recipes
- `GET /api/users/:id/favorites` - Get user's favorites (private)
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users` - Get all users (admin only)

### Recipe Endpoints

- `POST /api/recipes` - Create recipe
- `GET /api/recipes` - Get all recipes (with filters)
- `GET /api/recipes/popular` - Get popular recipes
- `GET /api/recipes/recent` - Get recent recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/image` - Upload recipe image
- `POST /api/recipes/:id/favorite` - Add to favorites
- `DELETE /api/recipes/:id/favorite` - Remove from favorites
- `POST /api/recipes/:id/publish` - Toggle publish status

### Category Endpoints

- `POST /api/categories` - Create category (admin)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/recipes` - Get recipes by category
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Ingredient Endpoints

- `POST /api/ingredients` - Create ingredient
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/search` - Search ingredients
- `GET /api/ingredients/:id` - Get ingredient by ID
- `PUT /api/ingredients/:id` - Update ingredient (admin/chef)
- `DELETE /api/ingredients/:id` - Delete ingredient (admin)

### Feedback Endpoints

- `POST /api/feedback` - Create feedback/rating
- `GET /api/feedback/recipe/:id` - Get recipe feedback
- `GET /api/feedback/user/:id` - Get user feedback
- `GET /api/feedback/:id` - Get feedback by ID
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback
- `POST /api/feedback/:id/helpful` - Mark feedback as helpful
- `POST /api/feedback/:id/flag` - Flag feedback for review

### Collection Endpoints

- `POST /api/collections` - Create collection
- `GET /api/collections` - Get user collections
- `GET /api/collections/public` - Get public collections
- `GET /api/collections/:id` - Get collection by ID
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/recipes` - Add recipe to collection
- `DELETE /api/collections/:id/recipes/:recipeId` - Remove recipe from collection
- `GET /api/collections/:id/recipes` - Get collection recipes

### Search Endpoints

- `GET /api/search/recipes` - Search recipes (advanced)
- `GET /api/search/ingredients` - Search ingredients
- `GET /api/search/categories` - Search categories
- `GET /api/search/users` - Search users
- `POST /api/search/advanced` - Advanced search (complex criteria)

---

## Next Steps

### 1. Implement API Integration

Each page component has TODO comments indicating which API endpoints to use. You'll need to:

- Create API service functions (e.g., `src/services/api.ts`)
- Add authentication token handling
- Implement error handling and loading states

### 2. Update Authentication Context

- Modify `AdminRoute.tsx` to check actual user role from auth context
- Ensure `ProtectedRoute.tsx` properly validates authentication
- Store user role from login response

### 3. Create Shared Components

Consider creating reusable components for:

- Recipe cards
- Collection cards
- User profile cards
- Pagination controls
- Filter/search forms
- Loading states
- Error messages

### 4. Add State Management

Consider using:

- React Context for global state (auth, user)
- React Query for API data fetching and caching
- Local state for component-specific data

### 5. Implement Forms

Create forms for:

- Recipe creation/editing
- Collection creation/editing
- Profile editing
- Feedback/ratings
- Search filters

### 6. Add Pagination

Most list endpoints support pagination. Implement:

- Page navigation controls
- Items per page selector
- Total count display

---

## File Structure

```
frontend/src/
├── App.tsx (✅ Updated with all routes)
├── components/
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx (✅ Created)
└── pages/
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── HomePage.tsx
    ├── RecipesPage.tsx
    ├── RecipeDetailPage.tsx
    ├── CreateRecipePage.tsx
    ├── EditRecipePage.tsx
    ├── CategoriesPage.tsx (✅ Created)
    ├── CategoryDetailPage.tsx (✅ Created)
    ├── SearchPage.tsx (✅ Created)
    ├── UserProfilePage.tsx
    ├── EditProfilePage.tsx (✅ Created)
    ├── MyRecipesPage.tsx
    ├── FavoritesPage.tsx (✅ Created)
    ├── MyCollectionsPage.tsx (✅ Created)
    ├── PublicUserProfilePage.tsx (✅ Created)
    ├── UserRecipesPage.tsx (✅ Created)
    ├── UserStatsPage.tsx (✅ Created)
    ├── PublicCollectionsPage.tsx (✅ Created)
    ├── CollectionDetailPage.tsx (✅ Created)
    ├── CreateCollectionPage.tsx (✅ Created)
    ├── AdminDashboardPage.tsx (✅ Created)
    ├── AdminUsersPage.tsx (✅ Created)
    ├── AdminCategoriesPage.tsx (✅ Created)
    └── AdminIngredientsPage.tsx (✅ Created)
```

---

## Common Patterns from API

### Pagination

Most list endpoints return:

```typescript
{
  success: true;
  message: string;
  data: Array<T>;
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

### Error Responses

```typescript
{
  success: false;
  message: string;
  error?: string;
}
```

### Authentication

Include JWT token in headers:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Store both `token` and `refreshToken` from login/register responses.
