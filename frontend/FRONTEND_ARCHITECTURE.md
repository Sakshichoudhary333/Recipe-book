# Recipe Book Frontend Architecture

## Overview

This document outlines the complete frontend architecture based on the backend API.

---

## Pages/Routes Structure

### Public Pages

1. **Home** (`/`) - Hero, popular recipes, recent recipes
2. **Recipes List** (`/recipes`) - All recipes with filters
3. **Recipe Detail** (`/recipes/:id`) - Full recipe details
4. **Categories** (`/categories`) - All categories
5. **Category Recipes** (`/categories/:id`) - Recipes by category
6. **Search** (`/search`) - Advanced search
7. **User Profile** (`/users/:id`) - Public user profile
8. **Login** (`/login`) - Login page
9. **Register** (`/register`) - Registration page

### Protected Pages (Require Authentication)

10. **My Profile** (`/profile`) - Current user profile
11. **Edit Profile** (`/profile/edit`) - Edit profile
12. **My Recipes** (`/my-recipes`) - User's own recipes
13. **My Favorites** (`/favorites`) - Favorited recipes
14. **My Collections** (`/collections`) - User's collections
15. **Create Recipe** (`/recipes/create`) - Create new recipe
16. **Edit Recipe** (`/recipes/:id/edit`) - Edit existing recipe
17. **Create Collection** (`/collections/create`) - Create collection
18. **Collection Detail** (`/collections/:id`) - Collection details

### Admin Pages (Admin Only)

19. **Admin Dashboard** (`/admin`) - Admin overview
20. **Manage Users** (`/admin/users`) - User management
21. **Manage Categories** (`/admin/categories`) - Category management
22. **Manage Ingredients** (`/admin/ingredients`) - Ingredient management

---

## Forms Required

### 1. **RecipeForm** (Create/Edit Recipe)

**Fields:**

- name (text, required)
- description (textarea, optional)
- prep_time (number, minutes)
- cook_time (number, minutes)
- servings (number)
- difficulty_level (select: Easy/Medium/Hard)
- instructions (textarea)
- image (file upload)
- video_url (text, optional)
- categories (multi-select)
- ingredients (dynamic array with autocomplete)
  - Search/select ingredient by name
  - Quantity (number)
  - Unit (text)
  - Notes (text, optional)
- is_published (checkbox)

**Key Features:**

- Ingredient autocomplete search (uses `/api/ingredients/search`)
- Option to create new ingredient if not found
- Dynamic add/remove ingredient rows
- Image preview before upload
- Draft save functionality

### 2. **LoginForm**

**Fields:**

- email (email, required)
- password (password, required)

### 3. **RegisterForm**

**Fields:**

- email (email, required)
- password (password, required)
- f_name (text, required)
- l_name (text, required)
- city (text, optional)
- state (text, optional)
- street (text, optional)
- phone_no (text, optional)
- phone_type (select: mobile/home/work)

### 4. **ProfileForm** (Edit Profile)

**Fields:**

- f_name (text)
- l_name (text)
- city (text)
- state (text)
- street (text)
- bio (textarea)
- dietary_preferences (text)
- favorite_cuisines (text)
- profile_image (file upload)

### 5. **FeedbackForm** (Review/Rating)

**Fields:**

- Rating (1-5 stars)
- Comment_Text (textarea)

### 6. **CollectionForm** (Create/Edit Collection)

**Fields:**

- name (text, required)
- description (textarea)
- is_public (checkbox)

### 7. **CategoryForm** (Admin - Create/Edit Category)

**Fields:**

- CName (text, required)
- Meal_Type (text)
- cuisine_type (text)
- description (textarea)
- image_url (text or file upload)

### 8. **IngredientForm** (Admin/Chef - Create/Edit Ingredient)

**Fields:**

- I_Name (text, required)
- Unit (text)
- Quantity (number)
- calories_per_unit (number)
- allergen_info (text)
- is_vegetarian (checkbox)
- is_vegan (checkbox)
- is_gluten_free (checkbox)

---

## Components Required

### Layout Components

1. **Navbar** - Main navigation with auth state
2. **Footer** - Footer with links
3. **Sidebar** - For admin/profile pages
4. **Layout** - Main layout wrapper

### Recipe Components

5. **RecipeCard** - Recipe preview card
6. **RecipeGrid** - Grid of recipe cards
7. **RecipeList** - List view of recipes
8. **RecipeDetail** - Full recipe display
9. **RecipeForm** - Create/edit recipe form
10. **IngredientInput** - Ingredient autocomplete input
11. **IngredientList** - Display list of ingredients

### User Components

12. **UserCard** - User profile card
13. **UserStats** - User statistics display
14. **ProfileHeader** - Profile page header

### Feedback Components

15. **FeedbackCard** - Single review/rating
16. **FeedbackList** - List of reviews
17. **FeedbackForm** - Create/edit review
18. **RatingStars** - Star rating display/input

### Collection Components

19. **CollectionCard** - Collection preview
20. **CollectionGrid** - Grid of collections
21. **CollectionDetail** - Full collection display
22. **CollectionForm** - Create/edit collection

### Category Components

23. **CategoryCard** - Category preview
24. **CategoryGrid** - Grid of categories
25. **CategoryFilter** - Category filter dropdown

### Search Components

26. **SearchBar** - Search input
27. **SearchFilters** - Advanced search filters
28. **SearchResults** - Search results display

### UI Components (Already exist via shadcn/ui)

29. **Button**
30. **Input**
31. **Textarea**
32. **Select**
33. **Card**
34. **Dialog**
35. **Alert**
36. **Badge**
37. **Tabs**
38. **Pagination**
39. **Skeleton**
40. **Toast**

### Utility Components

41. **ProtectedRoute** - Auth guard
42. **AdminRoute** - Admin guard
43. **LoadingSpinner** - Loading state
44. **ErrorBoundary** - Error handling
45. **ImageUpload** - Image upload with preview
46. **Pagination** - Pagination controls

---

## API Integration Pattern

### Using TanStack Query (React Query)

```typescript
// Example: Fetch recipes
const { data, isLoading, error } = useQuery({
  queryKey: ["recipes", { page, category, difficulty }],
  queryFn: () => fetchRecipes({ page, category, difficulty }),
});

// Example: Create recipe
const mutation = useMutation({
  mutationFn: createRecipe,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
    toast.success("Recipe created!");
    navigate("/my-recipes");
  },
});
```

---

## State Management

### Global State (Context/Zustand)

- **Auth State**: user, token, isAuthenticated, role
- **Theme State**: dark/light mode
- **Search State**: recent searches, filters

### Server State (TanStack Query)

- All API data (recipes, users, categories, etc.)
- Automatic caching and refetching
- Optimistic updates

---

## Key Implementation Details

### 1. Ingredient Autocomplete in RecipeForm

```typescript
// Use debounced search
const [ingredientSearch, setIngredientSearch] = useState("");
const { data: ingredients } = useQuery({
  queryKey: ["ingredients", "search", ingredientSearch],
  queryFn: () => searchIngredients(ingredientSearch),
  enabled: ingredientSearch.length > 2,
});

// Allow creating new ingredient
const handleCreateIngredient = async (name: string) => {
  const newIngredient = await createIngredient({ I_Name: name });
  // Add to recipe
  append({ IID: newIngredient.IID, quantity: 1, unit: "", notes: "" });
};
```

### 2. Image Upload Flow

```typescript
// 1. Create recipe first
const recipe = await createRecipe(formData);

// 2. Upload image if selected
if (selectedImage) {
  await uploadRecipeImage(recipe.RID, selectedImage);
}
```

### 3. Pagination

```typescript
const [page, setPage] = useState(1);
const limit = 12;

const { data } = useQuery({
  queryKey: ["recipes", page],
  queryFn: () => fetchRecipes({ page, limit }),
});

// Use meta for pagination controls
const { totalPages, hasNextPage, hasPrevPage } = data?.meta || {};
```

### 4. Authentication Flow

```typescript
// After login/register
localStorage.setItem('token', data.token);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.user));
localStorage.setItem('role', data.role);

// Include in all requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// On logout
localStorage.clear();
navigate('/login');
```

---

## Folder Structure

```
frontend/src/
├── api/
│   ├── auth.ts
│   ├── recipes.ts
│   ├── ingredients.ts
│   ├── categories.ts
│   ├── feedback.ts
│   ├── collections.ts
│   ├── users.ts
│   └── search.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── recipe/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeGrid.tsx
│   │   └── RecipeDetail.tsx
│   ├── user/
│   │   ├── UserCard.tsx
│   │   └── UserStats.tsx
│   └── ui/ (shadcn components)
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── api.ts
│   │   └── types.ts
│   ├── recipes/
│   │   ├── components/
│   │   │   ├── RecipeForm.tsx
│   │   │   └── IngredientInput.tsx
│   │   ├── api.ts
│   │   └── types.ts
│   └── ... (other features)
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── useImageUpload.ts
├── pages/
│   ├── HomePage.tsx
│   ├── RecipesPage.tsx
│   ├── RecipeDetailPage.tsx
│   ├── CreateRecipePage.tsx
│   └── ... (other pages)
├── lib/
│   └── utils.ts
├── types/
│   └── index.ts
└── App.tsx
```

---

## Next Steps

1. ✅ Create architecture document (this file)
2. Create/update IngredientInput component with autocomplete
3. Refactor RecipeForm to use IngredientInput
4. Create missing components (RecipeCard, RecipeGrid, etc.)
5. Create missing pages
6. Implement proper error handling
7. Add loading states
8. Implement authentication guards
9. Add image upload previews
10. Implement search functionality
