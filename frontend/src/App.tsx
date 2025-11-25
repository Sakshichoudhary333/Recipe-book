import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecipeDetails from "./pages/RecipeDetails";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";

import { useAuthStore } from "./store/authStore";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

function Layout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono antialiased relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center space-x-2 font-bold tracking-tight"
            >
              <span className="text-xl">RECIPE_BOOK</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  location.pathname === "/"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                /home
              </Link>
              {isAuthenticated && (
                <Link
                  to="/create-recipe"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === "/create-recipe"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  /create
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline-block font-mono">
                  @{user?.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="h-8 text-xs"
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    LOGIN
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="h-8 text-xs">
                    REGISTER
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto px-4 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/edit-recipe/:id" element={<EditRecipe />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
