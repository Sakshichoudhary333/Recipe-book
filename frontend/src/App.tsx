import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

// Auth Pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// Public Pages
import { HomePage } from "./pages/HomePage";

// Recipe Pages
import { RecipesPage } from "./pages/RecipesPage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { EditRecipePage } from "./pages/EditRecipePage";

// Category Pages
import { CategoriesPage } from "./pages/CategoriesPage";
import { CategoryDetailPage } from "./pages/CategoryDetailPage";

// Profile Pages (Current User)
import { UserProfilePage } from "./pages/UserProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { MyRecipesPage } from "./pages/MyRecipesPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MyCollectionsPage } from "./pages/MyCollectionsPage";

// Public User Pages
import { PublicUserProfilePage } from "./pages/PublicUserProfilePage";
import { UserRecipesPage } from "./pages/UserRecipesPage";
import { UserStatsPage } from "./pages/UserStatsPage";

// Collection Pages
import { PublicCollectionsPage } from "./pages/PublicCollectionsPage";
import { CollectionDetailPage } from "./pages/CollectionDetailPage";
import { CreateCollectionPage } from "./pages/CreateCollectionPage";

// Admin Pages
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminIngredientsPage } from "./pages/AdminIngredientsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main App Routes - With Layout */}
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Recipes */}
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />

          {/* Categories */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:id" element={<CategoryDetailPage />} />

          {/* Public User Profiles */}
          <Route path="/users/:id" element={<PublicUserProfilePage />} />
          <Route path="/users/:id/recipes" element={<UserRecipesPage />} />
          <Route path="/users/:id/stats" element={<UserStatsPage />} />

          {/* Public Collections */}
          <Route path="/collections" element={<PublicCollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />

          {/* Protected Routes - Require Authentication */}
          <Route element={<ProtectedRoute />}>
            {/* Recipe Management */}
            <Route path="/recipes/create" element={<CreateRecipePage />} />
            <Route path="/recipes/:id/edit" element={<EditRecipePage />} />

            {/* Current User Profile */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/recipes" element={<MyRecipesPage />} />
            <Route path="/profile/favorites" element={<FavoritesPage />} />
            <Route
              path="/profile/collections"
              element={<MyCollectionsPage />}
            />

            {/* Legacy route for backwards compatibility */}
            <Route path="/my-recipes" element={<MyRecipesPage />} />

            {/* Collection Management */}
            <Route
              path="/collections/create"
              element={<CreateCollectionPage />}
            />
            <Route path="/collections/my" element={<MyCollectionsPage />} />
          </Route>

          {/* Admin Routes - Require Admin Role */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route
              path="/admin/ingredients"
              element={<AdminIngredientsPage />}
            />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
