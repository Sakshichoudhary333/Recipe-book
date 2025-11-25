# Recipe Book API - Quick Reference

## Base URL

```
http://localhost:3000/api
```

## Authentication Header

```
Authorization: Bearer <token>
```

---

## Quick Endpoint Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint           | Access  | Description               |
| ------ | ------------------ | ------- | ------------------------- |
| POST   | `/register`        | Public  | Register new user         |
| POST   | `/login`           | Public  | Login user                |
| POST   | `/logout`          | Private | Logout user               |
| POST   | `/refresh-token`   | Public  | Refresh access token      |
| POST   | `/forgot-password` | Public  | Request password reset    |
| POST   | `/reset-password`  | Public  | Reset password with token |
| POST   | `/change-password` | Private | Change password           |

### 👤 Users (`/api/users`)

| Method | Endpoint         | Access  | Description                    |
| ------ | ---------------- | ------- | ------------------------------ |
| GET    | `/profile`       | Private | Get current user profile       |
| PUT    | `/profile`       | Private | Update profile                 |
| POST   | `/profile/image` | Private | Upload profile image           |
| GET    | `/:id`           | Public  | Get user by ID                 |
| GET    | `/:id/recipes`   | Public  | Get user's recipes (paginated) |
| GET    | `/:id/favorites` | Private | Get user's favorites           |
| GET    | `/:id/stats`     | Public  | Get user statistics            |
| DELETE | `/:id`           | Private | Delete user account            |
| GET    | `/`              | Admin   | Get all users (paginated)      |

### 🍳 Recipes (`/api/recipes`)

| Method | Endpoint        | Access  | Description                             |
| ------ | --------------- | ------- | --------------------------------------- |
| POST   | `/`             | Private | Create recipe                           |
| GET    | `/`             | Public  | Get all recipes (paginated, filterable) |
| GET    | `/popular`      | Public  | Get popular recipes (paginated)         |
| GET    | `/recent`       | Public  | Get recent recipes (paginated)          |
| GET    | `/:id`          | Public  | Get recipe details                      |
| PUT    | `/:id`          | Private | Update recipe (owner/admin)             |
| DELETE | `/:id`          | Private | Delete recipe (owner/admin)             |
| POST   | `/:id/image`    | Private | Upload recipe image                     |
| POST   | `/:id/favorite` | Private | Add to favorites                        |
| DELETE | `/:id/favorite` | Private | Remove from favorites                   |
| POST   | `/:id/publish`  | Private | Toggle publish status                   |

### 📁 Categories (`/api/categories`)

| Method | Endpoint       | Access | Description                         |
| ------ | -------------- | ------ | ----------------------------------- |
| POST   | `/`            | Admin  | Create category                     |
| GET    | `/`            | Public | Get all categories                  |
| GET    | `/:id`         | Public | Get category by ID                  |
| GET    | `/:id/recipes` | Public | Get recipes by category (paginated) |
| PUT    | `/:id`         | Admin  | Update category                     |
| DELETE | `/:id`         | Admin  | Delete category                     |

### 🥕 Ingredients (`/api/ingredients`)

| Method | Endpoint  | Access     | Description                     |
| ------ | --------- | ---------- | ------------------------------- |
| POST   | `/`       | Private    | Create ingredient               |
| GET    | `/`       | Public     | Get all ingredients (paginated) |
| GET    | `/search` | Public     | Search ingredients              |
| GET    | `/:id`    | Public     | Get ingredient by ID            |
| PUT    | `/:id`    | Admin/Chef | Update ingredient               |
| DELETE | `/:id`    | Admin      | Delete ingredient               |

### ⭐ Feedback (`/api/feedback`)

| Method | Endpoint       | Access  | Description                     |
| ------ | -------------- | ------- | ------------------------------- |
| POST   | `/`            | Private | Create feedback/review          |
| GET    | `/recipe/:id`  | Public  | Get recipe feedback (paginated) |
| GET    | `/user/:id`    | Public  | Get user feedback (paginated)   |
| GET    | `/:id`         | Public  | Get feedback by ID              |
| PUT    | `/:id`         | Private | Update feedback (owner)         |
| DELETE | `/:id`         | Private | Delete feedback (owner/admin)   |
| POST   | `/:id/helpful` | Private | Mark feedback as helpful        |
| POST   | `/:id/flag`    | Private | Flag feedback                   |

### 📚 Collections (`/api/collections`)

| Method | Endpoint                 | Access         | Description                        |
| ------ | ------------------------ | -------------- | ---------------------------------- |
| POST   | `/`                      | Private        | Create collection                  |
| GET    | `/`                      | Private        | Get user collections (paginated)   |
| GET    | `/public`                | Public         | Get public collections (paginated) |
| GET    | `/:id`                   | Public/Private | Get collection by ID               |
| PUT    | `/:id`                   | Private        | Update collection (owner)          |
| DELETE | `/:id`                   | Private        | Delete collection (owner)          |
| POST   | `/:id/recipes`           | Private        | Add recipe to collection           |
| DELETE | `/:id/recipes/:recipeId` | Private        | Remove recipe from collection      |
| GET    | `/:id/recipes`           | Public         | Get collection recipes (paginated) |

### 🔍 Search (`/api/search`)

| Method | Endpoint       | Access | Description                       |
| ------ | -------------- | ------ | --------------------------------- |
| GET    | `/recipes`     | Public | Search recipes (advanced filters) |
| GET    | `/ingredients` | Public | Search ingredients                |
| GET    | `/categories`  | Public | Search categories                 |
| GET    | `/users`       | Public | Search users                      |
| POST   | `/advanced`    | Public | Advanced search                   |

---

## Common Query Parameters

### Pagination (Most List Endpoints)

```
?page=1&limit=10
```

### Recipe Filters

```
?category_id=1
&difficulty_level=Easy
&min_rating=4
&max_prep_time=30
&max_cook_time=60
```

### Search Recipes

```
?query=pasta
&search_type=both
&sort_by=rating
&sort_order=desc
```

---

## Response Structure

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  },
  "meta": {
    /* pagination info (if applicable) */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Pagination Meta

```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (not logged in)         |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 409  | Conflict (duplicate resource)        |
| 429  | Too Many Requests (rate limited)     |
| 500  | Internal Server Error                |

---

## Frontend Page Checklist

### Public Pages

- [ ] Home page (popular + recent recipes)
- [ ] Recipe list with filters
- [ ] Recipe detail page
- [ ] Category list
- [ ] Category detail (recipes by category)
- [ ] User profile (public view)
- [ ] Search page
- [ ] Login page
- [ ] Register page

### Protected Pages (Require Login)

- [ ] My profile
- [ ] Edit profile
- [ ] My recipes
- [ ] My favorites
- [ ] My collections
- [ ] Create recipe
- [ ] Edit recipe
- [ ] Create collection
- [ ] Edit collection

### Admin Pages

- [ ] Admin dashboard
- [ ] Manage users
- [ ] Manage categories
- [ ] Manage ingredients

---

## Key Features to Implement

### Recipe Features

- ✅ Create/Edit/Delete recipes
- ✅ Upload recipe images
- ✅ Add ingredients with quantities
- ✅ Categorize recipes
- ✅ Publish/unpublish recipes
- ✅ View count tracking
- ✅ Favorite recipes
- ✅ Rate and review recipes

### User Features

- ✅ Registration and login
- ✅ Profile management
- ✅ Upload profile image
- ✅ View user statistics
- ✅ Dietary preferences
- ✅ Favorite cuisines

### Collection Features

- ✅ Create public/private collections
- ✅ Add/remove recipes from collections
- ✅ Browse public collections
- ✅ Organize recipes with display order

### Search Features

- ✅ Search by recipe name
- ✅ Search by ingredient
- ✅ Filter by category, difficulty, time, rating
- ✅ Sort by rating, date, views, name
- ✅ Search ingredients, categories, users

---

## Important Implementation Notes

### 1. Authentication Flow

```typescript
// Store tokens after login
localStorage.setItem('token', data.token);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.user));
localStorage.setItem('role', data.role);

// Include token in requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// Clear on logout
localStorage.clear();
```

### 2. File Uploads

```typescript
const formData = new FormData();
formData.append("recipe_image", file);

// Don't set Content-Type header - browser does it automatically
fetch("/api/recipes/1/image", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### 3. Pagination

```typescript
const [page, setPage] = useState(1);
const limit = 10;

const loadMore = () => {
  if (meta.hasNextPage) {
    setPage(page + 1);
  }
};
```

### 4. Search Debouncing

```typescript
const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, 500); // 500ms debounce

  return () => clearTimeout(timer);
}, [searchQuery]);
```

### 5. Image URLs

```typescript
// API returns relative paths
const imageUrl = recipe.image_url; // "/uploads/recipe.jpg"

// Prepend base URL
const fullUrl = `http://localhost:3000${imageUrl}`;
```

### 6. Error Handling

```typescript
try {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      router.push("/login");
    } else if (response.status === 403) {
      // Show permission error
      toast.error("You do not have permission");
    } else {
      // Show general error
      toast.error(data.message);
    }
    throw new Error(data.message);
  }

  return data;
} catch (error) {
  console.error("API Error:", error);
  throw error;
}
```

---

## Recommended Frontend Tech Stack

### Framework Options

- **Next.js** (React with SSR/SSG)
- **React** (with React Router)
- **Vue.js** (with Vue Router)

### State Management

- **React Context** (for simple apps)
- **Redux Toolkit** (for complex state)
- **Zustand** (lightweight alternative)
- **TanStack Query** (for server state)

### UI Libraries

- **Tailwind CSS** (utility-first CSS)
- **shadcn/ui** (React components)
- **Material-UI** (comprehensive component library)
- **Chakra UI** (accessible components)

### Form Handling

- **React Hook Form** (performant forms)
- **Formik** (popular alternative)
- **Zod** (schema validation)

### HTTP Client

- **Fetch API** (native)
- **Axios** (feature-rich)
- **TanStack Query** (with caching)

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","f_name":"John","l_name":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get recipes (with token)
curl http://localhost:3000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import endpoints from documentation
2. Set up environment variables for base URL and token
3. Create collection for each module
4. Use pre-request scripts for authentication

---

For detailed information, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
