# Route Protection Strategy - Recipe Book

## User Roles

Based on the API documentation, the system supports the following roles:

- **customer** - Regular users (default)
- **admin** - Administrators with full access
- **chef** - Users who can create/edit ingredients
- **moderator** - Users who can moderate content

## Route Access Matrix

### 🌍 Public Routes (No Authentication)

| Route                | Description         | API Endpoints                                          |
| -------------------- | ------------------- | ------------------------------------------------------ |
| `/`                  | Home page           | `GET /api/recipes/popular`, `GET /api/recipes/recent`  |
| `/login`             | Login page          | `POST /api/auth/login`                                 |
| `/register`          | Registration page   | `POST /api/auth/register`                              |
| `/recipes`           | Browse recipes      | `GET /api/recipes`                                     |
| `/recipes/:id`       | Recipe details      | `GET /api/recipes/:id`, `GET /api/feedback/recipe/:id` |
| `/categories`        | Browse categories   | `GET /api/categories`                                  |
| `/categories/:id`    | Category recipes    | `GET /api/categories/:id/recipes`                      |
| `/search`            | Advanced search     | `GET /api/search/recipes`                              |
| `/users/:id`         | Public user profile | `GET /api/users/:id`                                   |
| `/users/:id/recipes` | User's recipes      | `GET /api/users/:id/recipes`                           |
| `/users/:id/stats`   | User statistics     | `GET /api/users/:id/stats`                             |
| `/collections`       | Public collections  | `GET /api/collections/public`                          |
| `/collections/:id`   | Collection detail   | `GET /api/collections/:id` (if public)                 |

### 🔒 Protected Routes (Any Authenticated User)

| Route                  | Description          | API Endpoints                                                                               | Notes                   |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| `/recipes/create`      | Create recipe        | `POST /api/recipes`                                                                         | All authenticated users |
| `/recipes/:id/edit`    | Edit recipe          | `PUT /api/recipes/:id`                                                                      | Owner or admin only     |
| `/profile`             | Current user profile | `GET /api/users/profile`                                                                    | Own profile             |
| `/profile/edit`        | Edit profile         | `PUT /api/users/profile`, `POST /api/users/profile/image`, `POST /api/auth/change-password` | Own profile             |
| `/profile/recipes`     | My recipes           | `GET /api/users/recipes`                                                                    | Own recipes             |
| `/profile/favorites`   | My favorites         | `GET /api/users/:id/favorites`                                                              | Own favorites           |
| `/profile/collections` | My collections       | `GET /api/collections`                                                                      | Own collections         |
| `/collections/create`  | Create collection    | `POST /api/collections`                                                                     | All authenticated users |
| `/collections/my`      | My collections       | `GET /api/collections`                                                                      | Own collections         |

### 👨‍🍳 Chef Routes (Chef or Admin Role)

Currently, there are no dedicated chef-only pages in the frontend. Chefs have special permissions for:

- `PUT /api/ingredients/:id` - Update ingredients (API level)

### 👑 Admin Routes (Admin Role Only)

| Route                | Description        | API Endpoints                                                                                              |
| -------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `/admin`             | Admin dashboard    | Overview/stats                                                                                             |
| `/admin/users`       | Manage users       | `GET /api/users`                                                                                           |
| `/admin/categories`  | Manage categories  | `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`                            |
| `/admin/ingredients` | Manage ingredients | `GET /api/ingredients`, `POST /api/ingredients`, `PUT /api/ingredients/:id`, `DELETE /api/ingredients/:id` |

## Route Guard Components

### 1. ProtectedRoute

**File**: `src/components/ProtectedRoute.tsx`

**Purpose**: Ensures user is authenticated

**Checks**:

- User must be logged in (has valid token)
- Redirects to `/login` if not authenticated

**Used For**: All routes requiring authentication (any role)

### 2. AdminRoute

**File**: `src/components/AdminRoute.tsx`

**Purpose**: Ensures user is authenticated AND has admin role

**Checks**:

- User must be logged in
- User role must be `"admin"`
- Redirects to `/login` if not authenticated
- Redirects to `/` if authenticated but not admin

**Used For**: Admin-only routes (`/admin/*`)

## Special Cases & Considerations

### 1. Recipe Edit Route (`/recipes/:id/edit`)

- **Access**: Owner of the recipe OR admin
- **Implementation**: Check ownership in the page component itself
- **API**: `PUT /api/recipes/:id` returns 403 if not owner/admin

### 2. Collection Detail Route (`/collections/:id`)

- **Access**: Public if collection is public, owner if private
- **Implementation**: Public route, but API returns 403 for private collections
- **API**: `GET /api/collections/:id`

### 3. User Favorites Route (`/profile/favorites`)

- **Access**: Own favorites only
- **Implementation**: Protected route, uses current user's ID
- **API**: `GET /api/users/:id/favorites` (private endpoint)

### 4. Ingredient Creation

- **Access**: Any authenticated user (changed from Admin/Chef only)
- **Note**: Users can create ingredients when making recipes
- **API**: `POST /api/ingredients`

## Authentication Flow

### Login/Register

```typescript
// On successful login/register:
const { user, token, refreshToken, role } = response.data.data;

// Store in auth store:
setAuth(user, token, refreshToken, role);

// The role is one of: "customer", "admin", "chef", "moderator"
```

### Token Storage

- **Access Token**: Used for API requests (short-lived)
- **Refresh Token**: Used to get new access token (long-lived)
- **Role**: Stored for client-side route protection

### Logout

```typescript
// Clear all auth data:
logout(); // Clears user, token, refreshToken, role
```

## Implementation Checklist

### ✅ Completed

- [x] Created all page components
- [x] Set up route structure in App.tsx
- [x] Created ProtectedRoute component
- [x] Created AdminRoute component
- [x] Updated auth store to include role and refreshToken
- [x] Updated AdminRoute to check actual role from auth store

### 🔄 To Do

- [ ] Update login/register pages to use new setAuth signature
- [ ] Implement ownership checks in recipe edit page
- [ ] Add role-based UI elements (hide/show based on role)
- [ ] Implement API error handling for 403 (Forbidden)
- [ ] Add loading states during route transitions
- [ ] Implement refresh token logic
- [ ] Add role badges/indicators in UI
- [ ] Create ChefRoute if chef-specific pages are added later

## API Error Handling

### 401 Unauthorized

- Token is invalid or expired
- **Action**: Redirect to `/login`, clear auth state

### 403 Forbidden

- User is authenticated but lacks permission
- **Action**: Show error message, redirect to appropriate page

### Example Implementation

```typescript
// In API interceptor:
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Show forbidden error
      toast.error("You do not have permission to access this resource");
    }
    return Promise.reject(error);
  }
);
```

## Role-Based UI Examples

### Show Admin Link in Navigation

```typescript
const role = useAuthStore((state) => state.role);

{
  role === "admin" && <Link to="/admin">Admin Dashboard</Link>;
}
```

### Show Edit Button for Recipe Owner

```typescript
const currentUser = useAuthStore((state) => state.user);
const role = useAuthStore((state) => state.role);

const canEdit = recipe.uid === currentUser?.uid || role === "admin";

{
  canEdit && <Link to={`/recipes/${recipe.RID}/edit`}>Edit Recipe</Link>;
}
```

### Show Ingredient Management for Chef/Admin

```typescript
const role = useAuthStore((state) => state.role);

const canManageIngredients = role === "chef" || role === "admin";

{
  canManageIngredients && (
    <Button onClick={handleEditIngredient}>Edit Ingredient</Button>
  );
}
```

## Security Notes

1. **Client-side checks are NOT security** - They only improve UX
2. **Always validate on the backend** - API must enforce permissions
3. **Don't trust the role from localStorage** - Backend validates the token
4. **Implement proper token refresh** - Prevent session expiration issues
5. **Use HTTPS in production** - Protect tokens in transit
6. **Implement CSRF protection** - If using cookies for tokens
7. **Rate limit authentication endpoints** - Prevent brute force attacks

## Next Steps

1. **Update Login/Register Pages**

   - Update to use new `setAuth(user, token, refreshToken, role)` signature
   - Store role from API response

2. **Implement Ownership Checks**

   - In recipe edit page, check if current user owns the recipe
   - Show appropriate error if not owner/admin

3. **Add Role-Based UI**

   - Show/hide navigation items based on role
   - Show/hide action buttons based on permissions

4. **Implement Token Refresh**

   - Add refresh token logic to API interceptor
   - Handle token expiration gracefully

5. **Add Error Handling**
   - Handle 401/403 errors globally
   - Show appropriate error messages
   - Redirect to appropriate pages
